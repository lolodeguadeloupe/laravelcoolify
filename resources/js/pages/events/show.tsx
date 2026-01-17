import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart, type CartItem } from '@/contexts/cart-context';
import AppLayout from '@/layouts/app-layout';
import { index as eventsIndex } from '@/actions/App/Http/Controllers/EventController';
import { type BreadcrumbItem, type Event, type TicketCategory } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CalendarDays, Check, Clock, MapPin, Minus, Plus, ShoppingCart, Ticket, Users } from 'lucide-react';
import { useState } from 'react';

interface Props {
    event: Event;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatPrice(cents: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(cents / 100);
}

function getAvailability(category: TicketCategory): { available: number; status: 'available' | 'low' | 'sold_out' } {
    const available = category.quantity - category.quantity_sold;
    if (available === 0) return { available: 0, status: 'sold_out' };
    if (available <= 10) return { available, status: 'low' };
    return { available, status: 'available' };
}

function isSalesOpen(category: TicketCategory): boolean {
    const now = new Date();
    if (category.sales_start_at && new Date(category.sales_start_at) > now) return false;
    if (category.sales_end_at && new Date(category.sales_end_at) < now) return false;
    return true;
}

interface TicketCategoryCardProps {
    category: TicketCategory;
    event: CartItem['event'];
}

function TicketCategoryCard({ category, event }: TicketCategoryCardProps) {
    const { available, status } = getAvailability(category);
    const salesOpen = isSalesOpen(category);
    const { addItem, updateQuantity, removeItem, getItemQuantity, isInCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [justAdded, setJustAdded] = useState(false);

    const inCart = isInCart(category.id);
    const cartQuantity = getItemQuantity(category.id);
    const maxQuantity = Math.min(category.max_per_order, available);

    const handleAddToCart = () => {
        addItem(event, category, quantity);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
    };

    const handleIncrement = () => {
        if (inCart) {
            updateQuantity(category.id, Math.min(cartQuantity + 1, maxQuantity));
        } else {
            setQuantity((q) => Math.min(q + 1, maxQuantity));
        }
    };

    const handleDecrement = () => {
        if (inCart) {
            if (cartQuantity <= 1) {
                removeItem(category.id);
            } else {
                updateQuantity(category.id, cartQuantity - 1);
            }
        } else {
            setQuantity((q) => Math.max(q - 1, 1));
        }
    };

    return (
        <Card className={status === 'sold_out' ? 'opacity-60' : ''}>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {category.description && (
                            <CardDescription className="mt-1">{category.description}</CardDescription>
                        )}
                    </div>
                    <span className="whitespace-nowrap text-xl font-bold">
                        {category.price === 0 ? 'Gratuit' : formatPrice(category.price)}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    {status === 'sold_out' ? (
                        <Badge variant="destructive">Épuisé</Badge>
                    ) : status === 'low' ? (
                        <span className="text-orange-600 dark:text-orange-400">
                            Plus que {available} place{available > 1 ? 's' : ''} !
                        </span>
                    ) : (
                        <span>{available} places disponibles</span>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
                {!salesOpen ? (
                    <Badge variant="secondary">Bientôt disponible</Badge>
                ) : status === 'sold_out' ? (
                    <Button disabled className="w-full">
                        Épuisé
                    </Button>
                ) : (
                    <>
                        <div className="flex w-full items-center justify-between">
                            <span className="text-sm text-muted-foreground">Quantité</span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    onClick={handleDecrement}
                                    disabled={inCart ? cartQuantity <= 0 : quantity <= 1}
                                >
                                    <Minus className="size-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                    {inCart ? cartQuantity : quantity}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    onClick={handleIncrement}
                                    disabled={inCart ? cartQuantity >= maxQuantity : quantity >= maxQuantity}
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </div>
                        </div>
                        {inCart ? (
                            <div className="flex w-full items-center gap-2">
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Check className="size-3" />
                                    Dans le panier
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto text-destructive hover:text-destructive"
                                    onClick={() => removeItem(category.id)}
                                >
                                    Retirer
                                </Button>
                            </div>
                        ) : (
                            <Button className="w-full" onClick={handleAddToCart}>
                                {justAdded ? (
                                    <>
                                        <Check className="mr-2 size-4" />
                                        Ajouté !
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 size-4" />
                                        Ajouter au panier
                                    </>
                                )}
                            </Button>
                        )}
                    </>
                )}
            </CardFooter>
        </Card>
    );
}

export default function EventShow({ event }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Événements',
            href: eventsIndex().url,
        },
        {
            title: event.title,
            href: `/events/${event.slug}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={event.title}>
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Event',
                        name: event.title,
                        description: event.description,
                        startDate: event.starts_at,
                        endDate: event.ends_at || event.starts_at,
                        location: {
                            '@type': 'Place',
                            name: event.location,
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress: event.address,
                                addressLocality: event.city,
                            },
                        },
                        image: event.image ? `/storage/${event.image}` : undefined,
                        offers: event.ticket_categories?.map((tc) => ({
                            '@type': 'Offer',
                            name: tc.name,
                            price: tc.price / 100,
                            priceCurrency: 'EUR',
                            availability:
                                tc.quantity - tc.quantity_sold > 0
                                    ? 'https://schema.org/InStock'
                                    : 'https://schema.org/SoldOut',
                        })),
                    })}
                </script>
            </Head>
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="relative aspect-video overflow-hidden rounded-xl">
                            {event.image ? (
                                <img
                                    src={`/storage/${event.image}`}
                                    alt={event.title}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center bg-muted">
                                    <Ticket className="size-24 text-muted-foreground" />
                                </div>
                            )}
                            {event.is_featured && (
                                <Badge className="absolute right-4 top-4" variant="default">
                                    En vedette
                                </Badge>
                            )}
                        </div>

                        <div className="mt-6 space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold md:text-3xl">{event.title}</h1>
                                <div className="mt-4 flex flex-wrap gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="size-5" />
                                        <span>{formatDate(event.starts_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="size-5" />
                                        <span>
                                            {formatTime(event.starts_at)}
                                            {event.ends_at && ` - ${formatTime(event.ends_at)}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="size-5" />
                                        <span>
                                            {event.location}
                                            {event.address && `, ${event.address}`}, {event.city}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-neutral dark:prose-invert max-w-none">
                                <h2 className="text-xl font-semibold">Description</h2>
                                <p className="whitespace-pre-wrap">{event.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Billets</h2>
                        {event.ticket_categories && event.ticket_categories.length > 0 ? (
                            <div className="space-y-4">
                                {event.ticket_categories.map((category) => (
                                    <TicketCategoryCard
                                        key={category.id}
                                        category={category}
                                        event={{
                                            id: event.id,
                                            title: event.title,
                                            slug: event.slug,
                                            starts_at: event.starts_at,
                                            location: event.location,
                                            city: event.city,
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    Aucun billet disponible pour cet événement.
                                </CardContent>
                            </Card>
                        )}
                        <CartSummary />
                    </div>
                </div>

                <div className="mt-4">
                    <Button variant="outline" asChild>
                        <Link href={eventsIndex().url}>Retour aux événements</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}

function CartSummary() {
    const { items, getTotalItems, getSubtotal, getServiceFees, getTotal } = useCart();

    if (items.length === 0) return null;

    return (
        <Card className="sticky top-4 border-primary/50 bg-primary/5">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ShoppingCart className="size-5" />
                    Votre panier
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                {items.map((item) => (
                    <div key={item.category.id} className="flex justify-between">
                        <span>
                            {item.quantity}x {item.category.name}
                        </span>
                        <span>{formatPrice(item.category.price * item.quantity)}</span>
                    </div>
                ))}
                <div className="border-t pt-2">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Sous-total</span>
                        <span>{formatPrice(getSubtotal())}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Frais de service</span>
                        <span>{formatPrice(getServiceFees())}</span>
                    </div>
                    <div className="mt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(getTotal())}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href="/checkout">
                        Passer la commande ({getTotalItems()} billet{getTotalItems() > 1 ? 's' : ''})
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
