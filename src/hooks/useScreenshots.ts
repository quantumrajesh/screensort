import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';

type Screenshot = Database['public']['Tables']['screenshots']['Row'];

export function useScreenshots() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScreenshots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScreenshots(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addScreenshot = async (screenshot: Omit<Screenshot, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('screenshots')
        .insert([screenshot])
        .select()
        .single();

      if (error) throw error;
      setScreenshots(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add screenshot');
      throw err;
    }
  };

  const updateScreenshot = async (id: string, updates: Partial<Screenshot>) => {
    try {
      const { data, error } = await supabase
        .from('screenshots')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setScreenshots(prev => prev.map(s => s.id === id ? data : s));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update screenshot');
      throw err;
    }
  };

  const deleteScreenshot = async (id: string, fileUrl: string) => {
    try {
      // Extract the file path from the URL for deletion
      const urlParts = fileUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // Get user_id/filename format
      
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('screenshots')
          .remove([fileName]);
        
        if (storageError) {
          console.warn('Storage deletion error:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('screenshots')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setScreenshots(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete screenshot');
      throw err;
    }
  };

  // Enhanced search with better precision for multi-word queries and marine vehicles
  const searchScreenshots = async (query: string) => {
    try {
      setLoading(true);
      
      const searchTerms = query.toLowerCase().trim().split(/\s+/);
      
      if (searchTerms.length === 0) {
        return [];
      }
      
      console.log('🔍 Searching for terms:', searchTerms);
      
      // Get all screenshots first, then filter in JavaScript for precise matching
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data) return [];
      
      // Enhanced search logic with marine vehicle support
      const results = data.map(screenshot => {
        let score = 0;
        const combinedQuery = searchTerms.join(' ');
        
        console.log(`🔍 Analyzing screenshot: ${screenshot.file_name}`);
        console.log(`📋 Tags: ${screenshot.tags?.slice(0, 10).join(', ')}...`);
        console.log(`🎯 Objects: ${screenshot.detected_objects?.slice(0, 10).join(', ')}...`);
        
        // **HIGHEST PRIORITY: Marine vehicle specific searches**
        const marineTerms = ['cruise', 'ship', 'boat', 'vessel', 'ocean', 'sea', 'marine'];
        const hasMarineQuery = searchTerms.some(term => marineTerms.includes(term));
        const hasMarineContent = screenshot.tags?.some(tag => marineTerms.some(marine => tag.includes(marine))) ||
                                screenshot.detected_objects?.some(obj => marineTerms.some(marine => obj.includes(marine)));
        
        if (hasMarineQuery && hasMarineContent) {
          score += 2000; // Very high priority for marine matches
          console.log(`🚢 MARINE MATCH FOUND! Query: ${combinedQuery}, Score: +2000`);
        }
        
        // **VERY HIGH PRIORITY: Exact combination in tags**
        if (screenshot.tags?.some(tag => tag.toLowerCase() === combinedQuery)) {
          score += 1500;
          console.log(`🎯 Exact tag match: "${combinedQuery}", Score: +1500`);
        }
        
        // **HIGH PRIORITY: Exact combination in objects**
        if (screenshot.detected_objects?.some(obj => obj.toLowerCase() === combinedQuery)) {
          score += 1200;
          console.log(`🎯 Exact object match: "${combinedQuery}", Score: +1200`);
        }
        
        // **HIGH PRIORITY: Exact combination in text**
        if (screenshot.extracted_text?.toLowerCase().includes(combinedQuery)) {
          score += 1000;
          console.log(`📝 Text match: "${combinedQuery}", Score: +1000`);
        }
        
        // **MEDIUM-HIGH PRIORITY: Individual term matches with enhanced scoring**
        searchTerms.forEach(term => {
          // Enhanced marine term matching
          if (marineTerms.includes(term)) {
            if (screenshot.tags?.some(tag => tag.toLowerCase().includes(term))) {
              score += 500;
              console.log(`🚢 Marine tag match: "${term}", Score: +500`);
            }
            if (screenshot.detected_objects?.some(obj => obj.toLowerCase().includes(term))) {
              score += 400;
              console.log(`🚢 Marine object match: "${term}", Score: +400`);
            }
          }
          
          // Regular term matching
          if (screenshot.tags?.some(tag => tag.toLowerCase().includes(term))) {
            score += 100;
            console.log(`🏷️ Tag match: "${term}", Score: +100`);
          }
          if (screenshot.detected_objects?.some(obj => obj.toLowerCase().includes(term))) {
            score += 80;
            console.log(`🎯 Object match: "${term}", Score: +80`);
          }
          if (screenshot.dominant_colors?.some(color => color.toLowerCase().includes(term))) {
            score += 60;
            console.log(`🎨 Color match: "${term}", Score: +60`);
          }
          if (screenshot.extracted_text?.toLowerCase().includes(term)) {
            score += 40;
            console.log(`📝 Text partial match: "${term}", Score: +40`);
          }
        });
        
        // **ENHANCED: Multi-word combination scoring**
        if (searchTerms.length > 1) {
          // Check for related combinations (e.g., "cruise ship", "red car")
          const firstTerm = searchTerms[0];
          const secondTerm = searchTerms[1];
          
          // Marine combinations
          if ((firstTerm === 'cruise' && secondTerm === 'ship') || 
              (firstTerm === 'ship' && secondTerm === 'cruise')) {
            if (screenshot.tags?.some(tag => tag.includes('cruise')) && 
                screenshot.tags?.some(tag => tag.includes('ship'))) {
              score += 800;
              console.log(`🚢 Cruise ship combination match, Score: +800`);
            }
          }
          
          // Color + object combinations
          const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'purple', 'pink'];
          const isColorCombo = colors.includes(firstTerm) || colors.includes(secondTerm);
          
          if (isColorCombo) {
            const hasColor = screenshot.dominant_colors?.some(color => 
              searchTerms.some(term => color.toLowerCase().includes(term))
            );
            const hasObject = screenshot.detected_objects?.some(obj => 
              searchTerms.some(term => obj.toLowerCase().includes(term))
            ) || screenshot.tags?.some(tag => 
              searchTerms.some(term => tag.toLowerCase().includes(term))
            );
            
            if (hasColor && hasObject) {
              score += 300;
              console.log(`🎨 Color + object combination match, Score: +300`);
            }
          }
        }
        
        console.log(`📊 Final score for ${screenshot.file_name}: ${score}`);
        return { ...screenshot, searchScore: score };
      });
      
      // Filter and sort results
      const filteredResults = results
        .filter(r => r.searchScore >= 30) // Lower threshold to catch more marine matches
        .sort((a, b) => b.searchScore - a.searchScore);
      
      console.log(`✅ Search complete. Found ${filteredResults.length} results for "${query}"`);
      console.log('🏆 Top results:', filteredResults.slice(0, 3).map(r => ({
        name: r.file_name,
        score: r.searchScore,
        topTags: r.tags?.slice(0, 5)
      })));
      
      return filteredResults;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchByTags = async (tags: string[]) => {
    try {
      setLoading(true);
      console.log('🏷️ Searching by tags:', tags);
      
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .overlaps('tags', tags)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ Tag search found ${data?.length || 0} results`);
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tag search failed');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchByObjects = async (objects: string[]) => {
    try {
      setLoading(true);
      console.log('🎯 Searching by objects:', objects);
      
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .overlaps('detected_objects', objects)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ Object search found ${data?.length || 0} results`);
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Object search failed');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchByColors = async (colors: string[]) => {
    try {
      setLoading(true);
      console.log('🎨 Searching by colors:', colors);
      
      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .overlaps('dominant_colors', colors)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`✅ Color search found ${data?.length || 0} results`);
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Color search failed');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenshots();
  }, []);

  return {
    screenshots,
    loading,
    error,
    fetchScreenshots,
    addScreenshot,
    updateScreenshot,
    deleteScreenshot,
    searchScreenshots,
    searchByTags,
    searchByObjects,
    searchByColors,
  };
}