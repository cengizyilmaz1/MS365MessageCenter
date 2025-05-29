import React from 'react';
import { MessageCategory, MessageSeverity, Message } from '../types';
import { format, parseISO } from 'date-fns';
import { AlertTriangle, Info, Clock, Wrench, Shield, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MessageCardProps {
  message: Message;
  onMarkAsRead: (id: string) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, onMarkAsRead }) => {
  const handleClick = () => {
    if (!message.isRead) {
      onMarkAsRead(message.id);
    }
  };

  const getCategoryIcon = (category: MessageCategory) => {
    switch (category) {
      case MessageCategory.SERVICE_INCIDENT:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case MessageCategory.PLANNED_MAINTENANCE:
        return <Clock className="h-5 w-5 text-orange-500" />;
      case MessageCategory.FEATURE_UPDATE:
        return <Wrench className="h-5 w-5 text-blue-500" />;
      case MessageCategory.SECURITY_ADVISORY:
        return <Shield className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMessageUrl = (title: string) => {
    return `/message/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  };

  return (
    <Link 
      to={getMessageUrl(message.title)}
      onClick={handleClick}
      className={`block bg-white dark:bg-gray-800 rounded-xl border ${
        message.isRead 
          ? 'border-gray-200 dark:border-gray-700' 
          : 'border-blue-500 dark:border-blue-400'
      } hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="mt-1">
              {getCategoryIcon(message.category)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {message.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{message.service}</span>
                <span>•</span>
                <span>{format(parseISO(message.publishedDate), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              message.severity === 'high' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : message.severity === 'normal'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}>
              {message.severity}
            </span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <p className="mt-4 text-gray-600 dark:text-gray-400 line-clamp-2">
          {message.summary}
        </p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {message.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
            >
              {tag}
            </span>
          ))}
          {message.tags.length > 3 && (
            <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
              +{message.tags.length - 3} more
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MessageCard;