// ==============================================================================
// MNDO BUILDER - SUPABASE CLIENT & MOCK ADAPTER
// ==============================================================================
import { createClient } from '@supabase/supabase-js';
import { CONFIG, isBackendConfigured } from './config.js';

let supabase = null;

if (isBackendConfigured()) {
  try {
    supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    console.warn('Could not initialize Supabase client:', err);
  }
}

// ------------------------------------------------------------------------------
// DEMO / MOCK STORAGE ADAPTER
// When real Supabase credentials are not yet configured, permits seamless local UI testing
// ------------------------------------------------------------------------------
export const MOCK_STORAGE_KEY = 'mndo_app_state_v2';

export function getMockState() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('mndo_mock_state_v1')) {
      localStorage.removeItem('mndo_mock_state_v1');
    }
  } catch (e) {}

  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(MOCK_STORAGE_KEY) : null;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (!Array.isArray(parsed.sites)) parsed.sites = [];
        if (!Array.isArray(parsed.pages)) parsed.pages = [];
        if (!Array.isArray(parsed.posts)) parsed.posts = [];
        if (!Array.isArray(parsed.messages)) parsed.messages = [];
        return parsed;
      }
    } catch (e) {}
  }

  // Initial starter mock state for first-time visitors is unauthenticated
  const initial = {
    user: null,
    profile: null,
    sites: [
      {
        id: 'site-demo-1',
        owner_id: 'demo-user-123',
        title: 'Risvan - Full Stack Engineer',
        description: 'Building fast, elegant web apps and developer tools.',
        site_type: 'portfolio',
        template_id: 'developer',
        subdomain_slug: 'risvan',
        status: 'published',
        theme_config: { primaryColor: '#10b981', fontPair: 'jetbrains-inter' },
        seo_config: { metaTitle: 'Risvan | Full Stack Engineer', metaDescription: 'Building fast web apps.', discourageSearch: false },
        published_revision: 1,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
          skills: [
            { name: 'JavaScript / TypeScript' },
            { name: 'Cloudflare Workers' },
            { name: 'PostgreSQL' },
            { name: 'HTML5 & CSS' }
          ],
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
      }
    ],
    pages: [],
    posts: [
      {
        id: 'post-demo-1',
        site_id: 'site-demo-1',
        title: 'Building for the Edge: Why Zero-Runtime ROCKS',
        slug: 'building-for-the-edge',
        excerpt: 'Why rendering lightweight, semantic HTML on Cloudflare Workers outperforms heavy single-page apps.',
        body_markdown: '# Building for the Edge\n\nPure semantic HTML and clean CSS delivered from the edge in 10 milliseconds yields superior speed and battery life.',
        status: 'published',
        published_at: new Date().toISOString()
      }
    ],
    messages: [
      {
        id: 'msg-1',
        site_id: 'site-demo-1',
        sender_name: 'Alex Johnson',
        sender_email: 'alex@example.com',
        message: 'Loved your portfolio! Are you open to freelance contracts next month?',
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  };

  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveMockState(state) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state));
  }
}

// ------------------------------------------------------------------------------
// EXPORTED SUPABASE / ADAPTER API
// ------------------------------------------------------------------------------

export function getClient() {
  return supabase;
}

export async function getCurrentUser() {
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
  const state = getMockState();
  return state.user;
}

export async function getUserProfile(userId) {
  if (supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data;
  }
  const state = getMockState();
  return state.profile;
}

export async function getUserSites(userId) {
  if (supabase) {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
  const state = getMockState();
  return state.sites;
}

export async function getSiteById(siteId) {
  if (supabase) {
    const { data: site, error: sErr } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single();
    if (sErr) throw sErr;

    const { data: pages } = await supabase
      .from('site_pages')
      .select('*')
      .eq('site_id', siteId)
      .order('sort_order', { ascending: true });

    const { data: posts } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });

    return { site, pages: pages || [], posts: posts || [] };
  }

  const state = getMockState();
  const site = state.sites.find(s => s.id === siteId);
  if (!site) throw new Error('Site not found');
  const pages = state.pages.filter(p => p.site_id === siteId);
  const posts = state.posts.filter(p => p.site_id === siteId);
  return { site, pages, posts };
}

export async function saveSiteDraft(siteId, updates) {
  if (supabase) {
    const { data, error } = await supabase
      .from('sites')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', siteId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const state = getMockState();
  const idx = state.sites.findIndex(s => s.id === siteId);
  if (idx === -1) throw new Error('Site not found');
  state.sites[idx] = {
    ...state.sites[idx],
    ...updates,
    updated_at: new Date().toISOString()
  };
  saveMockState(state);
  return state.sites[idx];
}

export async function saveSitePosts(siteId, posts) {
  if (supabase) {
    return posts;
  }
  const state = getMockState();
  state.posts = (state.posts || []).filter(p => p.site_id !== siteId);
  posts.forEach(p => {
    state.posts.push({ ...p, site_id: siteId });
  });
  saveMockState(state);
  return posts;
}

export async function saveSitePages(siteId, pages) {
  if (supabase) {
    return pages;
  }
  const state = getMockState();
  state.pages = (state.pages || []).filter(p => p.site_id !== siteId);
  pages.forEach(p => {
    state.pages.push({ ...p, site_id: siteId });
  });
  saveMockState(state);
  return pages;
}

export async function createSite(siteData) {
  if (supabase) {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('sites')
      .insert({
        owner_id: user.id,
        title: siteData.title,
        description: siteData.description || '',
        site_type: siteData.site_type || 'portfolio',
        template_id: siteData.template_id || 'minimal',
        subdomain_slug: siteData.subdomain_slug,
        status: 'draft',
        theme_config: siteData.theme_config || {},
        seo_config: siteData.seo_config || {},
        content: siteData.content || {}
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const state = getMockState();
  if (state.sites.length >= (state.profile.max_sites || 3)) {
    throw new Error('Account quota exceeded: Free tier allows a maximum of 3 websites.');
  }

  const newSite = {
    id: `site-${Date.now()}`,
    owner_id: state.user.id,
    title: siteData.title,
    description: siteData.description || '',
    site_type: siteData.site_type || 'portfolio',
    template_id: siteData.template_id || 'minimal',
    subdomain_slug: siteData.subdomain_slug,
    status: 'draft',
    theme_config: siteData.theme_config || { primaryColor: '#2563eb', fontPair: 'inter-outfit' },
    seo_config: siteData.seo_config || { metaTitle: '', metaDescription: '', discourageSearch: false },
    content: siteData.content || { hero: { headline: siteData.title } },
    published_revision: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  state.sites.unshift(newSite);

  if (siteData.posts && Array.isArray(siteData.posts)) {
    siteData.posts.forEach(p => {
      state.posts.push({ ...p, site_id: newSite.id });
    });
  } else if (newSite.site_type === 'blog' || newSite.template_id === 'personal-blog') {
    state.posts.push({
      id: `post-${Date.now()}`,
      site_id: newSite.id,
      title: 'First Story or Thesis Chapter',
      slug: 'first-story',
      excerpt: 'Welcome to my writings. You can write your thesis, personal stories, essays, or research here.',
      body_markdown: '# Welcome to My Writings\n\nThis is where you can write your thesis, personal stories, essays, or research papers.\n\nEvery published piece of writing receives its own dedicated, permanent URL on your subdomain.',
      tags: ['story', 'writing'],
      status: 'published',
      published_at: new Date().toISOString()
    });
  }

  saveMockState(state);
  return newSite;
}

export async function deleteSite(siteId) {
  if (supabase) {
    const { error } = await supabase.from('sites').delete().eq('id', siteId);
    if (error) throw error;
    return true;
  }

  const state = getMockState();
  state.sites = state.sites.filter(s => s.id !== siteId);
  state.pages = state.pages.filter(p => p.site_id !== siteId);
  state.posts = state.posts.filter(p => p.site_id !== siteId);
  state.messages = state.messages.filter(m => m.site_id !== siteId);
  saveMockState(state);
  return true;
}

export async function getContactMessages(siteId) {
  if (supabase) {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const state = getMockState();
  return state.messages.filter(m => m.site_id === siteId);
}

export async function markMessageRead(messageId) {
  if (supabase) {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', messageId);
    return;
  }
  const state = getMockState();
  const m = state.messages.find(x => x.id === messageId);
  if (m) {
    m.is_read = true;
    saveMockState(state);
  }
}

export async function submitAbuseReport(payload) {
  if (supabase) {
    const { data, error } = await supabase.from('abuse_reports').insert({
      target_subdomain: payload.subdomain,
      reason: payload.reason,
      reporter_email: payload.email || null,
      description: payload.description
    });
    if (error) throw error;
    return data;
  }
  return { success: true };
}
