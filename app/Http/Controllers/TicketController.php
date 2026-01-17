<?php

namespace App\Http\Controllers;

use App\Jobs\SendTicketEmail;
use App\Models\Order;
use App\Models\Ticket;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class TicketController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $tickets = Ticket::whereHas('order', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id)
                ->where('status', 'paid');
        })
            ->with(['order.event', 'ticketCategory'])
            ->get()
            ->groupBy(function ($ticket) {
                return $ticket->order->event_id;
            })
            ->map(function ($eventTickets) {
                $event = $eventTickets->first()->order->event;
                $isPast = $event->starts_at < now();

                return [
                    'event' => [
                        'id' => $event->id,
                        'title' => $event->title,
                        'slug' => $event->slug,
                        'starts_at' => $event->starts_at,
                        'location' => $event->location,
                        'city' => $event->city,
                        'image' => $event->image,
                    ],
                    'is_past' => $isPast,
                    'tickets' => $eventTickets->map(function ($ticket) {
                        return [
                            'id' => $ticket->id,
                            'uuid' => $ticket->uuid,
                            'status' => $ticket->status,
                            'category_name' => $ticket->ticketCategory->name,
                            'scanned_at' => $ticket->scanned_at,
                        ];
                    })->values(),
                ];
            })
            ->sortBy('is_past')
            ->values();

        return Inertia::render('tickets/index', [
            'ticketGroups' => $tickets,
        ]);
    }

    public function show(string $uuid): InertiaResponse
    {
        $ticket = Ticket::where('uuid', $uuid)
            ->with(['order.event', 'order.user', 'ticketCategory'])
            ->firstOrFail();

        $this->authorize('view', $ticket);

        return Inertia::render('tickets/show', [
            'ticket' => [
                'id' => $ticket->id,
                'uuid' => $ticket->uuid,
                'qr_code' => $ticket->qr_code,
                'status' => $ticket->status,
                'scanned_at' => $ticket->scanned_at,
                'category' => [
                    'name' => $ticket->ticketCategory->name,
                    'description' => $ticket->ticketCategory->description,
                ],
                'event' => [
                    'id' => $ticket->order->event->id,
                    'title' => $ticket->order->event->title,
                    'slug' => $ticket->order->event->slug,
                    'starts_at' => $ticket->order->event->starts_at,
                    'ends_at' => $ticket->order->event->ends_at,
                    'location' => $ticket->order->event->location,
                    'address' => $ticket->order->event->address,
                    'city' => $ticket->order->event->city,
                    'image' => $ticket->order->event->image,
                ],
                'order' => [
                    'reference' => $ticket->order->reference,
                ],
            ],
        ]);
    }

    public function downloadPdf(string $uuid): Response
    {
        $ticket = Ticket::where('uuid', $uuid)
            ->with(['order.event', 'order.user', 'ticketCategory'])
            ->firstOrFail();

        $this->authorize('view', $ticket);

        $pdf = Pdf::loadView('pdf.ticket', [
            'ticket' => $ticket,
            'event' => $ticket->order->event,
            'category' => $ticket->ticketCategory,
            'order' => $ticket->order,
        ]);

        $filename = sprintf(
            'billet-%s-%s.pdf',
            \Str::slug($ticket->order->event->title),
            substr($ticket->uuid, 0, 8)
        );

        return $pdf->download($filename);
    }

    public function resend(Request $request, string $uuid): JsonResponse
    {
        $ticket = Ticket::where('uuid', $uuid)
            ->with(['order'])
            ->firstOrFail();

        $this->authorize('view', $ticket);

        $key = 'resend-ticket:'.$request->user()->id;

        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'message' => "Trop de tentatives. Réessayez dans {$seconds} secondes.",
            ], 429);
        }

        RateLimiter::hit($key, 3600);

        SendTicketEmail::dispatch($ticket->order);

        return response()->json([
            'message' => 'Email envoyé avec succès.',
        ]);
    }

    public function recover(): InertiaResponse
    {
        return Inertia::render('tickets/recover');
    }

    public function findTicket(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'reference' => ['required', 'string'],
        ]);

        $order = Order::where('reference', strtoupper($request->input('reference')))
            ->whereHas('user', function ($query) use ($request) {
                $query->where('email', $request->input('email'));
            })
            ->with(['event', 'tickets.ticketCategory'])
            ->first();

        if (! $order) {
            return response()->json([
                'found' => false,
                'message' => 'Aucune commande trouvée avec ces informations.',
            ], 404);
        }

        return response()->json([
            'found' => true,
            'order' => [
                'reference' => $order->reference,
                'event' => [
                    'title' => $order->event->title,
                    'starts_at' => $order->event->starts_at,
                    'location' => $order->event->location,
                    'city' => $order->event->city,
                ],
                'tickets' => $order->tickets->map(function ($ticket) {
                    return [
                        'uuid' => $ticket->uuid,
                        'category_name' => $ticket->ticketCategory->name,
                        'status' => $ticket->status,
                    ];
                }),
            ],
        ]);
    }
}
