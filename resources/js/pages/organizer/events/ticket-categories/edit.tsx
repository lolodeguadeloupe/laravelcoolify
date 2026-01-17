import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Event, type TicketCategory } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    event: Event;
    ticketCategory: TicketCategory;
}

export default function TicketCategoryEdit({ event, ticketCategory }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Mes événements', href: '/organizer/events' },
        { title: event.title, href: `/organizer/events/${event.id}` },
        { title: 'Catégories', href: `/organizer/events/${event.id}/ticket-categories` },
        { title: ticketCategory.name, href: `/organizer/events/${event.id}/ticket-categories/${ticketCategory.id}/edit` },
    ];

    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return '';
        return dateString.replace(' ', 'T').slice(0, 16);
    };

    const { data, setData, put, processing, errors } = useForm({
        name: ticketCategory.name,
        description: ticketCategory.description ?? '',
        price: (ticketCategory.price / 100).toFixed(2),
        quantity: ticketCategory.quantity.toString(),
        max_per_order: ticketCategory.max_per_order.toString(),
        sales_start_at: formatDateForInput(ticketCategory.sales_start_at),
        sales_end_at: formatDateForInput(ticketCategory.sales_end_at),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/organizer/events/${event.id}/ticket-categories/${ticketCategory.id}`, {
            data: {
                ...data,
                price: Math.round(parseFloat(data.price || '0') * 100),
                quantity: parseInt(data.quantity || '0'),
                max_per_order: parseInt(data.max_per_order || '10'),
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${ticketCategory.name} - ${event.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Modifier la catégorie</h1>
                <p className="text-muted-foreground">{event.title}</p>

                {ticketCategory.quantity_sold > 0 && (
                    <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Attention :</strong> {ticketCategory.quantity_sold} billet(s) déjà vendu(s).
                            La quantité ne peut pas être inférieure à ce nombre.
                        </p>
                    </div>
                )}

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations du billet</CardTitle>
                            <CardDescription>
                                Modifiez les détails de cette catégorie de billets.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="ex: Place Standard, VIP, Early Bird..."
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Avantages inclus, conditions..."
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Prix (€) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.price && (
                                        <p className="text-sm text-destructive">{errors.price}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantité disponible *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min={ticketCategory.quantity_sold}
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        placeholder="100"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Minimum: {ticketCategory.quantity_sold} (déjà vendus)
                                    </p>
                                    {errors.quantity && (
                                        <p className="text-sm text-destructive">{errors.quantity}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_per_order">Max par commande *</Label>
                                    <Input
                                        id="max_per_order"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={data.max_per_order}
                                        onChange={(e) => setData('max_per_order', e.target.value)}
                                    />
                                    {errors.max_per_order && (
                                        <p className="text-sm text-destructive">{errors.max_per_order}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sales_start_at">Début des ventes</Label>
                                    <Input
                                        id="sales_start_at"
                                        type="datetime-local"
                                        value={data.sales_start_at}
                                        onChange={(e) => setData('sales_start_at', e.target.value)}
                                    />
                                    {errors.sales_start_at && (
                                        <p className="text-sm text-destructive">{errors.sales_start_at}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sales_end_at">Fin des ventes</Label>
                                    <Input
                                        id="sales_end_at"
                                        type="datetime-local"
                                        value={data.sales_end_at}
                                        onChange={(e) => setData('sales_end_at', e.target.value)}
                                    />
                                    {errors.sales_end_at && (
                                        <p className="text-sm text-destructive">{errors.sales_end_at}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Enregistrement...' : 'Enregistrer'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
