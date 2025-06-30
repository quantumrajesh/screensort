// Enhanced color extraction (keeping the color analysis part)
export async function extractColorsWithAI(imageFile: File): Promise<string[]> {
  try {
    console.log('🎨 Starting AI color extraction...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageFile);
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const maxSize = 150;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          if (!imageData) throw new Error('Failed to get image data');
          
          const colors = analyzeColorsAdvanced(imageData.data);
          console.log('🎨 Extracted colors:', colors);
          
          URL.revokeObjectURL(imageUrl);
          resolve(colors);
        } catch (error) {
          URL.revokeObjectURL(imageUrl);
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('❌ Color extraction error:', error);
    return ['unknown'];
  }
}

// Advanced color analysis
function analyzeColorsAdvanced(data: Uint8ClampedArray): string[] {
  const colorCounts: { [key: string]: number } = {};
  const totalPixels = data.length / 4;
  
  for (let i = 0; i < data.length; i += 32) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];
    
    if (alpha < 128) continue;
    
    const colorName = getAdvancedColorName(r, g, b);
    colorCounts[colorName] = (colorCounts[colorName] || 0) + 1;
  }
  
  const threshold = totalPixels * 0.02;
  const dominantColors = Object.entries(colorCounts)
    .filter(([_, count]) => count > threshold)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 8)
    .map(([color, _]) => color);
  
  return dominantColors.length > 0 ? dominantColors : ['neutral'];
}

// Advanced color naming
function getAdvancedColorName(r: number, g: number, b: number): string {
  const [h, s, l] = rgbToHsl(r, g, b);
  
  if (s < 0.08) {
    if (l < 0.08) return 'black';
    if (l < 0.2) return 'very-dark-gray';
    if (l < 0.35) return 'dark-gray';
    if (l < 0.5) return 'medium-gray';
    if (l < 0.65) return 'light-gray';
    if (l < 0.8) return 'very-light-gray';
    if (l < 0.92) return 'off-white';
    return 'white';
  }
  
  if (s < 0.25) {
    if (l < 0.25) return 'dark-muted';
    if (l > 0.75) return 'light-muted';
    return 'muted';
  }
  
  const hue = Math.round(h);
  
  if (hue >= 345 || hue < 15) {
    if (l > 0.75) return 'light-pink';
    if (l > 0.6) return 'pink';
    if (l > 0.45) return 'light-red';
    if (l < 0.25) return 'dark-red';
    if (s > 0.8) return 'bright-red';
    return 'red';
  }
  
  if (hue < 25) return 'red-orange';
  if (hue < 40) return 'orange';
  if (hue < 50) return 'yellow-orange';
  if (hue < 70) return 'yellow';
  if (hue < 85) return 'yellow-green';
  if (hue < 150) return 'green';
  if (hue < 190) return 'cyan';
  if (hue < 250) return 'blue';
  if (hue < 290) return 'purple';
  if (hue < 330) return 'magenta';
  return 'pink';
}

// RGB to HSL conversion
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return [h * 360, s, l];
}