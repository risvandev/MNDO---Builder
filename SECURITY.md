# MNDO Builder — Security Architecture & Guidelines

MNDO Builder is designed as a secure, public internet-facing application. This document details the security protections implemented across the frontend, edge worker, and database layers.

---

## 1. Data Isolation & Row Level Security (RLS)

Every user-owned table in PostgreSQL (`profiles`, `sites`, `site_pages`, `blog_posts`, `site_assets`, `contact_messages`, `abuse_reports`, `site_slug_history`) has Row Level Security strictly enabled.

### Access Control Rules:
- **Authenticated Owners**: Can SELECT, INSERT, UPDATE, and DELETE only records where `owner_id = auth.uid()` or records tied to a parent site owned by `auth.uid()`.
- **Draft Protection**: Anonymous visitors have **zero** direct SELECT permissions on the `sites` or `site_pages` tables.
- **Public Renderer Isolation**: The Cloudflare Worker reads data exclusively via a narrow, security-definer function:
  ```sql
  public.get_published_site_by_slug(p_slug TEXT)
  ```
  This function:
  1. Checks `status = 'published'`.
  2. Returns only public-safe fields (title, description, template ID, public content, published pages, and published blog posts).
  3. Sanitizes and excludes private owner IDs, email addresses, draft content, and internal settings.
- **Contact Message Privacy**: Inbound contact submissions are readable exclusively by the site owner.

---

## 2. Zero-Runtime & XSS Prevention

Published sites are generated as plain HTML and vanilla CSS. User-supplied content is never executed as arbitrary code.

### Protections:
- **HTML Character Escaping**: All dynamic text strings are processed through `escapeHtml()` which replaces `&`, `<`, `>`, `"`, and `'`.
- **URL Sanitization**: Links and media sources are processed through `sanitizeUrl()`. Unsafe protocols such as `javascript:`, `data:text/html`, and `vbscript:` are rejected and converted to `#`.
- **Safe Markdown Parser**: Raw HTML tags embedded inside markdown descriptions are escaped prior to formatting headings, bold, italic, and links.
- **No Client Code Evaluation**: `eval()`, `new Function()`, `innerHTML` with unsanitized data, and inline script generation are strictly prohibited.

---

## 3. Subdomain & Wildcard Security

- **Format Validation**: Slugs are constrained to lowercase alphanumeric characters with internal single hyphens (`^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])?$`).
- **Reserved Subdomains**: Over 60 platform and infrastructure names are reserved and rejected (e.g., `www`, `api`, `admin`, `builder`, `app`, `mail`, `smtp`, `login`, `dashboard`, `auth`, `billing`, `status`).
- **Database Uniqueness**: Uniqueness is enforced by a PostgreSQL UNIQUE constraint (`site_slug_unique`) rather than relying on frontend checks alone.
- **Apex Domain Protection**: The Cloudflare Worker explicitly identifies and bypasses the apex domain (`mndo.online`) and `www.mndo.online`, ensuring the existing website origin is never overwritten.

---

## 4. Public Forms & Anti-Spam Protection

- **Honeypot Trap**: Contact forms include a hidden `_honeypot` field with tab-index `-1` and autocomplete disabled. Automated bot submissions filling this field are silently trapped and acknowledged with a 200 status code without storing spam in the owner's inbox.
- **Length Limits**: Sender names (max 100 chars), email addresses (max 120 chars), and message bodies (max 3000 chars) are enforced both client-side and in the database RPC.
- **Rate-Limiting**: Cloudflare Workers enforce edge rate limits on the `/api/contact` route. Cloudflare Turnstile token validation is supported when configured.

---

## 5. File Uploads & Quota Controls

- **File Type Restrictions**: Only `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, and `image/x-icon` are permitted.
- **SVG Rejection**: SVG files are rejected to eliminate XML External Entity (XXE) and embedded JavaScript attack vectors.
- **File Size Quotas**: 
  - Images: Maximum 2 MB per file.
  - PDF documents: Maximum 5 MB per file.
  - Logos / Favicons: Maximum 512 KB per file.
  - Account total quota: Maximum 20 MB per account, enforced via database trigger.
- **Safe Object Keys**: Uploaded files are renamed with generated timestamps and randomized identifiers (`${user.id}/${siteId}/${timestamp}-${random}.${ext}`) to prevent directory traversal or object overwriting.

---

## 6. HTTP Security Headers & Content Security Policy (CSP)

The Cloudflare Worker attaches hardened security headers to all published responses:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https: data: blob:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
