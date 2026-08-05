<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Invoice extends Model { protected $guarded=[]; protected function casts(): array { return ['business_snapshot'=>'array','issue_date'=>'date','due_date'=>'date','sent_at'=>'datetime','viewed_at'=>'datetime']; } public function items(){ return $this->hasMany(InvoiceItem::class); } public function payments(){ return $this->hasMany(Payment::class); } }
