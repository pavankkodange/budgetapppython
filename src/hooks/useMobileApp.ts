import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const useMobileApp = () => {
    useEffect(() => {
        const initializeMobileApp = async () => {
            // Only run on native platforms
            if (!Capacitor.isNativePlatform()) return;

            try {
                // Set status bar style
                await StatusBar.setStyle({ style: Style.Light });
                await StatusBar.setBackgroundColor({ color: '#3b82f6' });

                // Hide splash screen after app is ready
                setTimeout(async () => {
                    await SplashScreen.hide();
                }, 1000);

                // Handle deep link OAuth callback
                CapacitorApp.addListener('appUrlOpen', async (data) => {
                    console.log('Deep link received:', data.url);

                    // Check if it's OAuth callback
                    if (data.url.includes('login-callback')) {
                        try {
                            // Import supabase client
                            const { supabase } = await import('../lib/supabaseClient');

                            // Extract the full URL after the scheme
                            const urlParts = data.url.split('://');
                            if (urlParts.length > 1) {
                                const params = urlParts[1];
                                console.log('OAuth callback params:', params);

                                // Check if there's a hash fragment with tokens
                                if (params.includes('#')) {
                                    const hashPart = params.split('#')[1];
                                    const urlParams = new URLSearchParams(hashPart);

                                    const accessToken = urlParams.get('access_token');
                                    const refreshToken = urlParams.get('refresh_token');

                                    console.log('Access token found:', !!accessToken);
                                    console.log('Refresh token found:', !!refreshToken);

                                    if (accessToken && refreshToken) {
                                        // Use Supabase's setSession method
                                        const { error } = await supabase.auth.setSession({
                                            access_token: accessToken,
                                            refresh_token: refreshToken
                                        });

                                        if (error) {
                                            console.error('Error setting session:', error);
                                        } else {
                                            console.log('✅ Session set successfully!');
                                            // Reload to trigger auth state update
                                            window.location.href = '/';
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.error('Error processing OAuth callback:', error);
                        }
                    }
                });

                // Handle hardware back button
                CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                    if (!canGoBack) {
                        CapacitorApp.exitApp();
                    } else {
                        window.history.back();
                    }
                });

                // Handle app state changes
                CapacitorApp.addListener('appStateChange', ({ isActive }) => {
                    console.log('App state changed. Is active:', isActive);
                });

                console.log('✅ Mobile app initialized');
            } catch (error) {
                console.error('Mobile app initialization error:', error);
            }
        };

        initializeMobileApp();

        // Cleanup
        return () => {
            CapacitorApp.removeAllListeners();
        };
    }, []);
};
