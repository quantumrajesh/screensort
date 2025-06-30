// Legacy vision utilities - now using AI-powered detection
import { detectObjectsWithAI, extractColorsWithAI } from './aiVision';

// Wrapper functions for backward compatibility
export async function detectObjects(imageFile: File): Promise<string[]> {
  console.log('Using AI-powered object detection...');
  return detectObjectsWithAI(imageFile);
}

export async function extractColors(imageFile: File): Promise<string[]> {
  console.log('Using AI-powered color extraction...');
  return extractColorsWithAI(imageFile);
}

// No-op cleanup function
export function terminateVision(): void {
  console.log('Vision cleanup - no action needed');
}