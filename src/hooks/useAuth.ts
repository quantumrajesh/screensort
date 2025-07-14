import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, testSupabaseConnection } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test connection first
    const initializeAuth = async () => {
      try {
        console.log('🔍 Testing Supabase connection...');
        const connectionTest = await testSupabaseConnection();
        if (!connectionTest.success) {
          console.error('❌ Supabase connection failed:', connectionTest.error);
          setError(connectionTest.error || 'Unable to connect to Supabase');
          setLoading(false);
          return;
        }
        console.log('✅ Supabase connection successful');

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          setError(getAuthErrorMessage(error));
        }
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(getAuthErrorMessage(err));
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      setError(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getAuthErrorMessage = (error: any): string => {
    const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
    
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
      return 'Network connection failed. Please check: 1) Your internet connection, 2) Your .env file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, 3) Your Supabase project is active (not paused), 4) No firewall is blocking *.supabase.co domains.';
    }
    
    if (errorMessage.includes('Invalid API key') || errorMessage.includes('Invalid JWT')) {
      return 'Invalid Supabase credentials. Please check your VITE_SUPABASE_ANON_KEY in the .env file and ensure it matches your Supabase project settings.';
    }
    
    if (errorMessage.includes('Project not found') || errorMessage.includes('404')) {
      return 'Supabase project not found. Please verify your VITE_SUPABASE_URL is correct and points to an active Supabase project.';
    }
    
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    if (errorMessage.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    
    if (errorMessage.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    
    if (errorMessage.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }

    
    return errorMessage;
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test connection before attempting auth
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest.success) {
        setError(connectionTest.error || 'Unable to connect to Supabase');
        return;
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('Google auth error:', error);
        setError(getAuthErrorMessage(error));
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Test connection before attempting auth
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest.success) {
        setError(connectionTest.error || 'Unable to connect to Supabase');
        return;
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Email auth error:', error);
        setError(getAuthErrorMessage(error));
      }
    } catch (err) {
      console.error('Email sign in error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Test connection before attempting auth
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest.success) {
        setError(connectionTest.error || 'Unable to connect to Supabase');
        return;
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        setError(getAuthErrorMessage(error));
      } else {
        setError(null);
        // Show success message for sign up
        console.log('Sign up successful! Please check your email for confirmation.');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        setError(getAuthErrorMessage(error));
      }
    } catch (err) {
      console.error('Sign out error:', err);
      setError(getAuthErrorMessage(err));
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}