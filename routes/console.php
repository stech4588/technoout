<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Invoice;
use App\Models\Quotation;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    Quotation::whereIn('status',['sent','viewed'])->whereDate('expires_at','<',today())->update(['status'=>'expired']);
    Invoice::whereIn('status',['sent','viewed'])->whereDate('due_date','<',today())->update(['status'=>'overdue']);
})->dailyAt('00:15')->name('documents:refresh-status')->withoutOverlapping();
