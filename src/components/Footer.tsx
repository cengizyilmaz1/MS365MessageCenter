import React from 'react';
import { Github, Mail, Linkedin, Twitter, Award, Shield, FileText, Heart, Coffee, Sparkles, ArrowUpRight, Code2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative mt-20 overflow-hidden" role="contentinfo">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-pink-400/10 to-yellow-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="relative backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  M365 Message Center
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Your central hub for tracking Microsoft 365 updates, service changes, and important announcements with a modern, user-friendly interface.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full">
                  <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    Created by Cengiz YILMAZ - Microsoft MVP
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Quick Links
              </h4>
              <nav className="grid grid-cols-2 gap-3" role="navigation" aria-label="Footer navigation">
                <Link 
                  to="/"
                  className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Globe className="h-4 w-4" />
                  </div>
                  <span>Home</span>
                </Link>
                <Link 
                  to="/about"
                  className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span>About</span>
                </Link>
                <Link 
                  to="/privacy"
                  className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span>Privacy</span>
                </Link>
                <Link 
                  to="/terms"
                  className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                >
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span>Terms</span>
                </Link>
              </nav>
            </div>

            {/* Connect Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Connect
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Stay connected and follow for more updates
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://github.com/cengizyilmaz1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-110"
                  aria-label="GitHub"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-900 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Github className="h-5 w-5 text-gray-700 dark:text-gray-300 relative z-10 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="https://linkedin.com/in/cengizyilmazz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Linkedin className="h-5 w-5 text-gray-700 dark:text-gray-300 relative z-10 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="https://twitter.com/cengizyilmaz_" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-110"
                  aria-label="Twitter"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-sky-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Twitter className="h-5 w-5 text-gray-700 dark:text-gray-300 relative z-10 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="mailto:info@cengizyilmaz.net" 
                  className="group relative p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-110"
                  aria-label="Email"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Mail className="h-5 w-5 text-gray-700 dark:text-gray-300 relative z-10 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>&copy; {currentYear} Microsoft 365 Message Center Viewer</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:flex items-center gap-1">
                  Made with <Heart className="h-4 w-4 text-red-500 animate-pulse" /> and <Coffee className="h-4 w-4 text-amber-600" />
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                <Code2 className="h-4 w-4" />
                <span>Built for the Microsoft 365 community</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;