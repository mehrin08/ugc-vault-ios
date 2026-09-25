import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rims.ugcvault',
  appName: 'UGC Vault',
  webDir: 'www',
  server: {
    url: 'https://thriving-macaron-6a97f3.netlify.app',
    cleartext: false
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
