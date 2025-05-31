import React, { useState } from 'react';
import { useMessages } from '../hooks/useMessages';
import { Loader, AlertTriangle, Search, Bell, Calendar, Tag, ChevronDown, ChevronUp, ExternalLink, Layers, Clock, AlertCircle, CheckCircle, MessageSquare, TrendingUp, ArrowRight, ChevronLeft, ChevronRight, Download, Hash, Filter, Activity, BarChart3, Zap, Sparkles, ArrowUpRight, FileText, Eye } from 'lucide-react';
import { MessageSeverity, MessageCategory } from '../types';
import { Link } from 'react-router-dom';
import MessageFilter from '../components/MessageFilter';
import SEO from '../components/SEO';
import { generateSlug } from '../utils/slug';

const Dashboard: React.FC = () => {
  const { messages, filteredMessages, loading, error, markAsRead, filter, updateFilter, availableServices } = useMessages();
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'service'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Pagination state - moved up before any returns
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 20;

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
    return `/message/${generateSlug(title)}`;
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
        <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
          {/* Header Section */}
          <div className="mb-10">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
              </div>
              
              <div className="relative">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-4">
                    <Sparkles className="h-4 w-4" />
                    Microsoft 365 Updates Hub
                  </div>
                </div>
                <h1 className="text-6xl font-black text-center mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                    Message Center
                  </span>
            </h1>
                <p className="text-xl text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Track the latest updates, features, and announcements for Microsoft 365 services
                </p>
                
                {lastUpdateDate && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last sync: {new Date(lastUpdateDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Stats Section with Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Total Messages Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 ring-1 ring-gray-900/5 dark:ring-white/10 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                </div>
                  <span className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                    <Activity className="h-4 w-4 mr-1" />
                    Active
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Messages</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {filteredMessages.length.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  All available updates
                </p>
              </div>
            </div>

            {/* Major Changes Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 ring-1 ring-gray-900/5 dark:ring-white/10 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                  <span className="flex items-center text-sm font-medium text-orange-600 dark:text-orange-400">
                    <Activity className="h-4 w-4 mr-1" />
                    Critical
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Major Changes</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {majorChanges.length.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {highPriorityCount} high priority
                </p>
              </div>
            </div>

            {/* Action Required Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 ring-1 ring-gray-900/5 dark:ring-white/10 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                </div>
                  <span className="flex items-center text-sm font-medium text-purple-600 dark:text-purple-400">
                    <Clock className="h-4 w-4 mr-1" />
                    Urgent
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Action Required</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {actionRequiredCount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Needs immediate attention
                </p>
              </div>
            </div>
          </div>

          {/* Filter Section with Modern Design */}
          <div className="mb-8">
            <MessageFilter 
              filter={filter}
              onFilterChange={updateFilter}
              availableServices={availableServices}
            />
          </div>

          {/* Messages Table with Modern Design */}
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Updates</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {currentMessages.length} of {filteredMessages.length} messages displayed
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                    Live
                  </span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        <FileText className="h-4 w-4" />
                        Message Details
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        <Layers className="h-4 w-4" />
                        Service
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        <AlertCircle className="h-4 w-4" />
                        Priority
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        <Calendar className="h-4 w-4" />
                        Published
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        <Eye className="h-4 w-4" />
                        View
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
            {currentMessages.map((message, index) => {
              const messageTitle = message.title || message.Title || 'Untitled Message';
              const messageId = message.id || message.Id || `msg-${index}`;
                    const severity = message.severity || mapSeverity(message.Severity) || MessageSeverity.INFORMATIONAL;

              return (
                      <tr 
                  key={messageId}
                        className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                      >
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <Link 
                              to={getMessageUrl(messageTitle) || '/'}
                              className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer hover:underline block"
                            >
                              {messageTitle}
                            </Link>
                            <div className="flex items-center gap-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                #{messageId}
                              </p>
                  {(isMajorChange(message) || isActionRequired(message)) && (
                                <div className="flex items-center gap-2">
                      {isMajorChange(message) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-400">
                          <AlertCircle className="h-3 w-3" />
                                      Major
                        </span>
                      )}
                      {isActionRequired(message) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-400">
                                      <Zap className="h-3 w-3" />
                                      Action
                        </span>
                      )}
                    </div>
                  )}
                    </div>
                  </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-400 shadow-sm">
                            <Layers className="h-3.5 w-3.5" />
                      {message.service || message.Services?.[0] || 'Microsoft 365'}
                    </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-xl shadow-sm ${
                            severity === MessageSeverity.HIGH 
                              ? 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-400'
                              : severity === MessageSeverity.MEDIUM
                              ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400'
                              : severity === MessageSeverity.LOW
                              ? 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 text-gray-700 dark:text-gray-400'
                          }`}>
                            {severity}
                  </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                        </td>
                        <td className="px-6 py-5 text-center">
                    <Link
                      to={getMessageUrl(messageTitle) || '/'}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group"
                    >
                            Details
                            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                        </td>
                      </tr>
              );
            })}
                </tbody>
              </table>
          </div>

          {/* Empty State */}
          {currentMessages.length === 0 && (
              <div className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-6">
                  <MessageSquare className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No messages found</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                  Try adjusting your filters or search criteria to find what you're looking for.
                </p>
            </div>
          )}
          </div>

          {/* Modern Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center">
              <nav className="flex items-center gap-2" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                  className="relative inline-flex items-center p-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  aria-label="Previous page"
              >
                  <ChevronLeft className="h-5 w-5" />
              </button>
              
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum;
                    if (totalPages <= 7) {
                    pageNum = i + 1;
                    } else if (currentPage <= 4) {
                    pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                  } else {
                      pageNum = currentPage - 3 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-xl transition-all duration-200 ${
                        currentPage === pageNum
                            ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'
                      }`}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                  className="relative inline-flex items-center p-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  aria-label="Next page"
              >
                  <ChevronRight className="h-5 w-5" />
              </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;