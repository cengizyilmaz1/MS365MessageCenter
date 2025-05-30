import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';
import { ArrowLeft, AlertTriangle, Calendar, Clock, Tag, Layers, Hash, ExternalLink, Shield, BookOpen, Users, Globe, AlertCircle, Copy, Share2, Check, FileText } from 'lucide-react';
import { MessageSeverity } from '../types';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import StructuredData from '../components/StructuredData';
import { useAnalytics } from '../hooks/useAnalytics';

// Map actual values to our enums
const mapSeverity = (severity: string): MessageSeverity => {
  const severityMap: Record<string, MessageSeverity> = {
    'high': MessageSeverity.HIGH,
    'medium': MessageSeverity.MEDIUM,
    'low': MessageSeverity.LOW,
    'normal': MessageSeverity.INFORMATIONAL
  };
  return severityMap[severity?.toLowerCase()] || MessageSeverity.INFORMATIONAL;
};

// Blog post interface
interface BlogPost {
  Title: string;
  URL: string;
  Date: string;
}

// HTML entity decode helper
function decodeHtmlEntities(str: string) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

const getLatestCsvUrl = async (): Promise<string | null> => {
  // data klasöründe en güncel CSV dosyasını bulmak için fetch ile dizin içeriğini çekmeye çalışıyoruz
  // Vite dev server veya prod ortamda public/data dizini doğrudan erişilebilir
  // Burada dosya adını hardcode etmek yerine, en güncel dosyayı bulmak için bir endpoint veya dizin listeleme gerekir
  // Ancak çoğu static hostingde dizin listeleme yok, bu yüzden en son dosya adını powershell scriptinde sabit isimle de yazdırabilirsiniz
  // Şimdilik en güncel dosya adını elle güncelleyin veya powershell scriptini CengizYILMAZBlogPost_latest.csv olarak da yazdıracak şekilde değiştirin
  return '/data/CengizYILMAZBlogPost_20250528.csv'; // elle güncel dosya adı
};

const MessageDetail: React.FC = () => {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();
  const { messages, markAsRead } = useMessages();
  const [copiedLink, setCopiedLink] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<BlogPost[]>([]);
  const { trackMessageView, trackExternalLink } = useAnalytics();

  const message = messages.find(
    (msg) => (msg.title || msg.Title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') === title
  );

  useEffect(() => {
    if (message && !message.isRead) {
      const messageId = message.id || message.Id;
      if (messageId) {
        markAsRead(messageId);
      }
    }
    
    // Track message view in analytics
    if (message) {
      const messageId = message.id || message.Id || '';
      const messageTitle = message.title || message.Title || '';
      trackMessageView(messageId.toString(), messageTitle);
    }
  }, [message, markAsRead, trackMessageView]);

  // Deterministic shuffle for each message
  function seededShuffle<T>(array: T[], seed: string): T[] {
    let arr = [...array];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    for (let i = arr.length - 1; i > 0; i--) {
      hash = (hash * 9301 + 49297) % 233280;
      const j = Math.abs(hash) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Load blog posts from CSV
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        console.log('Blog posts loading...');
        const csvUrl = '/data/CengizYILMAZBlogPost_latest.csv';
        const response = await fetch(csvUrl);
        console.log('Fetch response:', response);
        const csvText = await response.text();
        console.log('CSV text:', csvText);
        const posts = csvText
          .split('\n')
          .slice(1) // Skip header
          .filter(line => line.trim())
          .map(line => {
            const match = line.match(/^"(.+?)","(.+?)","(.+?)"[\r\n]*$/);
            if (!match) return null;
            const [, Title, URL, Date] = match;
            return { Title, URL, Date };
          });
        const validPosts = posts.filter((p): p is BlogPost => p !== null);
        setBlogPosts(validPosts);
        // Deterministic selection: use messageId as seed
        if (message && validPosts.length > 0) {
          const messageId = (message.id || message.Id || message.title || message.Title || '').toString();
          const shuffled = seededShuffle(validPosts, messageId);
          setSelectedPosts(shuffled.slice(0, 3));
        }
      } catch (error) {
        console.error('Error loading blog posts:', error);
      }
    };
    loadBlogPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: message?.title || message?.Title || 'Microsoft 365 Message',
      text: message?.summary || 'Check out this Microsoft 365 update',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  if (!message) {
    return (
      <>
        <SEO 
          title="Message Not Found"
          description="The requested message could not be found."
          type="website"
        />
        <StructuredData type="website" />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The message you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Messages
            </Link>
          </div>
        </div>
      </>
    );
  }

  const getSeverityBadge = (severity: MessageSeverity) => {
    const styles = {
      [MessageSeverity.HIGH]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
      [MessageSeverity.MEDIUM]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
      [MessageSeverity.LOW]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
      [MessageSeverity.INFORMATIONAL]: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
    };

    const icons = {
      [MessageSeverity.HIGH]: <AlertTriangle className="h-4 w-4" />,
      [MessageSeverity.MEDIUM]: <AlertTriangle className="h-4 w-4" />,
      [MessageSeverity.LOW]: <Shield className="h-4 w-4" />,
      [MessageSeverity.INFORMATIONAL]: <BookOpen className="h-4 w-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md ${styles[severity]}`}>
        {icons[severity]}
        {severity}
      </span>
    );
  };

  const isMajorChange = (message: any) => {
    // Check IsMajorChange field first
    if (message.IsMajorChange) return true;
    
    // Then check tags
    const tags = message.tags || message.Tags || [];
    return tags.some((tag: string) => 
      tag.toLowerCase().includes('major') || 
      tag.toLowerCase().includes('breaking')
    ) || message.severity === MessageSeverity.HIGH;
  };

  const isActionRequired = (message: any) => {
    // Check ActionRequiredByDateTime field first
    if (message.ActionRequiredByDateTime) return true;
    
    // Then check tags and category
    const tags = message.tags || message.Tags || [];
    return tags.some((tag: string) => 
      tag.toLowerCase().includes('action') || 
      tag.toLowerCase().includes('required')
    ) || (message.category || message.Category || '').toLowerCase().includes('action');
  };

  // Extract additional details from message
  const extractRoadmapId = () => {
    // Check in tags first
    const tags = message.tags || message.Tags || [];
    const tagRoadmap = tags.find((tag: string) => tag.toLowerCase().includes('roadmap id:'))?.replace(/roadmap id:\s*/i, '').trim();
    if (tagRoadmap) return tagRoadmap;
    
    // Check in content for Roadmap ID patterns
    const content = message.content || message.Body?.Content || '';
    const contentMatch = content.match(/roadmap\s+id:\s*(\d+)/i);
    if (contentMatch) return contentMatch[1];
    
    // Check for roadmap links in content
    const linkMatch = content.match(/microsoft-365\/roadmap\?filters=&amp;searchterms=(\d+)/i);
    if (linkMatch) return linkMatch[1];
    
    return null;
  };

  const extractedDetails = {
    messageId: message.id || message.Id,
    roadmapId: extractRoadmapId(),
    platform: message.Services || message.service || 'Microsoft 365',
    lastModified: message.lastModifiedDate || message.LastModifiedDateTime || message.publishedDate || message.StartDateTime
  };

  // Calculate grid columns based on available data
  const infoItems = [
    { show: true, item: 'messageId' },
    { show: extractedDetails.roadmapId, item: 'roadmapId' },
    { show: true, item: 'category' },
    { show: true, item: 'platform' }
  ].filter(item => item.show);

  const gridCols = infoItems.length <= 2 ? 'md:grid-cols-2' : infoItems.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';

  // Process content to make links open in new tab and highlight headings
  const processContent = (content: string) => {
    // Make links open in new tab
    content = content.replace(
      /<a\s+href=/gi,
      '<a target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline" href='
    );
    
    // Highlight specific headings like [When this will happen:]
    content = content.replace(
      /\[([^\]]+):\]/g,
      '<strong class="block text-lg font-black text-gray-900 dark:text-white mt-6 mb-3">$1:</strong>'
    );
    
    return content;
  };

  // Extract all dates from message
  const extractAllDates = () => {
    const dates: any = {};
    
    if (message.publishedDate || message.StartDateTime) {
      dates.published = message.publishedDate || message.StartDateTime;
    }
    if (message.lastModifiedDate || message.LastModifiedDateTime) {
      dates.lastModified = message.lastModifiedDate || message.LastModifiedDateTime;
    }
    if (message.EndDateTime) {
      dates.endDate = message.EndDateTime;
    }
    if (message.ActionRequiredByDateTime) {
      dates.actionRequiredBy = message.ActionRequiredByDateTime;
    }
    
    return dates;
  };

  const allDates = extractAllDates();

  // SEO meta ve schema için değerler
  const pageTitle = (message.title || message.Title) + ' | Microsoft 365 Message Center';
  // Description
  let pageDescription = '';
  if (message.summary) {
    pageDescription = message.summary;
  } else if (message.content || message.Body?.Content) {
    const text = (message.content || message.Body?.Content || '').replace(/<[^>]+>/g, '');
    pageDescription = text.substring(0, 160).trim();
  } else {
    pageDescription = 'Microsoft 365 service update and announcement details.';
  }

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pageImage = 'https://message.cengizyilmaz.net/og-image.png';
  const publishedTime = allDates.published ? new Date(allDates.published).toISOString() : undefined;
  const modifiedTime = allDates.lastModified ? new Date(allDates.lastModified).toISOString() : undefined;
  const author = 'Microsoft 365';
  const publisher = 'Microsoft 365 Message Center';

  // Keywords
  const tagKeywords = (message.tags || message.Tags || []).join(', ');
  const titleWords = (message.title || message.Title || '').split(' ').slice(0, 5).join(', ');
  const summaryWords = (pageDescription || '').split(' ').slice(0, 5).join(', ');
  const keywordsArr = [
    message.category || message.Category,
    extractedDetails.platform,
    extractedDetails.roadmapId,
    tagKeywords,
    titleWords,
    summaryWords,
    'Microsoft 365',
    'Message Center',
    'Service Update',
    'Announcement',
    'Feature Update',
    'Maintenance',
    'Security Advisory'
  ];
  const keywords = Array.from(new Set(keywordsArr.join(', ').split(',').map(k => k.trim()).filter(Boolean))).join(', ');

  // Schema.org JSON-LD
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': pageTitle,
    'description': pageDescription,
    'datePublished': publishedTime,
    'dateModified': modifiedTime,
    'author': {
      '@type': 'Organization',
      'name': author,
      'url': 'https://www.microsoft.com'
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    'image': pageImage,
    'publisher': {
      '@type': 'Organization',
      'name': publisher,
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://message.cengizyilmaz.net/logo.png'
      }
    },
    'keywords': keywords,
    'articleSection': message.category || message.Category || 'Service Update',
    'inLanguage': 'en-US',
    'isAccessibleForFree': true,
    'license': 'https://www.microsoft.com/en-us/legal/terms-of-use'
  };

  return (
    <>
      <SEO 
        title={message.title || message.Title || 'Microsoft 365 Update'}
        description={pageDescription}
        type="article"
        url={pageUrl}
        keywords={keywords.split(', ')}
        image={pageImage}
      />
      <StructuredData message={message} type="article" />
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <meta name="publisher" content={publisher} />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:site_name" content={publisher} />
        <meta property="og:locale" content="en_US" />
        <meta property="article:published_time" content={publishedTime} />
        <meta property="article:modified_time" content={modifiedTime} />
        <meta property="article:section" content={message.category || message.Category || 'Service Update'} />
        <meta property="article:tag" content={keywords} />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
        <meta name="twitter:creator" content="@microsoft365" />
        
        {/* Additional Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Messages
          </button>

          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                  {message.title || message.Title}
                </h1>
                
                {/* Action Badges */}
                {(isMajorChange(message) || isActionRequired(message)) && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {isMajorChange(message) && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-700 dark:text-orange-400 rounded-lg border border-orange-200 dark:border-orange-800 shadow-sm">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-base font-bold">Major Change</span>
                      </div>
                    )}
                    {isActionRequired(message) && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 shadow-sm">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-base font-bold">Action Required</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {getSeverityBadge(message.severity || mapSeverity(message.Severity))}
                </div>
                
                {/* Copy Link and Share Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span className="text-sm font-medium">Copy Link</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Hash className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Message ID</span>
                </div>
                <a 
                  href={`https://admin.microsoft.com/Adminportal/Home#/MessageCenter/${extractedDetails.messageId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2 group"
                >
                  {extractedDetails.messageId}
                  <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
              
              {extractedDetails.roadmapId && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <ExternalLink className="h-5 w-5" />
                    <span className="text-sm font-semibold uppercase tracking-wide">Roadmap ID</span>
                  </div>
                  <a 
                    href={`https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=${extractedDetails.roadmapId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2 group"
                  >
                    {extractedDetails.roadmapId}
                    <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              )}
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Layers className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Category</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {message.category?.replace(/_/g, ' ') || 'General'}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Service</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{extractedDetails.platform}</p>
                  {message.affectedWorkloads && message.affectedWorkloads.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Platforms: {message.affectedWorkloads.filter(w => w && w.trim() !== '').join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Summary
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed mb-10">
                  {message.summary || 'No summary available'}
                </p>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Details
                </h2>
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert 
                    prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                    prose-p:text-gray-700 dark:prose-p:text-gray-300
                    prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                    prose-a:text-blue-600 dark:prose-a:text-blue-400
                    prose-li:text-gray-700 dark:prose-li:text-gray-300
                    prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                    prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                    prose-code:text-gray-800 dark:prose-code:text-gray-200
                    prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800"
                  dangerouslySetInnerHTML={{ 
                    __html: processContent(message.content || message.Body?.Content || '') 
                  }}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* All Dates Display */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  {allDates.published && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Published Date</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(allDates.published).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {allDates.lastModified && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Last Modified</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(allDates.lastModified).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {allDates.actionRequiredBy && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Action Required By</p>
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                          {new Date(allDates.actionRequiredBy).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {allDates.endDate && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">End Date</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(allDates.endDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {message.tags && message.tags.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {message.tags
                      .filter(tag => !tag.toLowerCase().includes('roadmap id:'))
                      .map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Blog Posts */}
              {selectedPosts.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">En Son Yazılar</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {selectedPosts.map((post, index) => (
                      <a
                        key={index}
                        href={post.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label={`Blog yazısı: ${decodeHtmlEntities(post.Title)}`}
                      >
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {decodeHtmlEntities(post.Title)}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(post.Date).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageDetail;