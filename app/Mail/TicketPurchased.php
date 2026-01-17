<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketPurchased extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Vos billets pour {$this->order->event->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ticket-purchased',
            with: [
                'order' => $this->order,
                'event' => $this->order->event,
                'tickets' => $this->order->tickets,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
