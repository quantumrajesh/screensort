import React, { useState } from 'react';
import { Trash2, Download, X, Info, Calendar, FileText, Tag, Palette, Zap } from 'lucide-react';
import { useScreenshots } from '../../hooks/useScreenshots';
import { Database } from '../../lib/supabase';

type Screenshot = Database['public']['Tables']['screenshots']['Row'];

interface ScreenshotGridProps {
  screenshots: Screenshot[];
  gridSize?: 'small' | 'medium' | 'large';
}

export function ScreenshotGrid({ screenshots, gridSize = 'medium' }: ScreenshotGridProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const { deleteScreenshot } = useScreenshots();

  const handleDelete = async (screenshot: Screenshot) => {
    if (confirm('Move to trash?')) {
      await deleteScreenshot(screenshot.id, screenshot.file_url);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Dynamic grid classes based on zoom level
  const getGridClasses = () => {
    switch (gridSize) {
      case 'small':
        return 'columns-2 xs:columns-3 sm:columns-4 md:columns-5 lg:columns-6 xl:columns-7 2xl:columns-8';
      case 'large':
        return 'columns-1 xs:columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-3 2xl:columns-4';
      default: // medium
        return 'columns-1 xs:columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6';
    }
  };

  // Dynamic gap classes based on zoom level
  const getGapClasses = () => {
    switch (gridSize) {
      case 'small':
        return 'gap-1 sm:gap-2 space-y-1 sm:space-y-2';
      case 'large':
        return 'gap-4 sm:gap-6 space-y-4 sm:space-y-6';
      default: // medium
        return 'gap-2 sm:gap-4 space-y-2 sm:space-y-4';
    }
  };

  if (screenshots.length === 0) {
    return (
      <div className="text-center py-12 sm:py-20">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4 sm:mb-6">
          <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-normal text-gray-900 mb-2">No photos yet</h3>
        <p className="text-sm sm:text-base text-gray-500">Add photos to see them here</p>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic Responsive Masonry Grid with Zoom Support */}
      <div className={`${getGridClasses()} ${getGapClasses()}`}>
        {screenshots.map((screenshot) => (
          <div
            key={screenshot.id}
            className="break-inside-avoid bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => setSelectedScreenshot(screenshot)}
          >
            <div className="relative">
              <img
                src={screenshot.file_url}
                alt={screenshot.file_name}
                className="w-full h-auto object-cover"
                loading="lazy"
                sizes={
                  gridSize === 'small' 
                    ? "(max-width: 480px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16vw, 12vw"
                    : gridSize === 'large'
                    ? "(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    : "(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                }
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
              
              {/* Hover overlay with actions - responsive to grid size */}
              <div className={`absolute ${gridSize === 'small' ? 'top-0.5 right-0.5' : 'top-1 right-1 sm:top-2 sm:right-2'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(screenshot);
                  }}
                  className={`${gridSize === 'small' ? 'p-0.5' : 'p-1 sm:p-1.5'} bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full text-gray-700 hover:text-red-600 transition-colors`}
                >
                  <Trash2 className={`${gridSize === 'small' ? 'w-2.5 h-2.5' : 'w-3 h-3 sm:w-4 sm:h-4'}`} />
                </button>
              </div>

              {/* Bottom info overlay - responsive text and spacing */}
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent ${gridSize === 'small' ? 'p-1' : 'p-2 sm:p-3'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                <p className={`text-white font-medium truncate ${gridSize === 'small' ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                  {screenshot.file_name}
                </p>
                {gridSize !== 'small' && (
                  <p className="text-white/80 text-xs">
                    {formatDate(screenshot.created_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Responsive Full Screen Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
            {/* Close button - responsive positioning */}
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Info toggle - responsive positioning */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="absolute top-2 right-12 sm:top-4 sm:right-16 z-10 p-1.5 sm:p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-colors"
            >
              <Info className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Download button - responsive positioning */}
            <a
              href={selectedScreenshot.file_url}
              download={selectedScreenshot.file_name}
              className="absolute top-2 right-24 sm:top-4 sm:right-28 z-10 p-1.5 sm:p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>

            {/* Main image - responsive sizing */}
            <img
              src={selectedScreenshot.file_url}
              alt={selectedScreenshot.file_name}
              className="max-w-full max-h-full object-contain"
            />

            {/* Enhanced Responsive Info panel */}
            {showInfo && (
              <div className="absolute right-2 top-16 bottom-2 w-72 sm:w-80 sm:right-4 sm:top-20 sm:bottom-4 bg-white rounded-lg shadow-2xl overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="p-3 sm:p-4 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                      {selectedScreenshot.file_name}
                    </h3>
                    <div className="flex items-center space-x-2 sm:space-x-4 mt-2 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatDate(selectedScreenshot.created_at)}</span>
                      </span>
                      <span>{formatFileSize(selectedScreenshot.file_size)}</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {/* Objects - responsive tags */}
                    {selectedScreenshot.detected_objects && selectedScreenshot.detected_objects.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">Objects</h4>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedScreenshot.detected_objects.map((object, index) => (
                            <span
                              key={index}
                              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {object}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Colors - responsive tags */}
                    {selectedScreenshot.dominant_colors && selectedScreenshot.dominant_colors.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">Colors</h4>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedScreenshot.dominant_colors.map((color, index) => (
                            <span
                              key={index}
                              className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags - responsive tags */}
                    {selectedScreenshot.tags && selectedScreenshot.tags.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">Tags</h4>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedScreenshot.tags.slice(0, 10).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {selectedScreenshot.tags.length > 10 && (
                            <span className="text-xs text-gray-500">
                              +{selectedScreenshot.tags.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Text - responsive text area */}
                    {selectedScreenshot.extracted_text && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">Text</h4>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                          <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {selectedScreenshot.extracted_text}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}