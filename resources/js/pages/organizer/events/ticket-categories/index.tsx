import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Event } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';

interface Props {
    event: Event;
}

export default function TicketCategoriesIndex({ event }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Mes événements', href: '/organizer/events' },
        { title: event.title, href: `/organizer/events/${event.id}` },
        { title: 'Catégories de billets', href: `/organizer/events/${event.id}/ticket-categories` },
    ];

    const handleDelete = (categoryId: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            router.delete(`/organizer/events/${event.id}/ticket-categories/${categoryId}`);
        }
    };

    const categories = event.ticket_categories ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Catégories - ${event.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Catégories de billets</h1>
                        <p className="text-muted-foreground">{event.title}</p>
                    </div>
                    <Button asChild>
                        <Link href={`/organizer/events/${event.id}/ticket-categories/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter une catégorie
                        </Link>
                    </Button>
                </div>

                {categories.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <h3 className="text-lg font-semibold">Aucune catégorie</h3>
                            <p className="text-muted-foreground">
                                Créez votre première catégorie de billets pour commencer à vendre.
                            </p>
                            <Button className="mt-4" asChild>
                                <Link href={`/organizer/events/${event.id}/ticket-categories/create`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Créer une catégorie
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {categories.map((category) => {
                            const available = category.quantity - category.quantity_sold;
                            const percentSold = (category.quantity_sold / category.quantity) * 100;

                            return (
                                <Card key={category.id}>
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="cursor-move text-muted-foreground">
                                            <GripVertical className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{category.name}</h3>
                                                {category.quantity_sold > 0 && (
                                                    <Badge variant="secondary">
                                                        {category.quantity_sold} vendu{category.quantity_sold > 1 ? 's' : ''}
                                                    </Badge>
                                                )}
                                            </div>
                                            {category.description && (
                                                <p className="text-sm text-muted-foreground">{category.description}</p>
                                            )}
                                            <div className="mt-2 flex items-center gap-4 text-sm">
                                                <span>{available} / {category.quantity} disponibles</span>
                                                <span>Max {category.max_per_order} par commande</span>
                                            </div>
                                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full bg-primary transition-all"
                                                    style={{ width: `${percentSold}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold">
                                                {(category.price / 100).toFixed(2)} €
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon" asChild>
                                                <Link href={`/organizer/events/${event.id}/ticket-categories/${category.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleDelete(category.id)}
                                                disabled={category.quantity_sold > 0}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/organizer/events/${event.id}`}>Retour à l'événement</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
