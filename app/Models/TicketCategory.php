<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TicketCategory extends Model
{
    /** @use HasFactory<\Database\Factories\TicketCategoryFactory> */
    use HasFactory;

    protected $fillable = [
        'event_id',
        'name',
        'description',
        'price',
        'quantity',
        'quantity_sold',
        'sales_start_at',
        'sales_end_at',
        'max_per_order',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'quantity' => 'integer',
            'quantity_sold' => 'integer',
            'max_per_order' => 'integer',
            'sort_order' => 'integer',
            'sales_start_at' => 'datetime',
            'sales_end_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function availableQuantity(): int
    {
        return $this->quantity - $this->quantity_sold;
    }

    public function isAvailable(): bool
    {
        return $this->availableQuantity() > 0;
    }
}
