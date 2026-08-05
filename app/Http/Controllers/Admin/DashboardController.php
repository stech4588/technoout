<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\{Inquiry,Invoice,Product,Quotation};
use Inertia\Inertia;
class DashboardController extends Controller {
    public function __invoke(){ return Inertia::render('admin/dashboard',['stats'=>[
        ['label'=>'New requests','value'=>Inquiry::where('status','new')->count(),'href'=>'/admin/inquiries'],
        ['label'=>'Active quotations','value'=>Quotation::whereIn('status',['draft','sent','viewed'])->count(),'href'=>'/admin/quotations'],
        ['label'=>'Open invoices','value'=>Invoice::whereNotIn('status',['paid','void'])->count(),'href'=>'/admin/invoices'],
        ['label'=>'Published products','value'=>Product::where('is_published',true)->count(),'href'=>'/admin/products'],
    ],'inquiries'=>Inquiry::latest()->take(6)->get(),'invoices'=>Invoice::latest()->take(6)->get()]); }
}
