<?php

namespace App\Http\Controllers;

use App\Http\Requests\ValidateScanRequest;
use App\Models\Event;
use App\Models\Scan;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScanController extends Controller
{
    public function index(Request $request): Response
    {
        $events = $request->user()->events()
            ->where('status', 'published')
            ->where('starts_at', '>=', now()->subDay())
            ->orderBy('starts_at')
            ->get(['id', 'title', 'slug', 'starts_at', 'location', 'city']);

        return Inertia::render('scan/index', [
            'events' => $events,
            'selectedEventId' => $request->query('event'),
        ]);
    }

    public function validate(ValidateScanRequest $request): JsonResponse
    {
        $qrCode = $request->input('qr_code');
        $eventId = $request->input('event_id');

        // Parse QR code (format: uuid:hmac)
        $parts = explode(':', $qrCode);
        if (count($parts) !== 2) {
            return $this->invalidResponse('Format QR code invalide.');
        }

        [$uuid, $hmac] = $parts;

        // Verify HMAC signature
        $expectedHmac = substr(hash_hmac('sha256', $uuid, config('app.key')), 0, 16);
        if (! hash_equals($expectedHmac, $hmac)) {
            return $this->invalidResponse('QR code falsifié ou corrompu.');
        }

        // Find ticket
        $ticket = Ticket::where('uuid', $uuid)
            ->with(['order.event', 'ticketCategory'])
            ->first();

        if (! $ticket) {
            return $this->invalidResponse('Billet introuvable.');
        }

        // Check if ticket belongs to the selected event
        if ($ticket->order->event_id !== (int) $eventId) {
            return $this->invalidResponse('Ce billet n\'est pas pour cet événement.', [
                'expected_event' => $ticket->order->event->title,
            ]);
        }

        // Check ticket status
        if ($ticket->status === 'cancelled') {
            return $this->invalidResponse('Ce billet a été annulé.');
        }

        if ($ticket->status === 'refunded') {
            return $this->invalidResponse('Ce billet a été remboursé.');
        }

        if ($ticket->status === 'used') {
            return response()->json([
                'status' => 'already_used',
                'message' => 'Ce billet a déjà été utilisé.',
                'scanned_at' => $ticket->scanned_at?->format('d/m/Y H:i'),
                'ticket' => $this->ticketData($ticket),
            ]);
        }

        // Mark ticket as used
        $ticket->update([
            'status' => 'used',
            'scanned_at' => now(),
        ]);

        // Record scan
        Scan::create([
            'ticket_id' => $ticket->id,
            'event_id' => $eventId,
            'scanned_by' => auth()->id(),
            'scanned_at' => now(),
            'result' => 'success',
        ]);

        return response()->json([
            'status' => 'valid',
            'message' => 'Billet valide ! Entrée autorisée.',
            'ticket' => $this->ticketData($ticket),
        ]);
    }

    public function history(Request $request, Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        $scans = Scan::where('event_id', $event->id)
            ->with(['ticket.ticketCategory', 'ticket.order.user'])
            ->latest('scanned_at')
            ->limit(50)
            ->get()
            ->map(fn (Scan $scan) => [
                'id' => $scan->id,
                'scanned_at' => $scan->scanned_at->format('H:i:s'),
                'result' => $scan->result,
                'category' => $scan->ticket->ticketCategory->name,
                'holder' => $scan->ticket->order->user->email ?? 'Invité',
            ]);

        $stats = [
            'total_scanned' => Scan::where('event_id', $event->id)->count(),
            'total_tickets' => Ticket::whereHas('order', fn ($q) => $q->where('event_id', $event->id))->count(),
        ];

        return response()->json([
            'scans' => $scans,
            'stats' => $stats,
        ]);
    }

    public function offlineData(Request $request, Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        // Get all valid ticket UUIDs and HMACs for offline validation
        $tickets = Ticket::whereHas('order', fn ($q) => $q->where('event_id', $event->id)->where('status', 'paid'))
            ->whereIn('status', ['valid', 'used'])
            ->get(['id', 'uuid', 'qr_code', 'status', 'scanned_at', 'ticket_category_id'])
            ->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'uuid' => $ticket->uuid,
                'qr_code' => $ticket->qr_code,
                'status' => $ticket->status,
                'scanned_at' => $ticket->scanned_at,
                'category_id' => $ticket->ticket_category_id,
            ]);

        $categories = $event->ticketCategories->map(fn ($cat) => [
            'id' => $cat->id,
            'name' => $cat->name,
        ]);

        return response()->json([
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
            ],
            'tickets' => $tickets,
            'categories' => $categories,
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    public function syncOfflineScans(Request $request, Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        $request->validate([
            'scans' => ['required', 'array'],
            'scans.*.ticket_id' => ['required', 'integer', 'exists:tickets,id'],
            'scans.*.scanned_at' => ['required', 'date'],
        ]);

        $synced = 0;

        foreach ($request->input('scans') as $scanData) {
            $ticket = Ticket::find($scanData['ticket_id']);

            if ($ticket && $ticket->status === 'valid') {
                $ticket->update([
                    'status' => 'used',
                    'scanned_at' => $scanData['scanned_at'],
                ]);

                Scan::create([
                    'ticket_id' => $ticket->id,
                    'event_id' => $event->id,
                    'scanned_by' => auth()->id(),
                    'scanned_at' => $scanData['scanned_at'],
                    'result' => 'success',
                    'synced_from_offline' => true,
                ]);

                $synced++;
            }
        }

        return response()->json([
            'synced' => $synced,
            'message' => "{$synced} scan(s) synchronisé(s).",
        ]);
    }

    private function invalidResponse(string $message, array $extra = []): JsonResponse
    {
        return response()->json(array_merge([
            'status' => 'invalid',
            'message' => $message,
        ], $extra));
    }

    private function ticketData(Ticket $ticket): array
    {
        return [
            'uuid' => $ticket->uuid,
            'category' => $ticket->ticketCategory->name,
            'event' => $ticket->order->event->title,
            'holder' => $ticket->holder_name ?? $ticket->order->user->name ?? 'Non spécifié',
        ];
    }
}
