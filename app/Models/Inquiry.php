<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inquiry extends Model
{
    protected $guarded = [];

    protected $appends = ['is_returning'];

    protected function casts(): array
    {
        return ['attachments' => 'array'];
    }

    public function items(): HasMany
    {
        return $this->hasMany(InquiryItem::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function getIsReturningAttribute(): bool
    {
        if (! $this->customer_id) {
            return false;
        }

        return static::query()
            ->where('customer_id', $this->customer_id)
            ->when($this->exists, fn ($q) => $q->whereKeyNot($this->id))
            ->exists();
    }
}
