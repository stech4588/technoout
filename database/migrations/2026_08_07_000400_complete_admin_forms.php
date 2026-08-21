<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', fn(Blueprint $table) => $table->string('image_alt')->nullable()->after('thumbnail_index'));
        Schema::table('categories', function(Blueprint $table){$table->string('image_alt')->nullable()->after('thumbnail_index');$table->string('seo_title')->nullable();$table->text('seo_description')->nullable();});
        Schema::table('content_pages', function(Blueprint $table){$table->string('image_alt')->nullable()->after('image_url');$table->string('seo_title')->nullable();$table->text('seo_description')->nullable();$table->timestamp('publish_at')->nullable();});
        Schema::table('social_links', fn(Blueprint $table) => $table->string('icon')->nullable()->after('platform'));
        Schema::table('bank_accounts', function(Blueprint $table){$table->string('branch')->nullable()->after('bank_name');$table->unsignedInteger('sort_order')->default(0);});
        Schema::table('inquiries', fn(Blueprint $table) => $table->text('internal_notes')->nullable()->after('message'));
    }
    public function down(): void
    {
        Schema::table('inquiries',fn(Blueprint $table)=>$table->dropColumn('internal_notes'));
        Schema::table('bank_accounts',fn(Blueprint $table)=>$table->dropColumn(['branch','sort_order']));
        Schema::table('social_links',fn(Blueprint $table)=>$table->dropColumn('icon'));
        Schema::table('content_pages',fn(Blueprint $table)=>$table->dropColumn(['image_alt','seo_title','seo_description','publish_at']));
        Schema::table('categories',fn(Blueprint $table)=>$table->dropColumn(['image_alt','seo_title','seo_description']));
        Schema::table('products',fn(Blueprint $table)=>$table->dropColumn('image_alt'));
    }
};
