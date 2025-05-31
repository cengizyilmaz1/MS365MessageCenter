import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMessages } from '../hooks/useMessages';
import { ArrowLeft, AlertTriangle, Calendar, Clock, Tag, Layers, Hash, ExternalLink, Shield, BookOpen, Users, Globe, AlertCircle, Copy, Share2, Check, FileText, ArrowUpRight } from 'lucide-react';
import { MessageSeverity } from '../types';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import StructuredData from '../components/StructuredData';
import { useAnalytics } from '../hooks/useAnalytics';
import { generateMessageId, generateSlug } from '../utils/slug';

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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { messages, loading, markAsRead } = useMessages();
  const [copiedLink, setCopiedLink] = useState(false);
  const { trackMessageView, trackExternalLink } = useAnalytics();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlogPosts, setLoadingBlogPosts] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Find message by ID or slug
  const message = messages.find((msg) => {
    const msgId = msg.id || msg.Id || '';
    const title = msg.title || msg.Title || '';
    
    // Direct ID match
    if (msgId && msgId.toString() === id) {
      return true;
    }
    
    // Generate slug from title and compare
    const titleSlug = generateMessageId(title);
    if (titleSlug === id) {
      return true;
    }
    
    // Also try with just generateSlug for backwards compatibility
    const simpleSlug = generateSlug(title);
    if (simpleSlug === id) {
      return true;
    }
    
    return false;
  });

  useEffect(() => {
    if (message && !message.isRead) {
      const messageId = message.id || message.Id;
      if (messageId) {
        markAsRead(messageId.toString());
      }
    }
    
    // Track message view in analytics
    if (message) {
      const messageId = message.id || message.Id || '';
      const messageTitle = message.title || message.Title || '';
      trackMessageView(messageId.toString(), messageTitle);
    }
  }, [message, markAsRead, trackMessageView]);

  // Load blog posts from CSV
  useEffect(() => {
    const loadBlogPosts = async () => {
      if (!message) return;
      
      try {
        const response = await fetch('/data/CengizYILMAZBlogPost_latest.csv');
        if (!response.ok) throw new Error('Failed to load blog posts');
        
        const text = await response.text();
        const lines = text.split('\n');
        const allPosts: BlogPost[] = [];
        
        // Skip header and parse CSV
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Parse CSV line (handle quotes and commas)
          const matches = line.match(/^"([^"]+)","([^"]+)","([^"]+)"$/);
          if (matches) {
            allPosts.push({
              Title: decodeHtmlEntities(matches[1]),
              URL: matches[2],
              Date: matches[3]
            });
          }
        }
        
        // Filter posts based on message keywords
        const messageTitle = (message.title || message.Title || '').toLowerCase();
        const messageService = (message.service || message.Services?.[0] || '').toLowerCase();
        const messageTags = (message.tags || message.Tags || []).map((tag: string) => tag.toLowerCase());
        
        // Extract keywords from title
        const titleKeywords = messageTitle
          .split(/[\s-_,.:;!?()[\]{}'"]+/)
          .filter(word => word.length > 3 && !['with', 'from', 'that', 'this', 'have', 'been', 'will', 'what', 'when', 'where', 'which', 'while'].includes(word));
        
        // Score each post based on relevance
        const scoredPosts = allPosts.map(post => {
          const postTitle = post.Title.toLowerCase();
          let score = 0;
          
          // Check title keywords
          titleKeywords.forEach(keyword => {
            if (postTitle.includes(keyword)) score += 3;
          });
          
          // Check service match
          if (messageService && postTitle.includes(messageService)) score += 2;
          
          // Check tag matches
          messageTags.forEach(tag => {
            if (postTitle.includes(tag)) score += 1;
          });
          
          // Check specific product names
          const products = ['teams', 'outlook', 'sharepoint', 'exchange', 'onedrive', 'azure', 'office', 'word', 'excel', 'powerpoint'];
          products.forEach(product => {
            if (messageTitle.includes(product) && postTitle.includes(product)) score += 2;
          });
          
          return { ...post, score };
        });
        
        // Sort by score and date
        const relevantPosts = scoredPosts
          .filter(post => post.score > 0)
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(b.Date).getTime() - new Date(a.Date).getTime();
          })
          .slice(0, 3);
        
        // If no relevant posts found, get latest 3
        const postsToShow = relevantPosts.length > 0 
          ? relevantPosts 
          : allPosts
              .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
              .slice(0, 3);
        
        setBlogPosts(postsToShow);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      } finally {
        setLoadingBlogPosts(false);
      }
    };
    
    loadBlogPosts();
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
        // Silently handle error
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <>
        <SEO 
          title="Message Not Found"
          description="The requested message could not be found."
          type="website"
        />
        <StructuredData type="website" />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Message Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                The message you're looking for doesn't exist or has been removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Messages
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Add SEO metadata for the message
  const messageTitle = message.title || message.Title || '';
  
  // Enhanced Description
  let messageDescription = '';
  if (message.summary) {
    messageDescription = message.summary;
  } else if (message.content || message.Body?.Content) {
    const text = (message.content || message.Body?.Content || '').replace(/<[^>]+>/g, '');
    // Try to find first meaningful paragraph
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 30);
    if (paragraphs.length > 0) {
      messageDescription = paragraphs[0].substring(0, 155).trim() + '...';
    } else {
      messageDescription = text.substring(0, 155).trim() + '...';
    }
  }
  
  // Add context to description
  const severity = message.severity || mapSeverity(message.Severity || 'normal');
  const service = message.service || message.Services?.[0] || 'Microsoft 365';
  
  if (!messageDescription) {
    messageDescription = `${severity} update for ${service}: ${(message.title || message.Title || '').substring(0, 100)}`;
  }

  const messageTags = message.tags || message.Tags || [];
  const publishedDate = message.publishedDate || message.StartDateTime;
  const modifiedDate = message.lastModifiedDate || message.LastModifiedDateTime || publishedDate;

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
    // First, wrap the content in a div with proper dark mode text color
    let processedContent = `<div class="text-gray-900 dark:text-gray-100">`;
    
    // Make links open in new tab
    processedContent += content.replace(
      /<a\s+href=/gi,
      '<a target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline" href='
    );
    
    // Highlight specific headings like [When this will happen:]
    processedContent = processedContent.replace(
      /\[([^\]]+):\]/g,
      '</div><strong class="block text-lg font-black text-gray-900 dark:text-white mt-6 mb-3">$1:</strong><div class="text-gray-900 dark:text-gray-100">'
    );
    
    // Fix any text color issues in paragraphs
    processedContent = processedContent.replace(
      /<p>/gi,
      '<p class="text-gray-700 dark:text-gray-300">'
    );
    
    // Fix list items
    processedContent = processedContent.replace(
      /<li>/gi,
      '<li class="text-gray-700 dark:text-gray-300">'
    );
    
    // Fix any spans or divs that might have color issues
    processedContent = processedContent.replace(
      /<span/gi,
      '<span class="text-gray-700 dark:text-gray-300"'
    );
    
    // Close the wrapper div
    processedContent += '</div>';
    
    return processedContent;
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
  // Description - use the enhanced messageDescription from above
  const pageDescription = messageDescription;

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
        title={messageTitle}
        description={messageDescription}
        type="article"
        publishedTime={publishedDate}
        modifiedTime={modifiedDate}
        tags={messageTags}
        url={pageUrl}
      />
      <StructuredData 
        type="article"
        message={message}
      />
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
        <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Messages
          </button>

          {/* Header Section with Gradient Background */}
          <div className="relative mb-8">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                    {message.title || message.Title}
                  </h1>
                  
                  {/* Action Badges */}
                  {(isMajorChange(message) || isActionRequired(message)) && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {isMajorChange(message) && (
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-700 dark:text-orange-400 rounded-xl border border-orange-200 dark:border-orange-800 shadow-sm backdrop-blur-sm">
                          <AlertCircle className="h-5 w-5" />
                          <span className="text-base font-bold">Major Change</span>
                        </div>
                      )}
                      {isActionRequired(message) && (
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 shadow-sm backdrop-blur-sm">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="text-base font-bold">Action Required</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(message.severity || mapSeverity(message.Severity || 'normal'))}
                  </div>
                  
                  {/* Copy Link and Share Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
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
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Grid - Full Width */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-xl p-6 lg:p-8 mb-8 border border-gray-200/50 dark:border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/50 dark:to-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
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
                <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/50 dark:to-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
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
              
              <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/50 dark:to-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                  <Layers className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Category</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {message.category?.replace(/_/g, ' ') || 'General'}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/50 dark:to-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
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

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content - Takes 3 columns on XL screens */}
            <div className="xl:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 lg:p-10">
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  Summary
                </h2>
                <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-200 leading-relaxed mb-12">
                  {message.summary || 'No summary available'}
                </p>

                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  Details
                </h2>
                <div 
                  className="prose prose-lg lg:prose-xl max-w-none dark:prose-invert 
                    prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                    prose-p:text-gray-700 dark:prose-p:text-gray-300
                    prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                    prose-a:text-blue-600 dark:prose-a:text-blue-400
                    prose-li:text-gray-700 dark:prose-li:text-gray-300
                    prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                    prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                    prose-code:text-gray-800 dark:prose-code:text-gray-200
                    prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800
                    prose-pre:rounded-xl prose-pre:shadow-inner
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4"
                  dangerouslySetInnerHTML={{ 
                    __html: processContent(message.content || message.Body?.Content || '') 
                  }}
                />
              </div>
            </div>

            {/* Sidebar - Takes 1 column on XL screens */}
            <div className="xl:col-span-1">
              <div className="space-y-6 xl:sticky xl:top-6">
                {/* Timeline Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Timeline
                  </h3>
                  <div className="space-y-4">
                    {allDates.published && (
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-1 p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Published</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(allDates.published).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {allDates.lastModified && (
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-1 p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Modified</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(allDates.lastModified).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {allDates.actionRequiredBy && (
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-1 p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg animate-pulse">
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Action By</p>
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                            {new Date(allDates.actionRequiredBy).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
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
                      <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {message.tags
                        .filter(tag => !tag.toLowerCase().includes('roadmap id:'))
                        .map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-400 rounded-xl text-sm font-medium hover:shadow-md transition-all duration-200 hover:scale-105 border border-purple-200/50 dark:border-purple-700/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source Information */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Source Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[80px]">Source:</span>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        Microsoft 365 Message Center
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[80px]">URL:</span>
                      <a 
                        href={`https://admin.microsoft.com/Adminportal/Home#/MessageCenter/${message.id || message.Id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 group"
                        onClick={() => trackExternalLink('Microsoft Admin Center', `Message ${message.id || message.Id}`)}
                      >
                        View in Admin Center
                        <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 min-w-[80px]">Type:</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                        <Shield className="h-3 w-3" />
                        Official
                      </span>
                    </div>
                  </div>
                </div>

                {/* Related Blog Posts */}
                <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl shadow-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Expert Analysis & Resources
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                    Deep-dive articles and expert insights about Microsoft 365 updates by Cengiz YILMAZ (Microsoft MVP)
                  </p>
                  {loadingBlogPosts ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : blogPosts.length > 0 ? (
                    <div className="space-y-3">
                      {blogPosts.map((post, index) => (
                        <article key={index} className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                          <a
                            href={post.URL}
                            target="_blank"
                            rel="dofollow noopener noreferrer"
                            className="block"
                            onClick={() => trackExternalLink('Blog Post', post.Title)}
                            title={`Read full article: ${post.Title}`}
                          >
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2" 
                                itemProp="headline">
                              {decodeHtmlEntities(post.Title)}
                            </h4>
                            <div className="flex items-center justify-between">
                              <time className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1" 
                                   dateTime={post.Date}
                                   itemProp="datePublished">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.Date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </time>
                              <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                                Read Article
                                <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              </span>
                            </div>
                          </a>
                          <meta itemProp="url" content={post.URL} />
                          <meta itemProp="author" content="Cengiz YILMAZ" />
                          <meta itemProp="publisher" content="cengizyilmaz.net" />
                        </article>
                      ))}
                      <div className="mt-4 pt-4 border-t border-blue-200/50 dark:border-blue-700/50">
                        <a 
                          href="https://cengizyilmaz.net"
                          target="_blank"
                          rel="dofollow noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          <Globe className="h-4 w-4" />
                          Visit cengizyilmaz.net for more Microsoft 365 insights
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No expert analysis available for this update yet.
                      </p>
                      <a 
                        href="https://cengizyilmaz.net"
                        target="_blank"
                        rel="dofollow noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        <Globe className="h-4 w-4" />
                        Browse all Microsoft 365 articles
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
            aria-label="Scroll to top"
          >
            <ArrowUpRight className="h-6 w-6 rotate-[-45deg]" />
          </button>
        )}
      </div>
    </>
  );
};

export default MessageDetail;