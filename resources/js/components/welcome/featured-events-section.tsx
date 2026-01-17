import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/events/event-card';
import { index as eventsIndex } from '@/actions/App/Http/Controllers/EventController';
import { type Event } from '@/types';
import { Link } from '@inertiajs/react';
import { Star } from 'lucide-react';

interface FeaturedEventsSectionProps {
    events: Event[];
}

export function FeaturedEventsSection({ events }: FeaturedEventsSectionProps) {
    if (events.length === 0) {
        return null;
    }

    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Star className="size-6 text-primary" />
                        <h2 className="text-2xl font-bold md:text-3xl">
                            Événements à la une
                        </h2>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={eventsIndex().url}>Voir tout</Link>
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
