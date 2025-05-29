import { useState, useEffect, useCallback } from 'react';
import { Message, MessageFilter, MessageCategory, MessageSeverity } from '../types';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

// Map actual values to our enums
const mapSeverity = (severity: string): MessageSeverity => {
  const severityMap: Record<string, MessageSeverity> = {
    'high': MessageSeverity.HIGH,
    'medium': MessageSeverity.MEDIUM,
    'low': MessageSeverity.LOW,
    'normal': MessageSeverity.INFORMATIONAL
  };
  return severityMap[severity.toLowerCase()] || MessageSeverity.INFORMATIONAL;
};

const mapCategory = (category: string): MessageCategory => {
  const categoryMap: Record<string, MessageCategory> = {
    'planforchange': MessageCategory.PLANNED_MAINTENANCE,
    'preventorfixissue': MessageCategory.SERVICE_INCIDENT,
    'stayinformed': MessageCategory.ANNOUNCEMENT
  };
  return categoryMap[category.toLowerCase()] || MessageCategory.ANNOUNCEMENT;
};

// Transform API message to our format
const transformMessage = (apiMessage: any): Message => {
  // Extract summary from Details array
  const summaryDetail = apiMessage.Details?.find((d: any) => d.Name === 'Summary');
  const summary = summaryDetail?.Value || apiMessage.Title;
  
  // Extract platforms from Details array
  const platformsDetail = apiMessage.Details?.find((d: any) => d.Name === 'Platforms');
  const platforms = platformsDetail ? platformsDetail.Value.split(',').map((p: string) => p.trim()) : [];
  
  // Extract roadmap ID from Details array
  const roadmapDetail = apiMessage.Details?.find((d: any) => d.Name === 'RoadmapIds');
  const roadmapId = roadmapDetail?.Value;
  
  // Process tags to include roadmap ID if exists
  const tags = [...(apiMessage.Tags || [])];
  if (roadmapId) {
    tags.push(`Roadmap ID: ${roadmapId}`);
  }

  // Get first service as primary service
  const primaryService = apiMessage.Services?.[0] || 'Microsoft 365';

  return {
    // New structure fields
    Id: apiMessage.Id,
    Title: apiMessage.Title,
    Body: apiMessage.Body,
    Category: apiMessage.Category,
    Severity: apiMessage.Severity,
    StartDateTime: apiMessage.StartDateTime,
    EndDateTime: apiMessage.EndDateTime,
    LastModifiedDateTime: apiMessage.LastModifiedDateTime,
    Services: apiMessage.Services || [],
    Tags: apiMessage.Tags || [],
    IsMajorChange: apiMessage.IsMajorChange || false,
    ActionRequiredByDateTime: apiMessage.ActionRequiredByDateTime,
    Details: apiMessage.Details,
    HasAttachments: apiMessage.HasAttachments || false,
    ViewPoint: apiMessage.ViewPoint,
    AdditionalProperties: apiMessage.AdditionalProperties,
    
    // Legacy fields for compatibility
    id: apiMessage.Id,
    title: apiMessage.Title,
    summary: summary,
    content: apiMessage.Body?.Content || '',
    category: mapCategory(apiMessage.Category),
    severity: mapSeverity(apiMessage.Severity),
    publishedDate: apiMessage.StartDateTime,
    lastModifiedDate: apiMessage.LastModifiedDateTime,
    service: primaryService,
    tags: tags,
    affectedWorkloads: platforms.length > 0 ? platforms : apiMessage.Services || [],
    isRead: false
  };
};

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MessageFilter>({
    searchTerm: '',
    service: null,
    category: null,
    severity: null,
    dateRange: {
      start: null,
      end: null,
    },
    showRead: true,
  });

  // Load read status from localStorage
  const loadReadStatus = useCallback(() => {
    const storedReadStatus = localStorage.getItem('readMessages');
    return storedReadStatus ? JSON.parse(storedReadStatus) : {};
  }, []);

  // Save read status to localStorage
  const saveReadStatus = useCallback((readStatus: Record<string, boolean>) => {
    localStorage.setItem('readMessages', JSON.stringify(readStatus));
  }, []);

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch from the JSON file
      const response = await fetch('/@data/messages.json');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      const readStatus = loadReadStatus();
      
      // Transform and set read status
      const transformedMessages = data.map((msg: any) => {
        const transformed = transformMessage(msg);
        const messageId = transformed.id || transformed.Id;
        if (messageId) {
          transformed.isRead = readStatus[messageId] || false;
        }
        return transformed;
      });
      
      setMessages(transformedMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [loadReadStatus]);

  // Mark message as read
  const markAsRead = useCallback((messageId: string) => {
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.map(msg =>
        (msg.id || msg.Id) === messageId ? { ...msg, isRead: true } : msg
      );
      
      // Update localStorage
      const readStatus = updatedMessages.reduce((acc, msg) => ({
        ...acc,
        [msg.id || msg.Id]: msg.isRead
      }), {});
      saveReadStatus(readStatus);
      
      return updatedMessages;
    });
  }, [saveReadStatus]);

  // Update filter
  const updateFilter = useCallback((newFilter: Partial<MessageFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  // Filter messages
  const filteredMessages = messages.filter(message => {
    // Search filter
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      const title = message.title || message.Title || '';
      const summary = message.summary || '';
      const content = message.content || message.Body?.Content || '';
      const tags = message.tags || message.Tags || [];
      const service = message.service || message.Services?.[0] || '';
      
      const matchesSearch = 
        title.toLowerCase().includes(searchLower) ||
        summary.toLowerCase().includes(searchLower) ||
        content.toLowerCase().includes(searchLower) ||
        tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        service.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Service filter
    if (filter.service && message.service !== filter.service) {
      return false;
    }

    // Category filter
    if (filter.category && message.category !== filter.category) {
      return false;
    }

    // Severity filter
    if (filter.severity && message.severity !== filter.severity) {
      return false;
    }

    // Date range filter
    if (filter.dateRange.start || filter.dateRange.end) {
      const dateString = message.publishedDate || message.StartDateTime;
      if (!dateString) return false;
      
      const messageDate = new Date(dateString);
      if (filter.dateRange.start && messageDate < filter.dateRange.start) {
        return false;
      }
      if (filter.dateRange.end && messageDate > filter.dateRange.end) {
        return false;
      }
    }

    // Read status filter
    if (!filter.showRead && message.isRead) {
      return false;
    }

    return true;
  });

  // Get unique services for filter
  const availableServices = [...new Set(messages.map(msg => msg.service || msg.Services?.[0] || 'Microsoft 365'))];

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages: filteredMessages,
    loading,
    error,
    markAsRead,
    filter,
    updateFilter,
    refetch: fetchMessages,
    availableServices
  };
};