import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Event } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Edit, MapPin, Ticket, Users } from 'lucide-react';

interface Props {
    event: Event;
}

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

export default function EventShow({ event }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Mes événements', href: '/organizer/events' },
        { title: event.title, href: `/organizer/events/${event.id}` },
    ];

    const handlePublish = () => {
        if (confirm('Êtes-vous sûr de vouloir publier cet événement ?')) {
            router.post(`/organizer/events/${event.id}/publish`);
        }
    };

    const handleCancel = () => {
        if (confirm('Êtes-vous sûr de vouloir annuler cet événement ?')) {
            router.post(`/organizer/events/${event.id}/cancel`);
        }
    };

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
            router.delete(`/organizer/events/${event.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={event.title} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{event.title}</h1>
                            <Badge variant={statusVariants[event.status]}>
                                {statusLabels[event.status]}
                            </Badge>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {event.location}, {event.city}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/organizer/events/${event.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Link>
                        </Button>
                        {event.status === 'draft' && (
                            <Button onClick={handlePublish}>Publier</Button>
                        )}
                        {event.status === 'published' && (
                            <Button variant="destructive" onClick={handleCancel}>
                                Annuler
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Billets vendus</CardTitle>
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{event.tickets_count ?? 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{event.orders_count ?? 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Date</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Date(event.starts_at).toLocaleDateString('fr-FR')}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {new Date(event.starts_at).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{event.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Catégories de billets</CardTitle>
                            <CardDescription>
                                Gérez les types de billets pour cet événement.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {event.ticket_categories && event.ticket_categories.length > 0 ? (
                                <div className="space-y-2">
                                    {event.ticket_categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="flex items-center justify-between rounded-md border p-3"
                                        >
                                            <div>
                                                <p className="font-medium">{category.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {category.quantity_sold}/{category.quantity} vendus
                                                </p>
                                            </div>
                                            <p className="font-bold">
                                                {(category.price / 100).toFixed(2)} €
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">
                                    Aucune catégorie de billet. Ajoutez-en pour commencer à vendre.
                                </p>
                            )}
                            <Button className="mt-4 w-full" variant="outline" asChild>
                                <Link href={`/organizer/events/${event.id}/ticket-categories`}>
                                    Gérer les catégories
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {event.status === 'draft' && (
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Zone de danger</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive" onClick={handleDelete}>
                                Supprimer l'événement
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
