import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDB extends DBSchema {
    tickets: {
        key: number;
        value: {
            id: number;
            uuid: string;
            qr_code: string;
            status: string;
            scanned_at: string | null;
            category_id: number;
            category_name: string;
        };
        indexes: { 'by-uuid': string };
    };
    pending_scans: {
        key: string;
        value: {
            id: string;
            ticket_id: number;
            scanned_at: string;
            synced: boolean;
        };
        indexes: { 'by-synced': boolean };
    };
    events: {
        key: number;
        value: {
            id: number;
            title: string;
            tickets_generated_at: string;
        };
    };
}

let db: IDBPDatabase<OfflineDB> | null = null;

export async function getDb(): Promise<IDBPDatabase<OfflineDB>> {
    if (db) return db;

    db = await openDB<OfflineDB>('event-cool-offline', 1, {
        upgrade(db) {
            // Store pour les tickets valides
            const ticketStore = db.createObjectStore('tickets', { keyPath: 'id' });
            ticketStore.createIndex('by-uuid', 'uuid');

            // Store pour les scans en attente de synchronisation
            const scanStore = db.createObjectStore('pending_scans', { keyPath: 'id' });
            scanStore.createIndex('by-synced', 'synced');

            // Store pour les événements téléchargés
            db.createObjectStore('events', { keyPath: 'id' });
        },
    });

    return db;
}

// Opérations sur les tickets
export async function clearTickets(): Promise<void> {
    const db = await getDb();
    await db.clear('tickets');
}

export async function saveTickets(tickets: Array<{
    id: number;
    uuid: string;
    qr_code: string;
    status: string;
    scanned_at: string | null;
    category_id: number;
    category_name: string;
}>): Promise<void> {
    const db = await getDb();
    const tx = db.transaction('tickets', 'readwrite');
    await Promise.all([
        tx.store.clear(),
        ...tickets.map((ticket) => tx.store.put(ticket)),
    ]);
    await tx.done;
}

export async function getTicketByUuid(uuid: string): Promise<OfflineDB['tickets']['value'] | undefined> {
    const db = await getDb();
    return db.getFromIndex('tickets', 'by-uuid', uuid);
}

export async function updateTicketStatus(
    uuid: string,
    status: string,
    scannedAt: string
): Promise<void> {
    const db = await getDb();
    const ticket = await getTicketByUuid(uuid);
    if (ticket) {
        await db.put('tickets', { ...ticket, status, scanned_at: scannedAt });
    }
}

// Opérations sur les scans en attente
export async function addPendingScan(scan: {
    ticket_id: number;
    scanned_at: string;
}): Promise<string> {
    const db = await getDb();
    const id = `${scan.ticket_id}-${Date.now()}`;
    await db.add('pending_scans', {
        id,
        ...scan,
        synced: false,
    });
    return id;
}

export async function getPendingScans(): Promise<Array<{
    id: string;
    ticket_id: number;
    scanned_at: string;
    synced: boolean;
}>> {
    const db = await getDb();
    return db.getAllFromIndex('pending_scans', 'by-synced', false);
}

export async function markScansSynced(scanIds: string[]): Promise<void> {
    const db = await getDb();
    const tx = db.transaction('pending_scans', 'readwrite');
    await Promise.all(
        scanIds.map((id) => tx.store.put({ id, synced: true } as any))
    );
    await tx.done;
}

export async function removeSyncedScans(): Promise<void> {
    const db = await getDb();
    const syncedScans = await getPendingScans();
    const tx = db.transaction('pending_scans', 'readwrite');
    await Promise.all(
        syncedScans
            .filter((scan) => scan.synced)
            .map((scan) => tx.store.delete(scan.id))
    );
    await tx.done;
}

// Opérations sur les événements
export async function saveEvent(event: {
    id: number;
    title: string;
    tickets_generated_at: string;
}): Promise<void> {
    const db = await getDb();
    await db.put('events', event);
}

export async function getEvent(eventId: number): Promise<OfflineDB['events']['value'] | undefined> {
    const db = await getDb();
    return db.get('events', eventId);
}

export async function isEventDataFresh(eventId: number): Promise<boolean> {
    const event = await getEvent(eventId);
    if (!event) return false;

    // Les données sont fraîches si elles ont été générées il y a moins de 5 minutes
    const generatedAt = new Date(event.tickets_generated_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return generatedAt > fiveMinutesAgo;
}

// Utilitaires
export async function clearAll(): Promise<void> {
    const db = await getDb();
    await Promise.all([
        db.clear('tickets'),
        db.clear('pending_scans'),
        db.clear('events'),
    ]);
}

export async function getDbSize(): Promise<{ tickets: number; pendingScans: number }> {
    const db = await getDb();
    const [tickets, pendingScans] = await Promise.all([
        db.count('tickets'),
        db.count('pending_scans'),
    ]);
    return { tickets, pendingScans };
}
