import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trackmyfunds.app',
  appName: 'TrackMyFunds',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#3b82f6'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#ffffff'
    }
  }
};

export default config;
