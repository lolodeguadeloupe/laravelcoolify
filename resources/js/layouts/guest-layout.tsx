import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto flex h-16 items-center px-4">
                    <Link href="/" className="text-xl font-bold">
                        Event Cool
                    </Link>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
    );
}
