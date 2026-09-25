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

## Version 1.0 (App Store tab)

### Promotional Text [170]
Run your UGC business from one screen: track brand deals, see what you've earned against your monthly goal, and batch content by client every week.

### Description [4000]
UGC Vault is a business dashboard built for content creators managing brand
partnerships. Track deals and payments, write scripts, and plan your content
in batches, all in one calm, pretty place.

FEATURES
• Monthly earnings-goal ring showing earned, in-pipeline, and to-go
• Daily and batching task lists by brand, which fold away until you need them
• Count sets like "post 5 videos" and pin today's focus
• Scripts by brand, with hooks, captions and reference links
• Brand deals and payments tracker, month by month

REMINDERS THAT KEEP YOU ON TRACK
• Set a reminder on any task, once or every 15, 30 or 60 minutes until it's done
• Real iPhone notifications, even when the app is closed
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
1.0.0 (Build 1)

## App Privacy (App Store Connect → App Privacy)
"Do you or your third-party partners collect data from this app?" → **Yes**. Then select:

| Data type | Used for | Linked to the user? | Used for tracking? |
|---|---|---|---|
| Contact Info → **Email Address** | App Functionality | Yes | No |
| Contact Info → **Name** (only if users add one) | App Functionality | Yes | No |
| User Content → **Other User Content** (tasks, scripts, deals, payments) | App Functionality | Yes | No |
| Identifiers → **User ID** (Supabase account ID) | App Functionality | Yes | No |

Result shown on the store: **Data Linked to You: Contact Info, User Content,
Identifiers**, with **Data Used to Track You: none**. This matches
`privacy-policy.md`.

## App Review Information
- Sign-in required: **Yes**. Create a demo account in the app first (for example
  `review@ugcvault.app` with a password you choose), add a few sample lists,
  tasks and deals, and enter the email and password here.
- Contact: Mehrin Reza Rim · ugcrims@gmail.com · (your phone number)
- Notes:

> UGC Vault is a productivity dashboard for UGC (user-generated content)
> creators to track brand partnerships, payments, scripts and content batching.
> Please sign in with the demo account above. It already has sample data.
>
> Native iOS features to test:
> 1. Local notifications: open the menu (top right) → "phone notifications" →
>    "turn on notifications" and allow. In the Tasks tab, tap ⋯ next to a task →
>    "reminder", and set a time a minute or two ahead. The notification arrives
>    even if the app is closed. "daily & weekly nudges" in the same screen adds
>    a daily task reminder, a Sunday planning reminder and a Friday payment
>    check-in.
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
Sign up, add a few lists and tasks, and open and close them. Set a reminder
on a task (⋯ → reminder) after turning on phone notifications in the menu, and
check it arrives with the app closed. Tell us anything that looks off,
confusing or slow.

### Feedback Email
ugcrims@gmail.com

## Screenshots needed
- iPhone 6.9" (1320 × 2868): 3–10 images. Use the iPhone 16 Pro Max simulator and press ⌘S.
- Not needed for iPad: the app is set to iPhone only.
- Tip: take them signed in to the demo account with sample data. Include the
  tasks tab, the home dashboard, a script, and the phone notifications screen.
