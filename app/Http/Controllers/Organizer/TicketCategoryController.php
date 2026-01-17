<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketCategoryRequest;
use App\Http\Requests\UpdateTicketCategoryRequest;
use App\Models\Event;
use App\Models\TicketCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TicketCategoryController extends Controller
{
    public function index(Event $event): Response
    {
        $this->authorize('update', $event);

        $event->load(['ticketCategories' => fn ($q) => $q->orderBy('sort_order')]);

        return Inertia::render('organizer/events/ticket-categories/index', [
            'event' => $event,
        ]);
    }

    public function create(Event $event): Response
    {
        $this->authorize('update', $event);

        return Inertia::render('organizer/events/ticket-categories/create', [
            'event' => $event,
        ]);
    }

    public function store(StoreTicketCategoryRequest $request, Event $event): RedirectResponse
    {
        $data = $request->validated();
        $data['sort_order'] = $event->ticketCategories()->max('sort_order') + 1;

        $event->ticketCategories()->create($data);

        return redirect()
            ->route('organizer.events.ticket-categories.index', $event)
            ->with('success', 'Catégorie de billet créée avec succès.');
    }

    public function edit(Event $event, TicketCategory $ticketCategory): Response
    {
        $this->authorize('update', $event);

        return Inertia::render('organizer/events/ticket-categories/edit', [
            'event' => $event,
            'ticketCategory' => $ticketCategory,
        ]);
    }

    public function update(UpdateTicketCategoryRequest $request, Event $event, TicketCategory $ticketCategory): RedirectResponse
    {
        $ticketCategory->update($request->validated());

        return redirect()
            ->route('organizer.events.ticket-categories.index', $event)
            ->with('success', 'Catégorie de billet mise à jour.');
    }

    public function destroy(Event $event, TicketCategory $ticketCategory): RedirectResponse
    {
        $this->authorize('update', $event);

        if ($ticketCategory->quantity_sold > 0) {
            return redirect()
                ->route('organizer.events.ticket-categories.index', $event)
                ->with('error', 'Impossible de supprimer une catégorie avec des billets vendus.');
        }

        $ticketCategory->delete();

        return redirect()
            ->route('organizer.events.ticket-categories.index', $event)
            ->with('success', 'Catégorie de billet supprimée.');
    }

    public function reorder(Event $event): RedirectResponse
    {
        $this->authorize('update', $event);

        $order = request()->input('order', []);

        foreach ($order as $index => $id) {
            TicketCategory::where('id', $id)
                ->where('event_id', $event->id)
                ->update(['sort_order' => $index]);
        }

        return redirect()
            ->route('organizer.events.ticket-categories.index', $event)
            ->with('success', 'Ordre mis à jour.');
    }
}
