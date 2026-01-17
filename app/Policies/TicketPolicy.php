<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    public function view(?User $user, Ticket $ticket): bool
    {
        if (! $user) {
            return false;
        }

        return $ticket->order->user_id === $user->id
            || $ticket->order->event->user_id === $user->id;
    }
}
