import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { isDriveConnected, getGoogleDriveAuthUrl, extractTokenFromUrl, saveDriveToken, disconnectDrive } from '@/services/googleDrive';
import { showSuccess, showError } from '@/utils/toast';

interface GoogleDriveConnectProps {
    onConnectionChange?: (connected: boolean) => void;
}

export const GoogleDriveConnect: React.FC<GoogleDriveConnectProps> = ({ onConnectionChange }) => {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);

    // Google OAuth Client ID (same as used for login)
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    const REDIRECT_URI = `${window.location.origin}/settings`; // Redirect to settings page

    useEffect(() => {
        checkConnection();

        // Check if we're returning from OAuth
        const token = extractTokenFromUrl();
        if (token) {
            handleOAuthCallback(token);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const checkConnection = async () => {
        setLoading(true);
        try {
            const isConnected = await isDriveConnected();
            setConnected(isConnected);
            onConnectionChange?.(isConnected);
        } catch (error) {
            console.error('Error checking Drive connection:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthCallback = async (token: string) => {
        try {
            setConnecting(true);
            await saveDriveToken(token);
            setConnected(true);
            onConnectionChange?.(true);
            showSuccess('✅ Google Drive connected successfully!');
        } catch (error) {
            console.error('Error saving Drive token:', error);
            showError('Failed to connect Google Drive');
        } finally {
            setConnecting(false);
        }
    };

    const handleConnect = () => {
        if (!GOOGLE_CLIENT_ID) {
            showError('Google Client ID not configured');
            return;
        }

        const authUrl = getGoogleDriveAuthUrl(GOOGLE_CLIENT_ID, REDIRECT_URI);
        window.location.href = authUrl;
    };

    const handleDisconnect = async () => {
        try {
            setConnecting(true);
            await disconnectDrive();
            setConnected(false);
            onConnectionChange?.(false);
            showSuccess('Google Drive disconnected');
        } catch (error) {
            console.error('Error disconnecting Drive:', error);
            showError('Failed to disconnect Google Drive');
        } finally {
            setConnecting(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        Google Drive Storage
                    </CardTitle>
                    <CardDescription>Loading connection status...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Google Drive Storage
                </CardTitle>
                <CardDescription>
                    Store your documents securely in your personal Google Drive
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Connection Status */}
                {connected ? (
                    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-800 dark:text-green-200">Connected</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-300">
                            Your documents are being stored in Google Drive
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Not Connected</AlertTitle>
                        <AlertDescription>
                            Connect Google Drive to upload and store documents securely with unlimited storage
                        </AlertDescription>
                    </Alert>
                )}

                {/* Drive Info */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        {connected ? (
                            <Badge variant="default" className="bg-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Connected
                            </Badge>
                        ) : (
                            <Badge variant="destructive">
                                <CloudOff className="h-3 w-3 mr-1" />
                                Disconnected
                            </Badge>
                        )}
                    </div>

                    {connected && (
                        <>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Storage:</span>
                                <Badge variant="outline">Unlimited (Your Drive)</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Folder:</span>
                                <span className="text-sm text-muted-foreground">Budget App Documents</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Benefits */}
                {!connected && (
                    <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium mb-2">Benefits:</p>
                        <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>✓ Unlimited storage space</li>
                            <li>✓ Access documents anywhere via Google Drive</li>
                            <li>✓ Automatic backups & sync</li>
                            <li>✓ Share documents easily</li>
                            <li>✓ Your data stays in your control</li>
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {connected ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => window.open('https://drive.google.com', '_blank')}
                                className="flex-1"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Drive
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDisconnect}
                                disabled={connecting}
                            >
                                {connecting ? 'Disconnecting...' : 'Disconnect'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={handleConnect}
                            disabled={connecting || !GOOGLE_CLIENT_ID}
                            className="w-full"
                        >
                            <Cloud className="h-4 w-4 mr-2" />
                            {connecting ? 'Connecting...' : 'Connect Google Drive'}
                        </Button>
                    )}
                </div>

                {/* Privacy Note */}
                <p className="text-xs text-muted-foreground">
                    🔒 Privacy: This app only accesses files it creates. Your other Drive files remain private.
                </p>
            </CardContent>
        </Card>
    );
};
