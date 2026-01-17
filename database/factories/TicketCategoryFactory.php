<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketCategory>
 */
class TicketCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => fake()->randomElement(['Standard', 'VIP', 'Premium', 'Early Bird']),
            'description' => fake()->optional()->sentence(),
            'price' => fake()->numberBetween(500, 15000),
            'quantity' => fake()->numberBetween(50, 500),
            'quantity_sold' => 0,
            'sales_start_at' => null,
            'sales_end_at' => null,
            'max_per_order' => 10,
            'sort_order' => 0,
        ];
    }

    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'price' => 0,
        ]);
    }

    public function soldOut(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 100,
            'quantity_sold' => 100,
        ]);
    }

    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 100,
            'quantity_sold' => 95,
        ]);
    }
}
