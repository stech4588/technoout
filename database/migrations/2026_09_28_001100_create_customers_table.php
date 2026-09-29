<?php

use App\Models\Inquiry;
use App\Services\CustomerDirectory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('company')->nullable();
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('city')->nullable();
            $table->string('email_normalized');
            $table->string('phone_normalized')->nullable();
            $table->timestamp('first_seen_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->unique('email_normalized');
            $table->index('phone_normalized');
        });

        Schema::table('inquiries', function (Blueprint $table) {
            $table->foreignId('customer_id')->nullable()->after('id')->constrained('customers')->nullOnDelete();
        });

        Inquiry::query()->orderBy('id')->each(function (Inquiry $inquiry) {
            $resolved = CustomerDirectory::resolve([
                'name' => $inquiry->name,
                'company' => $inquiry->company,
                'email' => $inquiry->email,
                'phone' => $inquiry->phone,
                'city' => $inquiry->city,
            ], false);

            $customer = $resolved['customer'];
            if ($inquiry->created_at) {
                if (! $customer->first_seen_at || $inquiry->created_at->lt($customer->first_seen_at)) {
                    $customer->first_seen_at = $inquiry->created_at;
                }
                if (! $customer->last_seen_at || $inquiry->created_at->gt($customer->last_seen_at)) {
                    $customer->last_seen_at = $inquiry->created_at;
                }
                $customer->save();
            }

            $inquiry->forceFill(['customer_id' => $customer->id])->saveQuietly();
        });
    }

    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropConstrainedForeignId('customer_id');
        });

        Schema::dropIfExists('customers');
    }
};
