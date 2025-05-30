import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (
      type: string,
      action: string,
      parameters?: {
        page_path?: string;
        page_title?: string;
        [key: string]: any;
      }
    ) => void;
  }
}

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', 'G-E6HR73GY9H', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  // Track custom events
  const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  // Track message views
  const trackMessageView = (messageId: string, messageTitle: string) => {
    trackEvent('view_message', 'engagement', messageTitle);
    
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_title: `Message: ${messageTitle}`,
        message_id: messageId,
      });
    }
  };

  // Track filter usage
  const trackFilterUsage = (filterType: string, filterValue: string) => {
    trackEvent('use_filter', 'engagement', `${filterType}: ${filterValue}`);
  };

  // Track search
  const trackSearch = (searchTerm: string, resultsCount: number) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'search', {
        search_term: searchTerm,
        results_count: resultsCount,
      });
    }
  };

  // Track external link clicks
  const trackExternalLink = (url: string, linkType: string) => {
    trackEvent('click_external_link', 'engagement', url);
    
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'click', {
        link_url: url,
        link_type: linkType,
        outbound: true,
      });
    }
  };

  // Track downloads
  const trackDownload = (fileName: string) => {
    trackEvent('download', 'engagement', fileName);
  };

  return {
    trackEvent,
    trackMessageView,
    trackFilterUsage,
    trackSearch,
    trackExternalLink,
    trackDownload,
  };
}; 