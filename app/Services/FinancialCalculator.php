<?php
namespace App\Services;

class FinancialCalculator
{
    public static function totals(array $items, float $discount=0): array
    {
        $normalized=[];$subtotal=0.0;$tax=0.0;
        foreach($items as $item){$quantity=round((float)$item['quantity'],2);$unit=round((float)$item['unit_price'],2);$rate=round((float)($item['tax_rate']??0),2);$line=round($quantity*$unit,2);$lineTax=round($line*$rate/100,2);$subtotal+=$line;$tax+=$lineTax;$normalized[]=[...$item,'quantity'=>$quantity,'unit_price'=>$unit,'tax_rate'=>$rate,'total'=>$line];}
        $discount=round(min(max($discount,0),$subtotal),2);
        return ['items'=>$normalized,'subtotal'=>round($subtotal,2),'discount'=>$discount,'tax'=>round($tax,2),'total'=>round($subtotal-$discount+$tax,2)];
    }
}
