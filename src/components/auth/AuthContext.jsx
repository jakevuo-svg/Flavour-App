import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../../services/supabaseClient';

const AuthContext = createContext(null);

// Demo mode user for development without Supabase
const DEMO_ADMIN = {
  id: 'demo-admin-1',
  email: 'admin@typedwn.fi',
  role: 'admin',
  first_name: 'Demo',
  last_name: 'Admin',
  is_active: true,
  expires_at: null,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: auto-login as admin
      setUser(DEMO_ADMIN);
      setProfile(DEMO_ADMIN);
      setLoading(false);
      return;
    }

    // Check if this is a signup confirmation redirect (URL hash contains type=signup)
    // If so, sign out immediately so the user must log in with their temp password
    const hash = window.location.hash;
    const isSignupConfirmation = hash && hash.includes('type=signup');

    if (isSignupConfirmation) {
      // Clear the hash first
      window.location.hash = '';
      // Wait for Supabase to process the token, then sign out
      supabase.auth.getSession().then(() => {
        supabase.auth.signOut().then(() => {
          setEmailConfirmed(true);
          setLoading(false);
        });
      });
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Ignore auth changes if we're in the process of signing out after email confirmation
      if (emailConfirmed) return;

      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    console.log('[AuthContext] Fetching profile for userId:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[AuthContext] Profile fetch error:', error);
    }

    if (data) {
      console.log('[AuthContext] Profile loaded:', data.email, 'role:', data.role);
      // Check temporary user expiration
      if (data.role === 'temporary' && data.expires_at) {
        if (new Date(data.expires_at) < new Date()) {
          await signOut();
          return;
        }
      }
      setProfile(data);
    } else {
      console.warn('[AuthContext] No profile found for userId:', userId);
    }
    setLoading(false);
  }

  async function signIn(email, password) {
    if (isDemoMode) {
      setUser(DEMO_ADMIN);
      setProfile(DEMO_ADMIN);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signOut() {
    if (isDemoMode) {
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  const isAdmin = profile?.role === 'admin';
  const isWorker = profile?.role === 'worker';
  const isTemporary = profile?.role === 'temporary';

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isAdmin, isWorker, isTemporary,
      isLoggedIn: !!user,
      signIn, signOut, isDemoMode, emailConfirmed, setEmailConfirmed
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
