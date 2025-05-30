import React, { useState } from 'react';
import { useMessages } from '../hooks/useMessages';
import { Loader, AlertTriangle, Search, Bell, Calendar, Tag, ChevronDown, ChevronUp, ExternalLink, Layers, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { MessageSeverity, MessageCategory } from '../types';
import { Link } from 'react-router-dom';
import MessageFilter from '../components/MessageFilter';
import SEO from '../components/SEO';

const Dashboard: React.FC = () => {
  const { messages, loading, error, markAsRead, filter, updateFilter, availableServices } = useMessages();
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'service'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const sortMessages = [...messages].sort((a, b) => {
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

  const unreadMessages = messages.filter(msg => !msg.isRead);
  const majorChanges = messages.filter(msg => isMajorChange(msg));
  const actionRequired = messages.filter(msg => isActionRequired(msg));
  const lastUpdateDate = messages.length > 0 
    ? Math.max(...messages.map(msg => new Date(msg.publishedDate || msg.StartDateTime || '').getTime()).filter(time => !isNaN(time)))
    : null;

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
    const icons = {
      [MessageCategory.PLANNED_MAINTENANCE]: <Clock className="h-4 w-4" />,
      [MessageCategory.SERVICE_INCIDENT]: <AlertTriangle className="h-4 w-4" />,
      [MessageCategory.ANNOUNCEMENT]: <Bell className="h-4 w-4" />,
      [MessageCategory.FEATURE_UPDATE]: <Tag className="h-4 w-4" />,
      [MessageCategory.SECURITY_ADVISORY]: <AlertCircle className="h-4 w-4" />
    };
    return icons[category] || <Tag className="h-4 w-4" />;
  };

  return (
    <>
      <SEO 
        title="Microsoft 365 Message Center"
        description="Stay updated with all Microsoft 365 service announcements, planned maintenance, and feature updates. Get real-time notifications about service changes, incidents, and improvements."
        keywords={[
          'Microsoft 365',
          'Office 365',
          'Service Updates',
          'Maintenance',
          'Feature Updates',
          'Service Status',
          'Microsoft Updates',
          ...availableServices
        ]}
      />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Message Center</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with all Microsoft 365 service announcements and changes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="relative z-10">
              <p className="text-blue-100 text-sm font-medium">Total Messages</p>
              <h3 className="text-3xl font-bold mt-2">{messages.length}</h3>
            </div>
            <Bell className="absolute -right-4 -bottom-4 h-24 w-24 text-blue-400 opacity-20" />
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="relative z-10">
              <p className="text-orange-100 text-sm font-medium">Major Changes</p>
              <h3 className="text-3xl font-bold mt-2">{majorChanges.length}</h3>
              <p className="text-orange-100 text-xs mt-2">{actionRequired.length} action required</p>
            </div>
            <AlertCircle className="absolute -right-4 -bottom-4 h-24 w-24 text-orange-400 opacity-20" />
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="relative z-10">
              <p className="text-purple-100 text-sm font-medium">Last Update</p>
              <h3 className="text-2xl font-bold mt-2">
                {lastUpdateDate ? new Date(lastUpdateDate).toLocaleDateString() : 'N/A'}
              </h3>
              <p className="text-purple-100 text-xs mt-2">
                {lastUpdateDate ? new Date(lastUpdateDate).toLocaleTimeString() : ''}
              </p>
            </div>
            <Clock className="absolute -right-4 -bottom-4 h-24 w-24 text-purple-400 opacity-20" />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <MessageFilter filter={filter} onFilterChange={updateFilter} availableServices={availableServices} />
        </div>

        {/* Messages Table */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Messages</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {messages.length} total • {majorChanges.length} major changes • {actionRequired.length} action required
              </p>
            </div>
          </div>

          {/* Message Cards */}
          <div className="space-y-4">
            {sortMessages.map((message) => {
              const majorChange = isMajorChange(message);
              const actionReq = isActionRequired(message);
              const messageId = message.id || message.Id;
              const messageTitle = message.title || message.Title;
              const messageService = message.service || message.Services?.[0] || 'Microsoft 365';
              const messageSummary = message.summary || '';
              const messageSeverity = message.severity || MessageSeverity.INFORMATIONAL;
              const messagePublishedDate = message.publishedDate || message.StartDateTime || '';
              const messageTags = message.tags || message.Tags || [];
              
              return (
                <Link
                  key={messageId}
                  to={getMessageUrl(messageTitle) || '/'}
                  onClick={() => markAsRead(messageId)}
                  className="block"
                >
                  <div
                    className={`
                      relative bg-white dark:bg-gray-800 rounded-2xl transition-all duration-300 p-6
                      hover:shadow-xl hover:scale-[1.02] cursor-pointer
                      shadow-md border border-gray-100 dark:border-gray-700
                      ${majorChange || actionReq ? 'ring-2 ring-offset-2 dark:ring-offset-gray-900' : ''}
                      ${majorChange && actionReq ? 'ring-red-400' : majorChange ? 'ring-orange-400' : actionReq ? 'ring-red-400' : ''}
                    `}
                  >
                    {/* Priority Bar */}
                    {(majorChange || actionReq) && (
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
                        majorChange && actionReq ? 'bg-gradient-to-b from-orange-500 to-red-500' :
                        majorChange ? 'bg-orange-500' : 
                        'bg-red-500'
                      }`}></div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                            <Layers className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{messageService}</span>
                          </div>
                          
                          {getSeverityBadge(messageSeverity)}
                          
                          {majorChange && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-700 dark:text-orange-400 rounded-lg text-xs font-bold shadow-sm">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Major Change
                            </span>
                          )}
                          
                          {actionReq && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold shadow-sm">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Action Required
                            </span>
                          )}
                        </div>

                        {/* Message ID */}
                        <div className="mb-3">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            ID: {messageId}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                          {messageTitle}
                        </h3>

                        {/* Summary */}
                        <p className="text-base text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                          {messageSummary}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="text-sm">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Published</p>
                                <p className="text-gray-700 dark:text-gray-300 font-semibold">
                                  {messagePublishedDate && new Date(messagePublishedDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            {messageTags.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                  {messageTags.length} tags
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <ExternalLink className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;