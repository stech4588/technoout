<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use DOMDocument;
use DOMElement;
use DOMNode;
use DOMXPath;
use Illuminate\Console\Command;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;
use SimpleXMLElement;
use Throwable;

class ImportTechnoOneCatalog extends Command
{
    protected $signature = 'catalog:import-technoone
        {--apply : Replace the local category and product records after a successful scrape}
        {--refresh : Redownload cached pages and media}
        {--concurrency=4 : Number of simultaneous source requests}
        {--limit=0 : Limit product pages for parser development; cannot be used with --apply}';

    protected $description = 'Scrape, normalize, cache, and optionally import the public TechnoOne catalogue';

    private const BASE_URL = 'https://www.technoone.pk';
    private const PRODUCT_SITEMAP = self::BASE_URL.'/product-sitemap.xml';
    private const CATEGORY_SITEMAP = self::BASE_URL.'/product_cat-sitemap.xml';
    private const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

    private string $importRoot;
    private string $pageRoot;
    private string $mediaRoot;
    private int $concurrency = 4;
    private bool $refresh = false;

    public function handle(): int
    {
        $this->concurrency = max(1, min(8, (int) $this->option('concurrency')));
        $this->refresh = (bool) $this->option('refresh');
        $limit = max(0, (int) $this->option('limit'));

        if ($limit > 0 && $this->option('apply')) {
            $this->error('A limited scrape cannot replace the catalogue. Remove --limit before using --apply.');
            return self::FAILURE;
        }

        $this->importRoot = storage_path('app/imports/technoone');
        $this->pageRoot = $this->importRoot.'/pages';
        $this->mediaRoot = $this->importRoot.'/media';
        File::ensureDirectoryExists($this->pageRoot);
        File::ensureDirectoryExists($this->mediaRoot);

        try {
            $this->newLine();
            $this->info('Discovering catalogue URLs from the official sitemaps...');
            $productUrls = $this->sitemapUrls(self::PRODUCT_SITEMAP, 'product-sitemap.xml', '/product/');
            $categoryUrls = $this->sitemapUrls(self::CATEGORY_SITEMAP, 'product-category-sitemap.xml', '/product-category/');

            if ($limit > 0) {
                $productUrls = array_slice($productUrls, 0, $limit);
            }

            $this->line(sprintf('Found %d product pages and %d category pages.', count($productUrls), count($categoryUrls)));
            if (count($productUrls) === 0 || count($categoryUrls) === 0) {
                throw new RuntimeException('The catalogue sitemaps did not contain usable URLs.');
            }

            $this->info('Caching product and category pages...');
            $pageJobs = [];
            foreach ($productUrls as $url) {
                $pageJobs[] = ['url' => $url, 'path' => $this->pagePath('product', $url)];
            }
            foreach ($categoryUrls as $url) {
                $pageJobs[] = ['url' => $url, 'path' => $this->pagePath('category', $url)];
            }
            $this->downloadJobs($pageJobs, 'pages');

            $categories = $this->parseCategories($categoryUrls);
            $products = [];
            foreach ($productUrls as $index => $url) {
                $products[] = $this->parseProduct($url, $index);
            }

            $this->validateParsedCatalogue($categories, $products, count($productUrls));
            $this->info('Downloading complete product galleries and documents...');
            [$products, $mediaJobs] = $this->prepareMediaJobs($products);
            $this->downloadJobs($mediaJobs, 'media');
            $this->validateDownloadedMedia($products);
            $categories = $this->attachCategoryImages($categories, $products);

            $manifest = [
                'source' => self::BASE_URL,
                'scraped_at' => now()->toIso8601String(),
                'category_count' => count($categories),
                'product_count' => count($products),
                'image_count' => collect($products)->sum(fn (array $product) => count($product['images'])),
                'document_count' => collect($products)->sum(fn (array $product) => count($product['documents'])),
                'categories' => array_values($categories),
                'products' => $products,
            ];
            File::put($this->importRoot.'/catalog.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

            $this->newLine();
            $this->table(
                ['Categories', 'Products', 'Images', 'Documents'],
                [[
                    $manifest['category_count'],
                    $manifest['product_count'],
                    $manifest['image_count'],
                    $manifest['document_count'],
                ]],
            );

            if (! $this->option('apply')) {
                $this->warn('Dry run complete. Re-run with --apply to back up and replace the local catalogue.');
                return self::SUCCESS;
            }

            $this->applyCatalogue($manifest);
            $this->verifyAppliedCatalogue($manifest);
            $this->info('The local catalogue has been replaced successfully.');
            return self::SUCCESS;
        } catch (Throwable $exception) {
            report($exception);
            $this->newLine();
            $this->error($exception->getMessage());
            return self::FAILURE;
        }
    }

    private function sitemapUrls(string $url, string $filename, string $requiredPath): array
    {
        $path = $this->importRoot.'/'.$filename;
        $this->downloadJobs([['url' => $url, 'path' => $path]], 'sitemap');
        $xml = simplexml_load_string(File::get($path));
        if (! $xml instanceof SimpleXMLElement) {
            throw new RuntimeException("Could not parse {$url}.");
        }

        $urls = [];
        foreach ($xml->xpath('//*[local-name()="loc"]') ?: [] as $location) {
            $candidate = trim((string) $location);
            if (str_contains($candidate, $requiredPath)) {
                $urls[] = $candidate;
            }
        }

        return array_values(array_unique($urls));
    }

    private function pagePath(string $type, string $url): string
    {
        $slug = trim((string) basename(parse_url($url, PHP_URL_PATH)), '/');
        return $this->pageRoot."/{$type}-{$slug}.html";
    }

    private function downloadJobs(array $jobs, string $label): void
    {
        $pending = collect($jobs)
            ->unique('path')
            ->filter(fn (array $job) => $this->refresh || ! File::exists($job['path']) || File::size($job['path']) < 100)
            ->values()
            ->all();

        if ($pending === []) {
            $this->line(ucfirst($label).': using '.count($jobs).' cached files.');
            return;
        }

        $total = count($pending);
        $completed = 0;
        $attempt = 1;

        while ($pending !== [] && $attempt <= 3) {
            $failed = [];
            foreach (array_chunk($pending, $this->concurrency) as $chunk) {
                $responses = Http::pool(function (Pool $pool) use ($chunk): array {
                    return array_map(
                        fn (array $job, int $index) => $pool
                            ->as((string) $index)
                            ->withHeaders([
                                'User-Agent' => self::USER_AGENT,
                                'Accept' => '*/*',
                                'Referer' => self::BASE_URL.'/',
                            ])
                            ->withOptions($this->httpOptions())
                            ->connectTimeout(30)
                            ->timeout(240)
                            ->get($job['url']),
                        $chunk,
                        array_keys($chunk),
                    );
                });

                foreach ($chunk as $index => $job) {
                    $response = $responses[(string) $index] ?? null;
                    if (! $response instanceof Response || ! $response->successful() || strlen($response->body()) < 100) {
                        $failed[] = $job;
                        continue;
                    }

                    File::ensureDirectoryExists(dirname($job['path']));
                    File::put($job['path'], $response->body());
                    $completed++;
                    if ($completed % 10 === 0 || $completed === $total) {
                        $this->line(sprintf('%s: %d/%d downloaded.', ucfirst($label), $completed, $total));
                    }
                }

                usleep(250000);
            }

            $pending = $failed;
            $attempt++;
            if ($pending !== []) {
                $this->warn(count($pending).' '.$label.' files will be retried.');
                sleep(2);
            }
        }

        if ($pending !== []) {
            throw new RuntimeException('Failed to download: '.implode(', ', array_column($pending, 'url')));
        }
    }

    private function parseCategories(array $urls): array
    {
        $categories = [];
        foreach ($urls as $index => $url) {
            $segments = $this->categorySegments($url);
            $slug = end($segments);
            $parentSlug = count($segments) > 1 ? $segments[count($segments) - 2] : null;
            $document = $this->loadDocument($this->pagePath('category', $url));
            $xpath = new DOMXPath($document);
            $ogTitle = $this->meta($xpath, 'property', 'og:title');
            $name = trim((string) preg_replace('/\s+Archives$/i', '', $ogTitle ?: Str::headline($slug)));
            $description = $this->meta($xpath, 'name', 'description');

            $categories[$slug] = [
                'name' => $name,
                'slug' => $slug,
                'parent_slug' => $parentSlug,
                'description' => $description ?: null,
                'images' => [],
                'thumbnail_index' => 0,
                'source_url' => $url,
                'source_data' => [
                    'path' => $segments,
                    'seo_title' => $this->title($document),
                    'seo_description' => $description,
                ],
                'is_active' => true,
                'sort_order' => $index + 1,
            ];
        }

        foreach ($categories as $category) {
            if ($category['parent_slug'] !== null && ! isset($categories[$category['parent_slug']])) {
                throw new RuntimeException("Missing parent category {$category['parent_slug']} for {$category['slug']}.");
            }
        }

        return $categories;
    }

    private function parseProduct(string $url, int $index): array
    {
        $slug = trim((string) basename(parse_url($url, PHP_URL_PATH)), '/');
        $document = $this->loadDocument($this->pagePath('product', $url));
        $xpath = new DOMXPath($document);
        $titleNode = $this->first($xpath, '//*[contains(concat(" ", normalize-space(@class), " "), " product_title ")]');
        $name = $this->cleanText($titleNode?->textContent ?? '');
        if ($name === '') {
            throw new RuntimeException("No product title was found on {$url}.");
        }

        $shortNode = $this->first($xpath, '//*[contains(concat(" ", normalize-space(@class), " "), " woocommerce-product-details__short-description ")]');
        $summary = $this->nodeText($shortNode);
        $sections = [];
        foreach (['description' => 'Description', 'features' => 'Features', 'applications' => 'Applications', 'additional-information' => 'Additional information'] as $id => $label) {
            $node = $this->first($xpath, "//*[@id='tab-{$id}']");
            $text = $this->cleanSectionText($node, $label);
            if ($text !== '') {
                $sections[$label] = $text;
            }
        }

        $descriptionParts = [];
        if ($summary !== '') {
            $descriptionParts[] = $summary;
        }
        foreach ($sections as $label => $text) {
            $descriptionParts[] = strtoupper($label)."\n".$text;
        }

        $categoryLinks = [];
        foreach ($xpath->query('//*[contains(concat(" ", normalize-space(@class), " "), " posted_in ")]//a[contains(@href, "/product-category/")]') ?: [] as $link) {
            if ($link instanceof DOMElement) {
                $categoryLinks[] = ['url' => $link->getAttribute('href'), 'name' => $this->cleanText($link->textContent)];
            }
        }
        usort($categoryLinks, fn (array $a, array $b) => count($this->categorySegments($b['url'])) <=> count($this->categorySegments($a['url'])));
        $primaryCategorySegments = isset($categoryLinks[0]) ? $this->categorySegments($categoryLinks[0]['url']) : [];
        $categorySlug = $primaryCategorySegments !== [] ? end($primaryCategorySegments) : null;
        if (! $categorySlug) {
            throw new RuntimeException("No product category was found on {$url}.");
        }

        $imageUrls = [];
        foreach ($xpath->query('//*[@data-large_image]') ?: [] as $node) {
            if ($node instanceof DOMElement && $node->getAttribute('data-large_image') !== '') {
                $imageUrls[] = $node->getAttribute('data-large_image');
            }
        }
        foreach ($xpath->query('//*[@data-large]') ?: [] as $node) {
            if ($node instanceof DOMElement && $node->getAttribute('data-large') !== '') {
                $imageUrls[] = $node->getAttribute('data-large');
            }
        }
        $imageUrls = $this->uniqueHttpUrls($imageUrls);

        $documentUrls = [];
        foreach ($xpath->query('//*[@id="tab-downloads"]//a[@href] | //a[contains(translate(@href, "PDF", "pdf"), ".pdf")]') ?: [] as $node) {
            if ($node instanceof DOMElement) {
                $documentUrls[] = $node->getAttribute('href');
            }
        }
        $documentUrls = $this->uniqueHttpUrls($documentUrls);

        $specifications = $this->tableSpecifications($xpath);
        $skuNode = $this->first($xpath, '//*[contains(concat(" ", normalize-space(@class), " "), " sku ")]');
        $sku = $this->cleanText($skuNode?->textContent ?? '');
        $imageAltNode = $this->first($xpath, '//*[@data-large_image][1]');
        $imageAlt = $imageAltNode instanceof DOMElement ? trim($imageAltNode->getAttribute('alt')) : '';
        $seoDescription = $this->meta($xpath, 'name', 'description') ?: $summary;

        return [
            'category_slug' => $categorySlug,
            'name' => $name,
            'slug' => $slug,
            'sku' => $sku !== '' ? $sku : null,
            'brand' => $this->inferBrand($name),
            'summary' => $summary !== '' ? $summary : ($sections['Description'] ?? null),
            'description' => implode("\n\n", array_unique($descriptionParts)),
            'specifications' => $specifications,
            'original_images' => $imageUrls,
            'original_documents' => $documentUrls,
            'images' => [],
            'documents' => [],
            'thumbnail_index' => 0,
            'image_alt' => $imageAlt !== '' ? $imageAlt : $name,
            'price' => null,
            'price_mode' => 'quote',
            'is_featured' => $index < 6,
            'is_published' => true,
            'seo_title' => $name,
            'seo_description' => Str::limit($seoDescription ?: $name, 500, ''),
            'source_url' => $url,
            'source_data' => [
                'sections' => $sections,
                'category_links' => $categoryLinks,
                'original_images' => $imageUrls,
                'original_documents' => $documentUrls,
                'source_title' => $this->title($document),
                'source_description' => $this->meta($xpath, 'name', 'description'),
            ],
        ];
    }

    private function prepareMediaJobs(array $products): array
    {
        $jobs = [];
        foreach ($products as &$product) {
            foreach ($product['original_images'] as $index => $url) {
                $relative = $this->mediaRelativePath($product['slug'], 'images', $url, $index);
                $product['images'][] = '/storage/catalog/technoone/'.$relative;
                $jobs[] = ['url' => $url, 'path' => $this->mediaRoot.'/'.$relative];
            }
            foreach ($product['original_documents'] as $index => $url) {
                $relative = $this->mediaRelativePath($product['slug'], 'documents', $url, $index);
                $product['documents'][] = '/storage/catalog/technoone/'.$relative;
                $jobs[] = ['url' => $url, 'path' => $this->mediaRoot.'/'.$relative];
            }
            unset($product['original_images'], $product['original_documents']);
        }
        unset($product);

        return [$products, $jobs];
    }

    private function mediaRelativePath(string $slug, string $type, string $url, int $index): string
    {
        $path = rawurldecode((string) parse_url($url, PHP_URL_PATH));
        $filename = basename($path);
        $extension = strtolower((string) pathinfo($filename, PATHINFO_EXTENSION));
        if ($extension === '' || strlen($extension) > 5) {
            $extension = $type === 'images' ? 'jpg' : 'pdf';
        }
        $stem = Str::slug((string) pathinfo($filename, PATHINFO_FILENAME));
        $stem = $stem !== '' ? $stem : $type.'-'.($index + 1);
        $hash = substr(hash('sha256', $url), 0, 8);
        return "{$type}/{$slug}/{$stem}-{$hash}.{$extension}";
    }

    private function validateParsedCatalogue(array $categories, array $products, int $expectedProducts): void
    {
        if (count($products) !== $expectedProducts) {
            throw new RuntimeException("Parsed ".count($products)." products but expected {$expectedProducts}.");
        }

        $slugs = [];
        foreach ($products as $product) {
            if (isset($slugs[$product['slug']])) {
                throw new RuntimeException("Duplicate product slug {$product['slug']}.");
            }
            $slugs[$product['slug']] = true;
            if (! isset($categories[$product['category_slug']])) {
                throw new RuntimeException("Product {$product['slug']} references missing category {$product['category_slug']}.");
            }
        }
    }

    private function validateDownloadedMedia(array $products): void
    {
        $missing = [];
        $invalidImages = [];
        foreach ($products as $product) {
            foreach ($product['images'] as $publicPath) {
                $relative = Str::after($publicPath, '/storage/catalog/technoone/');
                $path = $this->mediaRoot.'/'.$relative;
                if (! File::exists($path) || File::size($path) < 100) {
                    $missing[] = $publicPath;
                } elseif (@getimagesize($path) === false) {
                    $invalidImages[] = $publicPath;
                }
            }
            foreach ($product['documents'] as $publicPath) {
                $relative = Str::after($publicPath, '/storage/catalog/technoone/');
                $path = $this->mediaRoot.'/'.$relative;
                if (! File::exists($path) || File::size($path) < 100) {
                    $missing[] = $publicPath;
                }
            }
        }
        if ($missing !== []) {
            throw new RuntimeException('Missing downloaded media: '.implode(', ', $missing));
        }
        if ($invalidImages !== []) {
            throw new RuntimeException('Downloaded files are not valid images: '.implode(', ', $invalidImages));
        }
    }

    private function attachCategoryImages(array $categories, array $products): array
    {
        foreach ($products as $product) {
            if ($product['images'] !== [] && $categories[$product['category_slug']]['images'] === []) {
                $categories[$product['category_slug']]['images'] = [$product['images'][0]];
            }
        }

        foreach ($categories as $slug => &$category) {
            if ($category['images'] !== []) {
                continue;
            }
            foreach ($products as $product) {
                foreach ($product['source_data']['category_links'] as $categoryLink) {
                    if (in_array($slug, $this->categorySegments($categoryLink['url']), true) && $product['images'] !== []) {
                        $category['images'] = [$product['images'][0]];
                        break 2;
                    }
                }
            }
        }
        unset($category);

        return $categories;
    }

    private function applyCatalogue(array $manifest): void
    {
        $timestamp = now()->format('Ymd-His');
        $backupRoot = storage_path("app/backups/catalog-{$timestamp}");
        File::ensureDirectoryExists($backupRoot);
        File::put($backupRoot.'/records.json', json_encode([
            'categories' => Category::query()->get()->toArray(),
            'products' => Product::query()->get()->toArray(),
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

        $publicMedia = storage_path('app/public/catalog/technoone');
        if (File::isDirectory($publicMedia)) {
            File::copyDirectory($publicMedia, $backupRoot.'/media');
            File::deleteDirectory($publicMedia);
        }
        File::ensureDirectoryExists(dirname($publicMedia));
        if (! File::copyDirectory($this->mediaRoot, $publicMedia)) {
            throw new RuntimeException('Could not publish the staged catalogue media.');
        }

        try {
            DB::transaction(function () use ($manifest): void {
                Product::query()->delete();
                Category::query()->delete();

                $categoryIds = [];
                $categories = collect($manifest['categories'])->sortBy(fn (array $category) => count($category['source_data']['path']));
                foreach ($categories as $category) {
                    $created = Category::create([
                        'parent_id' => $category['parent_slug'] ? ($categoryIds[$category['parent_slug']] ?? null) : null,
                        'name' => $category['name'],
                        'slug' => $category['slug'],
                        'description' => $category['description'],
                        'source_url' => $category['source_url'],
                        'source_data' => $category['source_data'],
                        'images' => $category['images'],
                        'thumbnail_index' => 0,
                        'is_active' => true,
                        'sort_order' => $category['sort_order'],
                    ]);
                    $categoryIds[$created->slug] = $created->id;
                }

                foreach ($manifest['products'] as $product) {
                    Product::create([
                        'category_id' => $categoryIds[$product['category_slug']],
                        'name' => $product['name'],
                        'slug' => $product['slug'],
                        'sku' => $product['sku'],
                        'brand' => $product['brand'],
                        'summary' => $product['summary'],
                        'description' => $product['description'],
                        'specifications' => $product['specifications'],
                        'images' => $product['images'],
                        'thumbnail_index' => 0,
                        'image_alt' => $product['image_alt'],
                        'brochure_url' => $product['documents'][0] ?? null,
                        'documents' => $product['documents'],
                        'source_url' => $product['source_url'],
                        'source_data' => $product['source_data'],
                        'price' => $product['price'],
                        'price_mode' => $product['price_mode'],
                        'is_featured' => $product['is_featured'],
                        'is_published' => $product['is_published'],
                        'seo_title' => $product['seo_title'],
                        'seo_description' => $product['seo_description'],
                    ]);
                }
            });
        } catch (Throwable $exception) {
            File::deleteDirectory($publicMedia);
            if (File::isDirectory($backupRoot.'/media')) {
                File::copyDirectory($backupRoot.'/media', $publicMedia);
            }
            throw $exception;
        }
    }

    private function verifyAppliedCatalogue(array $manifest): void
    {
        $categoryCount = Category::query()->count();
        $productCount = Product::query()->count();
        if ($categoryCount !== $manifest['category_count'] || $productCount !== $manifest['product_count']) {
            throw new RuntimeException(
                "Post-import count mismatch: expected {$manifest['category_count']} categories and {$manifest['product_count']} products, "
                ."found {$categoryCount} categories and {$productCount} products."
            );
        }

        $invalidProducts = Product::query()
            ->whereNull('category_id')
            ->orWhereNull('source_url')
            ->orWhereNull('images')
            ->count();
        if ($invalidProducts > 0) {
            throw new RuntimeException("Post-import validation found {$invalidProducts} incomplete products.");
        }

        foreach ($manifest['products'] as $product) {
            foreach (array_merge($product['images'], $product['documents']) as $publicPath) {
                $relative = Str::after($publicPath, '/storage/catalog/technoone/');
                if (! File::exists(storage_path('app/public/catalog/technoone/'.$relative))) {
                    throw new RuntimeException("Published media is missing: {$publicPath}");
                }
            }
        }
    }

    private function loadDocument(string $path): DOMDocument
    {
        $document = new DOMDocument();
        $previous = libxml_use_internal_errors(true);
        $loaded = $document->loadHTML(File::get($path), LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_COMPACT);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);
        if (! $loaded) {
            throw new RuntimeException("Could not parse cached page {$path}.");
        }
        return $document;
    }

    private function first(DOMXPath $xpath, string $query): ?DOMNode
    {
        $nodes = $xpath->query($query);
        return $nodes && $nodes->length > 0 ? $nodes->item(0) : null;
    }

    private function meta(DOMXPath $xpath, string $attribute, string $value): string
    {
        $node = $this->first($xpath, "//meta[@{$attribute}='{$value}']/@content");
        return $this->cleanText($node?->nodeValue ?? '');
    }

    private function title(DOMDocument $document): string
    {
        return $this->cleanText($document->getElementsByTagName('title')->item(0)?->textContent ?? '');
    }

    private function cleanText(string $text): string
    {
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/[\h\v]+/u', ' ', $text) ?? $text;
        return trim($text);
    }

    private function cleanSectionText(?DOMNode $node, string $heading): string
    {
        if (! $node) {
            return '';
        }
        $text = $this->nodeText($node);
        return trim((string) preg_replace('/^'.preg_quote($heading, '/').'\s*/i', '', $text));
    }

    private function nodeText(?DOMNode $node): string
    {
        if (! $node) {
            return '';
        }

        $extract = function (DOMNode $current) use (&$extract): string {
            if ($current->nodeType === XML_TEXT_NODE) {
                return $current->nodeValue ?? '';
            }
            if ($current instanceof DOMElement && strtolower($current->tagName) === 'br') {
                return "\n";
            }

            $text = '';
            foreach ($current->childNodes as $child) {
                $text .= $extract($child);
            }

            if ($current instanceof DOMElement && in_array(strtolower($current->tagName), ['p', 'li', 'div', 'tr', 'h1', 'h2', 'h3', 'h4'], true)) {
                $text .= "\n";
            }

            return $text;
        };

        $text = html_entity_decode($extract($node), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/[\t ]+/u', ' ', $text) ?? $text;
        $text = preg_replace('/ *\R */u', "\n", $text) ?? $text;
        $text = preg_replace('/\n{3,}/', "\n\n", $text) ?? $text;
        return trim($text);
    }

    private function tableSpecifications(DOMXPath $xpath): array
    {
        $specifications = [];
        foreach ($xpath->query('//*[@id="tab-additional-information" or @id="tab-description"]//tr') ?: [] as $row) {
            $cells = [];
            foreach ($xpath->query('./th|./td', $row) ?: [] as $cell) {
                $cells[] = $this->cleanText($cell->textContent);
            }
            if (count($cells) >= 2 && $cells[0] !== '' && $cells[1] !== '') {
                $specifications[Str::limit($cells[0], 190, '')] = Str::limit(implode(' ', array_slice($cells, 1)), 1000, '');
            }
        }
        return $specifications;
    }

    private function categorySegments(string $url): array
    {
        $path = trim((string) parse_url($url, PHP_URL_PATH), '/');
        if (! str_starts_with($path, 'product-category/')) {
            return [];
        }
        return array_values(array_filter(explode('/', Str::after($path, 'product-category/'))));
    }

    private function uniqueHttpUrls(array $urls): array
    {
        return array_values(array_unique(array_filter(array_map(function (string $url): string {
            $url = trim(html_entity_decode($url, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            if (str_starts_with($url, '//')) {
                $url = 'https:'.$url;
            } elseif (str_starts_with($url, '/')) {
                $url = self::BASE_URL.$url;
            }
            return preg_match('#^https?://#i', $url) ? $url : '';
        }, $urls))));
    }

    private function inferBrand(string $name): ?string
    {
        $brands = ['EVACS', 'POWERTECH', 'TAU', 'DEFEND', 'ZKTECO', 'CHAFON', 'MOVE', 'CUPPON', 'DITEC', 'WEJOIN', 'OPTEX', 'BEA', 'ALIEN', 'DOOYA', 'LABEL', 'DORTEX', 'RGL'];
        $upper = Str::upper($name);
        foreach ($brands as $brand) {
            if (str_starts_with($upper, $brand.' ') || $upper === $brand) {
                return $brand;
            }
        }
        return null;
    }

    private function httpOptions(): array
    {
        $configured = (string) ini_get('curl.cainfo');
        $candidates = array_filter([
            $configured,
            dirname(base_path(), 2).'/etc/ssl/cacert.pem',
            dirname(PHP_BINARY).'/extras/ssl/cacert.pem',
        ]);

        foreach ($candidates as $candidate) {
            if (File::isFile($candidate)) {
                return ['verify' => $candidate];
            }
        }

        throw new RuntimeException('No readable CA certificate bundle is available for secure catalogue downloads.');
    }
}
