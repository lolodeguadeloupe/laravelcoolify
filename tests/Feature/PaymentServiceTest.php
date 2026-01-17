<?php

use App\Services\PaymentService;

describe('PaymentService::calculateFees', function () {
    it('returns 0 for zero subtotal', function () {
        $service = app(PaymentService::class);

        expect($service->calculateFees(0))->toBe(0);
    });

    it('calculates 5% plus 50 cents', function () {
        $service = app(PaymentService::class);

        // 1000 cents (10€) -> 5% = 50 + 50 = 100 cents (1€)
        expect($service->calculateFees(1000))->toBe(100);
    });

    it('calculates fees correctly for larger amounts', function () {
        $service = app(PaymentService::class);

        // 10000 cents (100€) -> 5% = 500 + 50 = 550 cents (5.50€)
        expect($service->calculateFees(10000))->toBe(550);
    });

    it('calculates fees for small amounts', function () {
        $service = app(PaymentService::class);

        // 500 cents (5€) -> 5% = 25 + 50 = 75 cents (0.75€)
        expect($service->calculateFees(500))->toBe(75);
    });

    it('rounds fees correctly', function () {
        $service = app(PaymentService::class);

        // 333 cents (3.33€) -> 5% = 16.65 (rounds to 17) + 50 = 67 cents
        expect($service->calculateFees(333))->toBe(67);
    });
});
