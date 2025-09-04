import React, { useState } from 'react';
import { trpc } from '../lib/trpc/client';

interface ExportButtonProps {
  conversationId?: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  conversationId, 
  className = '' 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showFormats, setShowFormats] = useState(false);

  const utils = trpc.useUtils();

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      let result;
      
      if (conversationId) {
        result = await utils.export.exportConversation.fetch({
          conversationId,
          format: format as 'markdown' | 'json',
          includeMetadata: true,
          includeTimestamps: true,
          includeCosts: true,
        });
      } else {
        result = await utils.export.exportAll.fetch({
          format: format as 'markdown' | 'json',
          includeMetadata: true,
          includeTimestamps: true,
          includeCosts: true,
          groupByConversation: true,
        });
      }

      // Create and download file
      const blob = new Blob([typeof result.data === 'string' ? result.data : JSON.stringify(result.data)], {
        type: format === 'json' ? 'application/json' : 'text/plain',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${new Date().toISOString().split('T')[0]}.${format === 'markdown' || format === 'obsidian' ? 'md' : format === 'json' ? 'json' : 'html'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowFormats(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowFormats(!showFormats)}
        disabled={isExporting}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? 'Exporting...' : '📤 Export'}
      </button>

      {showFormats && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
          <div className="p-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Export {conversationId ? 'Conversation' : 'All Conversations'}
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => handleExport('markdown')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
              >
                📝 Markdown
              </button>
              <button
                onClick={() => handleExport('obsidian')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
              >
                🔗 Obsidian
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
              >
                📊 JSON
              </button>
              <button
                onClick={() => handleExport('google-docs')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
              >
                📄 Google Docs
              </button>
              <button
                onClick={() => handleExport('notion')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
              >
                📋 Notion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
