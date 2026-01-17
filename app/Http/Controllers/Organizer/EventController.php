<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = auth()->user()->events()
            ->withCount('tickets')
            ->latest()
            ->paginate(10);

        return Inertia::render('organizer/events/index', [
            'events' => $events,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('organizer/events/create');
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();
        $data['slug'] = Str::slug($data['title']).'-'.Str::random(6);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('events', 'public');
        }

        $event = Event::create($data);

        return redirect()
            ->route('organizer.events.edit', $event)
            ->with('success', 'Événement créé avec succès.');
    }

    public function show(Event $event): Response
    {
        $this->authorize('view', $event);

        $event->load(['ticketCategories', 'orders' => fn ($q) => $q->latest()->limit(10)]);
        $event->loadCount(['tickets', 'orders']);

        return Inertia::render('organizer/events/show', [
            'event' => $event,
        ]);
    }

    public function edit(Event $event): Response
    {
        $this->authorize('update', $event);

        return Inertia::render('organizer/events/edit', [
            'event' => $event,
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($event->image) {
                Storage::disk('public')->delete($event->image);
            }
            $data['image'] = $request->file('image')->store('events', 'public');
        }

        $event->update($data);

        return redirect()
            ->route('organizer.events.edit', $event)
            ->with('success', 'Événement mis à jour avec succès.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $this->authorize('delete', $event);

        if ($event->image) {
            Storage::disk('public')->delete($event->image);
        }

        $event->delete();

        return redirect()
            ->route('organizer.events.index')
            ->with('success', 'Événement supprimé avec succès.');
    }

    public function publish(Event $event): RedirectResponse
    {
        $this->authorize('publish', $event);

        $event->update(['status' => 'published']);

        return redirect()
            ->route('organizer.events.show', $event)
            ->with('success', 'Événement publié avec succès.');
    }

    public function cancel(Event $event): RedirectResponse
    {
        $this->authorize('cancel', $event);

        $event->update(['status' => 'cancelled']);

        return redirect()
            ->route('organizer.events.show', $event)
            ->with('success', 'Événement annulé.');
    }
}
