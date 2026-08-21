<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table): void {
            $table->text('source_url')->nullable()->after('description');
            $table->json('source_data')->nullable()->after('source_url');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->json('documents')->nullable()->after('brochure_url');
            $table->text('source_url')->nullable()->after('documents');
            $table->json('source_data')->nullable()->after('source_url');
        });
    }

    public function down(): void
    {
        Schema::table('categories', fn (Blueprint $table) => $table->dropColumn(['source_url', 'source_data']));
        Schema::table('products', fn (Blueprint $table) => $table->dropColumn(['documents', 'source_url', 'source_data']));
    }
};
