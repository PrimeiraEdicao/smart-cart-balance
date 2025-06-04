import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.222af45c3eb44de5a678c254d7ef338d',
  appName: 'smart-cart-balance',
  webDir: 'dist',
  server: {
    url: 'https://222af45c-3eb4-4de5-a678-c254d7ef338d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;