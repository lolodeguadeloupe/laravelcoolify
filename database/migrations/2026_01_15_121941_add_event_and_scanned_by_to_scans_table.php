<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scans', function (Blueprint $table) {
            $table->foreignId('event_id')->nullable()->after('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('scanned_by')->nullable()->after('staff_id')->constrained('users')->nullOnDelete();
            $table->boolean('synced_from_offline')->default(false)->after('synced_at');

            // Make staff_id nullable (organizer can scan directly)
            $table->foreignId('staff_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('scans', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
            $table->dropColumn('event_id');
            $table->dropForeign(['scanned_by']);
            $table->dropColumn('scanned_by');
            $table->dropColumn('synced_from_offline');
        });
    }
};
