<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('business_profiles')->update([
            'name' => 'ViaTech',
            'legal_name' => 'ViaTech Technical Consultants',
            'tagline' => 'Measure. Control. Solve.',
            'footer_text' => 'Automation, security and industrial access systems—measured, controlled and solved with care.',
            'updated_at' => now(),
        ]);

        DB::table('users')
            ->where('name', 'Technoout Administrator')
            ->update(['name' => 'ViaTech Administrator', 'updated_at' => now()]);

        $this->replaceBrandIn('products', ['description']);
        $this->replaceBrandIn('content_pages', ['title', 'body']);
        Cache::forget('business.public');
    }

    public function down(): void
    {
        DB::table('business_profiles')->update([
            'name' => 'Technoout',
            'legal_name' => 'Technoout Technology Consultants',
            'tagline' => 'Engineered access. Intelligent security.',
            'footer_text' => 'Automation, security and industrial access systems—engineered for reliable performance.',
            'updated_at' => now(),
        ]);

        DB::table('users')
            ->where('name', 'ViaTech Administrator')
            ->update(['name' => 'Technoout Administrator', 'updated_at' => now()]);

        $this->replaceBrandIn('products', ['description'], 'ViaTech', 'Technoout');
        $this->replaceBrandIn('content_pages', ['title', 'body'], 'ViaTech', 'Technoout');
        Cache::forget('business.public');
    }

    private function replaceBrandIn(string $table, array $columns, string $from = 'Technoout', string $to = 'ViaTech'): void
    {
        DB::table($table)
            ->select(array_merge(['id'], $columns))
            ->orderBy('id')
            ->chunkById(100, function ($rows) use ($table, $columns, $from, $to): void {
                foreach ($rows as $row) {
                    $updates = [];

                    foreach ($columns as $column) {
                        if (is_string($row->{$column}) && str_contains($row->{$column}, $from)) {
                            $updates[$column] = str_replace($from, $to, $row->{$column});
                        }
                    }

                    if ($updates !== []) {
                        $updates['updated_at'] = now();
                        DB::table($table)->where('id', $row->id)->update($updates);
                    }
                }
            });
    }
};
