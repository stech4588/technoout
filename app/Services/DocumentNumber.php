<?php
namespace App\Services;
use App\Models\DocumentSequence;
use Illuminate\Support\Facades\DB;

class DocumentNumber
{
    public static function next(string $type, string $prefix): string
    {
        $year=(int)now()->year;
        return DB::transaction(function () use ($type,$prefix,$year) {
            DocumentSequence::query()->insertOrIgnore(['type'=>$type,'year'=>$year,'current_value'=>0,'created_at'=>now(),'updated_at'=>now()]);
            $sequence=DocumentSequence::where(['type'=>$type,'year'=>$year])->lockForUpdate()->firstOrFail();
            $sequence->increment('current_value');
            return sprintf('%s-%d-%05d',strtoupper($prefix),$year,$sequence->fresh()->current_value);
        },5);
    }
}
