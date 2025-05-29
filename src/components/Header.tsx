import React from 'react';
import { Sun, Moon, BellRing, Menu, X } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300" role="banner">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BellRing className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <Link to="/" className="text-xl font-semibold text-gray-800 dark:text-white" aria-label="Microsoft 365 Message Center - Home">
            Message Center
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4" role="navigation" aria-label="Main navigation">
          <Link 
            to="/" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium" 
            aria-label="Dashboard page"
          >
            Dashboard
          </Link>
          <Link 
            to="/about" 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium" 
            aria-label="About page"
          >
            About
          </Link>
          
          <div className="flex items-center gap-4 border-l border-gray-300 dark:border-gray-700 pl-4">
            <a 
              href="https://cengizyilmaz.net" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
              aria-label="Visit cengizyilmaz.net"
            >
              cengizyilmaz.net
            </a>
            <a 
              href="https://cengizyilmaz.net/mstenant-find" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              aria-label="MS Tenant Find Tool"
            >
              MS Tenant Find
            </a>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-4"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            role="switch"
            aria-checked={isDarkMode}
          >
            {isDarkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden bg-white dark:bg-gray-900 shadow-md" role="navigation" aria-label="Mobile navigation">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-gray-600 dark:text-gray-300 py-2 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Dashboard page"
            >
              Dashboard
            </Link>
            <Link 
              to="/about" 
              className="text-gray-600 dark:text-gray-300 py-2 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="About page"
            >
              About
            </Link>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <a 
                href="https://cengizyilmaz.net" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-gray-600 dark:text-gray-300 py-2 hover:text-blue-600 dark:hover:text-blue-400"
                aria-label="Visit cengizyilmaz.net"
              >
                cengizyilmaz.net
              </a>
              <a 
                href="https://cengizyilmaz.net/mstenant-find" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-gray-600 dark:text-gray-300 py-2 hover:text-blue-600 dark:hover:text-blue-400"
                aria-label="MS Tenant Find Tool"
              >
                MS Tenant Find
              </a>
            </div>
            
            <div className="flex items-center mt-4">
              <button 
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 py-2"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                role="switch"
                aria-checked={isDarkMode}
              >
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                {isDarkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;