import React from 'react';
import { Award, User, Calendar, MapPin, Briefcase, Target, BookOpen, Globe, Award as CertIcon, Users, Zap } from 'lucide-react';
import SEO from '../components/SEO';

const About: React.FC = () => {
  // Add schema.org data
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Cengiz YILMAZ',
    jobTitle: 'Microsoft MVP & Microsoft Certified Trainer',
    url: 'https://message.cengizyilmaz.net',
    sameAs: [
      'https://linkedin.com/in/cengizyilmazz',
      'https://cengizyilmaz.net'
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'Microsoft'
    },
    award: [
      'Microsoft MVP (2020-2024)',
      'Microsoft Certified Trainer (2018-2024)'
    ],
    knowsAbout: [
      'Microsoft Exchange Server',
      'Exchange Online',
      'Microsoft 365',
      'Active Directory',
      'PowerShell'
    ],
    description: 'Microsoft MVP and Microsoft Certified Trainer with expertise in Microsoft 365, Exchange, and PowerShell'
  };

  return (
    <>
      <SEO 
        title="About"
        description="Cengiz YILMAZ - Microsoft MVP and Microsoft Certified Trainer with expertise in Microsoft 365, Exchange, and PowerShell"
        keywords={['Cengiz YILMAZ', 'Microsoft MVP', 'Microsoft Certified Trainer', 'MCT', 'Microsoft 365', 'Exchange', 'PowerShell']}
      />
      <script type="application/ld+json">
        {JSON.stringify(personSchema)}
      </script>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 text-center">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                CY
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Cengiz YILMAZ</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Hello, I'm Cengiz YILMAZ</p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">
                <Award className="h-5 w-5" />
                Microsoft MVP
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                <CertIcon className="h-5 w-5" />
                Microsoft Certified Trainer
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg">
                <Calendar className="h-5 w-5" />
                In IT industry since 2015
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg">
                <MapPin className="h-5 w-5" />
                Turkey
              </span>
            </div>
          </div>

          {/* Introduction */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              I have been actively working in the IT industry since 2015 and dealing with Microsoft technologies. 
              I have Microsoft MVP (Most Valuable Professional) and Microsoft Certified Trainer (MCT) titles.
            </p>
          </div>

          {/* Professional Career */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              My Professional Career
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Areas of Expertise</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Microsoft Exchange Server & Exchange Online
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Extensive experience in designing, optimizing and managing mail infrastructures.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Microsoft 365
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Expert level knowledge in integration and configuration of productivity tools.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Active Directory
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Installation and management of reliable user and resource management systems.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  PowerShell
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Powerful script writing and system management for automation processes.
                </p>
              </div>
            </div>
          </div>

          {/* Certifications & Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Certifications & Achievements
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-blue-50/50 dark:bg-blue-900/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Microsoft MVP</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">2020-2024</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Most Valuable Professional</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Prestigious title recognized for community contribution and technical expertise in Microsoft technologies.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border border-green-200 dark:border-green-800 rounded-xl p-6 bg-green-50/50 dark:bg-green-900/20">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <CertIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Microsoft Certified Trainer</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">2018-2024</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">MCT</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Certified trainer title authorized to deliver Microsoft official curriculum.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My Goal */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              My Goal
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Sharing my technological knowledge and experience to guide organizations and individuals in their digital transformation processes. 
              As someone with Microsoft MVP and Microsoft Certified Trainer (MCT) titles, I continuously follow developments in the technology world 
              and integrate innovations into business processes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Digital Transformation Guidance
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Providing strategic consultancy to organizations and individuals in their digital transformation processes.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
                  <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Technology Integration
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Integrating innovations in the technology world into business processes and increasing efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Links */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Connect With Me
            </h2>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://cengizyilmaz.net"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Globe className="h-5 w-5" />
                Visit My Website
              </a>
              <a
                href="https://linkedin.com/in/cengizyilmazz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Users className="h-5 w-5" />
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;