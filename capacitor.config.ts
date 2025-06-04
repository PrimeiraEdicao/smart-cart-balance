// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // 👇 Mude esta linha
  appId: 'com.lovable.smartcartbalance', // Exemplo de novo ID válido
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