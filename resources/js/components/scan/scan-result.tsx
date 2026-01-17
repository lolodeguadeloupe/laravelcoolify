import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export type ScanStatus = 'valid' | 'already_used' | 'invalid' | null;

interface ScanResultData {
    status: ScanStatus;
    message: string;
    ticket?: {
        uuid: string;
        category: string;
        event: string;
        holder: string;
    };
    scanned_at?: string;
    expected_event?: string;
}

interface ScanResultProps {
    result: ScanResultData | null;
    onDismiss: () => void;
    autoDismissDelay?: number;
}

const statusConfig = {
    valid: {
        icon: CheckCircle,
        bgClass: 'bg-green-500',
        textClass: 'text-white',
        title: 'VALIDE',
    },
    already_used: {
        icon: AlertCircle,
        bgClass: 'bg-orange-500',
        textClass: 'text-white',
        title: 'DÉJÀ UTILISÉ',
    },
    invalid: {
        icon: XCircle,
        bgClass: 'bg-red-500',
        textClass: 'text-white',
        title: 'INVALIDE',
    },
};

export function ScanResult({ result, onDismiss, autoDismissDelay = 3000 }: ScanResultProps) {
    useEffect(() => {
        if (!result) return;

        const timer = setTimeout(() => {
            onDismiss();
        }, autoDismissDelay);

        return () => clearTimeout(timer);
    }, [result, onDismiss, autoDismissDelay]);

    if (!result || !result.status) return null;

    const config = statusConfig[result.status];
    const Icon = config.icon;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={onDismiss}
        >
            <Card className={`w-full max-w-sm ${config.bgClass} border-0`}>
                <CardContent className={`flex flex-col items-center gap-4 p-8 ${config.textClass}`}>
                    <Icon className="h-24 w-24" />
                    <h2 className="text-3xl font-bold">{config.title}</h2>
                    <p className="text-center text-lg">{result.message}</p>

                    {result.ticket && (
                        <div className="w-full rounded-lg bg-white/20 p-4 text-center">
                            <p className="text-xl font-semibold">{result.ticket.category}</p>
                            <p className="text-sm opacity-90">{result.ticket.holder}</p>
                        </div>
                    )}

                    {result.scanned_at && (
                        <p className="text-sm opacity-75">
                            Premier scan: {result.scanned_at}
                        </p>
                    )}

                    {result.expected_event && (
                        <p className="text-sm opacity-75">
                            Événement attendu: {result.expected_event}
                        </p>
                    )}

                    <p className="mt-4 text-xs opacity-50">
                        Touchez pour continuer
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
