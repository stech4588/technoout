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

Route::prefix('admin')->name('admin.')->middleware(['auth','role:Super Admin|Sales|Accounts|Catalog Manager|Content Editor|Support'])->group(function(){
    Route::get('/', DashboardController::class)->name('dashboard');
    Route::post('/inquiries/{inquiry}/quotation',[DocumentController::class,'quote'])->name('inquiries.quote');
    Route::post('/quotations/{quotation}/invoice',[DocumentController::class,'invoice'])->name('quotations.invoice');
    Route::post('/invoices/{invoice}/payments',[DocumentController::class,'payment'])->name('invoices.payment');
    Route::get('/documents/{type}/{id}/pdf',[DocumentController::class,'pdf'])->name('documents.pdf');
    Route::post('/documents/{type}/{id}/send',[DocumentController::class,'send'])->name('documents.send');
    Route::get('/{resource}',[ResourceController::class,'index'])->name('resources.index');
    Route::get('/{resource}/create',[ResourceController::class,'create'])->name('resources.create');
    Route::post('/{resource}',[ResourceController::class,'store'])->name('resources.store');
    Route::get('/{resource}/{id}/edit',[ResourceController::class,'edit'])->name('resources.edit');
    Route::put('/{resource}/{id}',[ResourceController::class,'update'])->name('resources.update');
    Route::delete('/{resource}/{id}',[ResourceController::class,'destroy'])->name('resources.destroy');
});

Route::get('/{slug}',[PublicSiteController::class,'page'])->where('slug','about-us|company-history|core-values|our-team|brand-partners|certifications|careers|latest-news|solutions|loading-bay-solution|parking-management-guidance-solution|perimeter-security-solutions|personnel-access-control-solution|rfid-etag-vehicle-access-control-solution|road-safety-solutions|visitor-management-solution|our-projects|support|technical-support|warranty|product-demonstration')->name('content.show');
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
