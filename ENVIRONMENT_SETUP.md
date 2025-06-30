# Step 3: Configure Your Local Environment - Detailed Guide

## Overview
This step involves creating and configuring your local environment file (`.env`) with your Supabase credentials and OpenRouter API key for AI features.

## Step 3.1: Locate the Environment Example File

1. **Open your project in your code editor** (VS Code, etc.)
2. **Look for the `.env.example` file** in your project root directory
3. **Verify the file exists** - it should contain template values like:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

## Step 3.2: Create Your Environment File

### Option A: Using Command Line (Recommended)
1. **Open your terminal/command prompt**
2. **Navigate to your project directory**:
   ```bash
   cd /path/to/your/screensort
   ```
3. **Copy the example file**:
   ```bash
   # On Windows (Command Prompt)
   copy .env.example .env
   
   # On Windows (PowerShell)
   Copy-Item .env.example .env
   
   # On Mac/Linux
   cp .env.example .env
   ```

### Option B: Using File Explorer/Finder
1. **Right-click on `.env.example`** in your file explorer
2. **Select "Copy"**
3. **Right-click in the same folder** and select "Paste"
4. **Rename the copied file** from `.env.example - Copy` to `.env`

### Option C: Manual Creation
1. **Create a new file** in your project root
2. **Name it exactly** `.env` (with the dot at the beginning)
3. **Copy the contents** from `.env.example` into this new file

## Step 3.3: Get Your Supabase Credentials

From your Supabase dashboard (as shown in your screenshot):

1. **Project URL**: `https://otgyuvfyicuqortshcep.supabase.co`
2. **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3l1dmZ5aWN1cW9ydHNoY2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNTcwMzMsImV4cCI6MjA2NTYzMzAzM30.UJFSOHtuRm_e25DFoRwDMVCsAM5h5LGaaNySnHA8bTI`

## Step 3.4: Get Your OpenRouter API Key (Required for AI Features)

**IMPORTANT**: To use AI image analysis features, you need your own OpenRouter API key to avoid rate limiting issues.

1. **Visit https://openrouter.ai** and sign up for a free account
2. **Navigate to Settings** → **Integrations** or **API Keys**
3. **Generate a new API key** (it will start with `sk-or-`)
4. **Copy the API key** - you'll need it for the next step

### Why You Need Your Own API Key:
- The default shared key hits rate limits quickly
- Your own key provides dedicated rate limits
- Free tier includes generous usage limits
- Required for reliable AI image analysis

## Step 3.5: Edit Your .env File

1. **Open the `.env` file** in your code editor
2. **Replace the placeholder values** with your actual credentials:

### Before (placeholder values):
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter API for Gemini 2.0 Flash
VITE_OPENROUTER_API_KEY=your_openrouter_api_key

# Optional: Site information for OpenRouter rankings
VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME=ScreenSort
```

### After (with your actual values):
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://otgyuvfyicuqortshcep.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90Z3l1dmZ5aWN1cW9ydHNoY2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNTcwMzMsImV4cCI6MjA2NTYzMzAzM30.UJFSOHtuRm_e25DFoRwDMVCsAM5h5LGaaNySnHA8bTI

# OpenRouter API for Gemini 2.0 Flash (Replace with your actual API key)
VITE_OPENROUTER_API_KEY=sk-or-your_actual_api_key_here

# Optional: Site information for OpenRouter rankings
VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME=ScreenSort
```

**CRITICAL**: Replace `sk-or-your_actual_api_key_here` with your real OpenRouter API key from Step 3.4!

## Step 3.6: Important Notes

### ⚠️ Critical Points:
1. **No spaces around the equals sign**: Use `VITE_SUPABASE_URL=value`, not `VITE_SUPABASE_URL = value`
2. **No quotes needed**: Don't wrap values in quotes unless specified
3. **Case sensitive**: Variable names must be exactly as shown
4. **File name**: Must be exactly `.env` (not `.env.txt` or anything else)
5. **OpenRouter API key is required**: Without it, AI features will be disabled

### 🔒 Security:
- **Never commit `.env` to version control** (it's already in `.gitignore`)
- **Keep your keys private** - don't share them publicly
- **The anon key is safe for frontend use** - it's designed to be public
- **OpenRouter API key should be kept private** - don't share it

### 📁 File Location:
Your `.env` file should be in the same directory as:
- `package.json`
- `vite.config.ts`
- `index.html`

## Step 3.7: Verify Your Configuration

1. **Save the `.env` file**
2. **Check the file structure**:
   ```
   your-project/
   ├── .env                 ← Your new file
   ├── .env.example         ← Template file
   ├── package.json
   ├── vite.config.ts
   └── src/
   ```

## Step 3.8: Restart Your Development Server

1. **Stop your current server** (if running):
   - Press `Ctrl+C` in your terminal

2. **Start the server again**:
   ```bash
   npm run dev
   ```

3. **Wait for the server to start** - you should see:
   ```
   Local:   http://localhost:5173/
   ```

## Step 3.9: Test the Configuration

1. **Open your browser** to `http://localhost:5173`
2. **Check for errors**:
   - ✅ **Success**: You see the login page without configuration errors
   - ❌ **Error**: You see red error messages about configuration

### If you see configuration errors:
1. **Double-check your `.env` file** for typos
2. **Ensure no extra spaces** around the equals signs
3. **Verify the file is named exactly** `.env`
4. **Restart the development server** again

### If you see "Failed to fetch" errors:
1. **Check your internet connection**
2. **Verify your Supabase project is active** in the dashboard
3. **Try refreshing the page**

### If you see "Rate limit" or "429" errors:
1. **Verify your OpenRouter API key** is correctly set in `.env`
2. **Make sure the API key starts with** `sk-or-`
3. **Restart the development server** after updating the key

## Troubleshooting Common Issues

### Issue: "Configuration missing" error
**Solution**: 
- Check that `.env` file exists in the correct location
- Verify variable names are exactly correct (case-sensitive)
- Restart the development server

### Issue: "Placeholder values" error
**Solution**:
- Replace `your_supabase_project_url` with your actual URL
- Replace `your_supabase_anon_key` with your actual key
- Replace `your_openrouter_api_key` with your actual OpenRouter API key
- Save the file and restart the server

### Issue: "Rate limit exceeded" or "429 error"
**Solution**:
- Get your own OpenRouter API key from https://openrouter.ai
- Add it to your `.env` file as `VITE_OPENROUTER_API_KEY=sk-or-your_key`
- Restart the development server
- Your own API key provides dedicated rate limits

### Issue: File not found
**Solution**:
- Ensure `.env` is in the project root (same level as `package.json`)
- Check that your file explorer shows hidden files (`.env` starts with a dot)
- Try creating the file manually if copy command failed

### Issue: Server won't start
**Solution**:
- Check for syntax errors in `.env` (no quotes, no spaces around =)
- Ensure all required variables are present
- Try deleting `.env` and recreating it

## Next Steps

Once your `.env` file is configured correctly:
1. The application should load without configuration errors
2. You can proceed to test authentication
3. Try uploading an image to test AI analysis features
4. AI features will work reliably with your own API key

Your environment is now properly configured with both Supabase and OpenRouter! 🎉

## AI Features Status

With your OpenRouter API key configured:
- ✅ **AI Image Analysis**: Powered by Gemini 2.0 Flash
- ✅ **Object Detection**: Identifies objects, people, text in images
- ✅ **Smart Tagging**: Automatically generates searchable tags
- ✅ **Color Analysis**: Detects dominant colors
- ✅ **Scene Recognition**: Identifies indoor/outdoor, location types
- ✅ **Text Extraction**: Reads text visible in images
- ✅ **Emotion Detection**: Identifies moods and emotions
- ✅ **Activity Recognition**: Detects actions and activities

Without the API key, these features will be disabled but the app will still work for basic photo management.