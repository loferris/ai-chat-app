import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '../lib/trpc/client';

// Mock tRPC
const mockTrpc = {
  conversations: {
    list: {
      useQuery: vi.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
      })),
    },
    create: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
        isSuccess: false,
        error: null,
      })),
    },
    delete: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
        isSuccess: false,
        error: null,
      })),
    },
  },
  messages: {
    getByConversation: {
      useQuery: vi.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
      })),
    },
  },
  chat: {
    sendMessage: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
        isSuccess: false,
        error: null,
      })),
    },
  },
  usage: {
    getSessionStats: {
      useQuery: vi.fn(() => ({
        data: { totalCost: 0, conversationCount: 0, messageCount: 0 },
        isLoading: false,
        error: null,
      })),
    },
    getModelUsage: {
      useQuery: vi.fn(() => ({
        data: { totalMessages: 0 },
        isLoading: false,
        error: null,
      })),
    },
  },
  useUtils: vi.fn(() => ({
    conversations: {
      list: { invalidate: vi.fn() },
    },
    messages: {
      getByConversation: { invalidate: vi.fn() },
    },
  })),
};

// Mock the trpc module
vi.mock('../lib/trpc/client', () => ({
  trpc: mockTrpc,
}));

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data factories
export const createMockConversation = (overrides = {}) => ({
  id: 'conv-1',
  title: 'Test Conversation',
  model: 'deepseek-chat',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  systemPrompt: 'You are a helpful AI assistant.',
  temperature: 0.7,
  maxTokens: 1000,
  messages: [],
  ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
  id: 'msg-1',
  role: 'user' as const,
  content: 'Hello, how are you?',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  tokens: 10,
  conversationId: 'conv-1',
  parentId: null,
  ...overrides,
});

export const createMockAssistantResponse = (overrides = {}) => ({
  response: 'I am doing well, thank you for asking!',
  model: 'deepseek-chat',
  cost: 0.0001,
  ...overrides,
});

// Mock window functions
export const mockWindowFunctions = () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  // Mock scrollIntoView
  Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
    writable: true,
    value: vi.fn(),
  });

  // Mock confirm
  window.confirm = vi.fn(() => true);

  return localStorageMock;
};

// Export everything
export * from '@testing-library/react';
export { customRender as render };
export { mockTrpc };
