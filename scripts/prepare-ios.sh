#!/usr/bin/env bash
# Run on your Mac from the project root: ./scripts/prepare-ios.sh
# Installs dependencies, syncs the iOS project, and opens Xcode.
set -euo pipefail

cd "$(dirname "$0")/.."

command -v node >/dev/null || { echo "Node.js is missing. Install the LTS version from https://nodejs.org, then re-run."; exit 1; }
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 22 ] || { echo "Node.js 22 or newer is needed (you have $(node -v)). Install the LTS version from https://nodejs.org."; exit 1; }
command -v xcodebuild >/dev/null || { echo "Xcode is missing. Install it from the Mac App Store, open it once, then re-run."; exit 1; }

npm install

# Rebuild the icon and splash screen from assets/ (skip with SKIP_ASSETS=1).
if [ "${SKIP_ASSETS:-0}" != "1" ]; then
  npm run assets
fi

npx cap sync ios
npx cap open ios

echo
echo "Xcode is opening. Next: follow step 3 ('In Xcode') in TESTFLIGHT.md."
