import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatPrice, getLowestPrice } from '@/lib/utils';
import { show as eventsShow } from '@/actions/App/Http/Controllers/EventController';
import { type Event } from '@/types';
import { Link } from '@inertiajs/react';
import { CalendarDays, MapPin, Ticket } from 'lucide-react';

interface EventCardProps {
    event: Event;
}

export function EventCard({ event }: EventCardProps) {
    const lowestPrice = getLowestPrice(event);

    return (
        <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
            <Link href={eventsShow.url(event.slug)} className="block">
                <div className="relative aspect-video overflow-hidden">
                    {event.image ? (
                        <img
                            src={`/storage/${event.image}`}
                            alt={event.title}
                            className="size-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-muted">
                            <Ticket className="size-12 text-muted-foreground" />
                        </div>
                    )}
                    {event.is_featured && (
                        <Badge className="absolute right-2 top-2" variant="default">
                            En vedette
                        </Badge>
                    )}
                </div>
            </Link>
            <CardHeader className="pb-2">
                <Link href={eventsShow.url(event.slug)}>
                    <CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">
                        {event.title}
                    </CardTitle>
                </Link>
            </CardHeader>
            <CardContent className="space-y-2 pb-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0" />
                    <span className="truncate">{formatDate(event.starts_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0" />
                    <span className="truncate">
                        {event.location}, {event.city}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                {lowestPrice !== null ? (
                    <span className="text-lg font-semibold">
                        {lowestPrice === 0 ? 'Gratuit' : `${formatPrice(lowestPrice)}`}
                    </span>
                ) : (
                    <span className="text-muted-foreground">Prix non disponible</span>
                )}
                <Button asChild size="sm">
                    <Link href={eventsShow.url(event.slug)}>Voir</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export function EventCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2 pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-9 w-16" />
            </CardFooter>
        </Card>
    );
}
