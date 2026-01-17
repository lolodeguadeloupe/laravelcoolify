<?php

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\Organizer\EventController as OrganizerEventController;
use App\Http\Controllers\Organizer\TicketCategoryController;
use App\Http\Controllers\ScanController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

// Public events routes (Catalogue)
Route::get('events', [EventController::class, 'index'])->name('events.index');
Route::get('events/{slug}', [EventController::class, 'show'])->name('events.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Checkout routes
    Route::get('checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('checkout/validate', [CheckoutController::class, 'validateCart'])->name('checkout.validate');
    Route::post('checkout/session', [CheckoutController::class, 'createSession'])->name('checkout.session');
    Route::get('checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::get('checkout/cancel', [CheckoutController::class, 'cancel'])->name('checkout.cancel');

    // Tickets routes (buyer)
    Route::get('tickets', [TicketController::class, 'index'])->name('tickets.index');
    Route::get('tickets/{uuid}', [TicketController::class, 'show'])->name('tickets.show')->whereUuid('uuid');
    Route::get('tickets/{uuid}/pdf', [TicketController::class, 'downloadPdf'])->name('tickets.pdf')->whereUuid('uuid');
    Route::post('tickets/{uuid}/resend', [TicketController::class, 'resend'])->name('tickets.resend')->whereUuid('uuid');
});

// Guest ticket recovery (no auth required)
Route::get('recover-ticket', [TicketController::class, 'recover'])->name('tickets.recover');
Route::post('recover-ticket/find', [TicketController::class, 'findTicket'])->name('tickets.find');

// Stripe webhook (no auth, no CSRF)
Route::post('webhook/stripe', [CheckoutController::class, 'webhook'])->name('webhook.stripe');

Route::middleware(['auth', 'verified', 'organizer'])->prefix('organizer')->name('organizer.')->group(function () {
    Route::resource('events', OrganizerEventController::class);
    Route::post('events/{event}/publish', [OrganizerEventController::class, 'publish'])->name('events.publish');
    Route::post('events/{event}/cancel', [OrganizerEventController::class, 'cancel'])->name('events.cancel');

    Route::resource('events.ticket-categories', TicketCategoryController::class)->except(['show']);
    Route::post('events/{event}/ticket-categories/reorder', [TicketCategoryController::class, 'reorder'])->name('events.ticket-categories.reorder');

    // Scan routes
    Route::get('scan', [ScanController::class, 'index'])->name('scan.index');
    Route::post('scan/validate', [ScanController::class, 'validate'])->name('scan.validate');
    Route::get('scan/{event}/history', [ScanController::class, 'history'])->name('scan.history');
    Route::get('scan/{event}/offline-data', [ScanController::class, 'offlineData'])->name('scan.offline-data');
    Route::post('scan/{event}/sync', [ScanController::class, 'syncOfflineScans'])->name('scan.sync');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
