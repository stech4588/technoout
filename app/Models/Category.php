<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Category extends Model
{
    protected $guarded = [];

    protected $appends = ['thumbnail_url'];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'source_data' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function getThumbnailUrlAttribute(): string
    {
        return $this->images[$this->thumbnail_index] ?? $this->images[0] ?? $this->image_url ?? '/images/product-placeholder.svg';
    }

    /** @return list<int> */
    public function selfAndDescendantIds(): array
    {
        $ids = [$this->id];
        $frontier = [$this->id];

        while ($frontier !== []) {
            $children = static::query()->whereIn('parent_id', $frontier)->pluck('id')->all();
            $frontier = [];

            foreach ($children as $childId) {
                if (! in_array($childId, $ids, true)) {
                    $ids[] = $childId;
                    $frontier[] = $childId;
                }
            }
        }

        return $ids;
    }

    /**
     * Active parent categories with nested children and published product counts
     * (including products assigned to descendants).
     */
    public static function catalogTree(): Collection
    {
        $counts = Product::query()
            ->where('is_published', true)
            ->selectRaw('category_id, count(*) as aggregate')
            ->groupBy('category_id')
            ->pluck('aggregate', 'category_id');

        $all = static::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $byParent = $all->groupBy(fn (self $category) => $category->parent_id ?? 0);

        $countFor = function (int $id) use (&$countFor, $counts, $byParent): int {
            $total = (int) ($counts[$id] ?? 0);

            foreach ($byParent->get($id, collect()) as $child) {
                $total += $countFor($child->id);
            }

            return $total;
        };

        return $byParent->get(0, collect())
            ->map(function (self $category) use ($countFor, $byParent) {
                $children = $byParent->get($category->id, collect())
                    ->map(fn (self $child) => [
                        'id' => $child->id,
                        'name' => $child->name,
                        'slug' => $child->slug,
                        'products_count' => $countFor($child->id),
                    ])
                    ->filter(fn (array $child) => $child['products_count'] > 0)
                    ->values();

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'thumbnail_url' => $category->thumbnail_url,
                    'products_count' => $countFor($category->id),
                    'children' => $children,
                ];
            })
            ->filter(fn (array $category) => $category['products_count'] > 0)
            ->values();
    }
}
