import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CalendarDays, MapPin, QrCode, Ticket } from 'lucide-react';

interface TicketGroup {
    event: {
        id: number;
        title: string;
        slug: string;
        starts_at: string;
        location: string;
        city: string;
        image: string | null;
    };
    is_past: boolean;
    tickets: Array<{
        id: number;
        uuid: string;
        status: string;
        category_name: string;
        scanned_at: string | null;
    }>;
}

interface Props {
    ticketGroups: TicketGroup[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mes billets',
        href: '/tickets',
    },
];

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'valid':
            return <Badge variant="default">Valide</Badge>;
        case 'used':
            return <Badge variant="secondary">Utilisé</Badge>;
        case 'cancelled':
            return <Badge variant="destructive">Annulé</Badge>;
        case 'refunded':
            return <Badge variant="outline">Remboursé</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function TicketsIndex({ ticketGroups }: Props) {
    const upcomingEvents = ticketGroups.filter((g) => !g.is_past);
    const pastEvents = ticketGroups.filter((g) => g.is_past);

    if (ticketGroups.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Mes billets" />
                <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
                    <Ticket className="size-24 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Aucun billet</h1>
                        <p className="mt-2 text-muted-foreground">
                            Vous n'avez pas encore acheté de billets.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/events">Découvrir les événements</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mes billets" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold md:text-3xl">Mes billets</h1>
                    <p className="text-muted-foreground">
                        Retrouvez tous vos billets d'événements
                    </p>
                </div>

                {upcomingEvents.length > 0 && (
                    <section>
                        <h2 className="mb-4 text-lg font-semibold">Événements à venir</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {upcomingEvents.map((group) => (
                                <EventTicketCard key={group.event.id} group={group} />
                            ))}
                        </div>
                    </section>
                )}

                {pastEvents.length > 0 && (
                    <section>
                        <Separator className="my-4" />
                        <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
                            Événements passés
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pastEvents.map((group) => (
                                <EventTicketCard key={group.event.id} group={group} isPast />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </AppLayout>
    );
}

function EventTicketCard({ group, isPast = false }: { group: TicketGroup; isPast?: boolean }) {
    return (
        <Card className={isPast ? 'opacity-60' : ''}>
            <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1 text-base">{group.event.title}</CardTitle>
                <CardDescription>
                    <div className="flex flex-col gap-1 text-xs">
                        <span className="flex items-center gap-1">
                            <CalendarDays className="size-3" />
                            {formatDate(group.event.starts_at)}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {group.event.location}, {group.event.city}
                        </span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {group.tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="flex items-center justify-between rounded-md border p-2"
                        >
                            <div className="flex items-center gap-2">
                                <QrCode className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">{ticket.category_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {ticket.uuid.substring(0, 8).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(ticket.status)}
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={`/tickets/${ticket.uuid}`}>Voir</Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
