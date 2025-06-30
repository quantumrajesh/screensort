import { extractTextFromImage } from './ocr';
import { detectObjectsWithCocoSsd } from './cocoSsdDetection';
import { extractColorsWithAI } from './aiVision';
import { analyzeImageWithAI } from './geminiVision';

export interface ImageAnalysisResult {
  extractedText: string;
  detectedObjects: string[];
  dominantColors: string[];
  tags: string[];
  geminiDescription?: string;
  confidence?: number;
}

// Comprehensive image analysis using COCO-SSD + Gemini 2.0 Flash
export async function analyzeImage(imageFile: File): Promise<ImageAnalysisResult> {
  try {
    console.log('🔍 Starting comprehensive image analysis with COCO-SSD + Gemini 2.0 Flash...');
    
    // Run all analyses in parallel for better performance
    const [ocrResult, cocoSsdResult, colorResult, geminiResult] = await Promise.allSettled([
      extractTextFromImage(imageFile),
      detectObjectsWithCocoSsd(imageFile),
      extractColorsWithAI(imageFile),
      analyzeImageWithAI(imageFile)
    ]);
    
    // Handle results and fallbacks
    const extractedText = ocrResult.status === 'fulfilled' ? ocrResult.value : '';
    const detectedObjects = cocoSsdResult.status === 'fulfilled' ? cocoSsdResult.value : [];
    const dominantColors = colorResult.status === 'fulfilled' ? colorResult.value : [];
    
    let geminiTags: string[] = [];
    let geminiDescription = '';
    let confidence = 0.7;
    
    if (geminiResult.status === 'fulfilled') {
      geminiTags = geminiResult.value.combinedTags;
      geminiDescription = geminiResult.value.enhancedDescription;
      confidence = geminiResult.value.geminiAnalysis.confidence;
      console.log('✅ Gemini analysis successful');
    } else {
      console.warn('⚠️ Gemini analysis failed, using fallback:', geminiResult.reason);
    }
    
    console.log('📊 Analysis results:', {
      textLength: extractedText.length,
      cocoSsdObjects: detectedObjects.length,
      colorsFound: dominantColors.length,
      geminiTags: geminiTags.length,
      confidence
    });
    
    // Create comprehensive tags combining all sources
    const allTags = [
      ...detectedObjects,
      ...dominantColors,
      ...geminiTags,
      ...generateSmartTags(detectedObjects, dominantColors, extractedText, geminiTags),
      ...generateContextualTags(detectedObjects, extractedText)
    ];
    
    // Remove duplicates and limit
    const uniqueTags = [...new Set(allTags)].filter(tag => tag && tag.length > 0);
    
    console.log('✅ Comprehensive image analysis complete:', { 
      text: extractedText.substring(0, 100) + (extractedText.length > 100 ? '...' : ''),
      objects: detectedObjects.slice(0, 10),
      colors: dominantColors.slice(0, 5),
      geminiDescription: geminiDescription.substring(0, 100) + '...',
      totalTags: uniqueTags.length 
    });
    
    return {
      extractedText,
      detectedObjects,
      dominantColors,
      tags: uniqueTags.slice(0, 60), // Increased limit for Gemini tags
      geminiDescription,
      confidence
    };
  } catch (error) {
    console.error('❌ Image analysis error:', error);
    throw new Error('Failed to analyze image');
  }
}

// Enhanced smart tags that include Gemini insights
function generateSmartTags(objects: string[], colors: string[], text: string, geminiTags: string[]): string[] {
  const smartTags: string[] = [];
  
  // Color + Object combinations (prioritize vehicles and technology)
  const priorityObjects = ['car', 'truck', 'bus', 'motorcycle', 'laptop', 'phone', 'keyboard'];
  
  colors.forEach(color => {
    objects.forEach(object => {
      // High priority combinations
      if (priorityObjects.some(priority => object.includes(priority))) {
        smartTags.push(`${color} ${object}`);
      }
      
      // Vehicle-specific combinations
      if (object.includes('car') || object.includes('vehicle')) {
        smartTags.push(`${color} car`, `${color} vehicle`);
      }
      
      // Technology combinations
      if (object.includes('laptop') || object.includes('computer')) {
        smartTags.push(`${color} laptop`, `${color} computer`);
      }
      
      // Phone combinations
      if (object.includes('phone') || object.includes('cell')) {
        smartTags.push(`${color} phone`, `${color} smartphone`);
      }
    });
  });
  
  // Gemini-enhanced combinations
  geminiTags.forEach(geminiTag => {
    colors.forEach(color => {
      if (geminiTag.includes('car') || geminiTag.includes('vehicle')) {
        smartTags.push(`${color} ${geminiTag}`);
      }
    });
  });
  
  // Text-based smart tags
  const textLower = text.toLowerCase();
  
  // Brand detection
  const brands = ['apple', 'samsung', 'google', 'microsoft', 'toyota', 'honda', 'ford', 'bmw'];
  brands.forEach(brand => {
    if (textLower.includes(brand)) {
      smartTags.push(brand, 'brand');
      
      // Add brand-specific context
      if (['apple', 'samsung', 'google', 'microsoft'].includes(brand)) {
        smartTags.push('tech-brand');
      }
      if (['toyota', 'honda', 'ford', 'bmw'].includes(brand)) {
        smartTags.push('car-brand', 'automotive');
      }
    }
  });
  
  // Shopping context
  if (textLower.includes('price') || textLower.includes('$') || textLower.includes('buy')) {
    smartTags.push('shopping', 'commerce', 'product');
  }
  
  // Gemini emotion and activity tags
  const emotionKeywords = ['happy', 'sad', 'excited', 'calm', 'energetic', 'peaceful'];
  const activityKeywords = ['running', 'walking', 'sitting', 'standing', 'driving', 'cooking'];
  
  geminiTags.forEach(tag => {
    if (emotionKeywords.some(emotion => tag.includes(emotion))) {
      smartTags.push('emotional-content', 'mood');
    }
    if (activityKeywords.some(activity => tag.includes(activity))) {
      smartTags.push('activity', 'action');
    }
  });
  
  return smartTags;
}

// Enhanced contextual tags with Gemini insights
function generateContextualTags(objects: string[], text: string): string[] {
  const contextTags: string[] = [];
  
  // Scene type detection
  const vehicleObjects = objects.filter(obj => 
    ['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'vehicle'].some(v => obj.includes(v))
  );
  
  const techObjects = objects.filter(obj => 
    ['laptop', 'phone', 'keyboard', 'mouse', 'computer', 'tv'].some(t => obj.includes(t))
  );
  
  const foodObjects = objects.filter(obj => 
    ['pizza', 'sandwich', 'food', 'cup', 'bottle', 'bowl'].some(f => obj.includes(f))
  );
  
  // Add scene context
  if (vehicleObjects.length > 0) {
    contextTags.push('transportation-scene', 'outdoor');
    if (vehicleObjects.length > 1) {
      contextTags.push('traffic', 'multiple-vehicles');
    }
  }
  
  if (techObjects.length > 0) {
    contextTags.push('technology-scene', 'digital');
    if (techObjects.length > 2) {
      contextTags.push('tech-setup', 'workspace');
    }
  }
  
  if (foodObjects.length > 0) {
    contextTags.push('food-scene', 'dining');
    if (foodObjects.length > 2) {
      contextTags.push('meal', 'restaurant');
    }
  }
  
  // Indoor/outdoor detection
  const outdoorIndicators = ['car', 'truck', 'bus', 'traffic light', 'stop sign', 'bench'];
  const indoorIndicators = ['chair', 'couch', 'bed', 'tv', 'laptop', 'keyboard'];
  
  if (objects.some(obj => outdoorIndicators.some(indicator => obj.includes(indicator)))) {
    contextTags.push('outdoor', 'street-scene');
  }
  
  if (objects.some(obj => indoorIndicators.some(indicator => obj.includes(indicator)))) {
    contextTags.push('indoor', 'interior');
  }
  
  // Activity detection
  if (objects.includes('sports ball') || objects.includes('tennis racket')) {
    contextTags.push('sports', 'recreation', 'activity');
  }
  
  if (objects.includes('book') || text.toLowerCase().includes('read')) {
    contextTags.push('reading', 'education', 'learning');
  }
  
  return contextTags;
}