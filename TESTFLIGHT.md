# Publishing UGC Vault to TestFlight and the App Store

This project is a Capacitor app: your web app (`www/`) runs inside a native iOS shell (`ios/`).
Every step below happens **on your Mac**. Apple only allows iOS builds to be signed and uploaded from Xcode on macOS.

---

## 0. What you need (one time)

| Item | Where | Notes |
|---|---|---|
| Apple Developer Program | https://developer.apple.com/programs/enroll | $99/year. Approval can take 24–48 h. |
| Xcode (latest) | Mac App Store | Open it once and accept the license. |
| Node.js LTS | https://nodejs.org | Needed for `npm` / `npx cap`. |
| Homebrew + CocoaPods | https://brew.sh, then `brew install cocoapods` | The script installs CocoaPods for you if it's missing. |
| A **public** privacy policy URL | e.g. `https://thriving-macaron-6a97f3.netlify.app/privacy` | Apple requires a URL. A `.md` file in this folder isn't enough. |
| App icon 1024×1024 PNG | No transparency, no rounded corners | |
| Screenshots | 6.9" iPhone (1320×2868) at minimum | Take them in the iPhone 16 Pro Max simulator with ⌘S. |

---

## 1. Put the privacy and support pages online

Apple needs both as live web pages. They're ready in `netlify-pages/`:

1. Copy `netlify-pages/privacy.html` and `netlify-pages/support.html` into the folder you deploy to Netlify, next to its `index.html`.
2. Redeploy. If you use drag-and-drop, go to Netlify → your site → **Deploys** and drag the whole folder in.
3. Check that these links open:
   - https://thriving-macaron-6a97f3.netlify.app/privacy.html
   - https://thriving-macaron-6a97f3.netlify.app/support.html

Already set in `capacitor.config.ts`: Bundle ID `com.rims.ugcvault`, name **UGC Vault**, and the app loads your live Netlify site.

---

## 2. Build the iOS project

In Terminal:

```bash
cd ~/path/to/ugc-vault-ios      # tip: type "cd " then drag the folder into Terminal
./scripts/prepare-ios.sh
```

This runs `npm install`, `npx cap sync ios`, and opens Xcode.

---

## 3. In Xcode

1. In the left sidebar, click **App** (the blue icon at the top), then the **App** target.
2. **Signing & Capabilities** tab:
   - Tick **Automatically manage signing**.
   - **Team**: pick your Apple Developer team. If it's not listed, go to Xcode → Settings → Accounts, add your Apple ID, then come back.
   - **Bundle Identifier**: `com.rims.ugcvault`
3. **General** tab:
   - **Version**: `1.0.0`
   - **Build**: `1`. Increase it on every upload (2, 3, 4…).
   - **Minimum Deployments**: iOS 15.0 or later is fine.
4. Add the icon: in the sidebar, open `App/App/Assets.xcassets/AppIcon` and drag in the 1024×1024 PNG.
5. Test: pick an iPhone simulator at the top and press ▶︎ (⌘R). Make sure the app loads.

---

## 4. Create the app in App Store Connect

1. Go to https://appstoreconnect.apple.com → **Apps** → **+** → **New App**.
2. Platform **iOS**, Name **UGC Vault** (it must be unique on the App Store), Language **English (U.S.)**, Bundle ID **com.rims.ugcvault**, SKU `ugcvault001`, User Access **Full Access**.
3. If the Bundle ID isn't in the dropdown, register it first at
   https://developer.apple.com/account/resources/identifiers → **+** → App IDs → App, then reload.

---

## 5. Upload to TestFlight

1. In Xcode, set the run destination at the top to **Any iOS Device (arm64)**.
2. Menu **Product → Archive**. This takes a few minutes.
3. The Organizer window opens. Select the archive → **Distribute App** → **App Store Connect** → **Upload** → keep the defaults → **Upload**.
4. After about 5–30 minutes, the build shows up in App Store Connect → your app → **TestFlight**.
5. You shouldn't see **Missing Compliance**, because the prep script already sets `ITSAppUsesNonExemptEncryption = NO`. If it does appear, answer **None of the algorithms mentioned above**.

### Testers
- **Internal testing** (up to 100 people on your team, no review): TestFlight → Internal Testing → **+** → add yourself → install the **TestFlight** app on your iPhone.
- **External testing** (up to 10,000 people via a public link): TestFlight → External Testing → create a group → add the build. The first build needs a short Beta App Review (usually under 24 h). Then turn on **Public Link** to share it with your audience.

---

## 6. Submit to the App Store

In App Store Connect → your app → **App Store** tab → version 1.0:

Every field below is written out in `app-store-listing.md`, ready to copy and paste.

- Description, keywords, subtitle, promo text, copyright.
- **Screenshots**: upload the 6.9" set. Add 13" iPad screenshots too if the app supports iPad.
- **Support URL** and **Privacy Policy URL**: both must be live web pages.
- **App Privacy**: **Data Not Collected**.
- **Age Rating**: fill in the questionnaire.
- **Build**: click **+** and choose the build you uploaded.
- **App Review Information**: no sign-in needed. Paste the review notes from the listing file.
- Click **Add for Review** → **Submit**. Review usually takes 1–3 days.

---

## Updating the app later

1. Update `www/` with the new web build.
2. Run `npx cap sync ios`.
3. In Xcode, increase **Build** (and **Version** for a public release).
4. **Product → Archive → Distribute** again.

## Common errors

| Error | Fix |
|---|---|
| `pod: command not found` | `brew install cocoapods` |
| "No signing certificate" / "No account for team" | Xcode → Settings → Accounts → add your Apple ID → Manage Certificates → **+** Apple Distribution |
| "Bundle ID is not available" | Someone else already uses it. Change `appId` to something more unique, run `npx cap sync ios`, and update it in Xcode. |
| "Redundant binary upload" | Increase the **Build** number. |
| Blank white screen in the app | `www/index.html` is missing or uses absolute `/paths`. Rebuild the web app with relative paths, then run `npx cap sync ios`. |
| Rejected under Guideline 4.2 | Add native value (offline storage, share sheet, camera, notifications) and don't just load the website with `server.url`. |
