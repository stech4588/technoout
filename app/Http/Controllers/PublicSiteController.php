<?php
namespace App\Http\Controllers;
use App\Mail\{InquiryThankYouMail, NewInquiryAlertMail};
use App\Models\{Category,Inquiry,Product,Quotation,Invoice};
use App\Services\BusinessSettings;
use App\Services\CustomerDirectory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Services\Audit;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
class PublicSiteController extends Controller {
    public function home()
    {
        $solutionSlugs = [
            'loading-bay-solution',
            'parking-management-guidance-solution',
            'perimeter-security-solutions',
            'personnel-access-control-solution',
            'rfid-etag-vehicle-access-control-solution',
            'visitor-management-solution',
        ];
        $solutions = collect($solutionSlugs)->map(fn ($slug) => [
            ...config("static_pages.{$slug}"),
            'slug' => $slug,
            'excerpt' => config("static_pages.{$slug}.intro"),
        ]);

        return Inertia::render('public/home', [
            'settings' => BusinessSettings::public(),
            'categories' => Category::catalogTree(),
            'products' => Product::with('category')->where('is_published', true)->where('is_featured', true)->take(6)->get(),
            'solutions' => $solutions,
        ]);
    }

    public function catalog(Request $request)
    {
        $search = trim((string) $request->input('search', ''));
        $categorySlug = trim((string) $request->input('category', ''));
        $categories = Category::catalogTree();

        $categoryIds = null;
        $activeCategory = null;

        if ($categorySlug !== '') {
            $activeCategory = Category::query()
                ->where('is_active', true)
                ->where('slug', $categorySlug)
                ->first();

            $categoryIds = $activeCategory
                ? $activeCategory->selfAndDescendantIds()
                : [];
        }

        $products = Product::query()
            ->with('category')
            ->where('is_published', true)
            ->whereHas('category', fn ($query) => $query->where('is_active', true))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', '%'.$search.'%')
                        ->orWhere('summary', 'like', '%'.$search.'%')
                        ->orWhere('sku', 'like', '%'.$search.'%')
                        ->orWhere('brand', 'like', '%'.$search.'%');
                });
            })
            ->when($categoryIds !== null, fn ($query) => $query->whereIn('category_id', $categoryIds))
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('public/catalog', [
            'settings' => BusinessSettings::public(),
            'products' => $products,
            'categories' => $categories,
            'activeCategory' => $activeCategory ? [
                'id' => $activeCategory->id,
                'name' => $activeCategory->name,
                'slug' => $activeCategory->slug,
                'parent_id' => $activeCategory->parent_id,
            ] : null,
            'filters' => [
                'search' => $search,
                'category' => $categorySlug,
            ],
        ]);
    }

    public function product(Product $product)
    {
        abort_unless($product->is_published, 404);

        return Inertia::render('public/product', [
            'settings' => BusinessSettings::public(),
            'product' => $product->load('category'),
            'related' => Product::query()
                ->where('category_id', $product->category_id)
                ->whereKeyNot($product)
                ->where('is_published', true)
                ->latest('id')
                ->take(6)
                ->get(),
        ]);
    }
    public function page(string $slug){$page=config("static_pages.{$slug}");abort_unless($page,404);$productSlugs=collect($page['blocks']??[])->where('type','products')->flatMap(fn($block)=>$block['slugs']??[])->unique();$relatedProducts=Product::with('category')->whereIn('slug',$productSlugs)->get()->keyBy('slug');return Inertia::render('public/content',['settings'=>BusinessSettings::public(),'page'=>[...$page,'slug'=>$slug],'relatedProducts'=>$relatedProducts]);}
    public function contact(Request $request)
    {
        return Inertia::render('public/contact', [
            'settings' => BusinessSettings::public(),
            ...$this->quoteFormProps($request),
        ]);
    }

    public function quote(Request $request)
    {
        return Inertia::render('public/quote', [
            'settings' => BusinessSettings::public(),
            ...$this->quoteFormProps($request),
        ]);
    }

    private function quoteFormProps(Request $request): array
    {
        $products = Product::where('is_published', true)->orderBy('name')->get(['id', 'name', 'sku']);
        $selectedProductId = $products->firstWhere('id', $request->integer('product'))?->id;

        return [
            'products' => $products,
            'selectedProductId' => $selectedProductId,
        ];
    }

    public function submitContact(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:general,quote',
            'name' => 'required|string|max:150',
            'company' => 'nullable|string|max:150',
            'email' => 'required|email|max:190',
            'phone' => 'required|string|min:7|max:50',
            'city' => 'nullable|string|max:100',
            'subject' => 'nullable|string|max:190',
            'message' => 'required|string|max:5000',
            'products' => 'nullable|array|max:20',
            'products.*.id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('products', 'id')->where('is_published', true),
            ],
            'products.*.quantity' => 'required|integer|min:1|max:100000',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $isQuote = ($data['type'] ?? '') === 'quote';
        $productRows = $isQuote
            ? collect($data['products'] ?? [])->map(fn (array $row) => [
                'id' => (int) $row['id'],
                'quantity' => (int) $row['quantity'],
            ])
            : collect();
        $selectedProducts = Product::whereIn('id', $productRows->pluck('id'))->get()->keyBy('id');
        $paths = collect($request->file('attachments', []))->map(fn ($file) => $file->store('inquiries', 'local'))->all();

        try {
            $inquiry = DB::transaction(function () use ($data, $paths, $productRows, $selectedProducts) {
                $resolved = CustomerDirectory::resolve([
                    'name' => $data['name'],
                    'company' => $data['company'] ?? null,
                    'email' => $data['email'],
                    'phone' => $data['phone'] ?? null,
                    'city' => $data['city'] ?? null,
                ]);

                $reference = \App\Services\DocumentNumber::next('inquiry', 'REQ');
                $inquiry = Inquiry::create([
                    ...collect($data)->except(['products', 'attachments'])->all(),
                    'customer_id' => $resolved['customer']->id,
                    'reference' => $reference,
                    'attachments' => $paths,
                ]);

                foreach ($productRows as $row) {
                    $product = $selectedProducts->get($row['id']);
                    $inquiry->items()->create([
                        'product_id' => $product->id,
                        'description' => $product->name,
                        'quantity' => $row['quantity'],
                    ]);
                }

                Audit::record('inquiry.created', $inquiry, [], [
                    'customer_id' => $resolved['customer']->id,
                    'is_returning' => $resolved['is_returning'],
                ]);

                return $inquiry->load(['items', 'customer']);
            });
        } catch (\Throwable $exception) {
            collect($paths)->each(fn ($path) => \Storage::disk('local')->delete($path));
            throw $exception;
        }

        $notifyTo = config('mail.inquiry_notify', config('mail.from.address', 'info@viatech.pk'));

        try {
            Mail::to($inquiry->email)->send(new InquiryThankYouMail($inquiry));
            if ($notifyTo) {
                Mail::to($notifyTo)->send(new NewInquiryAlertMail($inquiry));
            }
        } catch (\Throwable $exception) {
            report($exception);
        }

        return back()->with('success', 'Your request has been received. A confirmation email is on its way — our team will contact you shortly.');
    }
    public function quotation(string $token){$q=Quotation::with('items')->where('public_token',$token)->firstOrFail();if(!$q->viewed_at)$q->update(['viewed_at'=>now(),'status'=>$q->status==='sent'?'viewed':$q->status]);return Inertia::render('public/document',['settings'=>BusinessSettings::public(),'document'=>$q,'kind'=>'quotation']);}
    public function respondQuotation(Request $request,string $token){$data=$request->validate(['decision'=>'required|in:accepted,rejected']);$q=Quotation::where('public_token',$token)->lockForUpdate()->firstOrFail();abort_unless(in_array($q->status,['sent','viewed']),422);abort_if($q->expires_at->isPast(),422,'This quotation has expired.');$before=$q->only('status');$q->update(['status'=>$data['decision'],'responded_at'=>now(),'response_ip'=>$request->ip(),'response_user_agent'=>str((string)$request->userAgent())->limit(1000)]);Audit::record('quotation.'.$data['decision'],$q,$before,$q->only('status','responded_at'));return back()->with('success','Your response has been recorded.');}
    public function invoice(string $token){$i=Invoice::with(['items','payments'])->where('public_token',$token)->firstOrFail();if(!$i->viewed_at)$i->update(['viewed_at'=>now(),'status'=>$i->status==='sent'?'viewed':$i->status]);return Inertia::render('public/document',['settings'=>BusinessSettings::public(),'document'=>$i,'kind'=>'invoice']);}
}
