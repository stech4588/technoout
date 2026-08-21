<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Quotation extends Model { protected $guarded=[]; protected function casts(): array { return ['business_snapshot'=>'array','issue_date'=>'date','expires_at'=>'date','sent_at'=>'datetime','viewed_at'=>'datetime','responded_at'=>'datetime','subtotal'=>'decimal:2','discount'=>'decimal:2','tax'=>'decimal:2','total'=>'decimal:2']; } public function items(){ return $this->hasMany(QuotationItem::class); } public function inquiry(){return $this->belongsTo(Inquiry::class);} public function invoice(){return $this->hasOne(Invoice::class);} public function emailMessages(){return $this->morphMany(EmailMessage::class,'emailable');} }
