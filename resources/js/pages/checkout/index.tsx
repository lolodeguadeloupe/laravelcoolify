import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/cart-context';
import AppLayout from '@/layouts/app-layout';
import { index as eventsIndex } from '@/actions/App/Http/Controllers/EventController';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, CalendarDays, MapPin, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Événements',
        href: eventsIndex().url,
    },
    {
        title: 'Checkout',
        href: '/checkout',
    },
];

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatPrice(cents: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(cents / 100);
}

export default function CheckoutIndex() {
    const {
        items,
        updateQuantity,
        removeItem,
        clearCart,
        getSubtotal,
        getServiceFees,
        getTotal,
        getTotalItems,
    } = useCart();

    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        setValidationErrors([]);
    }, [items]);

    if (items.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Panier vide" />
                <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
                    <ShoppingCart className="size-24 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Votre panier est vide</h1>
                        <p className="mt-2 text-muted-foreground">
                            Parcourez nos événements pour trouver des billets.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={eventsIndex().url}>Voir les événements</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const eventInfo = items[0]?.event;

    const handleValidateAndProceed = async () => {
        setIsValidating(true);
        setValidationErrors([]);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            // First validate the cart
            const validateResponse = await fetch('/checkout/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    items: items.map((item) => ({
                        category_id: item.category.id,
                        quantity: item.quantity,
                    })),
                }),
            });

            const validateData = await validateResponse.json();

            if (!validateData.valid) {
                setValidationErrors(Array.isArray(validateData.errors) ? validateData.errors : Object.values(validateData.errors).flat() as string[]);
                return;
            }

            // Create Stripe Checkout session
            const sessionResponse = await fetch('/checkout/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    event_id: eventInfo?.id,
                    items: items.map((item) => ({
                        category_id: item.category.id,
                        quantity: item.quantity,
                    })),
                }),
            });

            const sessionData = await sessionResponse.json();

            if (sessionData.error) {
                setValidationErrors([sessionData.error]);
                return;
            }

            // Redirect to Stripe Checkout
            if (sessionData.checkout_url) {
                clearCart();
                window.location.href = sessionData.checkout_url;
            }
        } catch {
            setValidationErrors(['Une erreur est survenue. Veuillez réessayer.']);
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Récapitulatif de commande" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold md:text-3xl">Récapitulatif de commande</h1>
                        <p className="text-muted-foreground">
                            Vérifiez votre commande avant de procéder au paiement
                        </p>
                    </div>
                    <Button variant="ghost" asChild>
                        <Link href={`/events/${eventInfo?.slug}`}>
                            <ArrowLeft className="mr-2 size-4" />
                            Modifier
                        </Link>
                    </Button>
                </div>

                {validationErrors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Erreur de validation</AlertTitle>
                        <AlertDescription>
                            <ul className="list-inside list-disc">
                                {validationErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Événement</CardTitle>
                                <CardDescription className="flex flex-col gap-1">
                                    <span className="font-medium text-foreground">{eventInfo?.title}</span>
                                    <span className="flex items-center gap-2">
                                        <CalendarDays className="size-4" />
                                        {formatDate(eventInfo?.starts_at || '')}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <MapPin className="size-4" />
                                        {eventInfo?.location}, {eventInfo?.city}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Billets</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.category.id}
                                        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{item.category.name}</p>
                                            {item.category.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {item.category.description}
                                                </p>
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                {formatPrice(item.category.price)} / billet
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() =>
                                                        updateQuantity(item.category.id, item.quantity - 1)
                                                    }
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="size-4" />
                                                </Button>
                                                <span className="w-8 text-center font-medium">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() =>
                                                        updateQuantity(item.category.id, item.quantity + 1)
                                                    }
                                                    disabled={item.quantity >= item.category.max_per_order}
                                                >
                                                    <Plus className="size-4" />
                                                </Button>
                                            </div>
                                            <span className="w-24 text-right font-semibold">
                                                {formatPrice(item.category.price * item.quantity)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => removeItem(item.category.id)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle className="text-lg">Résumé</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Sous-total ({getTotalItems()} billet{getTotalItems() > 1 ? 's' : ''})
                                        </span>
                                        <span>{formatPrice(getSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Frais de service (5% + 0.50€)</span>
                                        <span>{formatPrice(getServiceFees())}</span>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total</span>
                                    <span>{formatPrice(getTotal())}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-3">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleValidateAndProceed}
                                    disabled={isValidating}
                                >
                                    {isValidating ? 'Validation...' : 'Procéder au paiement'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-destructive hover:text-destructive"
                                    onClick={clearCart}
                                >
                                    Vider le panier
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardContent className="p-4 text-xs text-muted-foreground">
                                <p>
                                    En procédant au paiement, vous acceptez nos{' '}
                                    <a href="#" className="underline">
                                        conditions générales de vente
                                    </a>
                                    .
                                </p>
                                <p className="mt-2">
                                    Paiement sécurisé par Stripe. Vos données bancaires ne sont jamais
                                    stockées sur nos serveurs.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
