import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';

interface QRScannerProps {
    onScan: (qrCode: string) => void;
    isProcessing?: boolean;
    disabled?: boolean;
}

export function QRScanner({ onScan, isProcessing = false, disabled = false }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cameraId, setCameraId] = useState<string | null>(null);
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastScannedRef = useRef<string>('');
    const lastScanTimeRef = useRef<number>(0);

    useEffect(() => {
        // Get available cameras
        Html5Qrcode.getCameras()
            .then((devices) => {
                if (devices && devices.length > 0) {
                    setCameras(devices.map((d) => ({ id: d.id, label: d.label })));
                    // Prefer back camera on mobile
                    const backCamera = devices.find(
                        (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('arrière')
                    );
                    setCameraId(backCamera?.id || devices[0].id);
                }
            })
            .catch((err) => {
                setError("Impossible d'accéder aux caméras. Vérifiez les permissions.");
                console.error('Camera error:', err);
            });

        return () => {
            stopScanning();
        };
    }, []);

    const startScanning = async () => {
        if (!cameraId || !containerRef.current) return;

        setError(null);

        try {
            scannerRef.current = new Html5Qrcode('qr-reader', {
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                verbose: false,
            });

            await scannerRef.current.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    // Debounce: prevent multiple scans of the same code within 3 seconds
                    const now = Date.now();
                    if (
                        decodedText === lastScannedRef.current &&
                        now - lastScanTimeRef.current < 3000
                    ) {
                        return;
                    }

                    lastScannedRef.current = decodedText;
                    lastScanTimeRef.current = now;

                    // Vibrate if supported
                    if (navigator.vibrate) {
                        navigator.vibrate(200);
                    }

                    onScan(decodedText);
                },
                () => {
                    // QR code not found in this frame - ignore
                }
            );

            setIsScanning(true);
        } catch (err) {
            setError("Erreur lors du démarrage de la caméra. Réessayez ou changez de caméra.");
            console.error('Scanner start error:', err);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current?.isScanning) {
            try {
                await scannerRef.current.stop();
            } catch (err) {
                console.error('Scanner stop error:', err);
            }
        }
        setIsScanning(false);
    };

    const toggleScanning = () => {
        if (isScanning) {
            stopScanning();
        } else {
            startScanning();
        }
    };

    const switchCamera = () => {
        if (cameras.length <= 1) return;

        const currentIndex = cameras.findIndex((c) => c.id === cameraId);
        const nextIndex = (currentIndex + 1) % cameras.length;
        const nextCamera = cameras[nextIndex];

        stopScanning().then(() => {
            setCameraId(nextCamera.id);
        });
    };

    useEffect(() => {
        if (cameraId && !isScanning && !disabled) {
            startScanning();
        }
    }, [cameraId]);

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="relative">
                    <div
                        id="qr-reader"
                        ref={containerRef}
                        className="aspect-square w-full bg-black"
                    />

                    {/* Overlay when processing */}
                    {isProcessing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="flex flex-col items-center gap-2 text-white">
                                <RefreshCw className="h-8 w-8 animate-spin" />
                                <span>Validation...</span>
                            </div>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
                            <div className="text-center text-white">
                                <p className="mb-4">{error}</p>
                                <Button onClick={startScanning} variant="secondary">
                                    Réessayer
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={toggleScanning}
                            disabled={disabled}
                        >
                            {isScanning ? (
                                <CameraOff className="h-5 w-5" />
                            ) : (
                                <Camera className="h-5 w-5" />
                            )}
                        </Button>
                        {cameras.length > 1 && (
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={switchCamera}
                                disabled={!isScanning}
                            >
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
