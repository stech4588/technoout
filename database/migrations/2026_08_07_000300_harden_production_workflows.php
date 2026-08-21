<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('document_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('type', 30);
            $table->unsignedSmallInteger('year');
            $table->unsignedBigInteger('current_value')->default(0);
            $table->timestamps();
            $table->unique(['type', 'year']);
        });
        Schema::table('quotations', function (Blueprint $table) {
            $table->string('response_ip', 45)->nullable()->after('responded_at');
            $table->string('response_user_agent', 1000)->nullable()->after('response_ip');
        });
        Schema::table('invoices', function (Blueprint $table) {
            $table->text('void_reason')->nullable()->after('viewed_at');
            $table->timestamp('voided_at')->nullable()->after('void_reason');
            $table->unique('quotation_id');
        });
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('reversed_by')->nullable()->after('reversed_at')->constrained('users')->nullOnDelete();
            $table->text('reversal_reason')->nullable()->after('reversed_by');
        });
    }

    public function down(): void
    {
        Schema::table('payments', fn (Blueprint $table) => $table->dropConstrainedForeignId('reversed_by'));
        Schema::table('payments', fn (Blueprint $table) => $table->dropColumn('reversal_reason'));
        Schema::table('invoices', function (Blueprint $table) {$table->dropUnique(['quotation_id']);$table->dropColumn(['void_reason','voided_at']);});
        Schema::table('quotations', fn (Blueprint $table) => $table->dropColumn(['response_ip','response_user_agent']));
        Schema::dropIfExists('document_sequences');
    }
};
