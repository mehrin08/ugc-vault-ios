# Moving UGC Vault's data to Supabase in Canada

A Supabase project's region is set when the project is created and can't be changed.
To store data in Canada, create a new project in **Canada (Central)** and move your data across.
Do this **before launch**, while you're the only user. After launch, moving every user's account is much harder.

It takes about 20 minutes. Do it on your Mac in Safari or Chrome, not in the iPhone app.

---

## 1. Back up your data from the current site
1. Open https://thriving-macaron-6a97f3.netlify.app and log in.
2. Menu (☰) → **settings** → **download backup**. Keep the `uvvault-backup-….json` file somewhere safe.

## 2. Create the new project in Canada
1. supabase.com → **New project**.
2. Name `ugc-vault`, set a strong database password (save it in your password manager), **Region: Canada (Central)**.
3. Wait about 2 minutes for it to finish setting up.

## 3. Create the table and the delete-account function
In the new project → **SQL Editor** → **New query**, paste all of this and click **Run**:

```sql
-- your lists, scripts, deals, payments and notes (one row per account)
create table if not exists public.checklists (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb,
  updated_at timestamptz default now()
);
alter table public.checklists enable row level security;
create policy "own row" on public.checklists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- "delete account" in the app (Apple requires it)
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

You should see "Success. No rows returned".

## 4. Sign-in settings
In the new project → **Authentication**:
1. **Sign In / Providers → Email**: turn **off** "Confirm email" if you want sign-up to work instantly (this is how your current project is set up).
2. **URL Configuration**:
   - Site URL: `https://thriving-macaron-6a97f3.netlify.app`
   - Redirect URLs → **Add URL**: `https://thriving-macaron-6a97f3.netlify.app/**`

   Password-reset emails need these to link back to the app.

## 5. Send Claude the new keys
New project → **Project Settings → API Keys** (or Settings → API). Copy these two:
- **Project URL**: looks like `https://abcdefghijk.supabase.co`
- **Publishable key**: starts with `sb_publishable_`, or the older "anon public" key

Both are safe to share and are meant to be in the app. **Never share the `secret` / `service_role` key.**
Claude puts them into `web/index.html` and makes you a new upload zip.

## 6. Deploy, then restore your data
1. Upload the new files to Netlify, the same way as before.
2. Open the site, **sign up** again with your email (it's a new, empty account in the Canadian project).
3. Menu (☰) → **settings** → **restore from backup** → pick the backup file from step 1.
4. Check that your lists, scripts, deals and notes are all there.

## 7. Recreate the demo account and tidy up
- Create the demo account for Apple's reviewer again, since the old one was in the old project.
- After a week or so, once everything works, you can delete the old project in Supabase → old project → Settings → General → **Delete project**.
