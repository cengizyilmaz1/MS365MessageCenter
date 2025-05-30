export enum MessageSeverity {
  HIGH = 'high',
  MEDIUM = 'medium', 
  LOW = 'low',
  INFORMATIONAL = 'normal'
}

export enum MessageCategory {
  PLANNED_MAINTENANCE = 'planForChange',
  SERVICE_INCIDENT = 'preventOrFixIssue',
  ANNOUNCEMENT = 'stayInformed',
  FEATURE_UPDATE = 'featureUpdate',
  SECURITY_ADVISORY = 'securityAdvisory'
}

export interface MessageDetail {
  Name: string;
  Value: string;
}

export interface MessageBody {
  Content: string;
  ContentType: string;
}

export interface Message {
  Id: string;
  Title: string;
  Body: {
    Content: string;
    ContentType: string;
  };
  Category: string;
  Severity: string;
  StartDateTime: string;
  EndDateTime: string;
  LastModifiedDateTime: string;
  Services: string[];
  Tags: string[];
  IsMajorChange: boolean;
  ActionRequiredByDateTime?: string;
  Details?: any[];
  HasAttachments: boolean;
  ViewPoint?: any;
  AdditionalProperties?: any;
  
  // URL tracking fields
  originalId?: string;         // Original ID to track changes
  originalTitle?: string;      // Original title for stable URLs
  urlSlug?: string;           // Stable URL slug
  
  // Legacy fields for compatibility
  id: string;
  title: string;
  summary: string;
  content: string;
  category: MessageCategory;
  severity: MessageSeverity;
  publishedDate: string;
  lastModifiedDate?: string;
  service: string;
  tags: string[];
  affectedWorkloads?: string[];
  isRead: boolean;
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

export interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}