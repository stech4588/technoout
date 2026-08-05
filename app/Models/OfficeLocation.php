<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OfficeLocation extends Model { protected $guarded=[]; protected function casts(): array { return ['is_primary'=>'boolean','is_active'=>'boolean']; } public function contacts(){ return $this->hasMany(ContactChannel::class); } }
