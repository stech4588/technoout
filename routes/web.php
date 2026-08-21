<?php
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DocumentController;
use App\Http\Controllers\Admin\ResourceController;
use App\Http\Controllers\PublicSiteController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicSiteController::class,'home'])->name('home');
Route::get('/catalog', [PublicSiteController::class,'catalog'])->name('catalog');
Route::get('/products/{product:slug}', [PublicSiteController::class,'product'])->name('products.show');
Route::get('/contact', [PublicSiteController::class,'contact'])->name('contact');
Route::post('/contact', [PublicSiteController::class,'submitContact'])->middleware('throttle:5,1')->name('contact.submit');
Route::get('/documents/quotation/{token}', [PublicSiteController::class,'quotation'])->name('public.quotation');
Route::post('/documents/quotation/{token}/respond', [PublicSiteController::class,'respondQuotation'])->middleware('throttle:10,1')->name('public.quotation.respond');
Route::get('/documents/invoice/{token}', [PublicSiteController::class,'invoice'])->name('public.invoice');

Route::get('/dashboard', fn () => redirect()->route('admin.dashboard'))
    ->middleware('auth')
    ->name('dashboard');

Route::prefix('admin')->name('admin.')->middleware(['auth','active','verified','role:Super Admin|Sales|Accounts|Catalog Manager|Content Editor|Support'])->group(function(){
    Route::get('/', DashboardController::class)->middleware('permission:dashboard.view')->name('dashboard');
    Route::post('/inquiries/{inquiry}/quotation',[DocumentController::class,'quote'])->middleware('permission:quotations.manage')->name('inquiries.quote');
    Route::get('/inquiries/{inquiry}/attachments/{index}',[ResourceController::class,'inquiryAttachment'])->whereNumber('index')->middleware('permission:inquiries.manage')->name('inquiries.attachments');
    Route::put('/quotations/{quotation}/details',[DocumentController::class,'updateQuotation'])->middleware('permission:quotations.manage')->name('quotations.details');
    Route::post('/quotations/{quotation}/invoice',[DocumentController::class,'invoice'])->middleware('permission:invoices.manage')->name('quotations.invoice');
    Route::post('/invoices/{invoice}/payments',[DocumentController::class,'payment'])->middleware('permission:payments.manage')->name('invoices.payment');
    Route::post('/payments/{payment}/reverse',[DocumentController::class,'reversePayment'])->middleware('permission:payments.manage')->name('payments.reverse');
    Route::post('/invoices/{invoice}/void',[DocumentController::class,'voidInvoice'])->middleware('permission:invoices.manage')->name('invoices.void');
    Route::get('/documents/{type}/{id}/pdf',[DocumentController::class,'pdf'])->middleware('permission:quotations.manage|invoices.manage')->name('documents.pdf');
    Route::post('/documents/{type}/{id}/send',[DocumentController::class,'send'])->middleware('permission:emails.manage')->name('documents.send');
    Route::get('/{resource}',[ResourceController::class,'index'])->name('resources.index');
    Route::get('/{resource}/create',[ResourceController::class,'create'])->name('resources.create');
    Route::post('/{resource}',[ResourceController::class,'store'])->name('resources.store');
    Route::get('/{resource}/{id}/edit',[ResourceController::class,'edit'])->name('resources.edit');
    Route::put('/{resource}/{id}',[ResourceController::class,'update'])->name('resources.update');
    Route::delete('/{resource}/{id}',[ResourceController::class,'destroy'])->name('resources.destroy');
});

Route::redirect('/visitor-identification-and-management-solution','/visitor-management-solution',301);
Route::get('/{slug}',[PublicSiteController::class,'page'])->where('slug','about-us|company-history|core-values|our-team|brand-partners|our-brands|certifications|careers|latest-news|solutions|loading-bay-solution|parking-management-guidance-solution|perimeter-security-solutions|personnel-access-control-solution|rfid-etag-vehicle-access-control-solution|road-safety-solutions|visitor-management-solution|our-projects|support|technical-support|warranty|product-demonstration')->name('content.show');
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
