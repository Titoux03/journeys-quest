import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fa38fd85770645c2b1f805b67f1e1a15',
  appName: 'journeys-quest',
  webDir: 'dist',
  server: {
    url: 'https://journeys-quest.com',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false,
    },
  },
};

export default config;