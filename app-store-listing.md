# UGC Vault — App Store Listing

Copy and paste each field into App Store Connect. Character limits are in brackets.

## App Information (App Store Connect → App Information)

| Field | Value |
|---|---|
| Name [30] | UGC Vault |
| Subtitle [30] | Your UGC business, organized |
| Bundle ID | com.rims.ugcvault |
| SKU | ugcvault001 |
| Primary category | Business |
| Secondary category | Productivity |
| Content rights | Does not contain, show or access third-party content |
| Age rating | 4+ (answer "None" / "No" to every questionnaire item) |
| Privacy Policy URL | https://thriving-macaron-6a97f3.netlify.app/privacy.html |
| License Agreement | Apple's standard EULA (leave the default) |
| Price | Free |

## Version 1.0 (App Store tab)

### Promotional Text [170]
Run your UGC business from one screen: track brand deals, see what you've earned against your monthly goal, and batch content by client every week.

### Description [4000]
UGC Vault is a business dashboard built for content creators managing brand
partnerships. Track deals and payments, write scripts, and plan your content
in batches, all in one calm, pretty place.

FEATURES
• Monthly earnings-goal ring showing earned, in-pipeline, and to-go
• Task lists by brand, in sections you name yourself (daily, batching, or your own)
• Count sets like "post 5 videos" and pin today's focus
• Scripts by brand, with hooks, captions and reference links
• Brand deals and payments tracker, month by month
• Calendar for shoots, deadlines and payment due dates
• Press and hold to reorder anything, swipe left to delete
• Pick your own theme color, or keep each tab's colors

REMINDERS THAT KEEP YOU ON TRACK
• Set a reminder on any task, once or repeating at any interval you choose
  (every 30 minutes, every 6 hours…) until it's done
• Real iPhone notifications with a soft sparkle sound, even when the app is closed
• Snooze or tick off a task right from the reminder

SYNCED AND PRIVATE
Your account syncs across your phone and computer. No ads, no tracking, and
you can delete your account and data anytime from the app.

Built by a creator, for creators: no bloated CRM, just what you need to run
a UGC business day to day.

### Keywords [100]
ugc,content creator,brand deals,creator tools,campaign tracker,earnings tracker,batching,influencer

### Support URL
https://thriving-macaron-6a97f3.netlify.app/support.html

### Marketing URL (optional)
https://thriving-macaron-6a97f3.netlify.app

### Copyright
2026 Mehrin Reza Rim

### Version
1.0.0 (Build 5)

## Availability (App Store Connect → Pricing and Availability)
Turn off **"Make available in all countries"** and select only these 18 countries:

| Region | Countries |
|---|---|
| North America | United States, Canada |
| English-speaking | United Kingdom, Ireland, Australia, New Zealand |
| Western & Northern Europe | Germany, France, Netherlands, Belgium, Luxembourg, Austria, Switzerland, Sweden, Norway, Denmark, Finland, Iceland |

Before the EU countries go live, finish the **EU trader status** step (App Store
Connect → Business → Compliance). A subscription app counts as a "trader", and
Apple shows the address, phone and email you enter on the EU App Store page.

When the subscription is added, it defaults to these same countries. Apple
converts your US price into each currency; review the list and round any odd
prices (e.g. £5.99, €6.99, CA$8.99, A$9.99).

## App Privacy (App Store Connect → App Privacy)
"Do you or your third-party partners collect data from this app?" → **Yes**. Then select:

| Data type | Used for | Linked to the user? | Used for tracking? |
|---|---|---|---|
| Contact Info → **Email Address** | App Functionality | Yes | No |
| Contact Info → **Name** (only if users add one) | App Functionality | Yes | No |
| User Content → **Other User Content** (tasks, scripts, deals, payments) | App Functionality | Yes | No |
| Financial Info → **Other Financial Info** (deal amounts, payments received, earnings goals) | App Functionality | Yes | No |
| Identifiers → **User ID** (Supabase account ID) | App Functionality | Yes | No |

Result shown on the store: **Data Linked to You: Contact Info, Financial Info,
User Content, Identifiers**, with **Data Used to Track You: none**. This matches
`privacy-policy.md`.

## App Review Information
- Sign-in required: **Yes**. Demo account: `ugcrims+review@gmail.com` (already filled
  with sample lists, tasks, scripts, deals, payments, calendar plans and notes).
  Type its password into App Store Connect yourself.
- Contact: Mehrin Reza Rim · ugcrims@gmail.com · (your phone number)
- Notes:

> UGC Vault is a productivity dashboard for UGC (user-generated content)
> creators to track brand partnerships, payments, scripts and content batching.
> Please sign in with the demo account above. It already has sample data.
>
> Native iOS features to test:
> 1. Local notifications: on first launch iOS asks to allow notifications. In
>    the Tasks tab, tap ⋯ next to a task → "reminder" and set a time a minute or
>    two ahead (or choose "repeat" and any interval). The notification arrives on
>    the lock screen even if the app is closed. Menu (top right) → "phone
>    notifications" opens the daily, Sunday and Friday nudges.
> 2. Haptic feedback when ticking off tasks and tapping buttons.
> 3. Account deletion: menu → account → "delete account" permanently deletes
>    the account and its data.
## Export Compliance
Uses encryption: **No** (standard HTTPS only). `ITSAppUsesNonExemptEncryption`
is set to `false` in Info.plist by `scripts/prepare-ios.sh`, so App Store
Connect won't ask on each build.

## TestFlight (Test Information)

### Beta App Description
UGC Vault helps UGC creators track brand deals, payments, earnings goals and
weekly content batching in one dashboard.

### What to Test
Sign up, add a few lists and tasks, and open and close them. Allow notifications
when asked, set a reminder on a task (⋯ → reminder), and
check it arrives with the app closed. Tell us anything that looks off,
confusing or slow.

### Feedback Email
ugcrims@gmail.com

## Screenshots
- Ready: `~/Desktop/DEKSTOP/AppStoreScreenshots/v1.0/` — 6 images at 1320 × 2868
  (iPhone 6.9"): home, tasks, reminders, script, deals, calendar.
- Retake: iPhone 16 Pro Max simulator, signed in to the demo account,
  `xcrun simctl status_bar <device> override --time 9:41`, then ⌘S.
- Not needed for iPad: the app is set to iPhone only.
- Tip: take them signed in to the demo account with sample data. Include the
  tasks tab, the home dashboard, a script, notes, and the phone notifications screen.

## Version 1.1 — when you turn on the subscription
Version 1 launches free. For 1.1, set `SUBSCRIPTIONS_ON=true` in `web/index.html`,
create the products (TESTFLIGHT.md step 5b), and add these:

**Add to the end of the description:**

SUBSCRIPTION
Try everything free for 3 days. After the trial, UGC Vault is $4.99 a month or
$49.99 a year (prices may vary by country). Payment is charged to your Apple
Account when the trial ends. Your subscription renews automatically unless
you cancel at least 24 hours before the end of the current period. Manage or
cancel anytime in your App Store account settings.

Terms of Use: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Privacy Policy: https://thriving-macaron-6a97f3.netlify.app/privacy.html

**Add to the review notes:**

> Subscription: after signing in, the subscribe screen offers a 3-day free
> trial of the monthly ($4.99) or yearly ($49.99) plan. Please start the trial
> with a sandbox account to unlock the app. "Restore purchases", Terms of Use
> and Privacy Policy links are on the same screen; menu → subscription opens
> Apple's manage/cancel screen.
