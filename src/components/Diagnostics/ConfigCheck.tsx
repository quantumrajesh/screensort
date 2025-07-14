import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { supabase, testSupabaseConnection } from '../../lib/supabase';

interface DiagnosticResult {
  name: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export function ConfigCheck() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Check environment variables
    results.push({
      name: 'Environment Variables',
      status: 'checking',
      message: 'Checking configuration...'
    });

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
      results[0] = {
        name: 'Environment Variables',
        status: 'error',
        message: 'Missing Supabase configuration',
        details: `Missing: ${!supabaseUrl ? 'VITE_SUPABASE_URL ' : ''}${!supabaseKey ? 'VITE_SUPABASE_ANON_KEY' : ''}`
      };
    } else if (supabaseUrl.includes('your-project') || supabaseKey.includes('your_')) {
      results[0] = {
        name: 'Environment Variables',
        status: 'error',
        message: 'Placeholder values detected',
        details: 'Environment variables contain placeholder values'
      };
    } else {
      results[0] = {
        name: 'Environment Variables',
        status: 'success',
        message: 'Configuration loaded',
        details: `Supabase URL: ${supabaseUrl.substring(0, 30)}...`
      };
    }

    setDiagnostics([...results]);

    // Check OpenRouter API key
    results.push({
      name: 'OpenRouter API',
      status: 'checking',
      message: 'Checking AI configuration...'
    });

    if (!openRouterKey || openRouterKey === 'your_openrouter_api_key') {
      results[1] = {
        name: 'OpenRouter API',
        status: 'warning',
        message: 'AI features disabled',
        details: 'OpenRouter API key not configured'
      };
    } else {
      results[1] = {
        name: 'OpenRouter API',
        status: 'success',
        message: 'AI features enabled',
        details: 'OpenRouter API key configured'
      };
    }

    setDiagnostics([...results]);

    // Test Supabase connection
    results.push({
      name: 'Supabase Connection',
      status: 'checking',
      message: 'Testing database connection...'
    });

    try {
      const connectionTest = await testSupabaseConnection();
      if (connectionTest.success) {
        results[2] = {
          name: 'Supabase Connection',
          status: 'success',
          message: 'Database connected',
          details: 'Successfully connected to Supabase'
        };
      } else {
        results[2] = {
          name: 'Supabase Connection',
          status: 'error',
          message: 'Connection failed',
          details: connectionTest.error || 'Unknown connection error'
        };
      }
    } catch (error) {
      results[2] = {
        name: 'Supabase Connection',
        status: 'error',
        message: 'Connection error',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    setDiagnostics([...results]);

    // Check storage bucket
    results.push({
      name: 'Storage Bucket',
      status: 'checking',
      message: 'Checking file storage...'
    });

    try {
      const { data, error } = await supabase.storage.getBucket('screenshots');
      if (error) {
        results[3] = {
          name: 'Storage Bucket',
          status: 'error',
          message: 'Storage not configured',
          details: error.message
        };
      } else {
        results[3] = {
          name: 'Storage Bucket',
          status: 'success',
          message: 'Storage ready',
          details: 'Screenshots bucket is configured'
        };
      }
    } catch (error) {
      results[3] = {
        name: 'Storage Bucket',
        status: 'error',
        message: 'Storage check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    setDiagnostics([...results]);

    // Check database tables
    results.push({
      name: 'Database Tables',
      status: 'checking',
      message: 'Checking database schema...'
    });

    try {
      const { data, error } = await supabase
        .from('screenshots')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        results[4] = {
          name: 'Database Tables',
          status: 'error',
          message: 'Table access failed',
          details: error.message
        };
      } else {
        results[4] = {
          name: 'Database Tables',
          status: 'success',
          message: 'Database schema ready',
          details: 'Screenshots table is accessible'
        };
      }
    } catch (error) {
      results[4] = {
        name: 'Database Tables',
        status: 'error',
        message: 'Database check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    setDiagnostics([...results]);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  const hasErrors = diagnostics.some(d => d.status === 'error');
  const hasWarnings = diagnostics.some(d => d.status === 'warning');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            System Diagnostics
          </h2>
          <p className="text-gray-600">
            Checking if ScreenSort is configured correctly
          </p>
        </div>

        <div className="p-6 space-y-4">
          {diagnostics.map((diagnostic, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(diagnostic.status)}`}
            >
              <div className="flex items-start space-x-3">
                {getStatusIcon(diagnostic.status)}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {diagnostic.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {diagnostic.message}
                  </p>
                  {diagnostic.details && (
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                      {diagnostic.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              {hasErrors && (
                <p className="text-red-600 text-sm font-medium">
                  ❌ Configuration issues found
                </p>
              )}
              {!hasErrors && hasWarnings && (
                <p className="text-yellow-600 text-sm font-medium">
                  ⚠️ Some features may be limited
                </p>
              )}
              {!hasErrors && !hasWarnings && diagnostics.length > 0 && (
                <p className="text-green-600 text-sm font-medium">
                  ✅ All systems operational
                </p>
              )}
            </div>
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm font-medium"
            >
              {isRunning ? 'Running...' : 'Run Again'}
            </button>
          </div>

          {hasErrors && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Quick Fixes:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Set environment variables in Netlify dashboard</li>
                <li>• Check Supabase project is active</li>
                <li>• Verify database migrations are applied</li>
                <li>• Ensure storage bucket exists</li>
              </ul>
              <a
                href="https://app.netlify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700 mt-2 text-sm"
              >
                <span>Open Netlify Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}