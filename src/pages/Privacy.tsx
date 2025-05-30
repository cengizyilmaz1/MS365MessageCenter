import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, UserCheck, FileText, Mail } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6" />
                Information We Collect
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The Microsoft 365 Message Center Viewer collects minimal information to provide and improve our service:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>Viewing preferences (such as filters and sorting options)</li>
                <li>Messages marked as read (stored locally in your browser)</li>
                <li>Theme preference (light/dark mode)</li>
                <li>Analytics data to improve user experience (via Google Analytics)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6" />
                How We Use Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                This application solely displays Microsoft 365 Message Center data. We do not store, process, or share any user data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UserCheck className="h-6 w-6" />
                Data Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                All data transmission occurs over secure HTTPS connections. No data is stored on our servers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Third-Party Services
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                This application uses Microsoft's public APIs to fetch message data. Please refer to Microsoft's privacy policy for information about their data practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Contact Us
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-2">
                <a href="mailto:info@cengizyilmaz.net" className="text-blue-600 dark:text-blue-400 hover:underline">
                  info@cengizyilmaz.net
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Analytics and Cookies</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use Google Analytics to understand how visitors interact with our website. This helps us improve the user experience and fix issues. Google Analytics collects:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
                <li>Pages visited and time spent on each page</li>
                <li>Browser type and operating system</li>
                <li>General geographic location (country/city level)</li>
                <li>How you arrived at our site</li>
                <li>Interactions with site features (filters, search, etc.)</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300">
                This data is anonymized and aggregated. We do not collect personally identifiable information. You can opt-out of Google Analytics by using the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google Analytics Opt-out Browser Add-on</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy; 