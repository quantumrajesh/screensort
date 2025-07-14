import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced error checking with more specific messages
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration missing. Please ensure you have a .env file in your project root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set. Copy .env.example to .env and update with your actual Supabase credentials.'
  );
}

// Check for placeholder values with more specific guidance
if (
  supabaseUrl === 'your_supabase_project_url' || 
  supabaseUrl === 'https://your-project.supabase.co' ||
  supabaseAnonKey === 'your_supabase_anon_key' ||
  supabaseUrl.includes('your-project') ||
  supabaseUrl.includes('your_supabase_project_url')
) {
  throw new Error(
    'Supabase credentials are still set to placeholder values. Please update your .env file with your actual Supabase project URL and API key. Find these in your Supabase dashboard under Settings > API. After updating, restart your development server.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    `Invalid Supabase URL format: "${supabaseUrl}". Please check your VITE_SUPABASE_URL in the .env file. It should look like: https://your-project-id.supabase.co`
  );
}

// Validate that the URL looks like a Supabase URL
if (!supabaseUrl.includes('.supabase.co')) {
  throw new Error(
    `Invalid Supabase URL: "${supabaseUrl}". It should end with .supabase.co and look like: https://your-project-id.supabase.co`
  );
}

// Validate anon key format (basic check)
if (supabaseAnonKey.length < 100) {
  throw new Error(
    'Invalid Supabase anon key format. The anon key should be a long string (100+ characters). Please check your VITE_SUPABASE_ANON_KEY in the .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'screensort@1.0.0',
    },
  },
});

// Test connection function
export const testSupabaseConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Add shorter timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    // Try a simple health check first
    const { data, error } = await supabase.auth.getSession({ 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    
    if (error && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        error: 'Network error: Cannot reach Supabase. Check: 1) Internet connection, 2) Supabase project is active at https://supabase.com/dashboard, 3) No firewall blocking *.supabase.co, 4) .env file has correct VITE_SUPABASE_URL'
      };
    }
    
    if (error && error.message.includes('Invalid API key')) {
      return {
        success: false,
        error: 'Invalid Supabase API key. Please check your VITE_SUPABASE_ANON_KEY in the .env file.'
      };
    }
    
    if (error && error.message.includes('Project not found')) {
      return {
        success: false,
        error: 'Supabase project not found. Please verify your VITE_SUPABASE_URL is correct and the project is active.'
      };
    }
    
    return { success: true };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        error: 'Connection timeout: Supabase took too long to respond. This usually means: 1) Network issues, 2) Supabase project is paused/inactive, 3) Wrong Supabase URL in .env file'
      };
    }
    
    if (err.message?.includes('Failed to fetch') || err.message?.includes('fetch') || err.message?.includes('NetworkError')) {
      return {
        success: false,
        error: 'Network error: Unable to reach Supabase servers. This could be due to: 1) No internet connection, 2) Firewall blocking *.supabase.co, 3) Supabase project is paused/inactive, or 4) Incorrect Supabase URL.'
      };
    }
    
    return {
      success: false,
      error: `Connection failed: ${err.message || 'Unknown error'}. Check your .env file and Supabase project status.`
    };
  }
};

export type Database = {
  public: {
    Tables: {
      screenshots: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_url: string;
          extracted_text: string;
          detected_objects: string[];
          dominant_colors: string[];
          tags: string[];
          file_size: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_url: string;
          extracted_text?: string;
          detected_objects?: string[];
          dominant_colors?: string[];
          tags?: string[];
          file_size?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_url?: string;
          extracted_text?: string;
          detected_objects?: string[];
          dominant_colors?: string[];
          tags?: string[];
          file_size?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};