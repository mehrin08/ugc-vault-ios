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

[ -f www/index.html ] || { echo "www/index.html not found. Put your web app build in the www folder first."; exit 1; }

npm install
npx cap sync ios
npx cap open ios

echo
echo "Xcode is opening. Next: follow the 'In Xcode' steps in TESTFLIGHT.md."
