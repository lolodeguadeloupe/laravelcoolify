<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_organizer;
    }

    public function view(User $user, Event $event): bool
    {
        return $user->id === $event->user_id;
    }

    public function create(User $user): bool
    {
        return $user->is_organizer;
    }

    public function update(User $user, Event $event): bool
    {
        return $user->id === $event->user_id;
    }

    public function delete(User $user, Event $event): bool
    {
        return $user->id === $event->user_id && $event->isDraft();
    }

    public function publish(User $user, Event $event): bool
    {
        return $user->id === $event->user_id && $event->isDraft();
    }

    public function cancel(User $user, Event $event): bool
    {
        return $user->id === $event->user_id && $event->isPublished();
    }
}
