import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Event, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, MapPin, Plus, QrCode, Ticket } from 'lucide-react';

interface Props {
    events: PaginatedData<Event>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mes événements', href: '/organizer/events' },
];

const statusLabels: Record<Event['status'], string> = {
    draft: 'Brouillon',
    published: 'Publié',
    cancelled: 'Annulé',
};

const statusVariants: Record<Event['status'], 'secondary' | 'default' | 'destructive'> = {
    draft: 'secondary',
    published: 'default',
    cancelled: 'destructive',
};

export default function EventsIndex({ events }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mes événements" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Mes événements</h1>
                    <Button asChild>
                        <Link href="/organizer/events/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Créer un événement
                        </Link>
                    </Button>
                </div>

                {events.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">Aucun événement</h3>
                            <p className="text-muted-foreground">Créez votre premier événement pour commencer.</p>
                            <Button className="mt-4" asChild>
                                <Link href="/organizer/events/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Créer un événement
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {events.data.map((event) => (
                            <Card key={event.id} className="overflow-hidden">
                                {event.image && (
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={`/storage/${event.image}`}
                                            alt={event.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                                        <Badge variant={statusVariants[event.status]}>
                                            {statusLabels[event.status]}
                                        </Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {event.location}, {event.city}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(event.starts_at).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Ticket className="h-4 w-4" />
                                            {event.tickets_count ?? 0} billets
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm" asChild className="flex-1">
                                            <Link href={`/organizer/events/${event.id}/edit`}>Modifier</Link>
                                        </Button>
                                        <Button size="sm" asChild className="flex-1">
                                            <Link href={`/organizer/events/${event.id}`}>Voir</Link>
                                        </Button>
                                        {event.status === 'published' && (
                                            <Button variant="secondary" size="sm" asChild>
                                                <Link href={`/organizer/scan?event=${event.id}`}>
                                                    <QrCode className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {events.meta.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            disabled={!events.links.prev}
                            onClick={() => events.links.prev && router.get(events.links.prev)}
                        >
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            disabled={!events.links.next}
                            onClick={() => events.links.next && router.get(events.links.next)}
                        >
                            Suivant
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
