<?php
namespace App\Http\Controllers;
use App\Models\{Category,Inquiry,Product,Quotation,Invoice};
use App\Services\BusinessSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\Audit;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
class PublicSiteController extends Controller {
    public function home(){ $solutionSlugs=['loading-bay-solution','parking-management-guidance-solution','perimeter-security-solutions','personnel-access-control-solution','rfid-etag-vehicle-access-control-solution','visitor-management-solution'];$solutions=collect($solutionSlugs)->map(fn($slug)=>[...config("static_pages.{$slug}"),'slug'=>$slug,'excerpt'=>config("static_pages.{$slug}.intro")]);return Inertia::render('public/home',['settings'=>BusinessSettings::public(),'categories'=>Category::withCount('products')->whereNull('parent_id')->where('is_active',true)->orderBy('sort_order')->get(),'products'=>Product::with('category')->where('is_published',true)->where('is_featured',true)->take(6)->get(),'solutions'=>$solutions]); }
    public function catalog(Request $request){ $products=Product::with('category')->where('is_published',true)->when($request->search,fn($q,$v)=>$q->where(fn($x)=>$x->where('name','like','%'.$v.'%')->orWhere('summary','like','%'.$v.'%')))->when($request->category,fn($q,$v)=>$q->whereHas('category',fn($x)=>$x->where('slug',$v)))->latest()->paginate(12)->withQueryString(); return Inertia::render('public/catalog',['settings'=>BusinessSettings::public(),'products'=>$products,'categories'=>Category::where('is_active',true)->orderBy('name')->get(),'filters'=>$request->only('search','category')]); }
    public function product(Product $product){ abort_unless($product->is_published,404); return Inertia::render('public/product',['settings'=>BusinessSettings::public(),'product'=>$product->load('category'),'related'=>Product::where('category_id',$product->category_id)->whereKeyNot($product)->where('is_published',true)->take(3)->get()]); }
    public function page(string $slug){$page=config("static_pages.{$slug}");abort_unless($page,404);$productSlugs=collect($page['blocks']??[])->where('type','products')->flatMap(fn($block)=>$block['slugs']??[])->unique();$relatedProducts=Product::with('category')->whereIn('slug',$productSlugs)->get()->keyBy('slug');return Inertia::render('public/content',['settings'=>BusinessSettings::public(),'page'=>[...$page,'slug'=>$slug],'relatedProducts'=>$relatedProducts]);}
    public function contact(Request $request)
    {
        $products = Product::where('is_published', true)->orderBy('name')->get(['id', 'name', 'sku']);
        $selectedProductId = $products->firstWhere('id', $request->integer('product'))?->id;

        return Inertia::render('public/contact', [
            'settings' => BusinessSettings::public(),
            'products' => $products,
            'selectedProductId' => $selectedProductId,
        ]);
    }

    public function submitContact(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:general,quote',
            'name' => 'required|string|max:150',
            'company' => 'nullable|string|max:150',
            'email' => 'required|email|max:190',
            'phone' => 'nullable|string|max:50',
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

        $productRows = collect($data['products'] ?? [])->map(fn (array $row) => [
            'id' => (int) $row['id'],
            'quantity' => (int) $row['quantity'],
        ]);
        $selectedProducts = Product::whereIn('id', $productRows->pluck('id'))->get()->keyBy('id');
        $paths = collect($request->file('attachments', []))->map(fn ($file) => $file->store('inquiries', 'local'))->all();

        try {
            DB::transaction(function () use ($data, $paths, $productRows, $selectedProducts): void {
                $reference = \App\Services\DocumentNumber::next('inquiry', 'REQ');
                $inquiry = Inquiry::create([
                    ...collect($data)->except(['products', 'attachments'])->all(),
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

                Audit::record('inquiry.created', $inquiry);
            });
        } catch (\Throwable $exception) {
            collect($paths)->each(fn ($path) => \Storage::disk('local')->delete($path));
            throw $exception;
        }

        return back()->with('success', 'Your request has been received. Our team will contact you shortly.');
    }
    public function quotation(string $token){$q=Quotation::with('items')->where('public_token',$token)->firstOrFail();if(!$q->viewed_at)$q->update(['viewed_at'=>now(),'status'=>$q->status==='sent'?'viewed':$q->status]);return Inertia::render('public/document',['settings'=>BusinessSettings::public(),'document'=>$q,'kind'=>'quotation']);}
    public function respondQuotation(Request $request,string $token){$data=$request->validate(['decision'=>'required|in:accepted,rejected']);$q=Quotation::where('public_token',$token)->lockForUpdate()->firstOrFail();abort_unless(in_array($q->status,['sent','viewed']),422);abort_if($q->expires_at->isPast(),422,'This quotation has expired.');$before=$q->only('status');$q->update(['status'=>$data['decision'],'responded_at'=>now(),'response_ip'=>$request->ip(),'response_user_agent'=>str((string)$request->userAgent())->limit(1000)]);Audit::record('quotation.'.$data['decision'],$q,$before,$q->only('status','responded_at'));return back()->with('success','Your response has been recorded.');}
    public function invoice(string $token){$i=Invoice::with(['items','payments'])->where('public_token',$token)->firstOrFail();if(!$i->viewed_at)$i->update(['viewed_at'=>now(),'status'=>$i->status==='sent'?'viewed':$i->status]);return Inertia::render('public/document',['settings'=>BusinessSettings::public(),'document'=>$i,'kind'=>'invoice']);}
}
