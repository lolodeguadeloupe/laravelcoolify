import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CalendarDays, CheckCircle, Clock, Download, MapPin, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    order?: Order & {
        event: {
            id: number;
            title: string;
            slug: string;
            starts_at: string;
            location: string;
            city: string;
        };
        tickets: Array<{
            id: number;
            uuid: string;
            qr_code: string;
            status: string;
            ticket_category: {
                id: number;
                name: string;
                price: number;
            };
        }>;
    };
    pending: boolean;
    session_id?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Confirmation',
        href: '/checkout/success',
    },
];

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
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

export default function CheckoutSuccess({ order, pending, session_id }: Props) {
    const [isPolling, setIsPolling] = useState(pending);

    useEffect(() => {
        if (!pending || !session_id) return;

        const interval = setInterval(async () => {
            const response = await fetch(`/checkout/success?session_id=${session_id}`, {
                headers: {
                    'X-Inertia': 'true',
                    'X-Inertia-Version': '',
                },
            });
            const data = await response.json();
            if (data.props && !data.props.pending) {
                window.location.reload();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [pending, session_id]);

    if (pending) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Traitement en cours" />
                <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
                    <Clock className="size-24 animate-pulse text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Traitement de votre paiement</h1>
                        <p className="mt-2 text-muted-foreground">
                            Veuillez patienter, nous confirmons votre commande...
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!order) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Commande introuvable" />
                <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
                    <div>
                        <h1 className="text-2xl font-bold">Commande introuvable</h1>
                        <p className="mt-2 text-muted-foreground">
                            Nous n'avons pas pu trouver cette commande.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/events">Retour aux événements</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const ticketsByCategory = order.tickets.reduce(
        (acc, ticket) => {
            const categoryId = ticket.ticket_category.id;
            if (!acc[categoryId]) {
                acc[categoryId] = {
                    category: ticket.ticket_category,
                    count: 0,
                };
            }
            acc[categoryId].count++;
            return acc;
        },
        {} as Record<number, { category: typeof order.tickets[0]['ticket_category']; count: number }>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Commande confirmée" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col items-center gap-4 text-center">
                    <CheckCircle className="size-16 text-green-500" />
                    <div>
                        <h1 className="text-2xl font-bold md:text-3xl">Commande confirmée !</h1>
                        <p className="mt-2 text-muted-foreground">
                            Merci pour votre achat. Vos billets ont été envoyés par email.
                        </p>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Commande #{order.reference}</span>
                                <span className="text-sm font-normal text-muted-foreground">
                                    {new Date(order.paid_at || order.created_at).toLocaleDateString('fr-FR')}
                                </span>
                            </CardTitle>
                            <CardDescription>
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-foreground">{order.event.title}</span>
                                    <span className="flex items-center gap-2">
                                        <CalendarDays className="size-4" />
                                        {formatDate(order.event.starts_at)}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <MapPin className="size-4" />
                                        {order.event.location}, {order.event.city}
                                    </span>
                                </div>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Ticket className="size-4" />
                                    Vos billets ({order.tickets.length})
                                </h3>
                                <div className="space-y-2 text-sm">
                                    {Object.values(ticketsByCategory).map(({ category, count }) => (
                                        <div key={category.id} className="flex justify-between">
                                            <span>
                                                {category.name} x {count}
                                            </span>
                                            <span>{formatPrice(category.price * count)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sous-total</span>
                                    <span>{formatPrice(order.total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Frais de service</span>
                                    <span>{formatPrice(order.fees)}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total payé</span>
                                <span>{formatPrice(order.total + order.fees)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-medium">Vos billets ont été envoyés</p>
                                    <p className="text-sm text-muted-foreground">
                                        Consultez votre boîte email pour télécharger vos billets avec QR code.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button asChild variant="outline">
                            <Link href={`/events/${order.event.slug}`}>Voir l'événement</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/events">Découvrir d'autres événements</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
