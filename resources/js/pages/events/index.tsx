import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EventCard, EventCardSkeleton } from '@/components/events/event-card';
import AppLayout from '@/layouts/app-layout';
import { index as eventsIndex } from '@/actions/App/Http/Controllers/EventController';
import { type BreadcrumbItem, type Event, type PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Search, Ticket } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
    events: PaginatedData<Event>;
    filters: {
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: eventsIndex().url,
    },
];

function Pagination({ pagination }: { pagination: PaginatedData<Event> }) {
    if (pagination.last_page <= 1) return null;

    const pages = Array.from({ length: pagination.last_page }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center gap-2">
            {pages.map((page) => (
                <Button
                    key={page}
                    variant={page === pagination.current_page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => router.get(eventsIndex().url, { page }, { preserveState: true })}
                >
                    {page}
                </Button>
            ))}
        </div>
    );
}

export default function EventsIndex({ events, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [isSearching, setIsSearching] = useState(false);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        setIsSearching(true);
        router.get(
            eventsIndex().url,
            { search: value || undefined },
            {
                preserveState: true,
                onFinish: () => setIsSearching(false),
            }
        );
    }, 300);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearch(value);
            debouncedSearch(value);
        },
        [debouncedSearch]
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Événements" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold md:text-3xl">Événements</h1>
                        <p className="text-muted-foreground">
                            Découvrez les prochains événements
                        </p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher un événement..."
                            value={search}
                            onChange={handleSearchChange}
                            className="pl-10"
                        />
                    </div>
                </div>

                {isSearching ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <EventCardSkeleton key={i} />
                        ))}
                    </div>
                ) : events.data.length > 0 ? (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {events.data.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                        <Pagination pagination={events} />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                        <Ticket className="size-16 text-muted-foreground" />
                        <div>
                            <h2 className="text-xl font-semibold">Aucun événement trouvé</h2>
                            <p className="text-muted-foreground">
                                {search
                                    ? 'Aucun événement ne correspond à votre recherche.'
                                    : "Il n'y a pas d'événement programmé pour le moment."}
                            </p>
                        </div>
                        {search && (
                            <Button variant="outline" onClick={() => {
                                setSearch('');
                                router.get(eventsIndex().url);
                            }}>
                                Effacer la recherche
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
