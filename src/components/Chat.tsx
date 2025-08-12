import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import { AssistantService, Message } from '../types';
import { createAssistant } from '../services/assistant';

// Arrow function implementation of useCostTracker hook
const useCostTracker = () => {
  const [cost, setCost] = useState(() => {
    const savedCost = localStorage.getItem('chatCost');
    return savedCost ? parseFloat(savedCost) : 0;
  });

  const [conversations, setConversations] = useState(() => {
    const savedConversations = localStorage.getItem('chatConversations');
    return savedConversations ? parseInt(savedConversations, 10) : 0;
  });

  const trackCost = useCallback((amount: number) => {
    setCost(prev => prev + amount);
    setConversations(prev => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setCost(0);
    setConversations(0);
  }, []);

  useEffect(() => {
    localStorage.setItem('chatCost', cost.toString());
    localStorage.setItem('chatConversations', conversations.toString());
  }, [cost, conversations]);

  return {
    cost,
    conversations,
    trackCost,
    reset
  };
};

const Chat: React.FC = () => {
  // State initialization
  const [assistant, setAssistant] = useState<AssistantService | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'connected' | 'mock'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Refs and hooks
  const inputRef = useRef<HTMLInputElement>(null);
  const { cost, conversations, trackCost, reset: resetCost } = useCostTracker();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize assistant
  useEffect(() => {
    const initAssistant = async () => {
      try {
        const isMock = localStorage.getItem('forceMock') === 'true' ||
        import.meta.env.VITE_USE_MOCK === 'true' ||
        !import.meta.env.VITE_OPENROUTER_API_KEY;

        const instance = createAssistant({
          type: isMock ? 'mock' : 'openrouter',
          apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
          siteName: import.meta.env.VITE_SITE_NAME || 'TeddyBox Chat'
        });

        setAssistant(instance);
        setApiStatus(isMock ? 'mock' : 'connected');
      } catch (err) {
        setError('Failed to initialize assistant');
        console.error('Assistant initialization error:', err);
      }
    };

    initAssistant();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus management
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading, messages]);

  // Generate unique message ID
  const generateMessageId = useCallback((): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add message to conversation
  const addMessage = useCallback((
    role: 'user' | 'assistant',
    content: string,
    model?: string,
    cost?: number
  ): Message => {
    const newMessage: Message = {
      id: generateMessageId(),
                                 role,
                                 content,
                                 timestamp: new Date(),
                                 model,
                                 cost
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage;
  }, [generateMessageId]);

  // Handle sending a message
  const handleSendMessage = async (): Promise<void> => {
    if (!input.trim() || isLoading || !assistant) return;

    try {
      // Add user message
      const userMessage = addMessage('user', input.trim());

      // Clear input and set loading
      setInput('');
      setIsLoading(true);

      // Get response from assistant
      const response = await assistant.getResponse(
        userMessage.content,
        messages
      );

      // Handle different response formats
      if (typeof response === 'string') {
        // MockAssistant response
        addMessage('assistant', response, 'Mock Assistant');
      } else {
        // OpenRouterAssistant response
        const { response: content, model, cost } = response;
        addMessage('assistant', content, model, cost);
        if (cost) trackCost(cost);
      }
    } catch (error) {
      console.error('Assistant error:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
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

  // Toggle between mock and API mode
  const toggleMockMode = () => {
    const newMode = apiStatus === 'connected' ? 'true' : 'false';
    localStorage.setItem('forceMock', newMode);
    window.location.reload();
  };

  // Reset conversation
  const resetConversation = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the conversation?')) {
      setMessages([]);
      resetCost();
    }
  }, [resetCost]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
    {/* Skip navigation link */}
    <a
    href="#chat-input"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:p-4 focus:z-50 focus:rounded-lg focus:shadow-lg"
    >
    Skip to chat input
    </a>

    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
    {/* Status indicator */}
    <div className={`text-xs text-center mb-2 p-1 rounded-full ${
      apiStatus === 'connected'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'
    }`}>
    {apiStatus === 'connected'
      ? 'Connected to OpenRouter API'
  : 'Using Mock Assistant'}

  <button
  onClick={toggleMockMode}
  className="ml-2 underline text-inherit"
  >
  {apiStatus === 'connected' ? 'Switch to Mock' : 'Switch to API'}
  </button>
  </div>

  {/* Header */}
  <header className="mb-6 pt-4">
  <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
  teddybox ✨
  </h1>
  <p className="text-sm text-center text-gray-600 mt-2">
  {apiStatus === 'connected'
    ? 'Powered by OpenRouter API'
  : 'Using local mock service'}
  </p>
  </header>

  {/* Messages Area */}
  <div
  className="flex-1 overflow-y-auto space-y-4 mb-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-100 p-6"
  aria-live="polite"
  aria-atomic="true"
  >
  {messages.length === 0 ? (
    <div className="text-center text-gray-500 py-12">
    <div className="text-6xl mb-4">🌈</div>
    <p className="text-xl font-medium text-gray-700">Welcome to your colorful chat!</p>
    <p className="mt-2 text-gray-500">Start a conversation by typing a message below</p>
    </div>
  ) : (
    <>
    {messages.map((message) => (
      <div
      key={message.id}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
      role={message.role === 'user' ? 'status' : 'complementary'}
      aria-atomic="true"
      >
      <div
      className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
        message.role === 'user'
        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
        : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-800 border border-purple-200'
      }`}
      >
      <div className="whitespace-pre-wrap leading-relaxed">
      {message.content}
      </div>
      <div className="flex justify-between items-center mt-2">
      <div
      className={`text-xs ${
        message.role === 'user' ? 'text-pink-100' : 'text-purple-500'
      }`}
      >
      {formatTime(message.timestamp)}
      {message.model && ` • ${message.model}`}
      </div>
      {message.cost && (
        <div className="text-xs text-purple-300">
        ${message.cost.toFixed(6)}
        </div>
      )}
      </div>
      </div>
      </div>
    ))}

    {/* Loading indicator */}
    {isLoading && (
      <div className="flex justify-start" aria-live="polite">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-purple-200 px-4 py-3 rounded-2xl shadow-sm">
      <div className="flex items-center space-x-3">
      <div className="flex space-x-1">
      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
      <span
      data-testid="loading-indicator"
      className="text-sm text-purple-600"
      >
      Assistant is typing...
      </span>
      <span className="sr-only">Assistant is typing a response</span>
      </div>
      </div>
      </div>
    )}
    <div ref={messagesEndRef} />
    </>
  )}
  </div>

  {/* Input Area */}
  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-100 p-4">
  <div className="flex gap-3">
  <input
  id="chat-input"
  ref={inputRef}
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyPress={handleKeyPress}
  placeholder="Type your message..."
  className="flex-1 px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-gray-800 placeholder-gray-500"
  disabled={isLoading}
  aria-label="Type your message"
  aria-describedby="input-instructions"
  />
  <button
  onClick={handleSendMessage}
  disabled={isLoading || !input.trim()}
  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
  aria-label="Send message"
  >
  {isLoading ? 'Sending...' : 'Send ✨'}
  </button>
  </div>

  <div className="mt-3 flex justify-between items-center">
  <p id="input-instructions" className="text-xs text-purple-500">
  Press Enter to send • {messages.length} message{messages.length !== 1 ? 's' : ''} 💫
  </p>

  <button
  onClick={resetConversation}
  className="text-xs text-red-500 hover:text-red-700"
  >
  Reset Conversation
  </button>
  </div>
  </div>
  </div>

  {/* Cost Tracker */}
  {cost > 0 && (
    <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-md border border-purple-200">
    <div className="text-sm text-gray-600">Session Cost</div>
    <div className="text-lg font-bold text-purple-600">
    ${cost.toFixed(6)}
    </div>
    <div className="text-xs text-gray-500 mt-1">
    ≈ ${(cost * 1000).toFixed(3)} per 1k messages
    </div>
    </div>
  )}

  {/* Error Display */}
  {error && (
    <div className="fixed top-4 right-4 bg-red-100 p-3 rounded-lg shadow-md border border-red-200 max-w-md">
    <div className="font-medium text-red-800">Error</div>
    <div className="text-red-600">{error}</div>
    <button
    onClick={() => setError(null)}
    className="mt-2 text-xs text-red-500 hover:text-red-700"
    >
    Dismiss
    </button>
    </div>
  )}
  </div>
  );
};

export default Chat;
