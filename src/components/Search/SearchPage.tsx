import React, { useState, useEffect } from 'react';
import { Search, Loader2, FileX, Filter, X, ZoomIn, ZoomOut, Info } from 'lucide-react';
import { useScreenshots } from '../../hooks/useScreenshots';
import { ScreenshotGrid } from '../Dashboard/ScreenshotGrid';
import { FloatingUpload } from '../Dashboard/FloatingUpload';
import { Database } from '../../lib/supabase';

type Screenshot = Database['public']['Tables']['screenshots']['Row'];

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Screenshot[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<'all' | 'text' | 'objects' | 'colors'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  const { searchScreenshots, searchByTags, searchByObjects, searchByColors } = useScreenshots();

  const handleZoomIn = () => {
    if (gridSize === 'small') setGridSize('medium');
    else if (gridSize === 'medium') setGridSize('large');
  };

  const handleZoomOut = () => {
    if (gridSize === 'large') setGridSize('medium');
    else if (gridSize === 'medium') setGridSize('small');
  };

  const handleSearch = async (searchQuery: string, mode: string = searchMode) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setSearching(true);
    setHasSearched(true);
    
    try {
      let results: Screenshot[] = [];
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
      
      console.log(`🔍 Starting search for: "${searchQuery}" in mode: ${mode}`);
      
      switch (mode) {
        case 'objects':
          console.log('🎯 Searching objects for:', searchTerms);
          results = await searchByObjects(searchTerms);
          break;
        case 'colors':
          console.log('🎨 Searching colors for:', searchTerms);
          results = await searchByColors(searchTerms);
          break;
        case 'text':
          console.log('📝 Searching text for:', searchQuery);
          results = await searchScreenshots(searchQuery);
          results = results.filter(r => 
            r.extracted_text && r.extracted_text.toLowerCase().includes(searchQuery.toLowerCase())
          );
          break;
        default:
          console.log('🔍 Comprehensive search for:', searchQuery);
          results = await searchScreenshots(searchQuery);
          break;
      }
      
      console.log(`✅ Search completed. Found ${results.length} results`);
      setSearchResults(results);
    } catch (error) {
      console.error('❌ Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, searchMode]);

  // Enhanced quick searches with marine terms
  const quickSearches = [
    'cruise ship', 'boat', 'ocean', 'ship', 'vessel', 'marine',
    'red car', 'blue dress', 'yellow car', 'green jacket', 
    'black shoes', 'white top', 'pink bag', 'purple hat'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your photos... (try 'cruise ship', 'boat', 'ocean')"
                className="w-full pl-10 pr-12 py-3 bg-gray-100 border-0 rounded-full text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
              )}
            </div>
            
            {/* Zoom Controls for Search Results */}
            {hasSearched && searchResults.length > 0 && (
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
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-full transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Debug Info Toggle */}
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className={`p-3 rounded-full transition-colors ${
                showDebugInfo ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Toggle debug information"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Search in:</span>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'Everything' },
                  { key: 'text', label: 'Text' },
                  { key: 'objects', label: 'Objects' },
                  { key: 'colors', label: 'Colors' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSearchMode(key as any);
                      if (query.trim()) handleSearch(query, key);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      searchMode === key
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced quick searches with marine terms */}
          {!hasSearched && !query && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Try searching for:</p>
              <div className="flex flex-wrap gap-2">
                {quickSearches.map((searchTerm) => (
                  <button
                    key={searchTerm}
                    onClick={() => {
                      setQuery(searchTerm);
                      handleSearch(searchTerm);
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      ['cruise ship', 'boat', 'ocean', 'ship', 'vessel', 'marine'].includes(searchTerm)
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {searchTerm}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Debug Information */}
          {showDebugInfo && hasSearched && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-yellow-800">Debug Information</h4>
                <button
                  onClick={() => setShowDebugInfo(false)}
                  className="p-1 text-yellow-600 hover:text-yellow-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-yellow-700 space-y-1">
                <p><strong>Search Query:</strong> "{query}"</p>
                <p><strong>Search Mode:</strong> {searchMode}</p>
                <p><strong>Results Found:</strong> {searchResults.length}</p>
                <p><strong>Search Terms:</strong> {query.toLowerCase().split(' ').join(', ')}</p>
                {searchResults.length > 0 && (
                  <div className="mt-2">
                    <p><strong>Top Result Tags:</strong></p>
                    <p className="text-xs bg-yellow-100 p-2 rounded mt-1">
                      {searchResults[0]?.tags?.slice(0, 15).join(', ') || 'No tags'}
                    </p>
                    <p><strong>Top Result Objects:</strong></p>
                    <p className="text-xs bg-yellow-100 p-2 rounded mt-1">
                      {searchResults[0]?.detected_objects?.slice(0, 10).join(', ') || 'No objects'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Results */}
        {searching && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-500 mx-auto animate-spin mb-4" />
              <p className="text-gray-500">Searching your photos...</p>
              <p className="text-xs text-gray-400 mt-1">Looking for: "{query}"</p>
            </div>
          </div>
        )}

        {!searching && hasSearched && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-normal text-gray-900">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
                  </>
                ) : (
                  `No results for "${query}"`
                )}
              </h2>
              {searchResults.length > 0 && searchMode !== 'all' && (
                <p className="text-sm text-gray-500 mt-1">
                  Searching in: {searchMode}
                </p>
              )}
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                  <FileX className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-normal text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">
                  Try different keywords or check your spelling
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">For cruise ships, try:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['cruise ship', 'boat', 'ship', 'vessel', 'ocean', 'marine'].map((searchTerm) => (
                        <button
                          key={searchTerm}
                          onClick={() => {
                            setQuery(searchTerm);
                            handleSearch(searchTerm);
                          }}
                          className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200 transition-colors"
                        >
                          Try "{searchTerm}"
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Other suggestions:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {quickSearches.slice(6, 10).map((searchTerm) => (
                        <button
                          key={searchTerm}
                          onClick={() => {
                            setQuery(searchTerm);
                            handleSearch(searchTerm);
                          }}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          Try "{searchTerm}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ScreenshotGrid screenshots={searchResults} gridSize={gridSize} />
            )}
          </>
        )}

        {!hasSearched && !searching && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Search className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-normal text-gray-900 mb-2">Search your photos</h3>
            <p className="text-gray-500 mb-8">
              Find photos by objects, colors, text, or any combination
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Text Recognition</h4>
                <p className="text-sm text-gray-500">Find text within your photos</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 bg-green-600 rounded-sm"></div>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Object Detection</h4>
                <p className="text-sm text-gray-500">Search for ships, cars, animals, and more</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-purple-600 rounded-full"></div>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Color Analysis</h4>
                <p className="text-sm text-gray-500">Find photos by dominant colors</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Upload Button */}
      <FloatingUpload />
    </div>
  );
}