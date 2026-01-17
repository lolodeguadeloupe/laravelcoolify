import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, CalendarDays, CheckCircle, Download, Mail, MapPin, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useState } from 'react';

interface Props {
    ticket: {
        id: number;
        uuid: string;
        qr_code: string;
        status: string;
        scanned_at: string | null;
        category: {
            name: string;
            description: string | null;
        };
        event: {
            id: number;
            title: string;
            slug: string;
            starts_at: string;
            ends_at: string | null;
            location: string;
            address: string | null;
            city: string;
            image: string | null;
        };
        order: {
            reference: string;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mes billets',
        href: '/tickets',
    },
    {
        title: 'Détail billet',
        href: '#',
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

function getStatusInfo(status: string) {
    switch (status) {
        case 'valid':
            return { badge: <Badge variant="default">Valide</Badge>, color: 'text-green-600' };
        case 'used':
            return { badge: <Badge variant="secondary">Utilisé</Badge>, color: 'text-gray-600' };
        case 'cancelled':
            return { badge: <Badge variant="destructive">Annulé</Badge>, color: 'text-red-600' };
        case 'refunded':
            return { badge: <Badge variant="outline">Remboursé</Badge>, color: 'text-orange-600' };
        default:
            return { badge: <Badge variant="outline">{status}</Badge>, color: 'text-gray-600' };
    }
}

export default function TicketShow({ ticket }: Props) {
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const statusInfo = getStatusInfo(ticket.status);

    const handleResend = async () => {
        setIsResending(true);
        setResendMessage(null);

        try {
            const response = await fetch(`/tickets/${ticket.uuid}/resend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setResendMessage({ type: 'success', text: data.message });
            } else {
                setResendMessage({ type: 'error', text: data.message });
            }
        } catch {
            setResendMessage({ type: 'error', text: 'Une erreur est survenue.' });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Billet - ${ticket.event.title}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold md:text-3xl">{ticket.event.title}</h1>
                        <p className="text-muted-foreground">
                            {ticket.category.name} - Réf: {ticket.order.reference}
                        </p>
                    </div>
                    {statusInfo.badge}
                </div>

                {ticket.status === 'used' && ticket.scanned_at && (
                    <Alert>
                        <CheckCircle className="size-4" />
                        <AlertTitle>Billet utilisé</AlertTitle>
                        <AlertDescription>
                            Ce billet a été scanné le {formatDate(ticket.scanned_at)}.
                        </AlertDescription>
                    </Alert>
                )}

                {ticket.status === 'cancelled' && (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Billet annulé</AlertTitle>
                        <AlertDescription>
                            Ce billet n'est plus valide.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="size-5" />
                                Code QR
                            </CardTitle>
                            <CardDescription>
                                Présentez ce code à l'entrée de l'événement
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <div className="rounded-lg bg-white p-4">
                                <QRCode
                                    value={ticket.qr_code}
                                    size={200}
                                    level="H"
                                />
                            </div>
                            <p className="font-mono text-sm text-muted-foreground">
                                {ticket.uuid.substring(0, 8).toUpperCase()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informations événement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <CalendarDays className="mt-0.5 size-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Date et heure</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(ticket.event.starts_at)}
                                    </p>
                                    {ticket.event.ends_at && (
                                        <p className="text-sm text-muted-foreground">
                                            Fin : {formatDate(ticket.event.ends_at)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 size-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Lieu</p>
                                    <p className="text-sm text-muted-foreground">
                                        {ticket.event.location}
                                    </p>
                                    {ticket.event.address && (
                                        <p className="text-sm text-muted-foreground">
                                            {ticket.event.address}
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        {ticket.event.city}
                                    </p>
                                </div>
                            </div>

                            {ticket.category.description && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="font-medium">Catégorie</p>
                                        <p className="text-sm text-muted-foreground">
                                            {ticket.category.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {ticket.category.description}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {resendMessage && (
                    <Alert variant={resendMessage.type === 'error' ? 'destructive' : 'default'}>
                        {resendMessage.type === 'error' ? (
                            <AlertCircle className="size-4" />
                        ) : (
                            <CheckCircle className="size-4" />
                        )}
                        <AlertDescription>{resendMessage.text}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild>
                        <a href={`/tickets/${ticket.uuid}/pdf`} download>
                            <Download className="mr-2 size-4" />
                            Télécharger PDF
                        </a>
                    </Button>
                    <Button variant="outline" onClick={handleResend} disabled={isResending}>
                        <Mail className="mr-2 size-4" />
                        {isResending ? 'Envoi...' : 'Renvoyer par email'}
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href={`/events/${ticket.event.slug}`}>Voir l'événement</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
