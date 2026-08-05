<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ContactChannel extends Model { protected $guarded=[]; protected function casts(): array { return ['is_primary'=>'boolean','is_public'=>'boolean']; } public function office(){ return $this->belongsTo(OfficeLocation::class,'office_location_id'); } }
