import { useState } from 'react';

export default function FeedCard({ feed }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        {/* Title + Date */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{feed.title}</h3>
          <span className="text-xs text-gray-400">
            {feed.created_date
              ? new Date(feed.created_date).toLocaleDateString()
              : ''}
          </span>
        </div>

        {/* Content */}
        <p className={`text-gray-600 ${!isExpanded && 'line-clamp-3'}`}>
          {feed.content}
        </p>

        {feed.content.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 text-sm mt-2 hover:text-blue-700"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Author + Time */}
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>{feed.author}</span>
          <span className="mx-2">•</span>
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {feed.created_date
              ? new Date(feed.created_date).toLocaleTimeString()
              : ''}
          </span>
        </div>

        {/* Modified Date */}
        {feed.modified_date && (
          <p className="mt-2 text-xs text-gray-400">
            Last updated: {new Date(feed.modified_date).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
