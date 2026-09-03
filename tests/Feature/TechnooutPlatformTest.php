<?php

namespace Tests\Feature;

use App\Models\{Inquiry, Product, Quotation, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TechnooutPlatformTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_public_catalog_and_database_content_are_available(): void
    {
        $this->get('/')->assertOk();
        $this->get('/catalog')->assertOk();
        $this->get('/about-us')->assertOk();
        $this->assertDatabaseHas('business_profiles', ['name' => 'ViaTech']);
        $this->assertDatabaseCount('products', 94);
        $this->assertDatabaseHas('products', ['slug'=>'defend-hrb-x-hydraulic-road-blocker']);
        $this->assertDatabaseHas('categories', ['slug'=>'rfid-readers']);
    }

    public function test_customer_can_submit_a_contact_request(): void
    {
        $product = Product::firstOrFail();
        $response = $this->post('/contact', [
            'type' => 'quote',
            'name' => 'A Customer',
            'company' => 'Example Industries',
            'email' => 'buyer@example.com',
            'phone' => '+92 300 1234567',
            'message' => 'Please quote an access control solution.',
            'products' => [['id' => $product->id, 'quantity' => 2]],
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame(1, Inquiry::count());
        $this->assertDatabaseHas('inquiries', ['email' => 'buyer@example.com', 'status' => 'new']);
        $this->assertDatabaseHas('inquiry_items', [
            'inquiry_id' => Inquiry::firstOrFail()->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    public function test_catalog_product_can_be_preselected_on_the_quote_form(): void
    {
        $product = Product::where('is_published', true)->firstOrFail();

        $this->get('/contact?product='.$product->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/contact')
                ->where('selectedProductId', $product->id)
                ->has('products', 94)
            );
    }

    public function test_customer_can_request_multiple_products_and_all_are_copied_to_the_quotation(): void
    {
        $products = Product::where('is_published', true)->take(3)->get();

        $this->post('/contact', [
            'type' => 'quote',
            'name' => 'Multiple Product Customer',
            'email' => 'multi@example.com',
            'message' => 'Please quote all selected products.',
            'products' => [
                ['id' => $products[0]->id, 'quantity' => 1],
                ['id' => $products[1]->id, 'quantity' => 3],
                ['id' => $products[2]->id, 'quantity' => 4],
            ],
        ])->assertSessionHasNoErrors();

        $inquiry = Inquiry::where('email', 'multi@example.com')->firstOrFail();
        $this->assertCount(3, $inquiry->items);

        $admin = User::where('email', 'admin@technoout.pk')->firstOrFail();
        $this->actingAs($admin)
            ->post("/admin/inquiries/{$inquiry->id}/quotation")
            ->assertSessionHasNoErrors();

        $quotation = Quotation::where('inquiry_id', $inquiry->id)->firstOrFail();
        $this->assertCount(3, $quotation->items);
        $this->assertDatabaseHas('quotation_items', ['quotation_id' => $quotation->id, 'product_id' => $products[0]->id, 'quantity' => 1]);
        $this->assertDatabaseHas('quotation_items', ['quotation_id' => $quotation->id, 'product_id' => $products[1]->id, 'quantity' => 3]);
        $this->assertDatabaseHas('quotation_items', ['quotation_id' => $quotation->id, 'product_id' => $products[2]->id, 'quantity' => 4]);
    }

    public function test_public_quote_request_rejects_duplicate_or_unpublished_products(): void
    {
        $product = Product::where('is_published', true)->firstOrFail();

        $this->post('/contact', [
            'type' => 'quote',
            'name' => 'Duplicate Product Customer',
            'email' => 'duplicate@example.com',
            'message' => 'Duplicate selection should not be accepted.',
            'products' => [
                ['id' => $product->id, 'quantity' => 1],
                ['id' => $product->id, 'quantity' => 2],
            ],
        ])->assertSessionHasErrors('products.0.id');

        $product->update(['is_published' => false]);

        $this->post('/contact', [
            'type' => 'quote',
            'name' => 'Unpublished Product Customer',
            'email' => 'unpublished@example.com',
            'message' => 'An unpublished product should not be accepted.',
            'products' => [['id' => $product->id, 'quantity' => 1]],
        ])->assertSessionHasErrors('products.0.id');

        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_public_quote_request_rejects_decimal_product_quantities(): void
    {
        $product = Product::where('is_published', true)->firstOrFail();

        $this->post('/contact', [
            'type' => 'quote',
            'name' => 'Decimal Quantity Customer',
            'email' => 'decimal@example.com',
            'message' => 'Decimal quantities should not be accepted.',
            'products' => [['id' => $product->id, 'quantity' => 1.5]],
        ])->assertSessionHasErrors('products.0.quantity');

        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_admin_can_add_products_to_an_incoming_contact_request(): void
    {
        $this->post('/contact', [
            'type' => 'general',
            'name' => 'Walk-in Customer',
            'email' => 'incoming@example.com',
            'message' => 'Please recommend suitable equipment.',
        ])->assertSessionHasNoErrors();

        $inquiry = Inquiry::where('email', 'incoming@example.com')->firstOrFail();
        $products = Product::take(2)->get();
        $admin = User::where('email', 'admin@technoout.pk')->firstOrFail();

        $this->actingAs($admin)->put("/admin/inquiries/{$inquiry->id}", [
            'type' => $inquiry->type,
            'name' => $inquiry->name,
            'email' => $inquiry->email,
            'message' => $inquiry->message,
            'status' => 'assigned',
            'assigned_to' => $admin->id,
            'products' => [
                ['product_id' => $products[0]->id, 'quantity' => 1],
                ['product_id' => $products[1]->id, 'quantity' => 3],
            ],
        ])->assertSessionHasNoErrors()->assertRedirect('/admin/inquiries');

        $inquiry->refresh();
        $this->assertSame('assigned', $inquiry->status);
        $this->assertCount(2, $inquiry->items);
        $this->assertDatabaseHas('inquiry_items', ['inquiry_id' => $inquiry->id, 'product_id' => $products[0]->id, 'quantity' => 1]);
        $this->assertDatabaseHas('inquiry_items', ['inquiry_id' => $inquiry->id, 'product_id' => $products[1]->id, 'quantity' => 3]);
    }

    public function test_seeded_super_admin_can_access_admin_portal(): void
    {
        $admin = User::where('email', 'admin@technoout.pk')->firstOrFail();
        $this->actingAs($admin)->get('/admin')->assertOk();
        $this->actingAs($admin)->get('/admin/social-links')->assertOk();
        $this->actingAs($admin)->get('/admin/bank-accounts')->assertOk();
    }

    public function test_admin_can_link_product_to_category_and_upload_multiple_images(): void
    {
        Storage::fake('public');
        $admin = \App\Models\User::where('email', 'admin@technoout.pk')->firstOrFail();
        $category = \App\Models\Category::firstOrFail();

        $this->actingAs($admin)->post('/admin/products', [
            'name' => 'Gallery Product',
            'slug' => 'gallery-product',
            'sku' => 'GALLERY-001',
            'category_id' => $category->id,
            'price_mode' => 'quote',
            'is_published' => '1',
            'new_images' => [
                UploadedFile::fake()->image('front.jpg'),
                UploadedFile::fake()->image('detail.webp'),
            ],
        ])->assertSessionHasNoErrors();

        $product = \App\Models\Product::where('slug', 'gallery-product')->firstOrFail();
        $this->assertTrue($product->category->is($category));
        $this->assertCount(2, $product->images);
        $this->assertSame($product->images[0], $product->thumbnail_url);
    }

    public function test_admin_can_manage_category_gallery_and_choose_thumbnail(): void
    {
        Storage::fake('public');
        $admin = \App\Models\User::where('email', 'admin@technoout.pk')->firstOrFail();
        $category = \App\Models\Category::firstOrFail();

        $this->actingAs($admin)->post('/admin/categories/'.$category->id, [
            '_method' => 'put',
            'name' => $category->name,
            'slug' => $category->slug,
            'new_images' => [
                UploadedFile::fake()->image('one.jpg'),
                UploadedFile::fake()->image('two.jpg'),
            ],
        ])->assertSessionHasNoErrors();

        $category->refresh();
        $this->actingAs($admin)->post('/admin/categories/'.$category->id, [
            '_method' => 'put',
            'name' => $category->name,
            'slug' => $category->slug,
            'thumbnail_index' => 1,
        ])->assertSessionHasNoErrors();

        $category->refresh();
        $this->assertCount(2, $category->images);
        $this->assertSame(1, $category->thumbnail_index);
        $this->assertSame($category->images[1], $category->thumbnail_url);
    }

    public function test_every_information_page_has_static_meaningful_content(): void
    {
        $pages = config('static_pages');
        $this->assertCount(22, $pages);

        foreach ($pages as $slug => $page) {
            $this->assertNotEmpty($page['intro']);
            $this->assertGreaterThanOrEqual(2, count($page['blocks']));
            $this->assertSame('story', $page['blocks'][0]['type']);
            $this->get('/'.$slug)->assertOk()->assertSee($page['title']);
        }

        foreach (['solutions', 'our-projects'] as $slug) {
            $this->assertCount(4, $pages[$slug]['details']['items']);
            $this->assertCount(6, $pages[$slug]['details']['applications']);
            $this->assertCount(4, $pages[$slug]['details']['process']);
            $this->get('/'.$slug)->assertSee($pages[$slug]['details']['title']);
        }
        $this->assertCount(23, $pages['our-projects']['portfolio']['items']);
        $this->assertCount(7, $pages['our-projects']['portfolio']['sectors']);
        $this->assertSame('timeline', $pages['company-history']['blocks'][1]['type']);
        $this->assertCount(8, $pages['core-values']['blocks'][1]['items']);
        $this->assertSame('products', $pages['rfid-etag-vehicle-access-control-solution']['blocks'][3]['type']);
        $this->assertSame('notice', $pages['warranty']['blocks'][3]['type']);
        $this->get('/our-brands')->assertOk()->assertSee('Specialist brands across our portfolio');
        $this->get('/visitor-identification-and-management-solution')->assertRedirect('/visitor-management-solution');

        $admin = \App\Models\User::where('email', 'admin@technoout.pk')->firstOrFail();
        $this->actingAs($admin)->get('/admin/pages')->assertOk()->assertSee('Content pages');
        $this->actingAs($admin)->post('/admin/pages', [
            'type' => 'page',
            'title' => 'Browser managed page',
            'slug' => '',
            'body' => 'Content managed through the control center.',
            'is_published' => true,
        ])->assertRedirect('/admin/pages');
        $this->assertDatabaseHas('content_pages', [
            'slug' => 'browser-managed-page',
            'is_published' => true,
            'sort_order' => 0,
        ]);
    }
}
