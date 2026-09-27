import ProductCard from '@/components/product-card';
import ProductVisual from '@/components/product-visual';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronRight,
    Download,
    FileText,
    MoveRight,
    Package,
    Share2,
    ShieldCheck,
    Sparkles,
    Tag,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type ProductCategory = {
    id?: number;
    name: string;
    slug?: string;
};

type ProductDetail = {
    id: number;
    slug: string;
    name: string;
    sku?: string | null;
    brand?: string | null;
    summary?: string | null;
    description?: string | null;
    price_mode: string;
    price?: number | string | null;
    thumbnail_url?: string | null;
    image_alt?: string | null;
    brochure_url?: string | null;
    images?: string[] | null;
    documents?: string[] | null;
    specifications?: Record<string, string | number | boolean | null> | null;
    is_featured?: boolean;
    category?: ProductCategory | null;
};

type RelatedProduct = {
    id: number;
    slug: string;
    name: string;
    summary?: string | null;
    price_mode: string;
    price?: number | string | null;
    thumbnail_url?: string | null;
    image_alt?: string | null;
    category?: { name: string } | null;
};

type TabId = 'overview' | 'specs' | 'downloads';

function documentLabel(url: string, index: number, total: number) {
    try {
        const path = new URL(url, 'https://example.local').pathname;
        const file = path.split('/').pop() || '';
        if (file && file.includes('.')) return decodeURIComponent(file);
    } catch {
        /* ignore */
    }
    return total > 1 ? `Document ${index + 1}` : 'Product document';
}

export default function Product({
    settings,
    product,
    related = [],
}: {
    settings: unknown;
    product: ProductDetail;
    related?: RelatedProduct[];
}) {
    const gallery = useMemo(() => {
        const images = product.images?.filter(Boolean) ?? [];
        if (images.length) return images;
        return [product.thumbnail_url || '/images/product-placeholder.svg'];
    }, [product.images, product.thumbnail_url]);

    const documents = useMemo(() => {
        const docs = product.documents?.filter(Boolean) ?? [];
        if (docs.length) return docs;
        return product.brochure_url ? [product.brochure_url] : [];
    }, [product.documents, product.brochure_url]);

    const specs = useMemo(() => Object.entries(product.specifications || {}).filter(([, value]) => value !== null && value !== ''), [product.specifications]);
    const highlightSpecs = specs.slice(0, 4);

    const [activeImage, setActiveImage] = useState(product.thumbnail_url || gallery[0]);
    const [tab, setTab] = useState<TabId>('overview');
    const [copied, setCopied] = useState(false);

    const priceLabel =
        product.price_mode === 'visible' && product.price
            ? 'PKR ' + Number(product.price).toLocaleString()
            : 'Quote on request';

    const isPlaceholder = activeImage === '/images/product-placeholder.svg';

    const share = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        try {
            if (navigator.share) {
                await navigator.share({ title: product.name, text: product.summary || product.name, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            /* user cancelled share */
        }
    };

    return (
        <PublicLayout settings={settings}>
            <Head title={product.name}>
                {product.summary ? <meta name="description" content={product.summary} /> : null}
            </Head>

            <div className="product-page">
                <section className="product-hero">
                    <div className="product-hero-grid" aria-hidden />
                    <div className="product-orb product-orb-a" aria-hidden />
                    <div className="product-orb product-orb-b" aria-hidden />

                    <div className="relative z-1 mx-auto max-w-7xl px-5 pt-8 md:pt-10">
                        <nav className="product-breadcrumb flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
                            <Link href="/" className="cursor-pointer hover:text-[#075fd8]">
                                Home
                            </Link>
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                            <Link href="/catalog" className="cursor-pointer hover:text-[#075fd8]">
                                Catalog
                            </Link>
                            {product.category?.slug ? (
                                <>
                                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                                    <Link
                                        href={`/catalog?category=${product.category.slug}`}
                                        className="cursor-pointer hover:text-[#075fd8]"
                                    >
                                        {product.category.name}
                                    </Link>
                                </>
                            ) : product.category?.name ? (
                                <>
                                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                                    <span>{product.category.name}</span>
                                </>
                            ) : null}
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                            <span className="line-clamp-1 text-slate-800">{product.name}</span>
                        </nav>

                        <div className="product-stage mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:items-start xl:gap-12">
                            <div className="product-gallery">
                                <div className="product-gallery-main">
                                    {isPlaceholder ? (
                                        <ProductVisual product={product} className="product-visual-surface h-full w-full" />
                                    ) : (
                                        <img src={activeImage} alt={product.image_alt || product.name} className="h-full w-full object-contain p-4 md:p-8" />
                                    )}
                                    {product.is_featured ? (
                                        <span className="product-badge">
                                            <Sparkles className="h-3.5 w-3.5" /> Featured
                                        </span>
                                    ) : null}
                                </div>
                                {gallery.length > 1 ? (
                                    <div className="product-thumbs" role="list">
                                        {gallery.map((image, index) => (
                                            <button
                                                type="button"
                                                key={`${image}-${index}`}
                                                role="listitem"
                                                onClick={() => setActiveImage(image)}
                                                aria-label={`View ${product.name} image ${index + 1}`}
                                                aria-pressed={activeImage === image}
                                                className={`product-thumb ${activeImage === image ? 'is-active' : ''}`}
                                            >
                                                {image === '/images/product-placeholder.svg' ? (
                                                    <ProductVisual product={product} className="h-full w-full" />
                                                ) : (
                                                    <img src={image} alt="" className="h-full w-full object-cover" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            <aside className="product-buybox">
                                {product.category?.name ? (
                                    <p className="section-kicker !mb-2 flex items-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5" />
                                        {product.category.name}
                                    </p>
                                ) : null}
                                <h1 className="product-title">{product.name}</h1>

                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    {product.sku ? (
                                        <span className="product-meta-chip">
                                            <Package className="h-3.5 w-3.5" /> SKU {product.sku}
                                        </span>
                                    ) : null}
                                    {product.brand ? <span className="product-meta-chip">Brand {product.brand}</span> : null}
                                    <span className="product-price-chip">{priceLabel}</span>
                                </div>

                                {product.summary ? <p className="mt-5 text-base leading-7 text-slate-600">{product.summary}</p> : null}

                                {highlightSpecs.length > 0 ? (
                                    <ul className="product-highlights mt-6 space-y-2.5">
                                        {highlightSpecs.map(([key, value]) => (
                                            <li key={key} className="flex gap-2.5 text-sm text-slate-600">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#075fd8]" />
                                                <span>
                                                    <span className="font-semibold text-slate-800">{key}:</span> {String(value)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}

                                <div className="product-trust mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <div className="product-trust-item">
                                        <ShieldCheck className="h-4 w-4 text-[#075fd8]" />
                                        <span>Project support</span>
                                    </div>
                                    <div className="product-trust-item">
                                        <FileText className="h-4 w-4 text-[#075fd8]" />
                                        <span>Spec guidance</span>
                                    </div>
                                    <div className="product-trust-item col-span-2 sm:col-span-1">
                                        <Sparkles className="h-4 w-4 text-[#075fd8]" />
                                        <span>After-sales care</span>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    <Link
                                        href={`/quote?product=${product.id}`}
                                        className="product-cta-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold"
                                    >
                                        Request quote <MoveRight className="h-4 w-4" />
                                    </Link>
                                    {product.brochure_url ? (
                                        <a
                                            href={product.brochure_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="product-cta-secondary inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold"
                                        >
                                            <Download className="h-4 w-4" /> Brochure
                                        </a>
                                    ) : null}
                                    <button type="button" onClick={share} className="product-cta-ghost inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold">
                                        <Share2 className="h-4 w-4" />
                                        {copied ? 'Link copied' : 'Share'}
                                    </button>
                                </div>
                            </aside>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-5 py-14 md:py-16">
                    <div className="product-tabs" role="tablist" aria-label="Product information">
                        {(
                            [
                                ['overview', 'Overview'],
                                ['specs', `Specifications${specs.length ? ` (${specs.length})` : ''}`],
                                ['downloads', `Downloads${documents.length ? ` (${documents.length})` : ''}`],
                            ] as const
                        ).map(([id, label]) => (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                aria-selected={tab === id}
                                onClick={() => setTab(id)}
                                className={`product-tab ${tab === id ? 'is-active' : ''}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="product-panel mt-6" role="tabpanel">
                        {tab === 'overview' ? (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
                                {product.description ? (
                                    <div className="prose-tech mt-5 whitespace-pre-line text-slate-600">{product.description}</div>
                                ) : (
                                    <p className="mt-5 text-sm text-slate-500">Detailed overview will appear here once published for this product.</p>
                                )}
                            </div>
                        ) : null}

                        {tab === 'specs' ? (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Specifications</h2>
                                {specs.length > 0 ? (
                                    <div className="product-spec-table mt-6 overflow-hidden rounded-2xl border border-slate-200">
                                        <table className="w-full text-left text-sm">
                                            <tbody>
                                                {specs.map(([key, value], index) => (
                                                    <tr key={key} className={index % 2 === 0 ? 'bg-slate-50/80' : 'bg-white'}>
                                                        <th className="w-[38%] px-4 py-3.5 font-semibold text-slate-700 sm:px-5">{key}</th>
                                                        <td className="px-4 py-3.5 text-slate-600 sm:px-5">{String(value)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="mt-5 text-sm text-slate-500">Specifications will be listed here when available.</p>
                                )}
                            </div>
                        ) : null}

                        {tab === 'downloads' ? (
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Downloads</h2>
                                {documents.length > 0 ? (
                                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                        {documents.map((document, index) => (
                                            <a
                                                key={`${document}-${index}`}
                                                href={document}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="product-download-card"
                                            >
                                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-[#075fd8]">
                                                    <Download className="h-5 w-5" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate font-semibold text-slate-900">{documentLabel(document, index, documents.length)}</span>
                                                    <span className="mt-0.5 block text-xs text-slate-500">PDF / document · Open in new tab</span>
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-5 text-sm text-slate-500">No downloads published for this product yet. Request a quote for datasheets and brochures.</p>
                                )}
                            </div>
                        ) : null}
                    </div>
                </section>

                {related.length > 0 ? (
                    <section className="product-related mx-auto max-w-7xl px-5 pb-16 md:pb-20">
                        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="section-kicker">Continue exploring</p>
                                <h2 className="text-3xl font-bold text-slate-900">Related products</h2>
                            </div>
                            {product.category?.slug ? (
                                <Link
                                    href={`/catalog?category=${product.category.slug}`}
                                    className="inline-flex cursor-pointer items-center gap-1 text-sm font-bold text-[#075fd8] hover:underline"
                                >
                                    View category <MoveRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <Link href="/catalog" className="inline-flex cursor-pointer items-center gap-1 text-sm font-bold text-[#075fd8] hover:underline">
                                    Back to catalog <MoveRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {related.map((item, index) => (
                                <div key={item.id} className="product-related-card" style={{ animationDelay: `${0.05 + index * 0.06}s` }}>
                                    <ProductCard product={item} premium />
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}
            </div>
        </PublicLayout>
    );
}
