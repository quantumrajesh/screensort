import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2, Plus, UploadCloud as CloudUpload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { analyzeImage } from '../../utils/imageAnalysis';
import { useAuth } from '../../hooks/useAuth';
import { useScreenshots } from '../../hooks/useScreenshots';

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
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

    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Check if the image format is supported
    if (!supportedImageTypes.includes(file.type)) {
      alert(`Image format ${file.type} is not supported. Please use JPEG, PNG, GIF, WebP, BMP, or TIFF formats.`);
      return;
    }

    setUploading(true);
    setProgress(0);
    setAnalysisStep('Preparing...');

    try {
      // Upload to Supabase Storage with user ID in path
      setProgress(20);
      setAnalysisStep('Uploading...');
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(fileName);

      setProgress(40);

      // Comprehensive image analysis
      setAnalysisStep('Analyzing with AI...');
      const analysisResult = await analyzeImage(file);
      setProgress(80);

      setAnalysisStep('Saving...');
      // Save to database with all analysis data
      await addScreenshot({
        user_id: user.id,
        file_name: file.name,
        file_url: publicUrl,
        extracted_text: analysisResult.extractedText,
        detected_objects: analysisResult.detectedObjects,
        dominant_colors: analysisResult.dominantColors,
        tags: analysisResult.tags,
        file_size: file.size,
      });

      setProgress(100);
      setAnalysisStep('Complete!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setAnalysisStep('');
      }, 1000);
    }
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : uploading
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <CloudUpload className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {analysisStep}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-base font-medium text-gray-900 mb-1">
                Add photos
              </p>
              <p className="text-sm text-gray-500 mb-3">
                Drag photos here or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                <span>Choose photos</span>
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff"
          onChange={handleFileInput}
          disabled={uploading}
        />
      </div>
    </div>
  );
}