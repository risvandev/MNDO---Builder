-- ==============================================================================
-- MNDO BUILDER - SEED DATA FOR DEMO & TESTING
-- ==============================================================================

-- Sample mock profile (for testing with local Supabase without auth)
-- In production, profiles are generated automatically when users sign up via auth.users
INSERT INTO public.profiles (id, display_name, is_verified, storage_used_bytes, max_sites)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Risvan Demo', true, 1048576, 3)
ON CONFLICT (id) DO NOTHING;

-- Sample published site: risvan.mndo.online (Developer Portfolio)
INSERT INTO public.sites (
    id, owner_id, title, description, site_type, template_id,
    subdomain_slug, status, theme_config, seo_config, content, published_revision, published_at
)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Risvan - Full Stack Engineer',
    'Full-stack developer building fast, elegant web apps and developer tools.',
    'portfolio',
    'developer',
    'risvan',
    'published',
    '{"primaryColor": "#10b981", "fontPair": "jetbrains-inter", "mode": "dark"}'::jsonb,
    '{"metaTitle": "Risvan | Full Stack Engineer & Cloud Architect", "metaDescription": "Full-stack developer building fast, elegant web apps and developer tools.", "discourageSearch": false}'::jsonb,
    '{
        "hero": {
            "headline": "Hi, I am Risvan",
            "tagline": "Senior Full-Stack Developer & Open Source Contributor",
            "bio": "Building robust web applications, high-throughput cloud workers, and intuitive user experiences with modern web technologies.",
            "avatarUrl": "",
            "primaryCta": {"text": "View Projects", "url": "#projects"},
            "secondaryCta": {"text": "Get In Touch", "url": "#contact"}
        },
        "about": {
            "title": "About Me",
            "body": "I have spent the last 5 years designing, architecting, and deploying distributed systems and responsive user interfaces. I love building lightweight tools that solve real-world problems without bloat."
        },
        "skills": [
            {"name": "JavaScript / TypeScript", "category": "Languages", "level": "Advanced"},
            {"name": "Cloudflare Workers & Pages", "category": "Cloud", "level": "Advanced"},
            {"name": "PostgreSQL & Supabase", "category": "Databases", "level": "Advanced"},
            {"name": "Node.js & Python", "category": "Backend", "level": "Intermediate"},
            {"name": "HTML5 & Modern CSS", "category": "Frontend", "level": "Expert"}
        ],
        "projects": [
            {
                "title": "MNDO Builder",
                "description": "A lightweight website builder and instant wildcard subdomain publishing platform.",
                "tags": ["Cloudflare Workers", "Supabase", "Vanilla JS"],
                "liveUrl": "https://risvan.mndo.online",
                "githubUrl": "https://github.com/example/mndo-builder"
            },
            {
                "title": "FastEdge Cache",
                "description": "High performance edge caching proxy with sub-millisecond response times.",
                "tags": ["TypeScript", "KV", "Rust"],
                "liveUrl": "",
                "githubUrl": "https://github.com/example/fastedge"
            }
        ],
        "education": [
            {
                "institution": "National University of Engineering",
                "degree": "B.Tech in Computer Science & Engineering",
                "year": "2020 - 2024",
                "details": "Specialized in Distributed Computing and Network Architecture."
            }
        ],
        "experience": [
            {
                "company": "CloudTech Solutions",
                "role": "Frontend Systems Engineer",
                "period": "2024 - Present",
                "description": "Architected edge routing and high-performance client rendering pipelines."
            }
        ],
        "social": {
            "github": "https://github.com",
            "linkedin": "https://linkedin.com",
            "twitter": "https://x.com",
            "email": "risvan@example.com"
        },
        "contact": {
            "enableForm": true,
            "heading": "Let''s build something together",
            "subheading": "Feel free to reach out for collaborations or freelance inquiries."
        }
    }'::jsonb,
    1,
    now()
)
ON CONFLICT (id) DO NOTHING;

-- Sample blog post for Risvan
INSERT INTO public.blog_posts (
    id, site_id, title, slug, excerpt, body_markdown, status, tags, published_at
)
VALUES (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Building for the Edge: Why Zero-Runtime ROCKS',
    'building-for-the-edge',
    'Why rendering lightweight, semantic HTML on Cloudflare Workers outperforms heavy single-page apps.',
    '# Building for the Edge\n\nWhen we construct web applications today, the default instinct is often to ship megabytes of JavaScript frameworks.\n\nYet, for portfolios, personal blogs, and business landing pages, pure semantic HTML and clean CSS delivered from the edge in 10 milliseconds yields superior speed, battery life, and SEO.\n\n## Key Takeaways\n1. Instant First Contentful Paint (FCP)\n2. Flawless accessibility out of the box\n3. Zero client-side hydration bugs\n\nStay tuned for more deep dives into lightweight architecture!',
    'published',
    ARRAY['Edge Computing', 'Performance', 'WebDev'],
    now()
)
ON CONFLICT (id) DO NOTHING;
