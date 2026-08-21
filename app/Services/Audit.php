<?php
namespace App\Services;
use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

class Audit
{
    public static function record(string $action, ?Model $subject=null, array $before=[], array $after=[]): void
    {
        ActivityLog::create(['user_id'=>auth()->id(),'action'=>$action,'subject_type'=>$subject?->getMorphClass(),'subject_id'=>$subject?->getKey(),'before'=>$before?:null,'after'=>$after?:null,'ip_address'=>request()?->ip()]);
    }
}
