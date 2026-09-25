import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rims.ugcvault',
  appName: 'UGC Vault',
  webDir: 'www',
  // The app loads the live Netlify site, so web updates reach users without a
  // new App Store build. See TESTFLIGHT.md ("Guideline 4.2") before submitting
  // for public review.
  server: {
    url: 'https://thriving-macaron-6a97f3.netlify.app',
    cleartext: false
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
