<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class BusinessProfile extends Model { protected $guarded=[]; protected function casts(): array { return ['default_tax_rate'=>'decimal:2']; } }
