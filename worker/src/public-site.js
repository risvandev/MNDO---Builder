// ==============================================================================
// CLOUDFLARE WORKER - PUBLIC SITE DATA LOADER (SUPABASE RPC)
// ==============================================================================

/**
 * Fetch published site data from Supabase via get_published_site_by_slug RPC.
 * Only returns explicitly published content, never user drafts or private data.
 * 
 * @param {string} slug
 * @param {object} env
 * @returns {Promise<{ found: boolean, redirect?: boolean, target_url?: string, siteData?: object }>}
 */
export async function fetchPublishedSite(slug, env) {
  if (!env?.SUPABASE_URL || !env?.SUPABASE_ANON_KEY) {
    // Development / Demo Fallback Mode
    if (slug === 'risvan' || slug === 'demo') {
      return {
        found: true,
        siteData: {
          site: {
            id: '10000000-0000-0000-0000-000000000001',
            title: 'Risvan - Full Stack Engineer',
            description: 'Building fast, elegant web apps and developer tools.',
            site_type: 'portfolio',
            template_id: 'developer',
            subdomain_slug: 'risvan',
            theme_config: { primaryColor: '#10b981', fontPair: 'jetbrains-inter' },
            seo_config: { metaTitle: 'Risvan | Full Stack Engineer', metaDescription: 'Building fast web apps.', discourageSearch: false },
            content: {
              hero: {
                headline: 'Hi, I am Risvan',
                tagline: 'Senior Full-Stack Developer & Open Source Contributor',
                bio: 'Building robust web applications and high-throughput cloud workers with modern web technologies.',
                primaryCta: { text: 'View Projects', url: '#projects' },
                secondaryCta: { text: 'Get In Touch', url: '#contact' }
              },
              about: {
                body: 'Designing and deploying distributed systems and responsive user interfaces. I love building lightweight tools that solve real-world problems without bloat.'
              },
              skills: ['JavaScript', 'Cloudflare Workers', 'PostgreSQL', 'Node.js', 'HTML5 & CSS'],
              projects: [
                {
                  title: 'MNDO Builder',
                  description: 'A lightweight website builder and instant wildcard subdomain publishing platform.',
                  tags: ['Cloudflare Workers', 'Supabase', 'Vanilla JS'],
                  liveUrl: 'https://risvan.mndo.online',
                  githubUrl: 'https://github.com/example/mndo-builder'
                }
              ],
              experience: [
                {
                  company: 'CloudTech Solutions',
                  role: 'Frontend Systems Engineer',
                  period: '2024 - Present',
                  description: 'Architected edge routing and high-performance client rendering pipelines.'
                }
              ],
              social: {
                github: 'https://github.com',
                linkedin: 'https://linkedin.com'
              },
              contact: {
                enableForm: true,
                heading: "Let's build something together",
                subheading: 'Feel free to reach out for collaborations or freelance inquiries.'
              }
            }
          },
          pages: [],
          posts: [
            {
              title: 'Building for the Edge: Why Zero-Runtime ROCKS',
              slug: 'building-for-the-edge',
              excerpt: 'Why rendering lightweight, semantic HTML on Cloudflare Workers outperforms heavy SPAs.',
              body_markdown: '# Building for the Edge\n\nPure semantic HTML and clean CSS delivered from the edge in 10 milliseconds yields superior speed and battery life.',
              status: 'published',
              published_at: new Date().toISOString()
            }
          ]
        }
      };
    }
    return { found: false };
  }

  try {
    const url = `${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/rpc/get_published_site_by_slug`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_slug: slug })
    });

    if (!res.ok) {
      console.error(`Supabase RPC error: ${res.status} ${res.statusText}`);
      return { found: false };
    }

    const data = await res.json();
    if (!data || data.found === false) {
      if (data && data.redirect && data.target_url) {
        return { redirect: true, target_url: data.target_url };
      }
      return { found: false };
    }

    return {
      found: true,
      siteData: {
        site: data.site,
        pages: data.pages || [],
        posts: data.posts || []
      }
    };
  } catch (err) {
    console.error('Error fetching published site from Supabase:', err);
    return { found: false };
  }
}
