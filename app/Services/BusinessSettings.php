<?php
namespace App\Services;
use App\Models\BusinessProfile;
use App\Models\ContactChannel;
use App\Models\OfficeLocation;
use Illuminate\Support\Facades\Cache;
class BusinessSettings {
    public static function public(): array { return Cache::remember('business.public',3600,fn()=>[
        'profile'=>BusinessProfile::first(),
        'locations'=>OfficeLocation::with('contacts')->where('is_active',true)->orderBy('sort_order')->get(),
        'contacts'=>ContactChannel::whereNull('office_location_id')->where('is_public',true)->orderBy('sort_order')->get(),
    ]); }
    public static function forget(): void { Cache::forget('business.public'); }
}
