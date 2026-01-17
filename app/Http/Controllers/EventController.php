<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(Request $request): Response
    {
        $page = $request->integer('page', 1);
        $search = $request->string('search')->trim()->toString();

        $cacheKey = "events.index.page.{$page}.search.".md5($search);

        $events = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($search) {
            $query = Event::query()
                ->where('status', 'published')
                ->where('starts_at', '>=', now())
                ->with(['ticketCategories' => fn ($q) => $q->orderBy('price')])
                ->orderBy('starts_at');

            if ($search !== '') {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'ilike', "%{$search}%")
                        ->orWhere('description', 'ilike', "%{$search}%")
                        ->orWhere('location', 'ilike', "%{$search}%")
                        ->orWhere('city', 'ilike', "%{$search}%");
                });
            }

            return $query->paginate(12)->withQueryString();
        });

        return Inertia::render('events/index', [
            'events' => $events,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        $event = Cache::remember("events.show.{$slug}", now()->addMinutes(5), function () use ($slug) {
            return Event::query()
                ->where('slug', $slug)
                ->where('status', 'published')
                ->with(['ticketCategories' => fn ($q) => $q->orderBy('sort_order')])
                ->firstOrFail();
        });

        return Inertia::render('events/show', [
            'event' => $event,
        ]);
    }
}
