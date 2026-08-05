<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Category extends Model { protected $guarded=[]; protected $appends=['thumbnail_url']; protected function casts(): array { return ['images'=>'array','is_active'=>'boolean']; } public function products(){ return $this->hasMany(Product::class); } public function children(){ return $this->hasMany(self::class,'parent_id'); } public function getThumbnailUrlAttribute(): string { return $this->images[$this->thumbnail_index]??$this->images[0]??$this->image_url??'/images/product-placeholder.svg'; } }
