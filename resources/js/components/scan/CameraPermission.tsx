import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Camera, RefreshCw } from 'lucide-react';

export type CameraPermissionState = 'prompt' | 'granted' | 'denied' | 'checking';

interface CameraPermissionProps {
    status: CameraPermissionState;
    onRequestPermission: () => void;
    onRetry?: () => void;
}

export function CameraPermission({ status, onRequestPermission, onRetry }: CameraPermissionProps) {
    if (status === 'checking') {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Vérification de la caméra...</p>
            </div>
        );
    }

    if (status === 'denied') {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Accès caméra refusé</AlertTitle>
                <AlertDescription className="mt-2">
                    <p>
                        Pour scanner les billets, vous devez autoriser l&apos;accès à la caméra.
                    </p>
                    <p className="mt-2 text-sm">
                        Pour réactiver la caméra :
                    </p>
                    <ol className="mt-1 list-decimal pl-4 text-sm">
                        <li>Cliquez sur l&apos;icône de cadenas dans la barre d&apos;adresse</li>
                        <li>Recherchez &quot;Caméra&quot; dans les permissions</li>
                        <li>Sélectionnez &quot;Autoriser&quot;</li>
                        <li>Rechargez la page</li>
                    </ol>
                    {onRetry && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={onRetry}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Réessayer
                        </Button>
                    )}
                </AlertDescription>
            </Alert>
        );
    }

    if (status === 'prompt') {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-primary/10 p-4">
                    <Camera className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Autorisation caméra requise</h3>
                <p className="mt-2 text-center text-muted-foreground">
                    Pour scanner les QR codes des billets, nous avons besoin d&apos;accéder à votre caméra.
                </p>
                <Button
                    className="mt-6 min-h-[44px]"
                    onClick={onRequestPermission}
                >
                    <Camera className="mr-2 h-4 w-4" />
                    Autoriser la caméra
                </Button>
            </div>
        );
    }

    return null;
}

export async function requestCameraPermission(): Promise<PermissionState> {
    try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return result.state;
    } catch {
        // Fallback: tenter getUserMedia directement
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            stream.getTracks().forEach((track) => track.stop());
            return 'granted';
        } catch {
            return 'denied';
        }
    }
}
