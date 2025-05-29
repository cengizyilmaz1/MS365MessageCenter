import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Award, User, Briefcase, BookOpen, Globe, Terminal, Target } from 'lucide-react';

const expertise = [
  {
    icon: <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />, 
    title: 'Microsoft Exchange Server & Exchange Online',
    desc: 'Extensive experience in designing, optimizing and managing mail infrastructures.'
  },
  {
    icon: <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />, 
    title: 'Microsoft 365',
    desc: 'Expert level knowledge in integration and configuration of productivity tools.'
  },
  {
    icon: <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />, 
    title: 'Active Directory',
    desc: 'Installation and management of reliable user and resource management systems.'
  },
  {
    icon: <Terminal className="h-6 w-6 text-blue-600 dark:text-blue-400" />, 
    title: 'PowerShell',
    desc: 'Powerful script writing and system management for automation processes.'
  }
];

const certifications = [
  {
    icon: <Award className="h-6 w-6 text-yellow-500" />,
    title: 'Microsoft MVP',
    years: '2020-2024',
    desc: 'Most Valuable Professional — Prestigious title recognized for community contribution and technical expertise in Microsoft technologies.'
  },
  {
    icon: <Award className="h-6 w-6 text-blue-600" />,
    title: 'Microsoft Certified Trainer',
    years: '2018-2024',
    desc: 'Certified trainer title authorized to deliver Microsoft official curriculum.'
  }
];

const Author: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <Helmet>
      <title>Cengiz YILMAZ | Microsoft MVP &amp; Trainer</title>
      <meta name="description" content="Cengiz YILMAZ - Microsoft MVP, Microsoft Certified Trainer. Expert in Microsoft Exchange, Microsoft 365, Active Directory, PowerShell. Digital transformation consultant." />
      <meta name="keywords" content="Cengiz YILMAZ, Microsoft MVP, Microsoft Certified Trainer, Exchange Server, Microsoft 365, PowerShell, Active Directory, IT Consultant, Digital Transformation" />
      <meta name="author" content="Cengiz YILMAZ" />
      <meta property="og:title" content="Cengiz YILMAZ | Microsoft MVP &amp; Trainer" />
      <meta property="og:description" content="Microsoft MVP, Microsoft Certified Trainer. Expert in Microsoft Exchange, Microsoft 365, Active Directory, PowerShell." />
      <meta property="og:type" content="profile" />
      <meta property="og:image" content="https://message.cengizyilmaz.net/og-image.png" />
      <meta property="og:url" content="https://message.cengizyilmaz.net/author" />
      <meta property="og:locale" content="en_US" />
      <link rel="canonical" href="https://message.cengizyilmaz.net/author" />
      <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Cengiz YILMAZ",
          "jobTitle": "Microsoft MVP, Microsoft Certified Trainer",
          "description": "Expert in Microsoft Exchange, Microsoft 365, Active Directory, PowerShell. Digital transformation consultant.",
          "url": "https://message.cengizyilmaz.net/author",
          "sameAs": [
            "https://cengizyilmaz.net/",
            "https://twitter.com/cengizyilmaz_"
          ],
          "alumniOf": "Microsoft",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "Turkey"
          }
        }
      `}</script>
    </Helmet>
    <div className="container mx-auto max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <img src="https://cengizyilmaz.net/wp-content/uploads/2023/11/cengiz-yilmaz-mvp.jpg" alt="Cengiz YILMAZ" className="w-32 h-32 rounded-full shadow-lg mb-4 border-4 border-blue-600" />
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Cengiz YILMAZ</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Hello, I'm Cengiz YILMAZ</p>
        <div className="flex flex-wrap gap-3 justify-center mb-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-200 dark:border-yellow-800 shadow-sm font-bold">
            <Award className="h-5 w-5" /> Microsoft MVP
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm font-bold">
            <Award className="h-5 w-5" /> Microsoft Certified Trainer
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">In IT industry since 2015 · Turkey</p>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" /> My Professional Career
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          I have been actively working in the IT industry since 2015 and dealing with Microsoft technologies. I have Microsoft MVP (Most Valuable Professional) and Microsoft Certified Trainer (MCT) titles.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {expertise.map((item, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 flex flex-col items-start">
              {item.icon}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2 mb-1">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="h-6 w-6 text-yellow-500" /> Certifications &amp; Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((item, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 flex flex-col items-start">
              {item.icon}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2 mb-1">{item.title}</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.years}</span>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" /> My Goal
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          Sharing my technological knowledge and experience to guide organizations and individuals in their digital transformation processes. As someone with Microsoft MVP and Microsoft Certified Trainer (MCT) titles, I continuously follow developments in the technology world and integrate innovations into business processes.
        </p>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
          <li><b>Digital Transformation Guidance:</b> Providing strategic consultancy to organizations and individuals in their digital transformation processes.</li>
          <li><b>Technology Integration:</b> Integrating innovations in the technology world into business processes and increasing efficiency.</li>
        </ul>
      </div>
    </div>
  </div>
);

export default Author; 