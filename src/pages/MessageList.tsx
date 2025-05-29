import React from 'react';
import { useMessages } from '../hooks/useMessages';
import MessageCard from '../components/MessageCard';
import MessageFilter from '../components/MessageFilter';
import { Loader, AlertTriangle, Inbox } from 'lucide-react';

const MessageList: React.FC = () => {
  const { 
    messages, 
    loading, 
    error, 
    filter, 
    updateFilter, 
    markAsRead,
    availableServices 
  } = useMessages();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Error Loading Messages</h3>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All Messages</h1>
      
      <div className="mb-6">
        <MessageFilter 
          filter={filter}
          onFilterChange={updateFilter}
          availableServices={availableServices}
        />
      </div>
      
      {messages.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {messages.map((message) => (
            <MessageCard 
              key={message.id} 
              message={message} 
              onMarkAsRead={markAsRead} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Inbox className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No messages found</h3>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Try adjusting your filters to see more results.
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageList;