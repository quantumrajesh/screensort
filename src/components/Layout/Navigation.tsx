import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Navigation() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Text */}
          <div className="flex items-center space-x-3">
            <img 
              src="/Green and Brown Minimalist Studio Logo Design Template.jpg" 
              alt="ScreenSort Logo" 
              className="h-10 w-10 object-contain rounded-lg"
            />
            <span className="text-xl font-semibold text-gray-900">ScreenSort</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-colors duration-200 ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Photos</span>
            </Link>
            <Link
              to="/search"
              className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-colors duration-200 ${
                isActive('/search') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Search</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="font-medium">{user?.email?.split('@')[0]}</span>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}