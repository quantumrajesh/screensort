import React from 'react';
import { ExternalLink, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Built with Bolt.new Badge */}
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-base font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Zap className="w-5 h-5" />
            <span>Made with Bolt.new</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          
          {/* Additional Footer Content */}
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 ScreenSort. Built with ❤️ using AI-powered development on Bolt.new</p>
            <p className="mt-1">
              Powered by{' '}
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                Supabase
              </a>
              {' '}and{' '}
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                OpenRouter
              </a>
              {' '}via{' '}
              <a href="https://bolt.new" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium">
                Bolt.new
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}