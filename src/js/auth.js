// ==============================================================================
// MNDO BUILDER - AUTHENTICATION CONTROLLER (SUPABASE AUTH)
// ==============================================================================
import { getClient, getCurrentUser, getUserProfile } from './supabase.js';
import { isBackendConfigured } from './config.js';

/**
 * Register a new user with Email and Password.
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 */
export async function signUpWithEmail(email, password, displayName) {
  const supabase = getClient();
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName
        },
        emailRedirectTo: `${window.location.origin}/#/auth/callback`
      }
    });

    if (error) throw error;
    return {
      user: data.user,
      session: data.session,
      requiresEmailVerification: !data.session
    };
  }

  // Demo fallback mode
  const mockUser = {
    id: `user-${Date.now()}`,
    email,
    user_metadata: { full_name: displayName },
    email_confirmed_at: new Date().toISOString()
  };
  const raw = localStorage.getItem('mndo_mock_state_v1');
  const state = raw ? JSON.parse(raw) : {};
  state.user = mockUser;
  state.profile = {
    id: mockUser.id,
    display_name: displayName,
    is_verified: true,
    storage_used_bytes: 0,
    max_sites: 3
  };
  localStorage.setItem('mndo_mock_state_v1', JSON.stringify(state));
  return { user: mockUser, session: { access_token: 'mock-token' }, requiresEmailVerification: false };
}

/**
 * Sign in existing user with Email and Password.
 * @param {string} email
 * @param {string} password
 */
export async function signInWithEmail(email, password) {
  const supabase = getClient();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  // Demo mode
  const raw = localStorage.getItem('mndo_mock_state_v1');
  const state = raw ? JSON.parse(raw) : {};
  if (!state.user) {
    state.user = { id: 'demo-user-123', email, email_confirmed_at: new Date().toISOString() };
    state.profile = { id: state.user.id, display_name: email.split('@')[0], is_verified: true, max_sites: 3 };
    localStorage.setItem('mndo_mock_state_v1', JSON.stringify(state));
  }
  return { user: state.user, session: { access_token: 'mock-token' } };
}

/**
 * Sign in with Google OAuth via Supabase
 */
export async function signInWithGoogle() {
  const supabase = getClient();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/#/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  }

  throw new Error('Google OAuth requires Supabase project credentials in .env.local.');
}

/**
 * Send Password Reset Email
 * @param {string} email
 */
export async function resetPasswordForEmail(email) {
  const supabase = getClient();
  if (supabase) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/auth/reset-password`
    });
    if (error) throw error;
    return data;
  }

  return { success: true };
}

/**
 * Sign Out
 */
export async function signOut() {
  const supabase = getClient();
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } else {
    // Clear mock active user
    const raw = localStorage.getItem('mndo_mock_state_v1');
    if (raw) {
      const state = JSON.parse(raw);
      state.user = null;
      localStorage.setItem('mndo_mock_state_v1', JSON.stringify(state));
    }
  }
  window.location.hash = '#/';
}

/**
 * Check if the active user is verified to publish websites.
 * @param {object} user
 * @returns {Promise<boolean>}
 */
export async function isUserVerified(user) {
  if (!user) return false;
  if (!isBackendConfigured()) return true; // In demo test mode, permit publishing

  // Check Supabase email confirmed timestamp
  if (user.email_confirmed_at) return true;

  // Check profile verified flag
  const profile = await getUserProfile(user.id);
  return Boolean(profile?.is_verified);
}
