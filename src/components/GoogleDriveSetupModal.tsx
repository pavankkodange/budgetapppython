import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cloud, CheckCircle2, FileUp, Shield, Zap, HardDrive, X } from 'lucide-react';
import { getGoogleDriveAuthUrl, saveDriveToken } from '@/services/googleDrive';
import { showSuccess, showError } from '@/utils/toast';

interface GoogleDriveSetupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete?: () => void;
}

export const GoogleDriveSetupModal: React.FC<GoogleDriveSetupModalProps> = ({
    open,
    onOpenChange,
    onComplete,
}) => {
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);

    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    const REDIRECT_URI = 'http://localhost:5173/drive-callback.html';

    const handleConnect = () => {
        if (!GOOGLE_CLIENT_ID) {
            showError('Google Client ID not configured');
            return;
        }

        setConnecting(true);

        const authUrl = getGoogleDriveAuthUrl(GOOGLE_CLIENT_ID, REDIRECT_URI);

        // Open OAuth in popup window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
            authUrl,
            'Google Drive Authorization',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        if (!popup) {
            showError('Popup blocked! Please allow popups for this site.');
            setConnecting(false);
            return;
        }

        // Listen for message from popup
        const messageHandler = async (event: MessageEvent) => {
            // Verify origin for security
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'DRIVE_AUTH_SUCCESS' && event.data.token) {
                window.removeEventListener('message', messageHandler);

                try {
                    await saveDriveToken(event.data.token);
                    setConnected(true);
                    showSuccess('✅ Google Drive connected successfully!');

                    // Auto-close after 1 second
                    setTimeout(() => {
                        onOpenChange(false);
                        onComplete?.();
                    }, 1000);
                } catch (error) {
                    console.error('Error saving Drive token:', error);
                    showError('Failed to save Drive token');
                } finally {
                    setConnecting(false);
                }
            } else if (event.data.type === 'DRIVE_AUTH_ERROR') {
                window.removeEventListener('message', messageHandler);
                showError('Failed to connect Google Drive');
                setConnecting(false);
            }
        };

        window.addEventListener('message', messageHandler);

        // Check if popup was closed without completing auth
        const checkPopupClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkPopupClosed);
                window.removeEventListener('message', messageHandler);
                if (!connected) {
                    setConnecting(false);
                }
            }
        }, 500);
    };

    const handleSkip = () => {
        localStorage.setItem('drive_setup_skipped', 'true');
        onOpenChange(false);
    };

    if (connected) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                            Connected Successfully!
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6 text-center">
                        <Cloud className="h-16 w-16 mx-auto text-green-600 mb-4" />
                        <p className="text-lg font-semibold mb-2">Google Drive is now connected</p>
                        <p className="text-sm text-muted-foreground">
                            You can now upload documents with unlimited storage!
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Cloud className="h-7 w-7 text-blue-600" />
                        Connect Your Google Drive
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Store your financial documents securely in your personal Google Drive
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Benefits Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <HardDrive className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Unlimited Storage</p>
                                <p className="text-xs text-muted-foreground">No file size limits</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Secure & Private</p>
                                <p className="text-xs text-muted-foreground">Your data, your control</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                            <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Access Anywhere</p>
                                <p className="text-xs text-muted-foreground">Via Google Drive app</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                            <FileUp className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm">Easy Upload</p>
                                <p className="text-xs text-muted-foreground">One-click document upload</p>
                            </div>
                        </div>
                    </div>

                    {/* What happens */}
                    <Alert>
                        <AlertDescription className="text-sm">
                            <p className="font-semibold mb-2">What happens next:</p>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>A popup will open for Google authorization</li>
                                <li>Grant permission to access your Drive</li>
                                <li>We'll create a "Budget App Documents" folder</li>
                                <li>Your documents will be organized in subfolders</li>
                            </ol>
                        </AlertDescription>
                    </Alert>

                    {/* Privacy Note */}
                    <div className="bg-muted p-3 rounded-lg text-xs text-muted-foreground">
                        🔒 <strong>Privacy First:</strong> This app only accesses files it creates.
                        Your other Drive files remain completely private.
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleConnect}
                            disabled={connecting || !GOOGLE_CLIENT_ID}
                            className="flex-1"
                            size="lg"
                        >
                            <Cloud className="h-4 w-4 mr-2" />
                            {connecting ? 'Opening authorization...' : 'Connect Google Drive'}
                        </Button>

                        <Button
                            onClick={handleSkip}
                            variant="outline"
                            size="lg"
                            disabled={connecting}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Skip for Now
                        </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        You can connect Drive later from Settings
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
