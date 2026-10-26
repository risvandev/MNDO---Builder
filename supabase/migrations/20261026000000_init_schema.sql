-- ==============================================================================
-- MNDO BUILDER - COMPLETE DATABASE SCHEMA & SECURITY POLICIES
-- ==============================================================================
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    is_verified BOOLEAN DEFAULT false,
    storage_used_bytes BIGINT DEFAULT 0,
    max_sites INT DEFAULT 3,
    max_storage_bytes BIGINT DEFAULT 20971520, -- 20 MB free quota
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Function to handle profile auto-creation on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, is_verified)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.email_confirmed_at IS NOT NULL), false)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users (runs if running in Supabase environment with auth schema)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- ==============================================================================
-- 2. RESERVED SUBDOMAINS LIST & VALIDATION
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reserved_subdomains (
    subdomain TEXT PRIMARY KEY
);

-- Populate reserved infrastructure & platform subdomains
INSERT INTO public.reserved_subdomains (subdomain) VALUES
    ('www'), ('api'), ('admin'), ('administrator'), ('builder'),
    ('app'), ('dashboard'), ('portal'), ('cdn'), ('static'),
    ('assets'), ('mail'), ('email'), ('smtp'), ('imap'), ('pop'),
    ('mx'), ('ns'), ('ns1'), ('ns2'), ('dns'), ('direct'),
    ('ftp'), ('cpanel'), ('whm'), ('webmail'), ('autodiscover'),
    ('autoconfig'), ('login'), ('signin'), ('signup'), ('auth'),
    ('oauth'), ('account'), ('user'), ('users'), ('profile'),
    ('billing'), ('shop'), ('store'), ('pay'), ('payment'),
    ('checkout'), ('support'), ('help'), ('faq'), ('docs'),
    ('status'), ('health'), ('ping'), ('metrics'), ('monitor'),
    ('abuse'), ('security'), ('root'), ('host'), ('server'),
    ('dev'), ('development'), ('staging'), ('test'), ('testing'),
    ('demo'), ('preview'), ('beta'), ('alpha'), ('mndo'),
    ('internal'), ('gateway'), ('proxy'), ('edge'), ('worker')
ON CONFLICT (subdomain) DO NOTHING;

-- Helper function to validate subdomain format
CREATE OR REPLACE FUNCTION public.is_valid_subdomain(p_slug TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF p_slug IS NULL OR length(p_slug) < 3 OR length(p_slug) > 32 THEN
        RETURN FALSE;
    END IF;
    -- Alphanumeric with internal hyphens only, no leading/trailing hyphen
    IF NOT (p_slug ~ '^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])?$') THEN
        RETURN FALSE;
    END IF;
    -- Cannot contain consecutive hyphens
    IF p_slug LIKE '%--%' THEN
        RETURN FALSE;
    END IF;
    -- Check reserved words
    IF EXISTS (SELECT 1 FROM public.reserved_subdomains WHERE subdomain = p_slug) THEN
        RETURN FALSE;
    END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ==============================================================================
-- 3. SITES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    site_type TEXT NOT NULL DEFAULT 'portfolio' CHECK (site_type IN ('portfolio', 'personal', 'blog', 'business')),
    template_id TEXT NOT NULL DEFAULT 'minimal' CHECK (template_id IN ('minimal', 'developer', 'academic', 'professional', 'creative', 'modern', 'personal-blog', 'business')),
    subdomain_slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished', 'suspended')),
    theme_config JSONB NOT NULL DEFAULT '{"primaryColor": "#2563eb", "fontPair": "inter-outfit", "mode": "light", "customCss": ""}'::jsonb,
    seo_config JSONB NOT NULL DEFAULT '{"metaTitle": "", "metaDescription": "", "discourageSearch": false, "keywords": []}'::jsonb,
    content JSONB NOT NULL DEFAULT '{"sections": []}'::jsonb,
    published_revision INT NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT site_slug_unique UNIQUE (subdomain_slug),
    CONSTRAINT site_slug_format CHECK (public.is_valid_subdomain(subdomain_slug))
);

CREATE INDEX IF NOT EXISTS idx_sites_subdomain ON public.sites(subdomain_slug);
CREATE INDEX IF NOT EXISTS idx_sites_owner ON public.sites(owner_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON public.sites(status);

-- Enforce Max 3 Sites Quota per user trigger
CREATE OR REPLACE FUNCTION public.check_user_site_quota()
RETURNS TRIGGER AS $$
DECLARE
    v_count INT;
    v_max INT;
BEGIN
    SELECT count(*) INTO v_count FROM public.sites WHERE owner_id = NEW.owner_id;
    SELECT COALESCE(max_sites, 3) INTO v_max FROM public.profiles WHERE id = NEW.owner_id;
    IF v_count >= v_max THEN
        RAISE EXCEPTION 'Account quota exceeded: Free tier allows a maximum of % websites.', v_max;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_user_site_quota ON public.sites;
CREATE TRIGGER trg_check_user_site_quota
    BEFORE INSERT ON public.sites
    FOR EACH ROW EXECUTE FUNCTION public.check_user_site_quota();

-- ==============================================================================
-- 4. SITE PAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    page_type TEXT NOT NULL DEFAULT 'custom' CHECK (page_type IN ('about', 'projects', 'contact', 'services', 'blog', 'custom')),
    title TEXT NOT NULL,
    path TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_in_nav BOOLEAN NOT NULL DEFAULT true,
    is_published BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT site_pages_unique_path UNIQUE (site_id, path),
    CONSTRAINT site_pages_path_format CHECK (path ~ '^/[a-z0-9_-]+$')
);

CREATE INDEX IF NOT EXISTS idx_site_pages_site ON public.site_pages(site_id);

-- ==============================================================================
-- 5. BLOG POSTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT DEFAULT '',
    body_markdown TEXT NOT NULL DEFAULT '',
    cover_asset_url TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT blog_posts_unique_slug UNIQUE (site_id, slug),
    CONSTRAINT blog_posts_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_site ON public.blog_posts(site_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);

-- ==============================================================================
-- 6. SITE ASSETS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/x-icon', 'image/vnd.microsoft.icon')),
    file_size INT NOT NULL CHECK (file_size > 0 AND file_size <= 5242880), -- 5 MB max single file
    asset_purpose TEXT NOT NULL DEFAULT 'image' CHECK (asset_purpose IN ('avatar', 'logo', 'favicon', 'project_image', 'resume_pdf', 'gallery_image', 'cover')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_assets_site ON public.site_assets(site_id);
CREATE INDEX IF NOT EXISTS idx_site_assets_owner ON public.site_assets(owner_id);

-- Trigger to update user's total storage tracking
CREATE OR REPLACE FUNCTION public.update_user_storage_on_asset()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles
        SET storage_used_bytes = storage_used_bytes + NEW.file_size,
            updated_at = now()
        WHERE id = NEW.owner_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles
        SET storage_used_bytes = GREATEST(0, storage_used_bytes - OLD.file_size),
            updated_at = now()
        WHERE id = OLD.owner_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_user_storage ON public.site_assets;
CREATE TRIGGER trg_update_user_storage
    AFTER INSERT OR DELETE ON public.site_assets
    FOR EACH ROW EXECUTE FUNCTION public.update_user_storage_on_asset();

-- ==============================================================================
-- 7. CONTACT MESSAGES TABLE (Inbox)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_site ON public.contact_messages(site_id);

-- ==============================================================================
-- 8. ABUSE REPORTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.abuse_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    target_subdomain TEXT NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'phishing', 'copyright', 'harassment', 'malware', 'other')),
    reporter_email TEXT,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 9. SITE SLUG HISTORY (For safe redirects & preventing squatting of old slugs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_slug_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    old_slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT slug_history_unique UNIQUE (old_slug)
);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all user tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_slug_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserved_subdomains ENABLE ROW LEVEL SECURITY;

-- Reserved subdomains: Read-only for authenticated and public
CREATE POLICY "Public can read reserved subdomains" ON public.reserved_subdomains
    FOR SELECT TO public USING (true);

-- Profiles policies
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Sites policies
CREATE POLICY "Users can view own sites" ON public.sites
    FOR SELECT TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Users can create own sites" ON public.sites
    FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own sites" ON public.sites
    FOR UPDATE TO authenticated USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own sites" ON public.sites
    FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Site Pages policies
CREATE POLICY "Users can view own site pages" ON public.site_pages
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.sites WHERE sites.id = site_pages.site_id AND sites.owner_id = auth.uid())
    );

CREATE POLICY "Users can insert own site pages" ON public.site_pages
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM public.sites WHERE sites.id = site_pages.site_id AND sites.owner_id = auth.uid())
    );

CREATE POLICY "Users can update own site pages" ON public.site_pages
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.sites WHERE sites.id = site_pages.site_id AND sites.owner_id = auth.uid())
    );

CREATE POLICY "Users can delete own site pages" ON public.site_pages
    FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.sites WHERE sites.id = site_pages.site_id AND sites.owner_id = auth.uid())
    );

-- Blog Posts policies
CREATE POLICY "Users can view own blog posts" ON public.blog_posts
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.sites WHERE sites.id = blog_posts.site_id AND sites.owner_id = auth.uid())
    );

CREATE POLICY "Users can insert own blog posts" ON public.blog_posts
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM public.sites WHERE sites.id = blog_posts.site_id AND sites.owner_id = auth.uid())
    );

CREATE POLICY "Users can update own blog posts" ON public.blog_posts
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.sites WHERE sites.id = blog_posts.site_id AND sites.owner_id = auth.uid())
    );

CREATE POLICY "Users can delete own blog posts" ON public.blog_posts
    FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.sites WHERE sites.id = blog_posts.site_id AND sites.owner_id = auth.uid())
    );

-- Site Assets policies
CREATE POLICY "Users can view own assets" ON public.site_assets
    FOR SELECT TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own assets" ON public.site_assets
    FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own assets" ON public.site_assets
    FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Contact Messages policies: ONLY site owner can view or delete
CREATE POLICY "Owners can view contact messages" ON public.contact_messages
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.sites WHERE sites.id = contact_messages.site_id AND sites.owner_id = auth.uid())
    );

CREATE POLICY "Owners can update contact messages" ON public.contact_messages
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.sites WHERE sites.id = contact_messages.site_id AND sites.owner_id = auth.uid())
    );

CREATE POLICY "Owners can delete contact messages" ON public.contact_messages
    FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.sites WHERE sites.id = contact_messages.site_id AND sites.owner_id = auth.uid())
    );

-- Abuse Reports policies: Anyone (public or auth) can insert; only platform admins can view
CREATE POLICY "Public can report abuse" ON public.abuse_reports
    FOR INSERT TO public WITH CHECK (true);

-- Site Slug History policies
CREATE POLICY "Users can view own slug history" ON public.site_slug_history
    FOR SELECT TO authenticated USING (owner_id = auth.uid());

-- ==============================================================================
-- 11. SECURE DATABASE FUNCTIONS (RPC)
-- ==============================================================================

-- Subdomain Availability Check (Public RPC)
CREATE OR REPLACE FUNCTION public.check_subdomain_availability(p_slug TEXT)
RETURNS JSONB AS $$
DECLARE
    v_norm TEXT;
BEGIN
    v_norm := lower(trim(p_slug));
    IF NOT public.is_valid_subdomain(v_norm) THEN
        RETURN jsonb_build_object('available', false, 'reason', 'Invalid format. Must be 3-32 characters of lowercase letters, numbers, and hyphens, and not a reserved name.');
    END IF;

    -- Check if active site has it
    IF EXISTS (SELECT 1 FROM public.sites WHERE subdomain_slug = v_norm) THEN
        RETURN jsonb_build_object('available', false, 'reason', 'This subdomain is already taken.');
    END IF;

    -- Check slug history
    IF EXISTS (SELECT 1 FROM public.site_slug_history WHERE old_slug = v_norm) THEN
        RETURN jsonb_build_object('available', false, 'reason', 'This subdomain was previously reserved.');
    END IF;

    RETURN jsonb_build_object('available', true, 'slug', v_norm);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Publish Site RPC (Authenticated site owner only)
CREATE OR REPLACE FUNCTION public.publish_site(p_site_id UUID, p_new_slug TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    v_site RECORD;
    v_target_slug TEXT;
    v_is_verified BOOLEAN;
BEGIN
    -- Verify ownership
    SELECT * INTO v_site FROM public.sites WHERE id = p_site_id AND owner_id = auth.uid();
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Site not found or unauthorized.';
    END IF;

    -- Verify user email status (must be verified to publish)
    SELECT is_verified INTO v_is_verified FROM public.profiles WHERE id = auth.uid();
    IF COALESCE(v_is_verified, false) = false THEN
        -- Also check auth.jwt() if available
        IF COALESCE((auth.jwt()->>'email_verified')::boolean, false) = false THEN
            RAISE EXCEPTION 'Email verification required: You must verify your email address before publishing your website.';
        END IF;
    END IF;

    -- Determine target slug
    v_target_slug := COALESCE(lower(trim(p_new_slug)), v_site.subdomain_slug);
    IF NOT public.is_valid_subdomain(v_target_slug) THEN
        RAISE EXCEPTION 'Invalid subdomain format or reserved word.';
    END IF;

    -- If slug changed, record old in history and check conflict
    IF v_target_slug <> v_site.subdomain_slug THEN
        IF EXISTS (SELECT 1 FROM public.sites WHERE subdomain_slug = v_target_slug AND id <> p_site_id) THEN
            RAISE EXCEPTION 'Subdomain % is already in use by another website.', v_target_slug;
        END IF;
        
        -- Record previous slug in history
        INSERT INTO public.site_slug_history (site_id, owner_id, old_slug)
        VALUES (p_site_id, auth.uid(), v_site.subdomain_slug)
        ON CONFLICT (old_slug) DO NOTHING;
    END IF;

    -- Update site to published state
    UPDATE public.sites
    SET subdomain_slug = v_target_slug,
        status = 'published',
        published_revision = published_revision + 1,
        published_at = now(),
        updated_at = now()
    WHERE id = p_site_id;

    RETURN jsonb_build_object(
        'success', true,
        'subdomain', v_target_slug,
        'published_url', 'https://' || v_target_slug || '.mndo.online'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unpublish Site RPC (Authenticated site owner only)
CREATE OR REPLACE FUNCTION public.unpublish_site(p_site_id UUID)
RETURNS JSONB AS $$
BEGIN
    UPDATE public.sites
    SET status = 'unpublished',
        updated_at = now()
    WHERE id = p_site_id AND owner_id = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Site not found or unauthorized.';
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure Public Site Data Fetcher for Cloudflare Worker Renderer
-- Notice: Returns ONLY published data, sanitizing owner ID, drafts, or private settings.
CREATE OR REPLACE FUNCTION public.get_published_site_by_slug(p_slug TEXT)
RETURNS JSONB AS $$
DECLARE
    v_norm_slug TEXT;
    v_site RECORD;
    v_pages JSONB;
    v_posts JSONB;
BEGIN
    v_norm_slug := lower(trim(p_slug));

    SELECT s.id, s.title, s.description, s.site_type, s.template_id,
           s.subdomain_slug, s.theme_config, s.seo_config, s.content,
           s.published_revision, s.published_at, s.updated_at
    INTO v_site
    FROM public.sites s
    WHERE s.subdomain_slug = v_norm_slug AND s.status = 'published';

    IF NOT FOUND THEN
        -- Check if it is an old slug in history for redirect
        DECLARE
            v_new_slug TEXT;
        BEGIN
            SELECT s2.subdomain_slug INTO v_new_slug
            FROM public.site_slug_history h
            JOIN public.sites s2 ON s2.id = h.site_id
            WHERE h.old_slug = v_norm_slug AND s2.status = 'published';
            
            IF FOUND THEN
                RETURN jsonb_build_object(
                    'redirect', true,
                    'new_subdomain', v_new_slug,
                    'target_url', 'https://' || v_new_slug || '.mndo.online'
                );
            END IF;
        END;
        
        RETURN jsonb_build_object('found', false);
    END IF;

    -- Fetch published pages for this site
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'page_type', p.page_type,
            'title', p.title,
            'path', p.path,
            'content', p.content,
            'is_in_nav', p.is_in_nav,
            'sort_order', p.sort_order
        ) ORDER BY p.sort_order ASC, p.created_at ASC
    ), '[]'::jsonb) INTO v_pages
    FROM public.site_pages p
    WHERE p.site_id = v_site.id AND p.is_published = true;

    -- Fetch published blog posts for this site
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', b.id,
            'title', b.title,
            'slug', b.slug,
            'excerpt', b.excerpt,
            'body_markdown', b.body_markdown,
            'cover_asset_url', b.cover_asset_url,
            'tags', b.tags,
            'published_at', b.published_at
        ) ORDER BY b.published_at DESC
    ), '[]'::jsonb) INTO v_posts
    FROM public.blog_posts b
    WHERE b.site_id = v_site.id AND b.status = 'published';

    RETURN jsonb_build_object(
        'found', true,
        'site', jsonb_build_object(
            'id', v_site.id,
            'title', v_site.title,
            'description', v_site.description,
            'site_type', v_site.site_type,
            'template_id', v_site.template_id,
            'subdomain_slug', v_site.subdomain_slug,
            'theme_config', v_site.theme_config,
            'seo_config', v_site.seo_config,
            'content', v_site.content,
            'published_revision', v_site.published_revision,
            'published_at', v_site.published_at,
            'updated_at', v_site.updated_at
        ),
        'pages', v_pages,
        'posts', v_posts
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public Contact Form Submission RPC (With honeypot protection & length checks)
CREATE OR REPLACE FUNCTION public.submit_contact_message(
    p_site_id UUID,
    p_sender_name TEXT,
    p_sender_email TEXT,
    p_message TEXT,
    p_honeypot TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
    v_is_published BOOLEAN;
BEGIN
    -- Anti-Spam Honeypot check: If bot fills hidden honeypot, return success silently without saving
    IF p_honeypot IS NOT NULL AND length(trim(p_honeypot)) > 0 THEN
        RETURN jsonb_build_object('success', true, 'note', 'received');
    END IF;

    -- Input length validation
    IF length(trim(COALESCE(p_sender_name, ''))) < 1 OR length(p_sender_name) > 100 THEN
        RAISE EXCEPTION 'Sender name must be between 1 and 100 characters.';
    END IF;

    IF length(trim(COALESCE(p_sender_email, ''))) < 3 OR length(p_sender_email) > 120 OR (p_sender_email NOT LIKE '%@%.%') THEN
        RAISE EXCEPTION 'Please provide a valid email address.';
    END IF;

    IF length(trim(COALESCE(p_message, ''))) < 3 OR length(p_message) > 3000 THEN
        RAISE EXCEPTION 'Message must be between 3 and 3000 characters.';
    END IF;

    -- Verify target site exists and is currently published
    SELECT (status = 'published') INTO v_is_published FROM public.sites WHERE id = p_site_id;
    IF NOT FOUND OR v_is_published IS NOT TRUE THEN
        RAISE EXCEPTION 'This website is not currently accepting contact submissions.';
    END IF;

    -- Insert into contact messages
    INSERT INTO public.contact_messages (site_id, sender_name, sender_email, message)
    VALUES (p_site_id, trim(p_sender_name), lower(trim(p_sender_email)), trim(p_message));

    RETURN jsonb_build_object('success', true, 'message', 'Thank you! Your message has been sent.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
