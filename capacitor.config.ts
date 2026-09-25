import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rims.ugcvault',
  appName: 'UGC Vault',
  webDir: 'www',
  // The app loads the live Netlify site, so web updates reach users without a
  // new App Store build. Native features come from web/native.js.
  server: {
    url: 'https://thriving-macaron-6a97f3.netlify.app',
    cleartext: false,
    // Shown instead of a blank screen if the site can't load (no connection).
    errorPath: 'offline.html'
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#f9ebde'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#f9ebde',
      showSpinner: false
    },
    LocalNotifications: {
      // While the app is open it shows its own reminder banner, so iOS only plays the sound.
      presentationOptions: ['sound', 'list']
    }
  }
};

export default config;
