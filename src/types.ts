// Add to existing types
declare global {
  interface Window {
    __INITIAL_MESSAGE__?: any;
    __INITIAL_STATE__?: {
      messages: any[];
      currentMessage: any;
    };
  }
}

export enum MessageSeverity {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  INFORMATIONAL = 'Informational'
}

export enum MessageCategory {
  PLANNED_MAINTENANCE = 'Planned Maintenance',
  SERVICE_INCIDENT = 'Service Incident',
  ANNOUNCEMENT = 'Announcement'
}

export interface MessageFilter {
  searchTerm: string;
  service: string | null;
  category: MessageCategory | null;
  severity: MessageSeverity | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  showRead: boolean;
}

export interface Message {
  // New structure fields
  Id?: string;
  Title?: string;
  Body?: {
    Content?: string;
  };
  Category?: string;
  Severity?: string;
  StartDateTime?: string;
  EndDateTime?: string;
  LastModifiedDateTime?: string;
  Services?: string[];
  Tags?: string[];
  IsMajorChange?: boolean;
  ActionRequiredByDateTime?: string;
  Details?: Array<{
    Name: string;
    Value: string;
  }>;
  HasAttachments?: boolean;
  ViewPoint?: string;
  AdditionalProperties?: Record<string, any>;

  // Legacy fields for compatibility
  id?: string;
  title?: string;
  summary?: string;
  content?: string;
  category?: MessageCategory;
  severity?: MessageSeverity;
  publishedDate?: string;
  lastModifiedDate?: string;
  service?: string;
  tags?: string[];
  affectedWorkloads?: string[];
  isRead?: boolean;
} 