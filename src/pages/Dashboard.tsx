import React, { useState } from 'react';
import { useMessages } from '../hooks/useMessages';
import { Loader, AlertTriangle, Search, Bell, Calendar, Tag, ChevronDown, ChevronUp, ExternalLink, Layers, Clock, AlertCircle, CheckCircle, MessageSquare, TrendingUp, ArrowRight, ChevronLeft, ChevronRight, Download, Hash } from 'lucide-react';
import { MessageSeverity, MessageCategory } from '../types';
import { Link } from 'react-router-dom';
import MessageFilter from '../components/MessageFilter';
import SEO from '../components/SEO';
import { downloadSitemap } from '../utils/generateSitemap';

const Dashboard: React.FC = () => {
  const { messages, filteredMessages, loading, error, markAsRead, filter, updateFilter, availableServices } = useMessages();
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'service'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Pagination state - moved up before any returns
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 12;

  // Map severity helper (same as in MessageDetail)
  const mapSeverity = (severity: string | undefined): MessageSeverity => {
    if (!severity) return MessageSeverity.INFORMATIONAL;
    const severityMap: Record<string, MessageSeverity> = {
      'high': MessageSeverity.HIGH,
      'medium': MessageSeverity.MEDIUM,
      'low': MessageSeverity.LOW,
      'normal': MessageSeverity.INFORMATIONAL,
      'informational': MessageSeverity.INFORMATIONAL
    };
    return severityMap[severity.toLowerCase()] || MessageSeverity.INFORMATIONAL;
  };

  // Helper functions - moved before their usage
  const isMajorChange = (message: any) => {
    // Check IsMajorChange field first
    if (message.IsMajorChange) return true;
    
    // Then check tags (both legacy and new format)
    const tags = message.tags || message.Tags || [];
    return tags.some((tag: string) => 
      tag.toLowerCase().includes('major') || 
      tag.toLowerCase().includes('breaking') ||
      tag.toLowerCase().includes('critical')
    ) || message.severity === MessageSeverity.HIGH;
  };

  const isActionRequired = (message: any) => {
    // Check ActionRequiredByDateTime field first
    if (message.ActionRequiredByDateTime) return true;
    
    // Then check tags and category
    const tags = message.tags || message.Tags || [];
    return tags.some((tag: string) => 
      tag.toLowerCase().includes('action') || 
      tag.toLowerCase().includes('required') ||
      tag.toLowerCase().includes('mandatory')
    ) || (message.category || message.Category || '').toLowerCase().includes('action');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Error Loading Messages</h3>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const getMessageUrl = (title: string | undefined) => {
    if (!title) return '/';
    return `/message/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  };

  const toggleSort = (field: 'date' | 'severity' | 'service') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortMessages = [...filteredMessages].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        const dateA = new Date(a.publishedDate || a.StartDateTime || '').getTime();
        const dateB = new Date(b.publishedDate || b.StartDateTime || '').getTime();
        comparison = dateA - dateB;
        break;
      case 'severity':
        const severityOrder: Record<string, number> = { 
          [MessageSeverity.HIGH]: 3, 
          [MessageSeverity.MEDIUM]: 2, 
          [MessageSeverity.LOW]: 1,
          [MessageSeverity.INFORMATIONAL]: 0
        };
        const sevA = a.severity || MessageSeverity.INFORMATIONAL;
        const sevB = b.severity || MessageSeverity.INFORMATIONAL;
        comparison = severityOrder[sevA] - severityOrder[sevB];
        break;
      case 'service':
        const serviceA = a.service || a.Services?.[0] || '';
        const serviceB = b.service || b.Services?.[0] || '';
        comparison = serviceA.localeCompare(serviceB);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const unreadMessages = filteredMessages.filter(msg => !msg.isRead);
  const majorChanges = filteredMessages.filter(msg => isMajorChange(msg));
  const actionRequired = filteredMessages.filter(msg => isActionRequired(msg));
  const lastUpdateDate = filteredMessages.length > 0 
    ? Math.max(...filteredMessages.map(msg => new Date(msg.publishedDate || msg.StartDateTime || '').getTime()).filter(time => !isNaN(time)))
    : null;

  // Calculate statistics for dashboard
  const messagesThisWeek = filteredMessages.filter(msg => {
    const publishedDate = new Date(msg.publishedDate || msg.StartDateTime || '');
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return publishedDate >= oneWeekAgo;
  }).length;

  const highPriorityCount = filteredMessages.filter(msg => 
    msg.severity === MessageSeverity.HIGH || 
    mapSeverity(msg.Severity) === MessageSeverity.HIGH
  ).length;

  const actionRequiredCount = actionRequired.length;

  // Pagination calculations
  const totalPages = Math.ceil(sortMessages.length / messagesPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentMessages = sortMessages.slice(
    (currentPage - 1) * messagesPerPage,
    currentPage * messagesPerPage
  );

  const getSeverityBadge = (severity: MessageSeverity) => {
    const styles = {
      [MessageSeverity.HIGH]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
      [MessageSeverity.MEDIUM]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
      [MessageSeverity.LOW]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
      [MessageSeverity.INFORMATIONAL]: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
    };

    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${styles[severity]}`}>
        {severity}
      </span>
    );
  };

  const getCategoryIcon = (category: MessageCategory) => {
    const icons: Record<string, JSX.Element> = {
      [MessageCategory.PLANNED_MAINTENANCE]: <Clock className="h-4 w-4" />,
      [MessageCategory.SERVICE_INCIDENT]: <AlertTriangle className="h-4 w-4" />,
      [MessageCategory.ANNOUNCEMENT]: <Bell className="h-4 w-4" />,
      [MessageCategory.FEATURE_UPDATE]: <Tag className="h-4 w-4" />,
      [MessageCategory.SECURITY_ADVISORY]: <AlertCircle className="h-4 w-4" />,
      [MessageCategory.SERVICE_DEGRADATION]: <AlertTriangle className="h-4 w-4" />,
      [MessageCategory.SERVICE_RESTORED]: <CheckCircle className="h-4 w-4" />,
      [MessageCategory.SERVICE_INTERRUPTION]: <AlertTriangle className="h-4 w-4" />,
      [MessageCategory.SERVICE_ISSUE]: <AlertCircle className="h-4 w-4" />,
      [MessageCategory.SERVICE_UPDATE]: <Tag className="h-4 w-4" />,
      [MessageCategory.SERVICE_CHANGE]: <Tag className="h-4 w-4" />,
      [MessageCategory.SERVICE_NOTIFICATION]: <Bell className="h-4 w-4" />,
      [MessageCategory.SERVICE_ALERT]: <AlertTriangle className="h-4 w-4" />,
      [MessageCategory.SERVICE_WARNING]: <AlertTriangle className="h-4 w-4" />,
      [MessageCategory.SERVICE_INFO]: <Bell className="h-4 w-4" />
    };
    return icons[category] || <Tag className="h-4 w-4" />;
  };

  return (
    <>
      <SEO 
        title="Dashboard"
        description="Microsoft 365 Message Center dashboard showing all service updates, announcements, and changes"
        keywords={['Microsoft 365', 'Message Center', 'Dashboard', 'Service Updates']}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Microsoft 365 Message Center
            </h1>
            <p className="text-lg text-secondary">
              Stay updated with all service announcements and changes
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-tertiary">Total Messages</p>
                  <p className="text-2xl font-bold text-primary">{filteredMessages.length.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-tertiary">This Week</p>
                  <p className="text-2xl font-bold text-primary">{messagesThisWeek.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-tertiary">Major Changes</p>
                  <p className="text-2xl font-bold text-primary">{majorChanges.length.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-tertiary">Action Required</p>
                  <p className="text-2xl font-bold text-primary">{actionRequiredCount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Search Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 animate-scale-in">
            <MessageFilter 
              filter={filter}
              onFilterChange={updateFilter}
              availableServices={availableServices}
            />
          </div>

          {/* Messages Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentMessages.map((message, index) => {
              const messageTitle = message.title || message.Title || 'Untitled Message';
              const messageId = message.id || message.Id || `msg-${index}`;
              const isRead = message.isRead || false;

              return (
                <div
                  key={messageId}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 card-hover animate-fade-in"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  {/* Priority indicators */}
                  {(isMajorChange(message) || isActionRequired(message)) && (
                    <div className="flex gap-2 mb-4">
                      {isMajorChange(message) && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                          <AlertCircle className="h-3 w-3" />
                          Major Change
                        </span>
                      )}
                      {isActionRequired(message) && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          <AlertTriangle className="h-3 w-3" />
                          Action Required
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-primary line-clamp-2 flex-1">
                        {messageTitle}
                      </h3>
                      {!isRead && (
                        <span className="ml-2 flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                      )}
                    </div>
                    
                    {/* Message ID */}
                    <div className="flex items-center gap-2 text-sm text-tertiary">
                      <Hash className="h-4 w-4" />
                      <span className="font-mono">{messageId}</span>
                    </div>
                  </div>

                  {/* Service and Severity */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      <Layers className="h-3 w-3" />
                      {message.service || message.Services?.[0] || 'Microsoft 365'}
                    </span>
                    {getSeverityBadge(message.severity || MessageSeverity.INFORMATIONAL)}
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-secondary line-clamp-3 mb-4">
                    {message.summary || 'No summary available'}
                  </p>

                  {/* Published Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-tertiary">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {(message.publishedDate || message.StartDateTime) ? 
                          new Date(message.publishedDate || message.StartDateTime || '').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'No date'
                        }
                      </span>
                    </div>
                    
                    <Link
                      to={getMessageUrl(messageTitle) || '/'}
                      className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {currentMessages.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center animate-fade-in">
              <MessageSquare className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">No messages found</h3>
              <p className="text-secondary">Try adjusting your filters or search criteria</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
              >
                <ChevronLeft className="h-5 w-5 text-primary" />
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white dark:bg-gray-800 text-primary shadow-md hover:shadow-lg'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
              >
                <ChevronRight className="h-5 w-5 text-primary" />
              </button>
            </div>
          )}

          {/* Sitemap Download */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => downloadSitemap(messages)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-md"
            >
              <Download className="h-5 w-5" />
              Download Sitemap
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;