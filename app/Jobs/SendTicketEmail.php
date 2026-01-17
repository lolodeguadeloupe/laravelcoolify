<?php

namespace App\Jobs;

use App\Mail\TicketPurchased;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendTicketEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Order $order
    ) {}

    public function handle(): void
    {
        $this->order->load(['event', 'tickets.ticketCategory', 'user']);

        Mail::to($this->order->user->email)
            ->send(new TicketPurchased($this->order));
    }
}
