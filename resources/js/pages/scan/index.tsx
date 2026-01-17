import { CameraPermission, requestCameraPermission, type CameraPermissionState } from '@/components/scan/CameraPermission';
import { EventSelector, type ScanEvent } from '@/components/scan/EventSelector';
import { OfflineIndicator } from '@/components/scan/offline-indicator';
import { QRScanner } from '@/components/scan/qr-scanner';
import { ScanHistory } from '@/components/scan/scan-history';
import { ScanResult, type ScanResultData } from '@/components/scan/scan-result';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useOfflineScan } from '@/hooks/useOfflineScan';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, QrCode } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Props {
    events: ScanEvent[];
    selectedEventId: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Scanner', href: '/organizer/scan' },
];

export default function ScanIndex({ events, selectedEventId }: Props) {
    const [selectedEvent, setSelectedEvent] = useState<ScanEvent | null>(
        selectedEventId ? events.find((e) => e.id === Number(selectedEventId)) ?? null : null
    );
    const [cameraPermission, setCameraPermission] = useState<CameraPermissionState>('checking');
    const [isLoading, setIsLoading] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // S7.4: Mode offline hook
    const offline = useOfflineScan({
        eventId: selectedEvent?.id ?? null,
        eventName: selectedEvent?.title ?? null,
        onSyncComplete: (syncedCount) => {
            // Afficher un toast ou notification de synchronisation réussie
            console.log(`${syncedCount} scan(s) synchronisé(s)`);
        },
        onSyncError: (error) => {
            console.error('Erreur de synchronisation:', error);
        },
    });

    // Auto-select if only one event
    useEffect(() => {
        if (events.length === 1 && !selectedEvent) {
            setSelectedEvent(events[0]);
        }
    }, [events, selectedEvent]);

    // Check camera permission on mount
    useEffect(() => {
        checkCameraPermission();
    }, []);

    const checkCameraPermission = useCallback(async () => {
        setCameraPermission('checking');
        const permission = await requestCameraPermission();
        setCameraPermission(permission as CameraPermissionState);
    }, []);

    const handleSelectEvent = useCallback((eventId: number) => {
        const event = events.find((e) => e.id === eventId);
        if (event) {
            setIsLoading(true);
            setSelectedEvent(event);
            // Update URL with selected event
            router.get(
                '/organizer/scan',
                { event: eventId },
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => setIsLoading(false),
                }
            );
        }
    }, [events]);

    const handleRequestPermission = useCallback(async () => {
        setCameraPermission('checking');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            stream.getTracks().forEach((track) => track.stop());
            setCameraPermission('granted');
        } catch {
            setCameraPermission('denied');
        }
    }, []);

    const handleBack = useCallback(() => {
        setSelectedEvent(null);
        router.get('/organizer/scan', {}, { preserveState: true });
    }, []);

    const handleScan = useCallback(async (qrCode: string) => {
        if (!selectedEvent || isProcessing) return;

        setIsProcessing(true);

        try {
            // S7.4: Utiliser le hook offline qui gère automatiquement online/offline
            const result = await offline.scanTicket(qrCode);
            setScanResult(result);
        } catch (error) {
            setScanResult({
                status: 'invalid',
                message: 'Erreur lors de la validation du QR code.',
            });
        } finally {
            setIsProcessing(false);
        }
    }, [selectedEvent, isProcessing, offline]);

    const handleDismissResult = useCallback(() => {
        setScanResult(null);
    }, []);

    // Loading state
    if (cameraPermission === 'checking' && !selectedEvent) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Scanner les billets" />
                <div className="min-h-screen bg-background">
                    <header className="sticky top-0 z-10 border-b bg-background p-4">
                        <div className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            <h1 className="text-lg font-semibold">Scanner les billets</h1>
                        </div>
                    </header>
                    <main className="p-4 space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </main>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={selectedEvent ? `Scanner - ${selectedEvent.title}` : 'Scanner les billets'} />
            <div className="min-h-screen bg-background">
                {/* Header fixe - mobile-first */}
                <header className="sticky top-0 z-10 border-b bg-background p-4">
                    <div className="flex items-center gap-2">
                        {selectedEvent && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mr-1 min-h-[44px] min-w-[44px]"
                                onClick={handleBack}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        )}
                        <QrCode className="h-5 w-5" />
                        <h1 className="text-lg font-semibold truncate">
                            {selectedEvent ? selectedEvent.title : 'Scanner les billets'}
                        </h1>
                    </div>
                </header>

                {/* Contenu principal */}
                <main className="p-4 space-y-4">
                    {!selectedEvent ? (
                        // Sélection de l'événement
                        <EventSelector
                            events={events}
                            onSelect={handleSelectEvent}
                            isLoading={isLoading}
                        />
                    ) : cameraPermission !== 'granted' ? (
                        // Demande de permission caméra
                        <CameraPermission
                            status={cameraPermission}
                            onRequestPermission={handleRequestPermission}
                            onRetry={checkCameraPermission}
                        />
                    ) : (
                        // Scanner actif (S7.2 + S7.4 Mode offline + S7.5 Historique)
                        <div className="space-y-4">
                            {/* Indicateur offline (S7.4) */}
                            <OfflineIndicator
                                isOffline={offline.isOffline}
                                isSyncing={offline.isSyncing}
                                pendingScansCount={offline.pendingScansCount}
                                onSyncNow={offline.syncPendingScans}
                            />

                            <div className="rounded-lg bg-muted p-3 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Événement : <span className="font-semibold text-foreground">{selectedEvent.title}</span>
                                </p>
                                {offline.isLoadingData && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Téléchargement des billets pour mode hors-ligne...
                                    </p>
                                )}
                            </div>

                            <QRScanner
                                onScan={handleScan}
                                isProcessing={isProcessing}
                                disabled={isProcessing}
                            />

                            <ScanResult
                                result={scanResult}
                                onDismiss={handleDismissResult}
                                autoDismissDelay={3000}
                            />

                            {/* Historique des scans (S7.5) */}
                            <ScanHistory eventId={selectedEvent.id} />
                        </div>
                    )}
                </main>
            </div>
        </AppLayout>
    );
}
