<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ContentPage extends Model { protected $guarded=[]; protected function casts(): array { return ['is_published'=>'boolean','publish_at'=>'datetime']; } public function scopePublished($query){return $query->where('is_published',true)->where(fn($q)=>$q->whereNull('publish_at')->orWhere('publish_at','<=',now()));} }
