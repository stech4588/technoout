<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Quotation extends Model { protected $guarded=[]; protected function casts(): array { return ['business_snapshot'=>'array','issue_date'=>'date','expires_at'=>'date','sent_at'=>'datetime','viewed_at'=>'datetime','responded_at'=>'datetime']; } public function items(){ return $this->hasMany(QuotationItem::class); } }
