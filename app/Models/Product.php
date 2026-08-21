<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Product extends Model { protected $guarded=[]; protected $appends=['thumbnail_url']; protected function casts(): array { return ['specifications'=>'array','images'=>'array','documents'=>'array','source_data'=>'array','is_featured'=>'boolean','is_published'=>'boolean','price'=>'decimal:2']; } public function category(){ return $this->belongsTo(Category::class); } public function getThumbnailUrlAttribute(): string { return $this->images[$this->thumbnail_index]??$this->images[0]??'/images/product-placeholder.svg'; } }
