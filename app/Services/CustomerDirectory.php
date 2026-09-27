<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Support\Carbon;

class CustomerDirectory
{
    /**
     * @param  array{name?:string|null,company?:string|null,email?:string|null,phone?:string|null,city?:string|null}  $contact
     * @return array{customer: Customer, is_returning: bool}
     */
    public static function resolve(array $contact, bool $touchTimestamps = true): array
    {
        $emailNormalized = self::normalizeEmail($contact['email'] ?? null);
        $phoneNormalized = self::normalizePhone($contact['phone'] ?? null);

        if (! $emailNormalized) {
            throw new \InvalidArgumentException('A customer email is required.');
        }

        $byEmail = Customer::query()->where('email_normalized', $emailNormalized)->first();
        $byPhone = $phoneNormalized
            ? Customer::query()
                ->where('phone_normalized', $phoneNormalized)
                ->when($byEmail, fn ($q) => $q->whereKeyNot($byEmail->id))
                ->first()
            : null;

        // Prefer email match when email and phone point at different customers.
        $customer = $byEmail ?: $byPhone;
        $isReturning = $customer !== null;

        if (! $customer) {
            $now = Carbon::now();
            $customer = Customer::create([
                'name' => (string) ($contact['name'] ?? 'Customer'),
                'company' => $contact['company'] ?? null,
                'email' => (string) ($contact['email'] ?? $emailNormalized),
                'phone' => $contact['phone'] ?? null,
                'city' => $contact['city'] ?? null,
                'email_normalized' => $emailNormalized,
                'phone_normalized' => $phoneNormalized,
                'first_seen_at' => $touchTimestamps ? $now : null,
                'last_seen_at' => $touchTimestamps ? $now : null,
            ]);

            return ['customer' => $customer, 'is_returning' => false];
        }

        $customer->fill([
            'name' => filled($contact['name'] ?? null) ? $contact['name'] : $customer->name,
            'company' => array_key_exists('company', $contact) ? ($contact['company'] ?: null) : $customer->company,
            'email' => (string) ($contact['email'] ?? $customer->email),
            'phone' => filled($contact['phone'] ?? null) ? $contact['phone'] : $customer->phone,
            'city' => array_key_exists('city', $contact) ? ($contact['city'] ?: null) : $customer->city,
            'email_normalized' => $emailNormalized,
            'phone_normalized' => $phoneNormalized ?: $customer->phone_normalized,
        ]);

        if ($touchTimestamps) {
            $now = Carbon::now();
            if (! $customer->first_seen_at) {
                $customer->first_seen_at = $now;
            }
            $customer->last_seen_at = $now;
        }

        $customer->save();

        return ['customer' => $customer->fresh(), 'is_returning' => $isReturning];
    }

    public static function normalizeEmail(?string $email): ?string
    {
        $email = strtolower(trim((string) $email));

        return $email !== '' ? $email : null;
    }

    public static function normalizePhone(?string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone) ?: '';

        if ($digits === '') {
            return null;
        }

        // Pakistan-friendly: match on last 10 digits when available (+92… / 03…).
        return strlen($digits) >= 10 ? substr($digits, -10) : $digits;
    }
}
