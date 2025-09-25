import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fa38fd85770645c2b1f805b67f1e1a15',
  appName: 'happy-journal-quest',
  webDir: 'dist',
  server: {
    url: 'https://fa38fd85-7706-45c2-b1f8-05b67f1e1a15.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;