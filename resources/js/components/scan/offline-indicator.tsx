import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WifiOff, Wifi, RefreshCw, Database } from 'lucide-react';

interface OfflineIndicatorProps {
    isOffline: boolean;
    isSyncing: boolean;
    pendingScansCount: number;
    onSyncNow?: () => void;
}

export function OfflineIndicator({
    isOffline,
    isSyncing,
    pendingScansCount,
    onSyncNow,
}: OfflineIndicatorProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border bg-card p-3">
            <div className="flex items-center gap-3">
                {/* Indicateur de connexion */}
                {isOffline ? (
                    <div className="flex items-center gap-2 text-orange-500">
                        <WifiOff className="h-4 w-4" />
                        <span className="text-sm font-medium">Mode hors-ligne</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-green-500">
                        <Wifi className="h-4 w-4" />
                        <span className="text-sm font-medium">En ligne</span>
                    </div>
                )}

                {/* Scans en attente */}
                {pendingScansCount > 0 && (
                    <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary" className="text-xs">
                            {pendingScansCount} scan{pendingScansCount > 1 ? 's' : ''} en attente
                        </Badge>
                    </div>
                )}
            </div>

            {/* Bouton de synchronisation */}
            {!isOffline && pendingScansCount > 0 && onSyncNow && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onSyncNow}
                    disabled={isSyncing}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
                </Button>
            )}
        </div>
    );
}
