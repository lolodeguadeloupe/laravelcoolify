import { Button } from '@/components/ui/button';
import { index as eventsIndex } from '@/actions/App/Http/Controllers/EventController';
import { Link } from '@inertiajs/react';
import { Ticket } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-6 rounded-full bg-primary/10 p-4">
                        <Ticket className="size-12 text-primary" />
                    </div>
                    <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                        Découvrez les meilleurs{' '}
                        <span className="text-primary">événements</span>
                    </h1>
                    <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
                        Concerts, festivals, spectacles... Trouvez et réservez vos places en quelques clics.
                    </p>
                    <Button asChild size="lg" className="text-lg">
                        <Link href={eventsIndex().url}>
                            Explorer les événements
                        </Link>
                    </Button>
                </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
        </section>
    );
}
