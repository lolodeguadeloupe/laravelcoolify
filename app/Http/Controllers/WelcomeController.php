<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function index(): Response
    {
        $featuredEvents = Event::query()
            ->where('status', 'published')
            ->where('is_featured', true)
            ->where('starts_at', '>=', now())
            ->with('ticketCategories')
            ->orderBy('starts_at')
            ->take(6)
            ->get();

        $upcomingEvents = Event::query()
            ->where('status', 'published')
            ->where('starts_at', '>=', now())
            ->where('is_featured', false)
            ->with('ticketCategories')
            ->orderBy('starts_at')
            ->take(6)
            ->get();

        return Inertia::render('welcome', [
            'featuredEvents' => $featuredEvents,
            'upcomingEvents' => $upcomingEvents,
        ]);
    }
}
