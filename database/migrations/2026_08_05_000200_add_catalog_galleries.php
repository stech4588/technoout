<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', fn (Blueprint $table) => $table->unsignedInteger('thumbnail_index')->default(0)->after('images'));
        Schema::table('categories', function (Blueprint $table) {
            $table->json('images')->nullable()->after('image_url');
            $table->unsignedInteger('thumbnail_index')->default(0)->after('images');
        });
    }

    public function down(): void
    {
        Schema::table('products', fn (Blueprint $table) => $table->dropColumn('thumbnail_index'));
        Schema::table('categories', fn (Blueprint $table) => $table->dropColumn(['images', 'thumbnail_index']));
    }
};
