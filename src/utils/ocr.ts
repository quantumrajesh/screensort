import { createWorker } from 'tesseract.js';

let worker: Tesseract.Worker | null = null;

export async function initializeOCR() {
  if (!worker) {
    try {
      worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('Failed to initialize text extraction');
    }
  }
  return worker;
}

export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    // Validate file
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      throw new Error('Invalid image file');
    }

    // Check file size (limit to 5MB for OCR)
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('Image too large for text extraction (max 5MB)');
    }

    const ocrWorker = await initializeOCR();
    
    // Create image URL for processing
    const imageUrl = URL.createObjectURL(imageFile);
    
    try {
      const { data: { text } } = await ocrWorker.recognize(imageUrl);
      return text.trim() || 'No text found in image';
    } finally {
      // Clean up the object URL
      URL.revokeObjectURL(imageUrl);
    }
  } catch (error) {
    console.error('OCR Error:', error);
    
    if (error instanceof Error) {
      throw new Error(`Text extraction failed: ${error.message}`);
    } else {
      throw new Error('Failed to extract text from image');
    }
  }
}

export async function terminateOCR() {
  if (worker) {
    try {
      await worker.terminate();
      worker = null;
    } catch (error) {
      console.error('Error terminating OCR worker:', error);
    }
  }
}