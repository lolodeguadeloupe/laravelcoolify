import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import {
    clearTickets,
    saveTickets,
    getTicketByUuid,
    updateTicketStatus,
    addPendingScan,
    getPendingScans,
    markScansSynced,
    removeSyncedScans,
    saveEvent,
    isEventDataFresh,
    getDbSize,
    type OfflineTicket,
} from '@/lib/offline-db';

export interface OfflineScanResult {
    status: 'valid' | 'already_used' | 'invalid';
    message: string;
    ticket?: {
        uuid: string;
        category: string;
        event: string;
        holder: string;
    };
    scanned_at?: string;
    isOffline?: boolean;
}

export interface UseOfflineScanOptions {
    eventId: number | null;
    eventName: string | null;
    onSyncComplete?: (syncedCount: number) => void;
    onSyncError?: (error: string) => void;
}

export function useOfflineScan({
    eventId,
    eventName,
    onSyncComplete,
    onSyncError,
}: UseOfflineScanOptions) {
    const [isOffline, setIsOffline] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingScansCount, setPendingScansCount] = useState(0);
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Vérifier si on est en ligne ou hors ligne
    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            // Lancer la synchronisation quand on revient en ligne
            if (eventId) {
                syncPendingScans();
            }
        };

        const handleOffline = () => {
            setIsOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // État initial
        setIsOffline(!navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [eventId]);

    // Mettre à jour le compteur de scans en attente
    const updatePendingCount = useCallback(async () => {
        const size = await getDbSize();
        setPendingScansCount(size.pendingScans);
    }, []);

    // Télécharger les données offline pour l'événement
    const downloadOfflineData = useCallback(async () => {
        if (!eventId || !eventName) return false;

        try {
            setIsLoadingData(true);

            const response = await axios.get(
                route('scan.offline-data', { event: eventId })
            );

            const { event, tickets, categories } = response.data;

            // Transformer les tickets avec le nom de la catégorie
            const ticketsWithCategoryNames = tickets.map((ticket: any) => ({
                id: ticket.id,
                uuid: ticket.uuid,
                qr_code: ticket.qr_code,
                status: ticket.status,
                scanned_at: ticket.scanned_at,
                category_id: ticket.category_id,
                category_name:
                    categories.find((c: any) => c.id === ticket.category_id)?.name ||
                    'Inconnu',
            }));

            // Sauvegarder dans IndexedDB
            await saveTickets(ticketsWithCategoryNames);
            await saveEvent({
                id: event.id,
                title: event.title,
                tickets_generated_at: response.data.generated_at,
            });

            await updatePendingCount();

            return true;
        } catch (error) {
            console.error('Erreur lors du téléchargement des données offline:', error);
            return false;
        } finally {
            setIsLoadingData(false);
        }
    }, [eventId, eventName, updatePendingCount]);

    // Initialiser les données offline au chargement de l'événement
    useEffect(() => {
        if (eventId && eventName) {
            const initializeOfflineData = async () => {
                // Vérifier si les données sont déjà fraîches
                const isFresh = await isEventDataFresh(eventId);

                if (isFresh) {
                    await updatePendingCount();
                    return;
                }

                // Télécharger les données si elles ne sont pas fraîches
                await downloadOfflineData();
            };

            initializeOfflineData();
        }
    }, [eventId, eventName, downloadOfflineData, updatePendingCount]);

    // Valider un ticket localement (mode offline)
    const validateOffline = useCallback(async (qrCode: string): Promise<OfflineScanResult | null> => {
        const [uuid, hmac] = qrCode.split(':');

        if (!uuid || !hmac) {
            return {
                status: 'invalid',
                message: 'Format QR code invalide.',
                isOffline: true,
            };
        }

        // Chercher le ticket dans IndexedDB
        const ticket = await getTicketByUuid(uuid);

        if (!ticket) {
            return {
                status: 'invalid',
                message: 'Billet introuvable.',
                isOffline: true,
            };
        }

        // Vérifier que le QR code correspond (anti-falsification simple)
        if (ticket.qr_code !== qrCode) {
            return {
                status: 'invalid',
                message: 'QR code falsifié ou corrompu.',
                isOffline: true,
            };
        }

        if (!ticket) {
            return {
                status: 'invalid',
                message: 'Billet introuvable.',
                isOffline: true,
            };
        }

        // Vérifier le statut du ticket
        if (ticket.status === 'used') {
            return {
                status: 'already_used',
                message: 'Ce billet a déjà été utilisé.',
                ticket: {
                    uuid: ticket.uuid,
                    category: ticket.category_name,
                    event: eventName || '',
                    holder: '',
                },
                scanned_at: ticket.scanned_at || undefined,
                isOffline: true,
            };
        }

        if (ticket.status !== 'valid') {
            return {
                status: 'invalid',
                message: 'Ce billet n\'est pas valide.',
                isOffline: true,
            };
        }

        // Ticket valide - marquer comme utilisé localement
        const scannedAt = new Date().toISOString();
        await updateTicketStatus(uuid, 'used', scannedAt);

        // Ajouter aux scans en attente de synchronisation
        await addPendingScan({
            ticket_id: ticket.id,
            scanned_at: scannedAt,
        });

        await updatePendingCount();

        return {
            status: 'valid',
            message: 'Billet valide ! (Mode hors-ligne)',
            ticket: {
                uuid: ticket.uuid,
                category: ticket.category_name,
                event: eventName || '',
                holder: '',
            },
            isOffline: true,
        };
    }, [eventName, updatePendingCount]);

    // Synchroniser les scans en attente avec le serveur
    const syncPendingScans = useCallback(async () => {
        if (!eventId || isOffline) return 0;

        try {
            setIsSyncing(true);

            const pendingScans = await getPendingScans();

            if (pendingScans.length === 0) {
                await updatePendingCount();
                return 0;
            }

            // Envoyer les scans au serveur
            await axios.post(
                route('scan.sync', { event: eventId }),
                {
                    scans: pendingScans.map((scan) => ({
                        ticket_id: scan.ticket_id,
                        scanned_at: scan.scanned_at,
                    })),
                }
            );

            // Marquer les scans comme synchronisés
            const scanIds = pendingScans.map((s) => s.id);
            await markScansSynced(scanIds);
            await removeSyncedScans();

            await updatePendingCount();

            const syncedCount = pendingScans.length;
            onSyncComplete?.(syncedCount);

            return syncedCount;
        } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
            onSyncError?.('Erreur lors de la synchronisation');

            // Réessayer dans 30 secondes
            syncTimeoutRef.current = setTimeout(() => {
                syncPendingScans();
            }, 30000);

            return 0;
        } finally {
            setIsSyncing(false);
        }
    }, [eventId, isOffline, updatePendingCount, onSyncComplete, onSyncError]);

    // Scanner un ticket (automatiquement offline ou online)
    const scanTicket = useCallback(async (qrCode: string): Promise<OfflineScanResult> => {
        // Si on est offline, utiliser la validation locale
        if (isOffline) {
            const result = await validateOffline(qrCode);
            if (!result) {
                return {
                    status: 'invalid',
                    message: 'Erreur de validation hors-ligne.',
                };
            }
            return result;
        }

        // Sinon, utiliser l'API (mode online avec fallback)
        try {
            const response = await axios.post<OfflineScanResult>(
                route('scan.validate'),
                {
                    qr_code: qrCode,
                    event_id: eventId,
                }
            );

            return response.data;
        } catch (error) {
            // En cas d'erreur réseau, basculer en mode offline
            console.warn('Erreur réseau, basculement en mode offline:', error);
            const result = await validateOffline(qrCode);
            return result || {
                status: 'invalid',
                message: 'Erreur de validation.',
            };
        }
    }, [isOffline, eventId, validateOffline]);

    return {
        isOffline,
        isLoadingData,
        isSyncing,
        pendingScansCount,
        downloadOfflineData,
        scanTicket,
        syncPendingScans,
        refreshPendingCount: updatePendingCount,
    };
}
