import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, QrCode } from 'lucide-react';

export interface ScanEvent {
    id: number;
    title: string;
    slug: string;
    starts_at: string;
    location: string;
    city: string;
}

interface EventSelectorProps {
    events: ScanEvent[];
    onSelect: (eventId: number) => void;
    isLoading?: boolean;
}

export function EventSelector({ events, onSelect, isLoading }: EventSelectorProps) {
    if (events.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <QrCode className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Aucun événement actif</h3>
                    <p className="mt-2 text-center text-muted-foreground">
                        Vous n&apos;avez pas d&apos;événement publié à scanner pour le moment.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-muted-foreground">Sélectionnez l&apos;événement à scanner :</p>
            <div className="grid gap-4">
                {events.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}, {event.city}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(event.starts_at).toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                            <Button
                                className="mt-4 w-full min-h-[44px]"
                                onClick={() => onSelect(event.id)}
                                disabled={isLoading}
                            >
                                <QrCode className="mr-2 h-4 w-4" />
                                Scanner cet événement
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
