# MNDO Builder — Production Deployment & DNS Guide

This guide provides step-by-step instructions for deploying MNDO Builder on free cloud tiers while **safeguarding your existing website at `mndo.online`**.

---

## Architecture Summary

```text
                                  DNS: GoDaddy -> Cloudflare
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                                                             │
        Existing Website Origin                                      Wildcard Subdomains
           (mndo.online / apex)                                   (*.mndo.online/*)
                 │                                                             │
        [Unchanged Website]                                           [Cloudflare Worker]
                                                                               │
                                                               ┌───────────────┴───────────────┐
                                                               │                               │
                                                        Supabase (RPC)                 HTML Renderer
                                                     (Public Published)           (8 Vanilla Templates)

                                Builder Dashboard & Studio
                                  (Cloudflare Pages)
                                [chosen-project.pages.dev]
```

---

## Step 1: Supabase Setup (Database, Auth, Storage)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Note your **Project URL** and **anon public key** from **Project Settings -> API**.

### 2. Run Database Migration
1. In the Supabase Dashboard, open **SQL Editor**.
2. Click **New Query**, paste the contents of `supabase/migrations/20261026000000_init_schema.sql`, and click **Run**.
3. This creates:
   - All tables (`profiles`, `sites`, `site_pages`, `blog_posts`, `site_assets`, `contact_messages`, `abuse_reports`, `reserved_subdomains`).
   - Row Level Security (RLS) policies on every table.
   - Secure database functions (`check_subdomain_availability`, `publish_site`, `unpublish_site`, `get_published_site_by_slug`, `submit_contact_message`).
   - Account quota enforcement triggers.

### 3. Create Storage Bucket
1. Open **Storage** in the Supabase Dashboard.
2. Click **New Bucket**.
3. Name: `site-assets`
4. Public bucket: **Enabled** (for serving published images and resumes).
5. Maximum file size limit: `5 MB`.
6. Allowed MIME types: `image/jpeg, image/png, image/webp, application/pdf, image/x-icon`.

### 4. Enable Email Verification
1. Open **Authentication -> Providers -> Email**.
2. Ensure **Confirm email** is enabled.
3. *Production Note:* Supabase's default email service is rate-limited to 3 emails per hour for testing. For production, configure a free SMTP provider (e.g. Brevo, Resend, or SendGrid) in **Project Settings -> Authentication -> SMTP Settings**.

### 5. Configure Google OAuth (Optional)
1. Go to **Google Cloud Console -> APIs & Credentials -> OAuth 2.0 Client IDs**.
2. Set Authorized Redirect URI to:  
   `https://<your-project-id>.supabase.co/auth/v1/callback`
3. In Supabase Dashboard -> **Authentication -> Providers -> Google**:
   - Enable Google provider.
   - Paste **Client ID** and **Client Secret**.

---

## Step 2: Cloudflare Pages Deployment (Builder Frontend)

1. Connect your Git repository to **Cloudflare Pages** (or use direct upload via `wrangler pages deploy dist`).
2. Build Configuration:
   - **Framework preset**: None / Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Environment Variables (set in Cloudflare Pages Dashboard -> Settings -> Environment Variables):
   ```ini
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_PLATFORM_DOMAIN=mndo.online
   VITE_TURNSTILE_SITE_KEY=your-optional-turnstile-site-key
   ```
4. Click **Save and Deploy**. Your builder will be accessible at:  
   `https://<your-project>.pages.dev`

---

## Step 3: Cloudflare Worker Deployment (Public Website Renderer)

The Worker routes and renders all published user sites at `*.mndo.online/*`.

### 1. Deploy the Worker
From the root of `mndo-builder`, execute:
```bash
npx wrangler deploy worker/src/index.js
```

### 2. Configure Worker Variables & Secrets
In Cloudflare Dashboard -> **Workers & Pages -> mndo-worker -> Settings -> Variables**:
- Environment Variables:
  - `PLATFORM_DOMAIN`: `mndo.online`
  - `SUPABASE_URL`: `https://your-project-id.supabase.co`
  - `SUPABASE_ANON_KEY`: `your-supabase-anon-key`
- Secrets (if using anti-spam Turnstile or Resend notifications):
  ```bash
  npx wrangler secret put TURNSTILE_SECRET_KEY
  npx wrangler secret put RESEND_API_KEY
  ```

---

## Step 4: Domain & DNS Configuration (Safeguarding `mndo.online`)

> [!IMPORTANT]
> The domain `mndo.online` is registered with GoDaddy and already hosts an active website.
> **DO NOT** delete or overwrite existing records. Follow this exact sequence to ensure zero downtime.

### Phase A: Record Existing DNS Configuration
1. Log into your **GoDaddy DNS Management** console for `mndo.online`.
2. Take a screenshot or export all existing DNS records:
   - Apex A record (`@`) pointing to your existing web host IP.
   - Any CNAME records (e.g. `www`, mail subdomains).
   - All MX records (email routing).
   - All TXT records (SPF, DKIM, site verification).

### Phase B: Add Domain to Cloudflare
1. Log into your **Cloudflare Dashboard**.
2. Click **Add a Domain** and enter `mndo.online`.
3. Select the **Free Plan**.
4. Cloudflare will automatically query and import existing records.
5. **Carefully compare** the imported records against your GoDaddy export. Manually add any missing MX, TXT, or A records.

### Phase C: Change Nameservers in GoDaddy
1. Cloudflare will provide two nameservers (e.g., `aria.ns.cloudflare.com` and `tom.ns.cloudflare.com`).
2. In GoDaddy DNS -> Nameservers, click **Change** -> **Enter my own nameservers**.
3. Save the Cloudflare nameservers.
4. Allow nameserver propagation (usually 5 to 30 minutes).
5. Verify that your existing website at `https://mndo.online` and your emails continue working normally.

### Phase D: Configure Wildcard DNS for User Subdomains
Once the domain is active on Cloudflare:
1. In Cloudflare Dashboard -> **DNS -> Records**, click **Add Record**:
   - **Type**: `CNAME`
   - **Name**: `*`
   - **Target**: `mndo.online` (or any dummy proxied hostname)
   - **Proxy status**: **Proxied** (Orange Cloud enabled — required for Workers)
   - **TTL**: Auto
2. Click **Save**.

### Phase E: Bind Worker Route
1. In Cloudflare Dashboard -> **Workers & Pages -> mndo-worker -> Settings -> Triggers**.
2. Click **Add Route**:
   - **Route**: `*.mndo.online/*`
   - **Zone**: `mndo.online`
3. Click **Save Route**.

### Phase F: Verification
1. Test your existing website at `https://mndo.online` — it should load your existing site.
2. Test a sample published site: publish a site in MNDO Builder under subdomain `risvan` and navigate to `https://risvan.mndo.online`. It should load the published site with an automatic SSL certificate.
3. Test a non-existent subdomain: `https://nonexistent123.mndo.online` should return the friendly 404 page.

### Rollback Procedure (Emergency Only)
If your existing website is unexpectedly affected:
1. In Cloudflare Dashboard -> **Workers -> Triggers**, simply click **Delete** on the `*.mndo.online/*` route. All requests will immediately bypass the worker.
2. If nameserver issues occur, revert GoDaddy nameservers back to the original GoDaddy default nameservers.
