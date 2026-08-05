<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_active')->default(true);
            $table->timestamp('invited_at')->nullable();
        });
        Schema::create('permissions', function (Blueprint $table) { $table->id(); $table->string('name'); $table->string('guard_name'); $table->timestamps(); $table->unique(['name','guard_name']); });
        Schema::create('roles', function (Blueprint $table) { $table->id(); $table->string('name'); $table->string('guard_name'); $table->timestamps(); $table->unique(['name','guard_name']); });
        Schema::create('model_has_permissions', function (Blueprint $table) { $table->foreignId('permission_id')->constrained()->cascadeOnDelete(); $table->string('model_type'); $table->unsignedBigInteger('model_id'); $table->index(['model_id','model_type']); $table->primary(['permission_id','model_id','model_type']); });
        Schema::create('model_has_roles', function (Blueprint $table) { $table->foreignId('role_id')->constrained()->cascadeOnDelete(); $table->string('model_type'); $table->unsignedBigInteger('model_id'); $table->index(['model_id','model_type']); $table->primary(['role_id','model_id','model_type']); });
        Schema::create('role_has_permissions', function (Blueprint $table) { $table->foreignId('permission_id')->constrained()->cascadeOnDelete(); $table->foreignId('role_id')->constrained()->cascadeOnDelete(); $table->primary(['permission_id','role_id']); });

        Schema::create('business_profiles', function (Blueprint $table) {
            $table->id(); $table->string('name'); $table->string('legal_name')->nullable();
            $table->string('tagline')->nullable(); $table->text('description')->nullable();
            $table->string('logo_path')->nullable(); $table->string('currency', 3)->default('PKR');
            $table->decimal('default_tax_rate', 5, 2)->default(0); $table->unsignedSmallInteger('quote_valid_days')->default(30);
            $table->unsignedSmallInteger('invoice_due_days')->default(14); $table->string('quote_prefix')->default('QTN');
            $table->string('invoice_prefix')->default('INV'); $table->string('tax_number')->nullable();
            $table->string('registration_number')->nullable(); $table->string('email_from_name')->nullable();
            $table->text('footer_text')->nullable(); $table->timestamps();
        });
        Schema::create('office_locations', function (Blueprint $table) {
            $table->id(); $table->string('name'); $table->string('address_line_1'); $table->string('address_line_2')->nullable();
            $table->string('city'); $table->string('region')->nullable(); $table->string('postal_code')->nullable();
            $table->string('country')->default('Pakistan'); $table->string('map_url')->nullable(); $table->string('hours')->nullable();
            $table->boolean('is_primary')->default(false); $table->boolean('is_active')->default(true); $table->unsignedInteger('sort_order')->default(0); $table->timestamps();
        });
        Schema::create('contact_channels', function (Blueprint $table) {
            $table->id(); $table->foreignId('office_location_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); $table->string('label'); $table->string('value'); $table->boolean('is_primary')->default(false);
            $table->boolean('is_public')->default(true); $table->unsignedInteger('sort_order')->default(0); $table->timestamps();
        });
        Schema::create('social_links', function (Blueprint $table) {
            $table->id(); $table->string('platform'); $table->string('url'); $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0); $table->timestamps();
        });
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id(); $table->string('bank_name'); $table->string('account_title'); $table->string('account_number')->nullable();
            $table->string('iban')->nullable(); $table->string('currency', 3)->default('PKR'); $table->text('instructions')->nullable();
            $table->boolean('is_active')->default(true); $table->timestamps();
        });
        Schema::create('categories', function (Blueprint $table) {
            $table->id(); $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete(); $table->string('name');
            $table->string('slug')->unique(); $table->text('description')->nullable(); $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true); $table->unsignedInteger('sort_order')->default(0); $table->timestamps();
        });
        Schema::create('products', function (Blueprint $table) {
            $table->id(); $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete(); $table->string('name');
            $table->string('slug')->unique(); $table->string('sku')->nullable()->unique(); $table->string('brand')->nullable();
            $table->text('summary')->nullable(); $table->longText('description')->nullable(); $table->json('specifications')->nullable();
            $table->json('images')->nullable(); $table->string('brochure_url')->nullable(); $table->decimal('price', 14, 2)->nullable();
            $table->string('price_mode')->default('quote'); $table->boolean('is_featured')->default(false); $table->boolean('is_published')->default(true);
            $table->string('seo_title')->nullable(); $table->text('seo_description')->nullable(); $table->timestamps();
        });
        Schema::create('content_pages', function (Blueprint $table) {
            $table->id(); $table->string('type')->default('page'); $table->string('title'); $table->string('slug')->unique();
            $table->string('eyebrow')->nullable(); $table->text('excerpt')->nullable(); $table->longText('body')->nullable();
            $table->string('image_url')->nullable(); $table->boolean('is_published')->default(true); $table->unsignedInteger('sort_order')->default(0); $table->timestamps();
        });
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id(); $table->string('reference')->unique(); $table->string('type')->default('quote'); $table->string('status')->default('new');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete(); $table->string('name'); $table->string('company')->nullable();
            $table->string('email'); $table->string('phone')->nullable(); $table->string('city')->nullable(); $table->string('subject')->nullable();
            $table->text('message'); $table->json('attachments')->nullable(); $table->timestamps();
        });
        Schema::create('inquiry_items', function (Blueprint $table) {
            $table->id(); $table->foreignId('inquiry_id')->constrained()->cascadeOnDelete(); $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description'); $table->decimal('quantity', 12, 2)->default(1); $table->timestamps();
        });
        Schema::create('quotations', function (Blueprint $table) {
            $table->id(); $table->foreignId('inquiry_id')->nullable()->constrained()->nullOnDelete(); $table->string('number')->unique();
            $table->unsignedInteger('revision')->default(1); $table->string('status')->default('draft'); $table->string('customer_name');
            $table->string('customer_company')->nullable(); $table->string('customer_email'); $table->string('customer_phone')->nullable();
            $table->date('issue_date'); $table->date('expires_at'); $table->decimal('subtotal', 14, 2)->default(0); $table->decimal('discount', 14, 2)->default(0);
            $table->decimal('tax', 14, 2)->default(0); $table->decimal('total', 14, 2)->default(0); $table->string('currency', 3)->default('PKR');
            $table->text('notes')->nullable(); $table->text('terms')->nullable(); $table->json('business_snapshot')->nullable();
            $table->uuid('public_token')->unique(); $table->timestamp('sent_at')->nullable(); $table->timestamp('viewed_at')->nullable();
            $table->timestamp('responded_at')->nullable(); $table->timestamps();
        });
        Schema::create('quotation_items', function (Blueprint $table) {
            $table->id(); $table->foreignId('quotation_id')->constrained()->cascadeOnDelete(); $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description'); $table->decimal('quantity', 12, 2); $table->decimal('unit_price', 14, 2); $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('total', 14, 2); $table->timestamps();
        });
        Schema::create('invoices', function (Blueprint $table) {
            $table->id(); $table->foreignId('quotation_id')->nullable()->constrained()->nullOnDelete(); $table->string('number')->unique();
            $table->string('status')->default('draft'); $table->string('customer_name'); $table->string('customer_company')->nullable();
            $table->string('customer_email'); $table->string('customer_phone')->nullable(); $table->date('issue_date'); $table->date('due_date');
            $table->decimal('subtotal', 14, 2)->default(0); $table->decimal('discount', 14, 2)->default(0); $table->decimal('tax', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0); $table->decimal('paid_amount', 14, 2)->default(0); $table->string('currency', 3)->default('PKR');
            $table->text('notes')->nullable(); $table->text('terms')->nullable(); $table->json('business_snapshot')->nullable(); $table->uuid('public_token')->unique();
            $table->timestamp('sent_at')->nullable(); $table->timestamp('viewed_at')->nullable(); $table->timestamps();
        });
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id(); $table->foreignId('invoice_id')->constrained()->cascadeOnDelete(); $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description'); $table->decimal('quantity', 12, 2); $table->decimal('unit_price', 14, 2); $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('total', 14, 2); $table->timestamps();
        });
        Schema::create('payments', function (Blueprint $table) {
            $table->id(); $table->foreignId('invoice_id')->constrained()->cascadeOnDelete(); $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('amount', 14, 2); $table->date('paid_at'); $table->string('method'); $table->string('reference')->nullable();
            $table->text('notes')->nullable(); $table->timestamp('reversed_at')->nullable(); $table->timestamps();
        });
        Schema::create('email_messages', function (Blueprint $table) {
            $table->id(); $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); $table->nullableMorphs('emailable');
            $table->string('to'); $table->string('cc')->nullable(); $table->string('bcc')->nullable(); $table->string('subject'); $table->longText('body');
            $table->json('attachments')->nullable(); $table->string('status')->default('queued'); $table->text('failure_reason')->nullable(); $table->timestamp('sent_at')->nullable(); $table->timestamps();
        });
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id(); $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); $table->string('action'); $table->nullableMorphs('subject');
            $table->json('before')->nullable(); $table->json('after')->nullable(); $table->string('ip_address')->nullable(); $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['activity_logs','email_messages','payments','invoice_items','invoices','quotation_items','quotations','inquiry_items','inquiries','content_pages','products','categories','bank_accounts','social_links','contact_channels','office_locations','business_profiles','role_has_permissions','model_has_roles','model_has_permissions','roles','permissions'] as $table) Schema::dropIfExists($table);
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['is_active','invited_at']));
    }
};
