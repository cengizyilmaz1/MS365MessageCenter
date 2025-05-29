import React from 'react';
import { Github, Mail, Linkedin, Twitter, Award, Shield, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 shadow-inner transition-colors duration-300" role="contentinfo">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Microsoft 365 Message Center Viewer
            </p>
            <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
              <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                Cengiz YILMAZ - Microsoft MVP
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-6" role="navigation" aria-label="Footer links">
            <div className="flex gap-4">
              <Link 
                to="/terms"
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
              >
                <FileText className="h-3 w-3" />
                Terms
              </Link>
              <Link 
                to="/privacy"
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                Privacy
              </Link>
            </div>
            
            <div className="border-l border-gray-300 dark:border-gray-700 pl-6 flex space-x-4">
              <a 
                href="https://github.com/cengizyilmaz1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                aria-label="Visit Cengiz Yılmaz's GitHub profile"
                title="GitHub"
              >
                <Github className="h-5 w-5" aria-hidden="true" />
              </a>
              <a 
                href="https://linkedin.com/in/cengizyilmazz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                aria-label="Visit Cengiz Yılmaz's LinkedIn profile"
                title="LinkedIn"
              >
                <Linkedin className="h-5 w-5" aria-hidden="true" />
              </a>
              <a 
                href="https://twitter.com/cengizyilmaz_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                aria-label="Visit Cengiz Yılmaz's Twitter profile"
                title="Twitter"
              >
                <Twitter className="h-5 w-5" aria-hidden="true" />
              </a>
              <a 
                href="mailto:info@cengizyilmaz.net" 
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                aria-label="Send email to Cengiz Yılmaz"
                title="Email"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </nav>
        </div>
        
        {/* SEO Footer Links */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-500">
            Track Microsoft 365 service updates, announcements, and changes in a modern interface
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;