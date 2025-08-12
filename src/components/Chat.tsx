// components/Chat.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AssistantService, Message, Conversation } from '../types';
import { createAssistant } from '../services/assistant';
import { useConversationStore } from './hooks/useConversationStore';
import { format } from 'date-fns';

// Arrow function implementation of useCostTracker hook
const useCostTracker = () => {
  const [cost, setCost] = useState(() => {
    const savedCost = localStorage.getItem('chatCost');
    return savedCost ? parseFloat(savedCost) : 0;
  });

  const [conversationCount, setConversationCount] = useState(() => {
    const savedCount = localStorage.getItem('chatConversationCount');
    return savedCount ? parseInt(savedCount, 10) : 0;
  });

  const trackCost = useCallback((amount: number) => {
    setCost((prev) => prev + amount);
    setConversationCount((prev) => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setCost(0);
    setConversationCount(0);
  }, []);

  useEffect(() => {
    localStorage.setItem('chatCost', cost.toString());
    localStorage.setItem('chatConversationCount', conversationCount.toString());
  }, [cost, conversationCount]);

  return {
    cost,
    conversations: conversationCount,
    trackCost,
    reset,
  };
};

const Chat: React.FC = () => {
  // State initialization
  const [assistant, setAssistant] = useState<AssistantService | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'connected' | 'mock'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Refs and hooks
  const inputRef = useRef<HTMLInputElement>(null);
  const { cost, trackCost, reset: resetCost } = useCostTracker();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Conversation store
  const {
    conversations: allConversations,
    currentConversation,
    createNewConversation,
    updateConversationMessages,
    setCurrentConversation,
  } = useConversationStore();

  // Get messages from current conversation
  const messages = currentConversation?.messages || [];

  // Initialize assistant - simplified to use environment variable only
  useEffect(() => {
    const initAssistant = async () => {
      try {
        // Use environment variable only - no localStorage override
        const isMock =
          import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_OPENROUTER_API_KEY;

        const instance = createAssistant({
          type: isMock ? 'mock' : 'openrouter',
          apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
          siteName: import.meta.env.VITE_SITE_NAME || 'TeddyBox Chat',
        });

        setAssistant(instance);
        setApiStatus(isMock ? 'mock' : 'connected');
      } catch (err) {
        setError('Failed to initialize assistant');
        console.error('Assistant initialization error:', err);
      }
    };

    initAssistant();
  }, []); // Only run once on mount

  // Auto-create first conversation on app load
  useEffect(() => {
    if (allConversations.length === 0 && !currentConversation) {
      console.log('Creating initial conversation');
      const newConversation = createNewConversation();
      setCurrentConversation(newConversation);
    }
  }, [allConversations.length, currentConversation, createNewConversation, setCurrentConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus management
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Generate unique message ID
  const generateMessageId = useCallback((): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Handle sending a message
  const handleSendMessage = async (): Promise<void> => {
    console.log('handleSendMessage called with input:', input);

    if (!input.trim() || isLoading || !assistant) {
      console.log('Early return - input empty or loading/assistant not ready');
      return;
    }

    try {
      // Ensure we have a conversation
      let conversation = currentConversation;
      if (!conversation) {
        console.log('Creating new conversation');
        conversation = createNewConversation();
      }

      // Create user message
      const userMessage: Message = {
        id: generateMessageId(),
        role: 'user',
        content: input.trim(),
        timestamp: new Date(),
      };

      // Update conversation with user message
      const updatedMessages = [...messages, userMessage];
      updateConversationMessages(conversation.id, updatedMessages);

      // Clear input and set loading
      setInput('');
      setIsLoading(true);

      // Get response from assistant
      console.log('Calling assistant.getResponse with messages:', updatedMessages);
      const response = await assistant.getResponse(userMessage.content, updatedMessages);

      console.log('Received response from assistant:', response);

      // Create assistant message
      let assistantMessage: Message;

      if (typeof response === 'string') {
        // MockAssistant response
        console.log('Handling mock response');
        assistantMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          model: 'Mock Assistant',
        };
      } else {
        // OpenRouterAssistant response
        console.log('Handling API response');
        const { response: content, model, cost } = response;
        assistantMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content,
          timestamp: new Date(),
          model,
          cost,
        };

        if (cost) trackCost(cost);
      }

      // Update conversation with assistant message
      const finalMessages = [...updatedMessages, assistantMessage];
      updateConversationMessages(conversation.id, finalMessages);
    } catch (error) {
      console.error('Assistant error:', error);

      // Add error message to conversation
      const errorMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      const errorMessages = [...messages, errorMessage];
      if (currentConversation) {
        updateConversationMessages(currentConversation.id, errorMessages);
      }
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = useCallback((date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Reset conversation
  const resetConversation = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the conversation?')) {
      setInput('');
      resetCost();
      const newConversation = createNewConversation();
      setCurrentConversation(newConversation);
    }
  }, [resetCost, createNewConversation, setCurrentConversation]);

  // Create new conversation
  const handleNewConversation = () => {
    setInput('');
    const newConversation = createNewConversation();
    setCurrentConversation(newConversation);
  };

  // Select conversation
  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setInput('');
  };

  return (
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
              className='w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-md'
            >
              + New Chat
            </button>
          </div>

          <div className='flex-1 overflow-y-auto p-2'>
            <h3 className='text-sm font-semibold text-gray-600 px-2 py-2'>Recent Conversations</h3>
            <div className='space-y-1'>
              {allConversations
                .slice()
                .reverse()
                .map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      currentConversation?.id === conversation.id
                        ? 'bg-purple-100 border border-purple-200'
                        : 'hover:bg-pink-50'
                    }`}
                  >
                    <div className='font-medium text-gray-800 truncate text-sm'>
                      {conversation.title}
                    </div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {format(new Date(conversation.updatedAt), 'MMM d, h:mm a')}
                    </div>
                  </button>
                ))}
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
          {/* Status indicator - simplified */}
          <div
            className={`text-xs text-center mb-2 p-1 rounded-full ${
              apiStatus === 'connected'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {apiStatus === 'connected' ? 'Connected to OpenRouter API' : 'Using Mock Assistant'}
          </div>

          {/* Header */}
          <header className='mb-6 pt-4'>
            <h1 className='text-3xl font-bold text-center bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
              teddybox ✨
            </h1>
            <p className='text-sm text-center text-gray-600 mt-2'>
              {apiStatus === 'connected' ? 'Powered by OpenRouter API' : 'Using local mock service'}
            </p>
          </header>

          {/* Messages Area */}
          <div
            className='flex-1 overflow-y-auto space-y-4 mb-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-100 p-6'
            aria-live='polite'
            aria-atomic='true'
          >
            {messages.length === 0 ? (
              <div className='text-center text-gray-500 py-12'>
                <div className='text-6xl mb-4'>🌈</div>
                <p className='text-xl font-medium text-gray-700'>Welcome to your colorful chat!</p>
                <p className='mt-2 text-gray-500'>Start a conversation by typing a message below</p>
              </div>
            ) : (
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
                          {formatTime(message.timestamp)}
                          {message.model && ` • ${message.model}`}
                        </div>
                        {message.cost && (
                          <div className='text-xs text-purple-300'>${message.cost.toFixed(6)}</div>
                        )}
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
                disabled={isLoading}
                aria-label='Type your message'
                aria-describedby='input-instructions'
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className='px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg'
                aria-label='Send message'
              >
                {isLoading ? 'Sending...' : 'Send ✨'}
              </button>
            </div>

            <div className='mt-3 flex justify-between items-center'>
              <p id='input-instructions' className='text-xs text-purple-500'>
                Press Enter to send • {messages.length} message{messages.length !== 1 ? 's' : ''} 💫
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

        {/* Cost Tracker */}
        {cost > 0 && (
          <div className='fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-md border border-purple-200'>
            <div className='text-sm text-gray-600'>Session Cost</div>
            <div className='text-lg font-bold text-purple-600'>${cost.toFixed(6)}</div>
            <div className='text-xs text-gray-500 mt-1'>
              ≈ ${(cost * 1000).toFixed(3)} per 1k messages
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className='fixed top-4 right-4 bg-red-100 p-3 rounded-lg shadow-md border border-red-200 max-w-md'>
            <div className='font-medium text-red-800'>Error</div>
            <div className='text-red-600'>{error}</div>
            <button
              onClick={() => setError(null)}
              className='mt-2 text-xs text-red-500 hover:text-red-700'
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
