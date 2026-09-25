#!/usr/bin/env bash
# Run on your Mac from the project root: ./scripts/prepare-ios.sh
# Installs dependencies, copies www/ into the iOS project, and opens Xcode.
set -euo pipefail

cd "$(dirname "$0")/.."

command -v node >/dev/null || { echo "Node.js is missing. Install it from https://nodejs.org (LTS)."; exit 1; }
command -v xcodebuild >/dev/null || { echo "Xcode is missing. Install it from the Mac App Store, open it once, then re-run."; exit 1; }

if ! command -v pod >/dev/null; then
  echo "CocoaPods not found. Installing with Homebrew (needs https://brew.sh)..."
  brew install cocoapods
fi

# Capacitor needs a www/index.html even when the app loads server.url.
if [ ! -f www/index.html ]; then
  mkdir -p www
  printf '<!doctype html><meta charset="utf-8"><title>UGC Vault</title>\n' > www/index.html
fi

npm install

[ -d ios ] || npx cap add ios
npx cap sync ios

# Skip the "Missing Compliance" (export encryption) question on every TestFlight upload.
PLIST=ios/App/App/Info.plist
/usr/libexec/PlistBuddy -c "Set :ITSAppUsesNonExemptEncryption false" "$PLIST" 2>/dev/null \
  || /usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" "$PLIST"

npx cap open ios

echo
echo "Xcode is opening. Next: follow the 'In Xcode' steps in TESTFLIGHT.md."
