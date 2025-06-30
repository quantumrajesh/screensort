// OpenRouter integration for Gemini 2.0 Flash
interface GeminiAnalysisResult {
  description: string;
  objects: string[];
  colors: string[];
  tags: string[];
  scene: string;
  text: string;
  confidence: number;
  emotions?: string[];
  activities?: string[];
  location?: string;
}

// Convert file to base64 for API
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove the data:image/jpeg;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Enhanced image analysis with Gemini 2.0 Flash via OpenRouter
export async function analyzeImageWithGemini(imageFile: File): Promise<GeminiAnalysisResult> {
  try {
    console.log('🤖 Starting Gemini 2.0 Flash analysis via OpenRouter...');
    
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    // Better error handling for missing or invalid API key
    if (!apiKey || apiKey === 'your_openrouter_api_key' || apiKey.trim() === '' || !apiKey.startsWith('sk-or-')) {
      console.warn('⚠️ OpenRouter API key not configured properly');
      console.warn('📝 To enable AI analysis:');
      console.warn('   1. Get an API key from https://openrouter.ai');
      console.warn('   2. Add it to your .env file as VITE_OPENROUTER_API_KEY=sk-or-your_actual_key');
      console.warn('   3. Restart your development server');
      
      // Return fallback result instead of throwing
      return {
        description: 'AI analysis unavailable - API key not configured',
        objects: ['image', 'photo'],
        colors: ['unknown'],
        tags: ['ai-analysis-disabled', 'image', 'photo'],
        scene: 'unknown',
        text: '',
        confidence: 0.1,
        emotions: [],
        activities: [],
        location: 'unknown'
      };
    }
    
    const base64Data = await fileToBase64(imageFile);
    
    const prompt = `Analyze this image comprehensively and provide a detailed JSON response with the following structure:

{
  "description": "A detailed 2-3 sentence description of what's in the image",
  "objects": ["list", "of", "specific", "objects", "detected"],
  "colors": ["dominant", "color", "names", "in", "the", "image"],
  "tags": ["relevant", "searchable", "tags", "and", "keywords"],
  "scene": "brief scene type (indoor/outdoor/nature/urban/etc)",
  "text": "any visible text in the image",
  "confidence": 0.95,
  "emotions": ["any", "emotions", "or", "moods", "conveyed"],
  "activities": ["any", "activities", "or", "actions", "happening"],
  "location": "type of location if identifiable"
}

Focus on:
- Specific objects, people, animals, vehicles, technology
- Dominant colors and color schemes
- Any text, signs, or writing visible
- Scene context and setting
- Activities or actions taking place
- Emotional tone or mood
- Searchable keywords that would help find this image later

Be thorough but concise. Include both obvious and subtle details that would be useful for searching and categorizing this image.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
        'X-Title': import.meta.env.VITE_SITE_NAME || 'ScreenSort',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${imageFile.type};base64,${base64Data}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 2048,
        top_p: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      // Handle specific error cases
      if (response.status === 401 || response.status === 403) {
        console.error('❌ Authentication failed - check your OpenRouter API key');
        console.error('📝 Steps to fix:');
        console.error('   1. Verify your API key at https://openrouter.ai');
        console.error('   2. Update your .env file with the correct key (starts with sk-or-)');
        console.error('   3. Restart your development server');
        
        // Return fallback result for auth errors
        return {
          description: 'AI analysis unavailable - authentication failed',
          objects: ['image', 'photo'],
          colors: ['unknown'],
          tags: ['ai-auth-failed', 'image', 'photo'],
          scene: 'unknown',
          text: '',
          confidence: 0.1,
          emotions: [],
          activities: [],
          location: 'unknown'
        };
      }
      
      // Handle rate limiting (429) errors specifically
      if (response.status === 429) {
        console.warn('⚠️ OpenRouter API rate limit exceeded');
        console.warn('📝 Rate limiting info:');
        console.warn('   - Free tier has generous limits');
        console.warn('   - Consider upgrading for higher limits');
        
        // Return fallback result for rate limiting
        return {
          description: 'AI analysis temporarily unavailable due to rate limiting',
          objects: ['image', 'photo'],
          colors: ['unknown'],
          tags: ['ai-rate-limited', 'image', 'photo'],
          scene: 'unknown',
          text: '',
          confidence: 0.1,
          emotions: [],
          activities: [],
          location: 'unknown'
        };
      }
      
      // For other errors, return fallback instead of throwing
      console.warn(`⚠️ OpenRouter API error ${response.status}, using fallback analysis`);
      return {
        description: 'AI analysis unavailable - API error',
        objects: ['image', 'photo'],
        colors: ['unknown'],
        tags: ['ai-api-error', 'image', 'photo'],
        scene: 'unknown',
        text: '',
        confidence: 0.1,
        emotions: [],
        activities: [],
        location: 'unknown'
      };
    }

    const data = await response.json();
    console.log('🤖 OpenRouter raw response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.warn('⚠️ Invalid response format from OpenRouter API, using fallback');
      return {
        description: 'AI analysis completed with limited data',
        objects: ['image', 'photo'],
        colors: ['unknown'],
        tags: ['ai-limited-response', 'image', 'photo'],
        scene: 'unknown',
        text: '',
        confidence: 0.3,
        emotions: [],
        activities: [],
        location: 'unknown'
      };
    }

    const content = data.choices[0].message.content;
    console.log('📝 Gemini analysis content:', content);

    // Parse JSON response
    let analysisResult: GeminiAnalysisResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.warn('⚠️ Failed to parse Gemini JSON response, creating fallback result');
      // Fallback: create a basic result from the text response
      analysisResult = {
        description: content.substring(0, 200) + '...',
        objects: extractWordsFromText(content, ['object', 'item', 'thing']),
        colors: extractWordsFromText(content, ['color', 'red', 'blue', 'green', 'yellow', 'black', 'white']),
        tags: extractWordsFromText(content, ['tag', 'keyword']),
        scene: 'unknown',
        text: '',
        confidence: 0.7,
        emotions: [],
        activities: [],
        location: 'unknown'
      };
    }

    // Validate and enhance the result
    const enhancedResult: GeminiAnalysisResult = {
      description: analysisResult.description || 'Image analysis completed',
      objects: Array.isArray(analysisResult.objects) ? analysisResult.objects.slice(0, 20) : [],
      colors: Array.isArray(analysisResult.colors) ? analysisResult.colors.slice(0, 10) : [],
      tags: Array.isArray(analysisResult.tags) ? analysisResult.tags.slice(0, 30) : [],
      scene: analysisResult.scene || 'general',
      text: analysisResult.text || '',
      confidence: typeof analysisResult.confidence === 'number' ? analysisResult.confidence : 0.8,
      emotions: Array.isArray(analysisResult.emotions) ? analysisResult.emotions.slice(0, 5) : [],
      activities: Array.isArray(analysisResult.activities) ? analysisResult.activities.slice(0, 10) : [],
      location: analysisResult.location || 'unknown'
    };

    console.log('✅ Gemini analysis complete:', enhancedResult);
    return enhancedResult;

  } catch (error) {
    console.warn('⚠️ Gemini analysis error, using fallback result:', error);
    
    // Return a fallback result instead of throwing
    return {
      description: 'AI analysis unavailable due to technical error',
      objects: ['image', 'photo'],
      colors: ['unknown'],
      tags: ['ai-analysis-failed', 'image', 'photo'],
      scene: 'unknown',
      text: '',
      confidence: 0.1,
      emotions: [],
      activities: [],
      location: 'unknown'
    };
  }
}

// Helper function to extract relevant words from text
function extractWordsFromText(text: string, keywords: string[]): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const relevant: string[] = [];
  
  keywords.forEach(keyword => {
    words.forEach(word => {
      if (word.includes(keyword) && !relevant.includes(word)) {
        relevant.push(word.replace(/[^\w]/g, ''));
      }
    });
  });
  
  return relevant.slice(0, 10);
}

// Enhanced image analysis combining Gemini with existing systems
export async function analyzeImageWithAI(imageFile: File): Promise<{
  geminiAnalysis: GeminiAnalysisResult;
  combinedTags: string[];
  enhancedDescription: string;
}> {
  try {
    console.log('🚀 Starting enhanced AI analysis with Gemini 2.0 Flash via OpenRouter...');
    
    // Get Gemini analysis (now with better error handling)
    const geminiResult = await analyzeImageWithGemini(imageFile);
    
    // Combine all tags and remove duplicates
    const allTags = [
      ...geminiResult.objects,
      ...geminiResult.colors,
      ...geminiResult.tags,
      ...geminiResult.emotions || [],
      ...geminiResult.activities || [],
      geminiResult.scene,
      geminiResult.location
    ].filter(tag => tag && tag !== 'unknown' && tag.length > 1);
    
    const uniqueTags = [...new Set(allTags)];
    
    // Create enhanced description
    const enhancedDescription = `${geminiResult.description}${geminiResult.text ? ` Contains text: "${geminiResult.text}"` : ''}`;
    
    console.log('🎯 Enhanced AI analysis complete:', {
      description: enhancedDescription,
      totalTags: uniqueTags.length,
      confidence: geminiResult.confidence
    });
    
    return {
      geminiAnalysis: geminiResult,
      combinedTags: uniqueTags.slice(0, 40), // Limit for performance
      enhancedDescription
    };
    
  } catch (error) {
    console.warn('⚠️ Enhanced AI analysis error, using fallback result:', error);
    
    // Return fallback result instead of throwing
    const fallbackResult: GeminiAnalysisResult = {
      description: 'AI analysis unavailable due to technical error',
      objects: ['image', 'photo'],
      colors: ['unknown'],
      tags: ['ai-analysis-failed', 'image', 'photo'],
      scene: 'unknown',
      text: '',
      confidence: 0.1,
      emotions: [],
      activities: [],
      location: 'unknown'
    };
    
    return {
      geminiAnalysis: fallbackResult,
      combinedTags: ['image', 'photo', 'ai-analysis-failed'],
      enhancedDescription: 'AI analysis unavailable due to technical error'
    };
  }
}

// Test function for API connectivity
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_openrouter_api_key' || apiKey.trim() === '' || !apiKey.startsWith('sk-or-')) {
      console.error('❌ VITE_OPENROUTER_API_KEY not found or not configured');
      return false;
    }
    
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
        'X-Title': import.meta.env.VITE_SITE_NAME || 'ScreenSort',
      }
    });
    
    if (response.ok) {
      console.log('✅ OpenRouter API connection successful');
      return true;
    } else {
      console.error('❌ OpenRouter API connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ OpenRouter API test error:', error);
    return false;
  }
}