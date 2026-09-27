<?php

namespace App\Mail;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewInquiryAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Inquiry $inquiry) {}

    public function envelope(): Envelope
    {
        $from = config('mail.from.address', 'info@viatech.pk');
        $name = config('mail.from.name', 'ViaTech');

        return new Envelope(
            from: new Address($from, $name),
            subject: 'New '.$this->inquiry->type.' request · '.$this->inquiry->reference,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.inquiry-alert',
            with: [
                'inquiry' => $this->inquiry,
                'brand' => config('mail.from.name', 'ViaTech'),
            ],
        );
    }
}
