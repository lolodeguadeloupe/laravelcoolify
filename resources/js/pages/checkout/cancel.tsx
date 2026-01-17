import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { XCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paiement annulé',
        href: '/checkout/cancel',
    },
];

export default function CheckoutCancel() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paiement annulé" />
            <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
                <XCircle className="size-24 text-destructive" />
                <div>
                    <h1 className="text-2xl font-bold">Paiement annulé</h1>
                    <p className="mt-2 text-muted-foreground">
                        Votre paiement a été annulé. Aucun montant n'a été débité.
                    </p>
                </div>

                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">
                            Si vous avez rencontré un problème lors du paiement, n'hésitez pas à réessayer
                            ou à nous contacter pour obtenir de l'aide.
                        </p>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="outline">
                        <Link href="/checkout">Retour au panier</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/events">Voir les événements</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
