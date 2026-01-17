<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Order;
use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\User;
use Illuminate\Support\Str;
use Stripe\Checkout\Session;
use Stripe\Stripe;
use Stripe\Webhook;

class PaymentService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function createCheckoutSession(User $user, Event $event, array $items): Session
    {
        $lineItems = [];
        $metadata = [
            'user_id' => $user->id,
            'event_id' => $event->id,
            'items' => json_encode($items),
        ];

        $subtotal = 0;

        foreach ($items as $item) {
            $category = TicketCategory::findOrFail($item['category_id']);

            if ($category->event_id !== $event->id) {
                throw new \Exception('Catégorie invalide pour cet événement.');
            }

            $available = $category->quantity - $category->quantity_sold;
            if ($item['quantity'] > $available) {
                throw new \Exception("Stock insuffisant pour {$category->name}.");
            }

            if ($item['quantity'] > $category->max_per_order) {
                throw new \Exception("Maximum {$category->max_per_order} billets par commande pour {$category->name}.");
            }

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => $category->name,
                        'description' => "{$event->title} - {$category->name}",
                    ],
                    'unit_amount' => $category->price,
                ],
                'quantity' => $item['quantity'],
            ];

            $subtotal += $category->price * $item['quantity'];
        }

        $fees = $this->calculateFees($subtotal);

        if ($fees > 0) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => 'Frais de service',
                    ],
                    'unit_amount' => $fees,
                ],
                'quantity' => 1,
            ];
        }

        return Session::create([
            'payment_method_types' => ['card'],
            'line_items' => $lineItems,
            'mode' => 'payment',
            'success_url' => route('checkout.success').'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('checkout.cancel'),
            'customer_email' => $user->email,
            'metadata' => $metadata,
            'expires_at' => now()->addMinutes(30)->timestamp,
        ]);
    }

    public function calculateFees(int $subtotal): int
    {
        if ($subtotal === 0) {
            return 0;
        }

        return (int) round($subtotal * 0.05) + 50;
    }

    public function handleWebhook(string $payload, string $signature): void
    {
        $event = Webhook::constructEvent(
            $payload,
            $signature,
            config('services.stripe.webhook_secret')
        );

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $this->processSuccessfulPayment($session);
        }
    }

    public function processSuccessfulPayment(object $session): Order
    {
        $metadata = $session->metadata;
        $items = json_decode($metadata->items, true);

        $order = Order::create([
            'user_id' => $metadata->user_id,
            'event_id' => $metadata->event_id,
            'reference' => $this->generateReference(),
            'total' => $session->amount_total - $this->calculateFees($session->amount_total - 50),
            'fees' => $this->calculateFeesFromTotal($session->amount_total),
            'status' => 'paid',
            'stripe_session_id' => $session->id,
            'stripe_payment_intent_id' => $session->payment_intent,
            'paid_at' => now(),
        ]);

        foreach ($items as $item) {
            $category = TicketCategory::find($item['category_id']);

            for ($i = 0; $i < $item['quantity']; $i++) {
                $uuid = Str::uuid()->toString();

                Ticket::create([
                    'uuid' => $uuid,
                    'order_id' => $order->id,
                    'ticket_category_id' => $category->id,
                    'qr_code' => $this->generateQRCode($uuid),
                    'status' => 'valid',
                ]);
            }

            $category->increment('quantity_sold', $item['quantity']);
        }

        return $order;
    }

    private function generateReference(): string
    {
        do {
            $reference = 'EC-'.strtoupper(Str::random(8));
        } while (Order::where('reference', $reference)->exists());

        return $reference;
    }

    private function generateQRCode(string $uuid): string
    {
        $secret = config('app.key');
        $hmac = hash_hmac('sha256', $uuid, $secret);

        return $uuid.':'.substr($hmac, 0, 16);
    }

    private function calculateFeesFromTotal(int $total): int
    {
        return (int) round(($total - 50) * 0.05 / 1.05) + 50;
    }
}
