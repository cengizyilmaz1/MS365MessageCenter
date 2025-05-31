import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, Menu, X, MessageSquare, Home, Info, BookOpen, Search, Sparkles } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/about', label: 'About', icon: Info },
  ];

  const externalLinks = [
    { href: 'https://cengizyilmaz.net', label: 'Blog', icon: BookOpen },
    { href: 'https://cengizyilmaz.net/mstenant-find', label: 'MS Tenant Find', icon: Search },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50">
      <nav className="container mx-auto px-4 py-3 max-w-screen-2xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex items-center space-x-3 py-1">
            {/* New Modern Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                M365 Message Center
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Real-time Updates</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 mr-6">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                      isActive(item.path)
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {isActive(item.path) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"></div>
                    )}
                    <div className={`relative flex items-center gap-2 ${
                      !isActive(item.path) && 'group-hover:bg-gray-100 dark:group-hover:bg-gray-800 px-4 py-2 -mx-4 -my-2 rounded-xl'
                    }`}>
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
              
              {externalLinks.map(link => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group px-4 py-2 rounded-xl font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 px-4 py-2 -mx-4 -my-2 rounded-xl">
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:shadow-lg transition-all duration-300 group hover:scale-110"
              aria-label="Toggle theme"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 dark:from-blue-600 dark:to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors" />
                )}
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:shadow-lg transition-all duration-300 group"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col space-y-2">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
                
                {externalLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </a>
                  );
                })}
                
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-5 h-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;