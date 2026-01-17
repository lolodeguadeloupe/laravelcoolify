<?php

namespace App\Http\Controllers;

use App\Jobs\SendTicketEmail;
use App\Models\Event;
use App\Models\Order;
use App\Models\TicketCategory;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    public function index(): Response
    {
        return Inertia::render('checkout/index');
    }

    public function validateCart(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'items' => ['required', 'array', 'min:1'],
            'items.*.category_id' => ['required', 'integer', 'exists:ticket_categories,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'valid' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $items = collect($request->input('items'));
        $categoryIds = $items->pluck('category_id');
        $categories = TicketCategory::whereIn('id', $categoryIds)
            ->with('event')
            ->get()
            ->keyBy('id');

        $errors = [];
        $validatedItems = [];
        $event = null;

        foreach ($items as $item) {
            $category = $categories->get($item['category_id']);

            if (! $category) {
                $errors[] = "Catégorie {$item['category_id']} introuvable.";

                continue;
            }

            $event = $category->event;

            $available = $category->quantity - $category->quantity_sold;

            if ($available < $item['quantity']) {
                $errors[] = "Stock insuffisant pour {$category->name}. Disponible: {$available}";

                continue;
            }

            if ($item['quantity'] > $category->max_per_order) {
                $errors[] = "Maximum {$category->max_per_order} billets par commande pour {$category->name}.";

                continue;
            }

            if ($category->event->status !== 'published') {
                $errors[] = "L'événement n'est plus disponible.";

                continue;
            }

            $validatedItems[] = [
                'category_id' => $category->id,
                'quantity' => $item['quantity'],
                'unit_price' => $category->price,
                'subtotal' => $category->price * $item['quantity'],
                'category_name' => $category->name,
                'event_title' => $category->event->title,
                'event_id' => $category->event->id,
            ];
        }

        if (! empty($errors)) {
            return response()->json([
                'valid' => false,
                'errors' => $errors,
            ], 422);
        }

        $subtotal = collect($validatedItems)->sum('subtotal');
        $serviceFees = $this->paymentService->calculateFees($subtotal);
        $total = $subtotal + $serviceFees;

        return response()->json([
            'valid' => true,
            'items' => $validatedItems,
            'subtotal' => $subtotal,
            'service_fees' => $serviceFees,
            'total' => $total,
            'event' => $event ? [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
            ] : null,
        ]);
    }

    public function createSession(Request $request): JsonResponse
    {
        $request->validate([
            'event_id' => ['required', 'exists:events,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.category_id' => ['required', 'integer', 'exists:ticket_categories,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $event = Event::findOrFail($request->input('event_id'));

        try {
            $session = $this->paymentService->createCheckoutSession(
                auth()->user(),
                $event,
                $request->input('items')
            );

            return response()->json([
                'checkout_url' => $session->url,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    public function success(Request $request): Response|RedirectResponse
    {
        $sessionId = $request->query('session_id');

        if (! $sessionId) {
            return redirect()->route('home');
        }

        $order = Order::where('stripe_session_id', $sessionId)
            ->with(['event', 'tickets.ticketCategory'])
            ->first();

        if (! $order) {
            return Inertia::render('checkout/success', [
                'pending' => true,
                'session_id' => $sessionId,
            ]);
        }

        return Inertia::render('checkout/success', [
            'order' => $order,
            'pending' => false,
        ]);
    }

    public function cancel(): Response
    {
        return Inertia::render('checkout/cancel');
    }

    public function webhook(Request $request): \Illuminate\Http\Response
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        try {
            $this->paymentService->handleWebhook($payload, $signature);

            $event = json_decode($payload);
            if ($event->type === 'checkout.session.completed') {
                $sessionId = $event->data->object->id;
                $order = Order::where('stripe_session_id', $sessionId)->first();

                if ($order) {
                    SendTicketEmail::dispatch($order);
                }
            }

            return response('', 200);
        } catch (\Exception $e) {
            return response($e->getMessage(), 400);
        }
    }
}
