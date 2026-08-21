<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Payment extends Model { protected $guarded=[]; protected function casts(): array { return ['paid_at'=>'date','reversed_at'=>'datetime','amount'=>'decimal:2']; } public function invoice(){ return $this->belongsTo(Invoice::class); } }
