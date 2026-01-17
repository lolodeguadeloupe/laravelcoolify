import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

export interface ScanHistoryEntry {
    id: number;
    scanned_at: string;
    result: string;
    category: string;
    holder: string;
}

export interface ScanHistoryStats {
    total_scanned: number;
    total_tickets: number;
}

interface ScanHistoryProps {
    eventId: number | null;
    filter?: 'all' | 'success' | 'already_used' | 'invalid';
}

const resultConfig = {
    success: {
        label: 'Succès',
        icon: CheckCircle,
        badgeClass: 'bg-green-500 text-white hover:bg-green-600',
    },
    already_used: {
        label: 'Déjà utilisé',
        icon: AlertCircle,
        badgeClass: 'bg-orange-500 text-white hover:bg-orange-600',
    },
    invalid: {
        label: 'Invalide',
        icon: XCircle,
        badgeClass: 'bg-red-500 text-white hover:bg-red-600',
    },
};

export function ScanHistory({ eventId, filter = 'all' }: ScanHistoryProps) {
    const [scans, setScans] = useState<ScanHistoryEntry[]>([]);
    const [stats, setStats] = useState<ScanHistoryStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentFilter, setCurrentFilter] = useState<'all' | 'success' | 'already_used' | 'invalid'>(filter);

    const fetchHistory = useCallback(async (showRefreshLoading = false) => {
        if (!eventId) return;

        if (showRefreshLoading) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            const response = await axios.get<{ scans: ScanHistoryEntry[]; stats: ScanHistoryStats }>(
                route('scan.history', { event: eventId })
            );

            setScans(response.data.scans);
            setStats(response.data.stats);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'historique:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [eventId]);

    // Charger l'historique au montage et quand l'événement change
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Rafraîchissement automatique toutes les 30 secondes
    useEffect(() => {
        if (!eventId) return;

        const interval = setInterval(() => {
            fetchHistory(true);
        }, 30000);

        return () => clearInterval(interval);
    }, [eventId, fetchHistory]);

    const handleRefresh = useCallback(() => {
        fetchHistory(true);
    }, [fetchHistory]);

    const handleFilterChange = useCallback((newFilter: typeof currentFilter) => {
        setCurrentFilter(newFilter);
    }, []);

    // Filtrer les scans selon le filtre sélectionné
    const filteredScans = scans.filter((scan) => {
        if (currentFilter === 'all') return true;
        return scan.result === currentFilter;
    });

    // Calculer les statistiques par type de résultat
    const statsByResult = scans.reduce((acc, scan) => {
        acc[scan.result] = (acc[scan.result] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (isLoading && !scans.length) {
        return <ScanHistorySkeleton />;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Historique des scans</CardTitle>
                        <CardDescription>
                            {stats ? (
                                <>
                                    {stats.total_scanned} / {stats.total_tickets} billets scannés
                                    {stats.total_tickets > 0 && (
                                        <span className="ml-2">
                                            ({Math.round((stats.total_scanned / stats.total_tickets) * 100)}%)
                                        </span>
                                    )}
                                </>
                            ) : (
                                'Chargement...'
                            )}
                        </CardDescription>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Actualiser
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filtres */}
                <div className="mb-4 flex flex-wrap gap-2">
                    <FilterButton
                        active={currentFilter === 'all'}
                        onClick={() => handleFilterChange('all')}
                        label="Tous"
                        count={scans.length}
                    />
                    <FilterButton
                        active={currentFilter === 'success'}
                        onClick={() => handleFilterChange('success')}
                        label="Succès"
                        count={statsByResult.success || 0}
                        variant="success"
                    />
                    <FilterButton
                        active={currentFilter === 'already_used'}
                        onClick={() => handleFilterChange('already_used')}
                        label="Déjà utilisés"
                        count={statsByResult.already_used || 0}
                        variant="warning"
                    />
                    <FilterButton
                        active={currentFilter === 'invalid'}
                        onClick={() => handleFilterChange('invalid')}
                        label="Invalides"
                        count={statsByResult.invalid || 0}
                        variant="error"
                    />
                </div>

                {/* Liste des scans */}
                <div className="space-y-2">
                    {filteredScans.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            {currentFilter === 'all'
                                ? 'Aucun scan pour cet événement'
                                : `Aucun scan "${resultConfig[currentFilter].label.toLowerCase()}"`
                            }
                        </div>
                    ) : (
                        filteredScans.map((scan) => {
                            const config = resultConfig[scan.result as keyof typeof resultConfig];
                            if (!config) return null;

                            const Icon = config.icon;

                            return (
                                <div
                                    key={scan.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`rounded-full p-1 ${config.badgeClass.replace('hover:', '')}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{scan.holder}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {scan.category} • {scan.scanned_at}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={config.badgeClass}>
                                        {config.label}
                                    </Badge>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface FilterButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    count: number;
    variant?: 'default' | 'success' | 'warning' | 'error';
}

function FilterButton({ active, onClick, label, count, variant = 'default' }: FilterButtonProps) {
    const variantClasses = {
        default: active
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
        success: active
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
        warning: active
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
        error: active
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
    };

    return (
        <Button
            size="sm"
            variant={active ? 'default' : 'outline'}
            className={variantClasses[variant]}
            onClick={onClick}
        >
            {label} ({count})
        </Button>
    );
}

function ScanHistorySkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="mt-2 h-4 w-60" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-24" />
                </div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
