<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Scan extends Model
{
    /** @use HasFactory<\Database\Factories\ScanFactory> */
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'event_id',
        'staff_id',
        'scanned_by',
        'result',
        'device_info',
        'is_offline',
        'scanned_at',
        'synced_at',
        'synced_from_offline',
    ];

    protected function casts(): array
    {
        return [
            'is_offline' => 'boolean',
            'synced_from_offline' => 'boolean',
            'scanned_at' => 'datetime',
            'synced_at' => 'datetime',
        ];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    public function scanner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scanned_by');
    }

    public function isSuccess(): bool
    {
        return $this->result === 'valid' || $this->result === 'success';
    }

    public function needsSync(): bool
    {
        return $this->is_offline && $this->synced_at === null;
    }
}
