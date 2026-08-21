<?php

namespace Tests\Feature;

use App\Jobs\SendDocumentEmail;
use App\Models\{BankAccount,BusinessProfile,ContactChannel,Inquiry,Invoice,Payment,Product,Quotation,SocialLink,User};
use App\Services\FinancialCalculator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProductionHardeningTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void {parent::setUp();$this->seed();}

    public function test_inactive_administrator_cannot_log_in(): void
    {
        $user=User::factory()->create(['email'=>'inactive@example.com','password'=>'password','is_active'=>false]);
        $this->post('/login',['email'=>$user->email,'password'=>'password'])->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_support_role_cannot_manage_users_or_finances(): void
    {
        $user=User::factory()->create(['is_active'=>true]);$user->assignRole('Support');
        $this->actingAs($user)->get('/admin/users')->assertForbidden();
        $this->actingAs($user)->get('/admin/invoices')->assertForbidden();
        $this->actingAs($user)->get('/admin/inquiries')->assertOk();
    }

    public function test_server_calculates_money_and_caps_discount(): void
    {
        $result=FinancialCalculator::totals([['description'=>'Item','quantity'=>2,'unit_price'=>99.995,'tax_rate'=>10]],999);
        $this->assertSame(200.0,$result['subtotal']);$this->assertSame(200.0,$result['discount']);$this->assertSame(20.0,$result['tax']);$this->assertSame(20.0,$result['total']);
    }

    public function test_admin_can_create_request_with_multiple_products(): void
    {
        $admin=User::where('email','admin@technoout.pk')->firstOrFail();$products=Product::take(2)->get();
        $this->actingAs($admin)->post('/admin/inquiries',['type'=>'quote','name'=>'Procurement Manager','company'=>'Factory Ltd','email'=>'buyer@example.com','phone'=>'+92 300 1234567','city'=>'Lahore','subject'=>'Access control requirement','message'=>'Please prepare a quotation.','status'=>'new','products'=>[['product_id'=>$products[0]->id,'quantity'=>2],['product_id'=>$products[1]->id,'quantity'=>3.5]]])->assertSessionHasNoErrors()->assertRedirect('/admin/inquiries');
        $inquiry=Inquiry::where('email','buyer@example.com')->firstOrFail();
        $this->assertCount(2,$inquiry->items);$this->assertEquals(2,$inquiry->items[0]->quantity);$this->assertEquals(3.5,$inquiry->items[1]->quantity);
    }

    public function test_catalog_form_persists_modern_product_fields_and_files(): void
    {
        Storage::fake('public');$admin=User::where('email','admin@technoout.pk')->firstOrFail();
        $this->actingAs($admin)->post('/admin/products',['name'=>'Secure Gate Controller','slug'=>'secure-gate-controller','sku'=>'SGC-100','summary'=>'Controller summary','description'=>'Complete product description','specifications'=>[['key'=>'Voltage','value'=>'24V DC'],['key'=>'Ingress rating','value'=>'IP65']],'image_alt'=>'Gate controller enclosure','brochure_url'=>UploadedFile::fake()->create('brochure.pdf',120,'application/pdf'),'price_mode'=>'quote','seo_title'=>'Secure Gate Controller','seo_description'=>'Industrial access-control gate controller.','is_published'=>true])->assertSessionHasNoErrors();
        $product=Product::where('sku','SGC-100')->firstOrFail();$this->assertSame('24V DC',$product->specifications['Voltage']);$this->assertSame('Gate controller enclosure',$product->image_alt);Storage::disk('public')->assertExists(str($product->brochure_url)->after('/storage/'));
    }

    public function test_new_product_image_can_be_selected_as_default_during_upload(): void
    {
        Storage::fake('public');$admin=User::where('email','admin@technoout.pk')->firstOrFail();
        $this->actingAs($admin)->post('/admin/products',['name'=>'Camera Kit','slug'=>'camera-kit','price_mode'=>'quote','is_published'=>true,'new_images'=>[UploadedFile::fake()->image('front.jpg'),UploadedFile::fake()->image('installed.jpg')],'thumbnail_index'=>1])->assertSessionHasNoErrors();
        $product=Product::where('slug','camera-kit')->firstOrFail();
        $this->assertCount(2,$product->images);$this->assertSame(1,$product->thumbnail_index);$this->assertSame($product->images[1],$product->thumbnail_url);
        $this->get('/catalog')->assertOk();$this->get('/products/camera-kit')->assertOk();
    }

    public function test_social_bank_and_contact_forms_match_the_database(): void
    {
        Storage::fake('public');$admin=User::where('email','admin@technoout.pk')->firstOrFail();
        $this->actingAs($admin)->post('/admin/social-links',['platform'=>'Instagram','url'=>'https://instagram.com/technoout','icon'=>'instagram','is_active'=>true,'sort_order'=>4])->assertSessionHasNoErrors();$this->assertDatabaseHas('social_links',['platform'=>'Instagram','icon'=>'instagram','sort_order'=>4]);
        $this->actingAs($admin)->post('/admin/bank-accounts',['bank_name'=>'Example Bank','branch'=>'Main Boulevard','account_title'=>'Technoout','account_number'=>'00112233','iban'=>'PK00EXAMPLE00112233','instructions'=>'Use invoice number as reference.','is_active'=>true,'sort_order'=>2])->assertSessionHasNoErrors();$this->assertDatabaseHas('bank_accounts',['bank_name'=>'Example Bank','branch'=>'Main Boulevard','sort_order'=>2]);
        $location=\App\Models\OfficeLocation::firstOrFail();$this->actingAs($admin)->post('/admin/contacts',['office_location_id'=>$location->id,'type'=>'email','label'=>'Project sales','value'=>'projects@example.com','is_public'=>true,'sort_order'=>3])->assertSessionHasNoErrors();$this->assertDatabaseHas('contact_channels',['office_location_id'=>$location->id,'value'=>'projects@example.com']);
    }

    public function test_quotation_can_be_priced_sent_and_invoiced_once(): void
    {
        Queue::fake();$admin=User::where('email','admin@technoout.pk')->firstOrFail();
        $inquiry=Inquiry::create(['reference'=>'REQ-2026-99999','name'=>'Buyer','email'=>'buyer@example.com','message'=>'Quote me']);
        $quotation=Quotation::create(['inquiry_id'=>$inquiry->id,'number'=>'QTN-2026-99999','customer_name'=>'Buyer','customer_email'=>'buyer@example.com','issue_date'=>today(),'expires_at'=>today()->addWeek(),'currency'=>'PKR','public_token'=>Str::uuid(),'status'=>'draft']);
        $this->actingAs($admin)->put("/admin/quotations/{$quotation->id}/details",['customer_name'=>'Buyer','customer_email'=>'buyer@example.com','expires_at'=>today()->addWeek()->toDateString(),'discount'=>10,'items'=>[['description'=>'Barrier','quantity'=>2,'unit_price'=>100,'tax_rate'=>10]]])->assertSessionHasNoErrors();
        $quotation->refresh();$this->assertSame('210.00',$quotation->total);
        $this->actingAs($admin)->post("/admin/documents/quotation/{$quotation->id}/send",['subject'=>'Your quote','body'=>'Please review'])->assertSessionHasNoErrors();
        Queue::assertPushed(SendDocumentEmail::class);$this->assertDatabaseHas('email_messages',['emailable_id'=>$quotation->id,'status'=>'queued']);
        $quotation->update(['status'=>'accepted']);
        $this->actingAs($admin)->post("/admin/quotations/{$quotation->id}/invoice")->assertRedirect();
        $this->actingAs($admin)->post("/admin/quotations/{$quotation->id}/invoice")->assertStatus(422);
    }

    public function test_overpayment_is_rejected_and_payment_can_be_reversed(): void
    {
        $admin=User::where('email','admin@technoout.pk')->firstOrFail();$profile=BusinessProfile::firstOrFail();
        $invoice=Invoice::create(['number'=>'INV-2026-99998','customer_name'=>'Buyer','customer_email'=>'buyer@example.com','issue_date'=>today(),'due_date'=>today()->addWeek(),'currency'=>'PKR','public_token'=>Str::uuid(),'business_snapshot'=>$profile->toArray(),'total'=>100,'status'=>'sent']);
        $this->actingAs($admin)->post("/admin/invoices/{$invoice->id}/payments",['amount'=>101,'paid_at'=>today()->toDateString(),'method'=>'bank'])->assertStatus(422);
        $this->actingAs($admin)->post("/admin/invoices/{$invoice->id}/payments",['amount'=>40,'paid_at'=>today()->toDateString(),'method'=>'bank'])->assertSessionHasNoErrors();
        $payment=Payment::firstOrFail();$this->assertSame('partially_paid',$invoice->fresh()->status);
        $this->actingAs($admin)->post("/admin/payments/{$payment->id}/reverse",['reason'=>'Entry error'])->assertSessionHasNoErrors();
        $this->assertNotNull($payment->fresh()->reversed_at);$this->assertSame('sent',$invoice->fresh()->status);
    }
}
