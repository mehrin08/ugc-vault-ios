import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rims.ugcvault',
  appName: 'UGC Vault',
  webDir: 'www',
  // The app loads the live Netlify site, so web updates reach users without a
  // new App Store build. Native features come from netlify-pages/native.js.
  server: {
    url: 'https://thriving-macaron-6a97f3.netlify.app',
    cleartext: false,
    // Shown instead of a blank screen if the site can't load (no connection).
    errorPath: 'offline.html'
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#15101f',
    // Needed for the offline cache (service worker) in the iOS web view.
    // The matching WKAppBoundDomains list is added to Info.plist by scripts/prepare-ios.sh.
    limitsNavigationsToAppBoundDomains: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#15101f',
      showSpinner: false
    },
    LocalNotifications: {
      presentationOptions: ['banner', 'sound', 'list']
    }
  }
};

export default config;
