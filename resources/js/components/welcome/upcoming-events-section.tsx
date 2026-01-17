import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/events/event-card';
import { index as eventsIndex } from '@/actions/App/Http/Controllers/EventController';
import { type Event } from '@/types';
import { Link } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';

interface UpcomingEventsSectionProps {
    events: Event[];
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
    if (events.length === 0) {
        return null;
    }

    return (
        <section className="bg-muted/50 py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CalendarDays className="size-6 text-primary" />
                        <h2 className="text-2xl font-bold md:text-3xl">
                            Prochains événements
                        </h2>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={eventsIndex().url}>Voir le calendrier</Link>
                    </Button>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </div>
        </section>
    );
}
