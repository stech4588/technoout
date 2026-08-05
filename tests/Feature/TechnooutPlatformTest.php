<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
        $this->assertDatabaseHas('business_profiles', ['name' => 'Technoout']);
        $this->assertDatabaseCount('products', 18);
    }

    public function test_customer_can_submit_a_contact_request(): void
    {
        $response = $this->post('/contact', [
            'type' => 'quote',
            'name' => 'A Customer',
            'company' => 'Example Industries',
            'email' => 'buyer@example.com',
            'phone' => '+92 300 1234567',
            'message' => 'Please quote an access control solution.',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame(1, Inquiry::count());
        $this->assertDatabaseHas('inquiries', ['email' => 'buyer@example.com', 'status' => 'new']);
    }

    public function test_seeded_super_admin_can_access_admin_portal(): void
    {
        $admin = \App\Models\User::where('email', 'admin@technoout.pk')->firstOrFail();
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
}
