import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, CalendarDays, CheckCircle, MapPin, Search, Ticket } from 'lucide-react';
import { useState } from 'react';

interface FoundOrder {
    reference: string;
    event: {
        title: string;
        starts_at: string;
        location: string;
        city: string;
    };
    tickets: Array<{
        uuid: string;
        category_name: string;
        status: string;
    }>;
}

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
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function TicketRecover() {
    const [email, setEmail] = useState('');
    const [reference, setReference] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [foundOrder, setFoundOrder] = useState<FoundOrder | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setError(null);
        setFoundOrder(null);

        try {
            const response = await fetch('/recover-ticket/find', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email, reference }),
            });

            const data = await response.json();

            if (response.ok && data.found) {
                setFoundOrder(data.order);
            } else {
                setError(data.message || 'Aucune commande trouvée.');
            }
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Retrouver mon billet" />
            <div className="flex flex-col gap-6">
                <div className="text-center">
                    <Ticket className="mx-auto size-12 text-primary" />
                    <h1 className="mt-4 text-2xl font-bold">Retrouver mon billet</h1>
                    <p className="mt-2 text-muted-foreground">
                        Entrez votre email et le numéro de commande pour retrouver vos billets
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Rechercher une commande</CardTitle>
                        <CardDescription>
                            Ces informations se trouvent dans l'email de confirmation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reference">Numéro de commande</Label>
                                <Input
                                    id="reference"
                                    type="text"
                                    placeholder="EC-XXXXXXXX"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSearching}>
                                <Search className="mr-2 size-4" />
                                {isSearching ? 'Recherche...' : 'Rechercher'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Non trouvé</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {foundOrder && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="size-5 text-green-600" />
                                <CardTitle>Commande trouvée</CardTitle>
                            </div>
                            <CardDescription>
                                Référence : {foundOrder.reference}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg bg-muted p-4">
                                <h3 className="font-semibold">{foundOrder.event.title}</h3>
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <p className="flex items-center gap-2">
                                        <CalendarDays className="size-4" />
                                        {formatDate(foundOrder.event.starts_at)}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MapPin className="size-4" />
                                        {foundOrder.event.location}, {foundOrder.event.city}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-2 font-medium">Vos billets</h4>
                                <div className="space-y-2">
                                    {foundOrder.tickets.map((ticket) => (
                                        <div
                                            key={ticket.uuid}
                                            className="flex items-center justify-between rounded-md border p-3"
                                        >
                                            <div>
                                                <p className="font-medium">{ticket.category_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {ticket.uuid.substring(0, 8).toUpperCase()}
                                                </p>
                                            </div>
                                            {getStatusBadge(ticket.status)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Alert>
                                <AlertCircle className="size-4" />
                                <AlertTitle>Connexion requise</AlertTitle>
                                <AlertDescription>
                                    Pour voir le QR code et télécharger vos billets, veuillez vous
                                    connecter ou créer un compte.
                                </AlertDescription>
                            </Alert>

                            <div className="flex gap-3">
                                <Button asChild className="flex-1">
                                    <Link href="/login">Se connecter</Link>
                                </Button>
                                <Button asChild variant="outline" className="flex-1">
                                    <Link href="/register">Créer un compte</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </GuestLayout>
    );
}
