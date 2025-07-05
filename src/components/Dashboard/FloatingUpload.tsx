import React, { useRef, useState } from 'react';
import { Plus, Upload, Loader2, X, CheckCircle, Sparkles, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { analyzeImage } from '../../utils/imageAnalysis';
import { useAuth } from '../../hooks/useAuth';
import { useScreenshots } from '../../hooks/useScreenshots';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'analyzing' | 'ai-analyzing' | 'complete' | 'error';
  step: string;
}

export function FloatingUpload() {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const [showProgress, setShowProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { addScreenshot } = useScreenshots();

  // Supported image MIME types for Supabase storage
  const supportedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
  ];

  const handleFiles = async (files: FileList) => {
    if (!user) return;

    // Filter valid image files and check for supported formats
    const imageFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        return false;
      }
      if (!supportedImageTypes.includes(file.type)) {
        alert(`Image format ${file.type} is not supported for file "${file.name}". Please use JPEG, PNG, GIF, WebP, BMP, or TIFF formats.`);
        return false;
      }
      return true;
    });
    
    if (imageFiles.length === 0) {
      alert('Please select valid image files in supported formats (JPEG, PNG, GIF, WebP, BMP, TIFF)');
      return;
    }

    // Initialize upload queue
    const initialQueue: UploadProgress[] = imageFiles.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading',
      step: 'Preparing...'
    }));

    setUploadQueue(initialQueue);
    setUploading(true);
    setShowProgress(true);

    // Process files one by one
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      
      try {
        // Update current file status
        setUploadQueue(prev => prev.map((item, index) => 
          index === i ? { ...item, step: 'Uploading...', progress: 10 } : item
        ));

        // Upload to Supabase Storage with better error handling
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        
        // Check if storage bucket exists and is accessible
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL with error handling
        const { data: { publicUrl } } = supabase.storage
          .from('screenshots')
          .getPublicUrl(fileName);

        if (!publicUrl) {
          throw new Error('Failed to get public URL for uploaded file');
        }

        setUploadQueue(prev => prev.map((item, index) => 
          index === i ? { ...item, step: 'AI Analysis with Gemini...', progress: 40, status: 'ai-analyzing' } : item
        ));

        // Enhanced AI analysis with better error handling
        let analysisResult;
        try {
          analysisResult = await analyzeImage(file);
        } catch (analysisError) {
          console.warn('AI analysis failed, using fallback:', analysisError);
          // Fallback analysis if AI fails
          analysisResult = {
            extractedText: '',
            detectedObjects: [],
            dominantColors: [],
            tags: [file.name.split('.')[0]] // Use filename as fallback tag
          };
        }

        setUploadQueue(prev => prev.map((item, index) => 
          index === i ? { ...item, step: 'Saving...', progress: 80 } : item
        ));

        // Save to database with enhanced analysis
        await addScreenshot({
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          extracted_text: analysisResult.extractedText || '',
          detected_objects: analysisResult.detectedObjects || [],
          dominant_colors: analysisResult.dominantColors || [],
          tags: analysisResult.tags || [],
          file_size: file.size,
        });

        // Mark as complete
        setUploadQueue(prev => prev.map((item, index) => 
          index === i ? { ...item, step: 'Complete!', progress: 100, status: 'complete' } : item
        ));

      } catch (error) {
        console.error('Upload error:', error);
        let errorMessage = 'Unknown error';
        
        if (error instanceof Error) {
          errorMessage = error.message;
          
          // Provide more specific error messages
          if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error - check your internet connection';
          } else if (error.message.includes('storage')) {
            errorMessage = 'Storage error - please try again';
          } else if (error.message.includes('auth')) {
            errorMessage = 'Authentication error - please log in again';
          }
        }
        
        setUploadQueue(prev => prev.map((item, index) => 
          index === i ? { 
            ...item, 
            step: `Error: ${errorMessage}`, 
            progress: 0, 
            status: 'error' 
          } : item
        ));
      }
    }

    // Clean up after all uploads
    setTimeout(() => {
      setUploading(false);
      setShowProgress(false);
      setUploadQueue([]);
    }, 2000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const completedCount = uploadQueue.filter(item => item.status === 'complete').length;
  const totalCount = uploadQueue.length;

  return (
    <>
      {/* Drag overlay */}
      {dragActive && (
        <div 
          className="fixed inset-0 bg-blue-500 bg-opacity-20 backdrop-blur-sm z-40 flex items-center justify-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-dashed border-blue-400">
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">Drop photos here</p>
              <p className="text-sm text-gray-500">AI-powered analysis with Gemini 2.0</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced progress overlay with AI indicators */}
      {showProgress && uploadQueue.length > 0 && (
        <div className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 min-w-[320px] max-w-[400px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  AI Analysis ({completedCount}/{totalCount})
                </p>
                {totalCount > 1 && (
                  <p className="text-xs text-gray-500">
                    {completedCount === totalCount ? 'All photos analyzed!' : 'Processing with Gemini...'}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowProgress(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Overall progress bar */}
          {totalCount > 1 && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Individual file progress with AI status */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {uploadQueue.map((upload, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700 truncate flex-1 mr-2">
                    {upload.fileName}
                  </p>
                  <div className="flex items-center space-x-1">
                    {upload.status === 'ai-analyzing' && (
                      <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" />
                    )}
                    {upload.status === 'complete' && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                    {upload.status === 'error' && (
                      <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 flex items-center space-x-1">
                  {upload.status === 'ai-analyzing' && (
                    <Sparkles className="w-3 h-3 text-purple-500" />
                  )}
                  <span>{upload.step}</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      upload.status === 'error' ? 'bg-red-500' : 
                      upload.status === 'complete' ? 'bg-green-500' : 
                      upload.status === 'ai-analyzing' ? 'bg-gradient-to-r from-purple-500 to-blue-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced floating upload button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center relative ${
            uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl active:scale-95 group'
          }`}
          title="Add photos with AI analysis - Built with Bolt.new"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <>
              <Plus className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 flex items-center space-x-0.5">
                <Sparkles className="w-3 h-3 text-white" />
                <Zap className="w-2.5 h-2.5 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff"
          multiple
          onChange={handleFileInput}
          disabled={uploading}
        />
      </div>
    </>
  );
}