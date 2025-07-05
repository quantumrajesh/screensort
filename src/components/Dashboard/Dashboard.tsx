import React, { useState } from 'react';
import { ScreenshotGrid } from './ScreenshotGrid';
import { FloatingUpload } from './FloatingUpload';
import { Footer } from '../Layout/Footer';
import { useScreenshots } from '../../hooks/useScreenshots';
import { Loader2, RefreshCw, ZoomIn, ZoomOut, Zap } from 'lucide-react';

export function Dashboard() {
  const { screenshots, loading, error, fetchScreenshots } = useScreenshots();
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');

  const handleZoomIn = () => {
    if (gridSize === 'small') setGridSize('medium');
    else if (gridSize === 'medium') setGridSize('large');
  };

  const handleZoomOut = () => {
    if (gridSize === 'large') setGridSize('medium');
    else if (gridSize === 'medium') setGridSize('small');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchScreenshots}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-normal text-gray-900">Photos</h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-500">
                  {screenshots.length} {screenshots.length === 1 ? 'photo' : 'photos'}
                </p>
                <a
                  href="https://bolt.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  <span>Built with Bolt.new</span>
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Zoom Controls */}
              <div className="flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={handleZoomOut}
                  disabled={gridSize === 'small'}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom out (smaller thumbnails)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-1 px-2">
                  <div className={`w-2 h-2 rounded-full ${gridSize === 'small' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <div className={`w-2 h-2 rounded-full ${gridSize === 'medium' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <div className={`w-2 h-2 rounded-full ${gridSize === 'large' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                </div>
                <button
                  onClick={handleZoomIn}
                  disabled={gridSize === 'large'}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom in (larger thumbnails)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={fetchScreenshots}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Photos Grid */}
        {loading && screenshots.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading your photos...</p>
            </div>
          </div>
        ) : (
          <ScreenshotGrid screenshots={screenshots} gridSize={gridSize} />
        )}
      </div>

      {/* Floating Upload Button */}
      <FloatingUpload />
      
      {/* Footer with Bolt.new Badge */}
      <Footer />
    </div>
  );
}