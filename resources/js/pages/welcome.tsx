import { Button } from '@/components/ui/button';
import { FeaturedEventsSection } from '@/components/welcome/featured-events-section';
import { HeroSection } from '@/components/welcome/hero-section';
import { UpcomingEventsSection } from '@/components/welcome/upcoming-events-section';
import { index as eventsIndex } from '@/actions/App/Http/Controllers/EventController';
import { dashboard, login, register } from '@/routes';
import { type Event, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Ticket } from 'lucide-react';

interface Props {
    featuredEvents: Event[];
    upcomingEvents: Event[];
}

export default function Welcome({ featuredEvents, upcomingEvents }: Props) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Accueil">
                <meta
                    name="description"
                    content="Event Cool - Découvrez et réservez vos places pour les meilleurs événements : concerts, festivals, spectacles et plus encore."
                />
            </Head>

            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4">
                        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                            <Ticket className="size-6 text-primary" />
                            Event Cool
                        </Link>
                        <nav className="flex items-center gap-4">
                            <Button asChild variant="ghost">
                                <Link href={eventsIndex().url}>Événements</Link>
                            </Button>
                            {auth.user ? (
                                <Button asChild>
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost">
                                        <Link href={login()}>Connexion</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={register()}>Inscription</Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Main content */}
                <main>
                    <HeroSection />
                    <FeaturedEventsSection events={featuredEvents} />
                    <UpcomingEventsSection events={upcomingEvents} />

                    {/* Empty state when no events */}
                    {featuredEvents.length === 0 && upcomingEvents.length === 0 && (
                        <section className="py-16 text-center">
                            <div className="container mx-auto px-4">
                                <Ticket className="mx-auto mb-4 size-16 text-muted-foreground" />
                                <h2 className="mb-2 text-2xl font-bold">
                                    Aucun événement pour le moment
                                </h2>
                                <p className="mb-6 text-muted-foreground">
                                    Revenez bientôt pour découvrir nos prochains événements !
                                </p>
                                <Button asChild>
                                    <Link href={eventsIndex().url}>
                                        Voir tous les événements
                                    </Link>
                                </Button>
                            </div>
                        </section>
                    )}
                </main>

                {/* Footer */}
                <footer className="border-t bg-muted/30 py-8">
                    <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                        <p>&copy; {new Date().getFullYear()} Event Cool. Tous droits réservés.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
