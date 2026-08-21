<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\{Inquiry,Invoice,Product,Quotation,QuotationItem};
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
class DashboardController extends Controller {
    public function __invoke(){
        Invoice::whereNotIn('status',['paid','void'])->whereDate('due_date','<',today())->update(['status'=>'overdue']);
        $receivables=Invoice::whereNotIn('status',['paid','void'])->selectRaw('COALESCE(SUM(total-paid_amount),0) total')->value('total');
        $paidThisMonth=Invoice::where('status','paid')->whereBetween('updated_at',[now()->startOfMonth(),now()->endOfMonth()])->sum('paid_amount');
        return Inertia::render('admin/dashboard',['stats'=>[
        ['label'=>'New requests','value'=>Inquiry::where('status','new')->count(),'href'=>'/admin/inquiries'],
        ['label'=>'Active quotations','value'=>Quotation::whereIn('status',['draft','sent','viewed'])->count(),'href'=>'/admin/quotations'],
        ['label'=>'Open invoices','value'=>Invoice::whereNotIn('status',['paid','void'])->count(),'href'=>'/admin/invoices'],
        ['label'=>'Published products','value'=>Product::where('is_published',true)->count(),'href'=>'/admin/products'],
    ],'report'=>['receivables'=>(float)$receivables,'paid_this_month'=>(float)$paidThisMonth,'overdue_count'=>Invoice::where('status','overdue')->count(),'quote_conversion'=>round(100*Quotation::where('status','accepted')->count()/max(1,Quotation::whereNotIn('status',['draft','superseded'])->count()),1)],'topProducts'=>QuotationItem::query()->join('products','products.id','=','quotation_items.product_id')->join('quotations','quotations.id','=','quotation_items.quotation_id')->whereIn('quotations.status',['accepted'])->groupBy('products.id','products.name','products.sku')->orderByDesc(DB::raw('SUM(quotation_items.quantity)'))->limit(5)->get(['products.name','products.sku',DB::raw('SUM(quotation_items.quantity) as quantity'),DB::raw('SUM(quotation_items.total) as value')]),'inquiries'=>Inquiry::latest()->take(6)->get(),'invoices'=>Invoice::latest()->take(6)->get()]); }
}
