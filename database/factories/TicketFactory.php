<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\TicketCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    public function definition(): array
    {
        $uuid = Str::uuid()->toString();
        $hmac = substr(hash_hmac('sha256', $uuid, config('app.key')), 0, 16);

        return [
            'uuid' => $uuid,
            'order_id' => Order::factory(),
            'ticket_category_id' => TicketCategory::factory(),
            'qr_code' => $uuid.':'.$hmac,
            'status' => 'valid',
            'scanned_at' => null,
        ];
    }

    public function used(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'used',
            'scanned_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    public function refunded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'refunded',
        ]);
    }
}
