// src/components/chat/Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { trpc } from '../../lib/trpc/client';
import { format } from 'date-fns';
import { ExportButton } from '../ExportButton';
import { DemoBanner } from '../DemoBanner';

export const Chat: React.FC = () => {
  // State initialization
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // tRPC hooks
  const utils = trpc.useUtils();

  // Get conversations
  const { 
    data: conversations = [], 
    isLoading: conversationsLoading,
    error: conversationsError 
  } = trpc.conversations.list.useQuery();

  // Get current conversation messages
  const { 
    data: messages = [], 
    isLoading: messagesLoading,
    error: messagesError 
  } = trpc.messages.getByConversation.useQuery(
    { conversationId: currentConversationId || '' },
    { enabled: !!currentConversationId },
  );

  // Create conversation mutation
  const createConversationMutation = trpc.conversations.create.useMutation({
    onSuccess: (data) => {
      console.log('Conversation created successfully:', data);
      setCurrentConversationId(data.id);
      setError(null);
      utils.conversations.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to create conversation:', error);
      setError('Failed to create conversation. Please try again.');
    },
  });

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setError(null);
      utils.messages.getByConversation.invalidate();
      utils.conversations.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    },
  });

  // Delete conversation mutation
  const deleteConversationMutation = trpc.conversations.delete.useMutation({
    onSuccess: () => {
      setError(null);
      utils.conversations.list.invalidate();
      if (currentConversationId === conversations[0]?.id) {
        const nextConversation = conversations.find((c) => c.id !== currentConversationId);
        setCurrentConversationId(nextConversation?.id || null);
      }
    },
    onError: (error) => {
      console.error('Failed to delete conversation:', error);
      setError('Failed to delete conversation. Please try again.');
    },
  });

  // Debug logging
  useEffect(() => {
    console.log('Conversation state:', {
      conversationsCount: Array.isArray(conversations) ? conversations.length : 'not array',
      currentConversationId,
      isCreating: createConversationMutation.isPending,
      createSuccess: createConversationMutation.isSuccess,
      createError: createConversationMutation.error,
    });
  }, [conversations, currentConversationId, createConversationMutation]);

  // Auto-create first conversation on app load
  useEffect(() => {
    console.log('Checking conversation creation:', {
      hasConversations: Array.isArray(conversations) && conversations.length > 0,
      currentConversationId,
      isPending: createConversationMutation.isPending,
      isSuccess: createConversationMutation.isSuccess,
    });

    // Only try to create if we don't have a conversation and aren't creating one
    if (
      !currentConversationId &&
      Array.isArray(conversations) &&
      conversations.length === 0 &&
      !createConversationMutation.isPending
    ) {
      console.log('Attempting to create conversation');
      createConversationMutation.mutate();
    }
    // Set current conversation if we have conversations but no current one
    else if (
      !currentConversationId &&
      Array.isArray(conversations) &&
      conversations.length > 0 &&
      !createConversationMutation.isPending
    ) {
      console.log('Setting current conversation to first conversation');
      setCurrentConversationId(conversations[0].id);
    }
  }, [
    conversations.length,
    currentConversationId,
    createConversationMutation.isPending,
  ]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus management
  useEffect(() => {
    if (inputRef.current && !isLoading && !createConversationMutation.isPending) {
      inputRef.current.focus();
    }
  }, [isLoading, createConversationMutation.isPending]);

  // Check if conversation is ready for messaging
  const isConversationReady = currentConversationId || createConversationMutation.isSuccess;

  // Handle sending a message
  const handleSendMessage = async () => {
    console.log('Send button clicked', {
      input,
      isLoading,
      currentConversationId,
      hasInput: !!input.trim(),
      canSend: !isLoading && !!input.trim() && isConversationReady,
    });

    if (!input.trim() || isLoading || !isConversationReady) {
      console.log('Send blocked:', {
        noInput: !input.trim(),
        loading: isLoading,
        noConversation: !isConversationReady,
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Sending message:', {
        content: input.trim(),
        conversationId: currentConversationId,
      });

      if (!currentConversationId) {
        setError('No conversation selected. Please create a conversation first.');
        return;
      }

      await sendMessageMutation.mutateAsync({
        content: input.trim(),
        conversationId: currentConversationId,
      });

      console.log('Message sent successfully');
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Reset conversation (clear current conversation messages)
  const resetConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation? This will remove all messages but keep the conversation.')) {
      setInput('');
      setError(null);
      // Clear the current conversation by setting it to null
      setCurrentConversationId(null);
    }
  };

  // Create new conversation
  const handleNewConversation = () => {
    setInput('');
    setError(null);
    createConversationMutation.mutate();
  };

  // Select conversation
  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setInput('');
    setError(null);
  };

  // Delete conversation
  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversationMutation.mutate(conversationId);
    }
  };

  // Dismiss error
  const dismissError = () => {
    setError(null);
  };

  return (
    <>
      {/* Demo Banner */}
      <DemoBanner />
      
      <div className='min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex'>
        {/* Skip navigation link */}
        <a
          href='#chat-input'
          className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:p-4 focus:z-50 focus:rounded-lg focus:shadow-lg'
        >
          Skip to chat input
        </a>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className='w-64 bg-white/90 backdrop-blur-sm shadow-lg border-r border-pink-100 flex flex-col h-screen'>
          <div className='p-4 border-b border-pink-100'>
            <button
              onClick={handleNewConversation}
              disabled={createConversationMutation.isPending}
              className='w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md'
            >
              {createConversationMutation.isPending ? 'Creating...' : '+ New Chat'}
            </button>
            <div className="mt-2">
              <ExportButton className="w-full" />
            </div>
          </div>

          <div className='flex-1 overflow-y-auto p-2'>
            <h3 className='text-sm font-semibold text-gray-600 px-2 py-2'>Recent Conversations</h3>
            <div className='space-y-1'>
              {createConversationMutation.isPending ? (
                <div className='text-center text-gray-500 py-4'>Creating new conversation...</div>
              ) : conversationsLoading ? (
                <div className='text-center text-gray-500 py-4'>Loading...</div>
              ) : conversationsError ? (
                <div className='text-center text-red-500 py-4'>Failed to load conversations</div>
              ) : Array.isArray(conversations) && conversations.length > 0 ? (
                conversations
                  .slice()
                  .reverse()
                  .map((conversation) => (
                    <div key={conversation.id} className='flex items-center'>
                      <button
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`flex-1 text-left p-3 rounded-lg transition-all duration-200 ${
                          currentConversationId === conversation.id
                            ? 'bg-purple-100 border border-purple-200'
                            : 'hover:bg-pink-50'
                        }`}
                      >
                        <div className='font-medium text-gray-800 truncate text-sm'>
                          {conversation.title || 'New Conversation'}
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                          {format(new Date(conversation.updatedAt), 'MMM d, h:mm a')}
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        className='p-2 text-gray-400 hover:text-red-500 ml-1'
                        aria-label='Delete conversation'
                      >
                        ×
                      </button>
                    </div>
                  ))
              ) : (
                <div className='text-center text-gray-500 py-4'>No conversations found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col'>
        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className='absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md border border-pink-100'
        >
          {sidebarOpen ? '←' : '→'}
        </button>

        <div className='max-w-4xl mx-auto p-4 h-screen flex flex-col'>
          {/* Header */}
          <header className='mb-6 pt-4'>
            <h1 className='text-3xl font-bold text-center bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
              teddybox ✨
            </h1>
            <p className='text-sm text-center text-gray-600 mt-2'>Powered by Next.js + tRPC</p>
          </header>

          {/* Messages Area */}
          <div
            className='flex-1 overflow-y-auto space-y-4 mb-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-100 p-6'
            aria-live='polite'
            aria-atomic='true'
            role='status'
          >
            {createConversationMutation.isPending ? (
              <div className='text-center text-gray-500 py-12'>
                <div className='text-6xl mb-4'>✨</div>
                <p className='text-xl font-medium text-gray-700'>Creating your conversation...</p>
              </div>
            ) : messagesLoading ? (
              <div className='text-center text-gray-500 py-12'>
                <div className='text-6xl mb-4'>🌈</div>
                <p className='text-xl font-medium text-gray-700'>Loading your conversation...</p>
              </div>
            ) : messagesError ? (
              <div className='text-center text-red-500 py-12'>
                <div className='text-6xl mb-4'>⚠️</div>
                <p className='text-xl font-medium text-red-700'>Failed to load messages</p>
                <p className='mt-2 text-red-500'>Please try refreshing the page</p>
              </div>
            ) : Array.isArray(messages) && messages.length === 0 ? (
              <div className='text-center text-gray-500 py-12'>
                <div className='text-6xl mb-4'>🌈</div>
                <p className='text-xl font-medium text-gray-700'>Welcome to your colorful chat!</p>
                <p className='mt-2 text-gray-500'>Start a conversation by typing a message below</p>
              </div>
            ) : Array.isArray(messages) ? (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    role={message.role === 'user' ? 'status' : 'complementary'}
                    aria-atomic='true'
                  >
                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                          : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-800 border border-purple-200'
                      }`}
                    >
                      <div className='whitespace-pre-wrap leading-relaxed'>{message.content}</div>
                      <div className='flex justify-between items-center mt-2'>
                        <div
                          className={`text-xs ${
                            message.role === 'user' ? 'text-pink-100' : 'text-purple-500'
                          }`}
                        >
                          {formatTime(new Date(message.createdAt))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className='flex justify-start' aria-live='polite'>
                    <div className='bg-gradient-to-r from-indigo-50 to-purple-50 border border-purple-200 px-4 py-3 rounded-2xl shadow-sm'>
                      <div className='flex items-center space-x-3'>
                        <div className='flex space-x-1'>
                          <div className='w-2 h-2 bg-pink-400 rounded-full animate-bounce'></div>
                          <div
                            className='w-2 h-2 bg-purple-400 rounded-full animate-bounce'
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className='w-2 h-2 bg-indigo-400 rounded-full animate-bounce'
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                        </div>
                        <span data-testid='loading-indicator' className='text-sm text-purple-600'>
                          Assistant is typing...
                        </span>
                        <span className='sr-only'>Assistant is typing a response</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className='text-center text-gray-500 py-12'>
                <div className='text-6xl mb-4'>🌈</div>
                <p className='text-xl font-medium text-gray-700'>Welcome to your colorful chat!</p>
                <p className='mt-2 text-gray-500'>Start a conversation by typing a message below</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className='bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-100 p-4'>
            <div className='flex gap-3'>
              <input
                id='chat-input'
                ref={inputRef}
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Type your message...'
                className='flex-1 px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-gray-800 placeholder-gray-500'
                disabled={isLoading || createConversationMutation.isPending}
                aria-label='Type your message'
                aria-describedby='input-instructions'
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim() || !isConversationReady}
                className='px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg'
                aria-label='Send message'
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-pulse">Sending</span>
                    <span className="ml-1">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                    </span>
                  </span>
                ) : (
                  'Send ✨'
                )}
              </button>
            </div>

            <div className='mt-3 flex justify-between items-center'>
              <p id='input-instructions' className='text-xs text-purple-500'>
                Press Enter to send • {Array.isArray(messages) ? messages.length : 0} message
                {Array.isArray(messages) && messages.length !== 1 ? 's' : ''} 💫
              </p>

              <button
                onClick={resetConversation}
                className='text-xs text-red-500 hover:text-red-700'
              >
                Reset Conversation
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className='fixed top-4 right-4 bg-red-100 p-3 rounded-lg shadow-md border border-red-200 max-w-md z-50'>
            <div className='font-medium text-red-800'>Error</div>
            <div className='text-red-600'>{error}</div>
            <button
              onClick={dismissError}
              className='mt-2 text-xs text-red-500 hover:text-red-700'
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
