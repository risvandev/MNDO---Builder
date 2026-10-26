// ==============================================================================
// CLOUDFLARE WORKER - PUBLIC CONTACT FORM HANDLER
// ==============================================================================

/**
 * Handle POST /api/contact submissions from published websites.
 * 
 * @param {Request} request
 * @param {object} env
 * @returns {Promise<Response>}
 */
export async function handleContactSubmission(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { siteId, name, email, message, _honeypot, turnstileToken } = body;

  // 1. Anti-spam Honeypot Check: Trap bots silently
  if (_honeypot && String(_honeypot).trim().length > 0) {
    return new Response(JSON.stringify({ success: true, message: 'Thank you! Your message has been sent.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. Turnstile Verification (if configured)
  if (env?.TURNSTILE_SECRET_KEY && turnstileToken) {
    try {
      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
          remoteip: request.headers.get('CF-Connecting-IP') || ''
        })
      });
      const outcome = await turnstileRes.json();
      if (!outcome.success) {
        return new Response(JSON.stringify({ error: 'Security verification failed. Please refresh and try again.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (err) {
      console.error('Turnstile verification error:', err);
    }
  }

  // 3. Field validation
  if (!name || typeof name !== 'string' || name.trim().length < 1 || name.length > 100) {
    return new Response(JSON.stringify({ error: 'Name must be between 1 and 100 characters.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    return new Response(JSON.stringify({ error: 'Please enter a valid email address.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 3 || message.length > 3000) {
    return new Response(JSON.stringify({ error: 'Message must be between 3 and 3000 characters.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!siteId || typeof siteId !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing site identifier.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 4. Submit to Supabase via RPC
  if (env?.SUPABASE_URL && env?.SUPABASE_ANON_KEY) {
    try {
      const url = `${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/rpc/submit_contact_message`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_site_id: siteId,
          p_sender_name: name.trim(),
          p_sender_email: email.trim().toLowerCase(),
          p_message: message.trim(),
          p_honeypot: ''
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Failed submitting contact message to Supabase:', errText);
        return new Response(JSON.stringify({ error: 'Failed to deliver message. Please try again later.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (err) {
      console.error('Contact submit network error:', err);
      return new Response(JSON.stringify({ error: 'Network error. Please try again later.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ success: true, message: 'Thank you! Your message has been sent successfully.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
