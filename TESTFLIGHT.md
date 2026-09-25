# Publishing UGC Vault to TestFlight and the App Store

UGC Vault is a Capacitor app. The iOS shell (`ios/`) loads your live Netlify site (`web/` in this repo) and adds native iPhone features on top:

| Feature | Where it lives |
|---|---|
| Task reminders become real iPhone notifications, even when the app is closed | `web/index.html` + `web/native.js` + `@capacitor/local-notifications` |
| Optional daily / Sunday / Friday nudges | `web/native.js` |
| Haptic taps when you tick off tasks | `web/native.js` + `@capacitor/haptics` |
| Offline banner + branded offline screen instead of a blank page | `web/native.js`, `www/offline.html` |
| App icon + splash screen | `assets/` |
| In-app account deletion (Apple requires it for apps with sign-up) | `web/index.html` + one Supabase SQL function |

Apple approves apps like this when they do more than a plain website. These features are what get it past **Guideline 4.2 (Minimum Functionality)**.

Every step below happens **on your Mac**. Apple only allows iOS builds to be signed and uploaded from Xcode on macOS.

---

## 0. What you need (one time)

| Item | Where | Notes |
|---|---|---|
| Apple Developer Program | https://developer.apple.com/programs/enroll | $99/year. Approval can take 24–48 h. |
| Xcode (latest) | Mac App Store | Open it once and accept the license. |
| Node.js 22 or newer | https://nodejs.org (LTS) | Needed for `npm` / `npx cap`. |

No CocoaPods needed. The project uses Swift Package Manager, which Xcode handles on its own.

---

## 1. Get this project onto your Mac

Your old `ugc-vault-ios` folder has an older `ios` folder that doesn't include the new features. Replace it with this repo:

1. On GitHub, open this repo, switch to the branch `claude/app-store-testflight-publish-fksw01`, then **Code → Download ZIP**.
2. Unzip it. Use this new folder from now on. You can delete or rename the old one.

---

## 2. Update your Netlify site

The `web/` folder has the new version of your site: the calmer design, iPhone notifications and account deletion.

1. **Copy these 5 files from `web/`** into the folder you deploy to Netlify, replacing the old `index.html`:
   `index.html`, `music.mp3`, `native.js`, `privacy.html`, `support.html`.
   **Keep your existing `sw.js`**; web push notifications use it.
2. **Redeploy.** For drag-and-drop, go to Netlify → your site → **Deploys** and drag the whole folder in.
3. **Add the delete-account function in Supabase**: Supabase → your project → **SQL Editor** → New query, paste this and click **Run**:
   ```sql
   create or replace function public.delete_my_account() returns void
   language plpgsql security definer set search_path = public as $$
   begin
     if to_regclass('public.push_subscriptions') is not null then
       execute 'delete from public.push_subscriptions where user_id = $1' using auth.uid();
     end if;
     delete from public.checklists where user_id = auth.uid();
     delete from auth.users where id = auth.uid();
   end; $$;
   revoke all on function public.delete_my_account() from public, anon;
   grant execute on function public.delete_my_account() to authenticated;
   ```
4. Check these open:
   - https://thriving-macaron-6a97f3.netlify.app/privacy.html
   - https://thriving-macaron-6a97f3.netlify.app/support.html
5. **Make a demo account for Apple.** Sign up in the app with a new email (e.g. `review@…`), then add a few lists, tasks and a deal. Apple's reviewer signs in with it.

`native.js` does nothing in a normal browser, so the website keeps its own web push.

---

## 3. Open the project in Xcode

In Terminal:

```bash
cd ~/Downloads/ugc-vault-ios-claude-app-store-testflight-publish-fksw01   # tip: type "cd " then drag the folder in
./scripts/prepare-ios.sh
```

This installs everything, rebuilds the icon and splash, syncs the iOS project, and opens Xcode.
The first time, Xcode spends a minute fetching packages (bottom-left progress bar).

---

## 4. In Xcode

1. In the left sidebar, click **App** (blue icon at the top), then the **App** target.
2. **Signing & Capabilities** tab:
   - Tick **Automatically manage signing**.
   - **Team**: pick your Apple Developer team. If it's not listed, go to Xcode → Settings → Accounts, add your Apple ID, then come back.
   - Bundle Identifier is already `com.rims.ugcvault`.
3. **General** tab: Version `1.0`, Build `1` (already set). Increase **Build** on every upload.
4. Test on a simulator: pick **iPhone 16 Pro Max** at the top and press ▶︎ (⌘R). Check that:
   - the splash shows, then your dashboard loads
   - menu (top right) → phone notifications → **turn on notifications**, and allow
   - on a task, ⋯ → reminder → set a time a minute ahead, close the app, and the notification arrives
5. Take screenshots now, while the simulator is open, signed in to the demo account: press **⌘S** on each screen (home, tasks, a script, phone notifications). They save to your Desktop at the 6.9" size Apple wants.

Already set up for you: iPhone-only, portrait, and the encryption export answer (`ITSAppUsesNonExemptEncryption = NO`).

---

## 5. Create the app in App Store Connect

1. Go to https://appstoreconnect.apple.com → **Apps** → **+** → **New App**.
2. Platform **iOS**, Name **UGC Vault**, Language **English (U.S.)**, Bundle ID **com.rims.ugcvault**, SKU `ugcvault001`, User Access **Full Access**.
3. If the Bundle ID isn't in the dropdown, register it at
   https://developer.apple.com/account/resources/identifiers → **+** → App IDs → App, then reload.

If the name "UGC Vault" is taken, try "UGC Vault: Creator Hub". The name on the home screen stays "UGC Vault".

---

## 6. Upload to TestFlight

1. In Xcode, set the run destination at the top to **Any iOS Device (arm64)**.
2. Menu **Product → Archive**. This takes a few minutes.
3. The Organizer opens. **Distribute App** → **App Store Connect** → **Upload** → keep the defaults → **Upload**.
4. After about 5–30 minutes, the build appears in App Store Connect → your app → **TestFlight**.

### Testers
- **Internal** (you and up to 100 team members, no review): TestFlight → Internal Testing → **+** → add yourself → install the **TestFlight** app on your iPhone.
- **External** (up to 10,000 people via a public link, e.g. your followers): TestFlight → External Testing → new group → add the build. The first build gets a short Beta App Review (usually under 24 h). Then turn on **Public Link**.

---

## 7. Submit to the App Store

In App Store Connect → your app → **App Store** tab → version 1.0, paste everything from `app-store-listing.md`:

- Promo text, description, keywords, support and marketing URLs, copyright
- **Screenshots**: the 6.9" set from step 4 (3–10 images). Include one showing the reminders sheet; it helps show native features.
- **App Privacy**: answer as in the table in `app-store-listing.md` (email, user content, user ID; none used for tracking)
- **Age Rating**: answer "None"/"No" to everything → 4+
- **Build**: click **+** and choose your upload
- **App Review Information**: sign-in required; enter the demo account's email and password, then paste the review notes
- **Add for Review** → **Submit**. Review usually takes 1–3 days.

---

## Changing the logo later

Yes, you can change it anytime:

1. Replace **`assets/logo.png`** with your new logo: a square PNG, 1024×1024, no transparency, no rounded corners (iOS rounds them).
   Keep the background a plain colour or a top-to-bottom gradient; the splash screen is built from it automatically.
2. Run `npm run assets`. This rebuilds the app icon, the splash screen and the offline-screen icon.
3. Increase **Build** in Xcode, then Archive and upload again.

Users get the new icon when they install the update. On the App Store page, it changes when that version goes live.

**Canva:** design at 1024×1024, fill the whole square, and download as **PNG**. Rename it `logo.png` and drop it in `assets/`.

---

## Updating the app later

- **Changes to your web app** (dashboard, features, text): just redeploy Netlify. The app picks them up the next time it opens. No new App Store build needed.
- **Icon, splash, app name or native features**: increase **Build** in Xcode → Archive → upload → submit.

Keep the app's core purpose the same when you change the website. Apple can pull apps whose content changes into something different from what was reviewed.

## Common errors

| Error | Fix |
|---|---|
| "No signing certificate" / "No account for team" | Xcode → Settings → Accounts → add your Apple ID → Manage Certificates → **+** Apple Distribution |
| "Bundle ID is not available" | Someone else has it. Change `appId` in `capacitor.config.ts` (e.g. `com.mehrinreza.ugcvault`), run `npx cap sync ios`, and update it in Xcode. |
| "Redundant binary upload" | Increase the **Build** number. |
| Package resolution errors in Xcode | File → Packages → **Reset Package Caches**, then build again. |
| Offline screen shows even with internet | The Netlify site is down or the URL changed. Update `server.url` in `capacitor.config.ts` and `APP_URL` in `www/offline.html`. |
| "phone notifications" still says "Add to Home Screen" in the app | `native.js` isn't loading. Check `native.js` was uploaded next to `index.html` (step 2). |
| "couldn't delete your account" | The Supabase SQL function from step 2 hasn't been run yet. |
| Notifications never arrive | iPhone Settings → UGC Vault → Notifications → Allow. Then open the app once so it reschedules them. |
