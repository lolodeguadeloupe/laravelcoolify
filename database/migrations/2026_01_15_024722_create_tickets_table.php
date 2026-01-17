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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ticket_category_id')->constrained()->cascadeOnDelete();
            $table->string('qr_code');
            $table->string('holder_name')->nullable();
            $table->string('holder_email')->nullable();
            $table->enum('status', ['valid', 'used', 'cancelled', 'refunded'])->default('valid');
            $table->timestamp('scanned_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index('ticket_category_id');
            $table->index('uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
