<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Invoice extends Model { protected $guarded=[]; protected function casts(): array { return ['business_snapshot'=>'array','issue_date'=>'date','due_date'=>'date','sent_at'=>'datetime','viewed_at'=>'datetime','voided_at'=>'datetime','subtotal'=>'decimal:2','discount'=>'decimal:2','tax'=>'decimal:2','total'=>'decimal:2','paid_amount'=>'decimal:2']; } public function items(){ return $this->hasMany(InvoiceItem::class); } public function payments(){ return $this->hasMany(Payment::class); } public function quotation(){return $this->belongsTo(Quotation::class);} public function emailMessages(){return $this->morphMany(EmailMessage::class,'emailable');} }
