import React, { useState } from 'react';
import { Mail, AlertCircle, ExternalLink, RefreshCw, Info, Upload, Zap, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ConfigCheck } from '../Diagnostics/ConfigCheck';

export function LoginPage() {
  const { signInWithEmail, signUpWithEmail, loading, error } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showGoogleNotification, setShowGoogleNotification] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signin') {
      await signInWithEmail(email, password);
    } else {
      await signUpWithEmail(email, password);
    }
  };

  const handleGoogleClick = () => {
    setShowGoogleNotification(true);
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setShowGoogleNotification(false);
    }, 3000);
  };

  const isConfigurationError = error?.includes('Supabase configuration') || 
                              error?.includes('placeholder values') ||
                              error?.includes('Unable to connect to Supabase') ||
                              error?.includes('Invalid Supabase URL') ||
                              error?.includes('Invalid Supabase anon key') ||
                              error?.includes('.env file');

  const isNetworkError = error?.includes('Failed to fetch') ||
                        error?.includes('Network error') ||
                        error?.includes('network') ||
                        error?.includes('Unable to reach Supabase servers');

  const handleRefresh = () => {
    window.location.reload();
  };

  // Show diagnostics if there are configuration errors
  if (showDiagnostics || isConfigurationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-6">
            <button
              onClick={() => setShowDiagnostics(false)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back to Login
            </button>
          </div>
          <ConfigCheck />
        </div>
      </div>
    );
  }

  const handleTestConnection = async () => {
    // This will trigger a re-initialization of the auth hook
    handleRefresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ScreenSort</h1>
          <p className="text-gray-600">Drop photos, AI finds everything, search instantly - your photos organized automatically</p>
        </div>

        {/* Google Coming Soon Notification */}
        {showGoogleNotification && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-blue-800 text-sm font-medium">Google OAuth Coming Soon!</p>
                <p className="text-blue-700 text-sm mt-1">
                  We're working on Google authentication. For now, please use email sign-in below.
                </p>
              </div>
              <button
                onClick={() => setShowGoogleNotification(false)}
                className="text-blue-400 hover:text-blue-600"
              >
                <span className="sr-only">Close</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 text-sm font-medium">
                  {isConfigurationError ? 'Configuration Error' : 
                   isNetworkError ? 'Connection Error' : 'Authentication Error'}
                </p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                
                {isConfigurationError && (
                  <div className="mt-3 p-3 bg-red-100 rounded-lg">
                    <p className="text-red-800 text-sm font-medium mb-2">🔧 Quick Fix Steps:</p>
                    <ol className="text-red-700 text-sm space-y-1 list-decimal list-inside">
                      <li><strong>Create .env file</strong> in project root (same level as package.json)</li>
                      <li><strong>Add these exact lines</strong> to .env:
                        <div className="mt-1 p-2 bg-red-200 rounded text-xs font-mono">
                          VITE_SUPABASE_URL=https://otgyuvfyicuqortshcep.supabase.co<br/>
                          VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3l1dmZ5aWN1cW9ydHNoY2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNTcwMzMsImV4cCI6MjA2NTYzMzAzM30.UJFSOHtuRm_e25DFoRwDMVCsAM5h5LGaaNySnHA8bTI
                        </div>
                      </li>
                      <li><strong>Restart dev server:</strong> Stop (Ctrl+C) and run <code>npm run dev</code> again</li>
                      <li><strong>Check Supabase:</strong> <a href="https://supabase.com/dashboard/project/otgyuvfyicuqortshcep" target=\"_blank" rel="noopener noreferrer\" className="underline inline-flex items-center">Verify project is active <ExternalLink className="w-3 h-3 ml-1" /></a></li>
                    </ol>
                    <button
                      onClick={handleRefresh}
                      className="mt-2 inline-flex items-center space-x-1 text-red-700 hover:text-red-800 text-sm"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refresh page after fixing</span>
                    </button>
                    <button
                      onClick={() => setShowDiagnostics(true)}
                      className="mt-2 ml-4 inline-flex items-center space-x-1 text-red-700 hover:text-red-800 text-sm"
                    >
                      <Info className="w-3 h-3" />
                      <span>Run diagnostics</span>
                    </button>
                  </div>
                )}

                {isNetworkError && (
                  <div className="mt-3 p-3 bg-red-100 rounded-lg">
                    <p className="text-red-800 text-sm font-medium mb-2">🌐 Connection Troubleshooting:</p>
                    <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                      <li><strong>Internet:</strong> Test other websites work</li>
                      <li><strong>Supabase Status:</strong> <a href="https://supabase.com/dashboard/project/otgyuvfyicuqortshcep" target=\"_blank\" rel="noopener noreferrer\" className=\"underline inline-flex items-center">Check if project is active <ExternalLink className=\"w-3 h-3 ml-1" /></a></li>
                      <li><strong>Firewall:</strong> Ensure *.supabase.co isn't blocked</li>
                      <li><strong>Environment:</strong> Verify .env file has correct VITE_SUPABASE_URL</li>
                      <li><strong>Project Status:</strong> Supabase projects pause after inactivity</li>
                      <li><strong>Dev Server:</strong> Restart after .env changes</li>
                    </ul>
                    <button
                      onClick={handleTestConnection}
                      className="mt-2 inline-flex items-center space-x-1 text-red-700 hover:text-red-800 text-sm"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Test connection</span>
                    </button>
                  </div>
                )}
                
                {error.includes('refused to connect') && !isConfigurationError && !isNetworkError && (
                  <p className="text-red-600 text-xs mt-2">
                    This usually means Google OAuth isn't properly configured in your Supabase project. 
                    Try using email authentication below instead.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Features with clearer descriptions */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-3 text-gray-700">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
              <Upload className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900">Drop & Store</span>
              <p className="text-sm text-gray-600 mt-0.5">Simply drag photos to upload and keep them organized in one place</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 text-gray-700">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mt-0.5">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900">Smart Recognition</span>
              <p className="text-sm text-gray-600 mt-0.5">AI automatically identifies objects, colors, and text in your photos</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 text-gray-700">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mt-0.5">
              <Search className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900">Find Instantly</span>
              <p className="text-sm text-gray-600 mt-0.5">Search by typing what you see - "red car", "cruise ship", or any text</p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="space-y-4">
          {/* Google Sign In - Disabled with notification */}
          <button
            onClick={handleGoogleClick}
            className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm relative"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              Soon
            </div>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isConfigurationError || isNetworkError}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isConfigurationError || isNetworkError}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password (min 6 characters)"
              />
            </div>
            <button
              type="submit"
              disabled={loading || isConfigurationError || isNetworkError}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="text-center">
            <button
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              disabled={isConfigurationError || isNetworkError}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authMode === 'signin' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Secure authentication powered by Supabase
        </p>
        
        {/* Built with Bolt.new Badge */}
        <div className="text-center mt-4">
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-xs font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Zap className="w-3 h-3" />
            <span>Made with Bolt.new</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}