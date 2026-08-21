<?php
namespace App\Jobs;

use App\Models\EmailMessage;
use App\Services\Audit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendDocumentEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public int $tries=3;
    public array $backoff=[60,300,900];
    public function __construct(public int $messageId){}
    public function handle(): void
    {
        $message=EmailMessage::findOrFail($this->messageId);$document=$message->emailable()->with('items')->firstOrFail();$type=$document instanceof \App\Models\Quotation?'quotation':'invoice';
        $url=$type==='quotation'?route('public.quotation',$document->public_token):route('public.invoice',$document->public_token);
        $pdf=Pdf::loadView('pdf.document',['document'=>$document,'type'=>$type])->output();
        Mail::html(nl2br(e($message->body)).'<p><a href="'.e($url).'">View document securely</a></p>',function($mail)use($message,$document,$pdf){$mail->to($message->to)->subject($message->subject)->attachData($pdf,$document->number.'.pdf',['mime'=>'application/pdf']);});
        $message->update(['status'=>'sent','sent_at'=>now(),'failure_reason'=>null]);$document->update(['status'=>'sent','sent_at'=>now()]);Audit::record('email.sent',$document,[],['email_message_id'=>$message->id]);
    }
    public function failed(\Throwable $exception): void {EmailMessage::whereKey($this->messageId)->update(['status'=>'failed','failure_reason'=>str($exception->getMessage())->limit(2000)]);}
}
