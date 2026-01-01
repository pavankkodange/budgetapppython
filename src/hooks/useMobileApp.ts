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
                CapacitorApp.addListener('appUrlOpen', (data) => {
                    console.log('Deep link received:', data.url);

                    // Check if it's OAuth callback
                    if (data.url.includes('login-callback')) {
                        // Extract the URL hash/query params
                        const url = new URL(data.url.replace('com.trackmyfunds.app://', 'https://temp.com/'));

                        // If there's a hash (token response), process it
                        if (url.hash) {
                            console.log('Processing OAuth hash');
                            // Update the window location hash so Supabase can pick it up
                            window.location.hash = url.hash;
                        }

                        // Navigate to root to trigger auth state check
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 100);
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
