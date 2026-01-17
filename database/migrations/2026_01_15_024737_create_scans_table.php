<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained()->cascadeOnDelete();
            $table->enum('result', ['success', 'already_used', 'invalid', 'cancelled'])->default('success');
            $table->string('device_info')->nullable();
            $table->boolean('is_offline')->default(false);
            $table->timestamp('scanned_at');
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->index(['ticket_id', 'scanned_at']);
            $table->index('staff_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scans');
    }
};
