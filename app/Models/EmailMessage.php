<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class EmailMessage extends Model { protected $guarded=[]; protected function casts(): array{return ['attachments'=>'array','sent_at'=>'datetime'];} public function emailable(){return $this->morphTo();} }
