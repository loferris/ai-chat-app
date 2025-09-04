import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockWindowFunctions } from '../../test/utils';
import { Chat } from '../../components/chat/Chat';
import { mockDataScenarios } from './realistic-mocks';

// Mock the tRPC module at the top level for E2E testing
const mockCreateMutation = vi.fn();
const mockDeleteMutation = vi.fn();
const mockSendMessageMutation = vi.fn();

vi.mock('../../lib/trpc/client', () => ({
  trpc: {
    useUtils: vi.fn(() => ({
      conversations: {
        list: {
          invalidate: vi.fn(),
        },
      },
      messages: {
        getByConversation: {
          invalidate: vi.fn(),
        },
      },
    })),
    conversations: {
      list: {
        useQuery: vi.fn(() => ({
          data: mockDataScenarios.empty.conversations,
          isLoading: false,
          error: null,
        })),
      },
      create: {
        useMutation: vi.fn(() => ({
          mutate: mockCreateMutation,
          mutateAsync: vi.fn(),
          isPending: false,
          isSuccess: false,
          error: null,
        })),
      },
      delete: {
        useMutation: vi.fn(() => ({
          mutate: mockDeleteMutation,
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
          data: mockDataScenarios.empty.messages,
          isLoading: false,
          error: null,
        })),
      },
    },
    chat: {
      sendMessage: {
        useMutation: vi.fn(() => ({
          mutate: mockSendMessageMutation,
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
          data: mockDataScenarios.empty.usageStats,
          isLoading: false,
          error: null,
        })),
      },
    },
  },
}));

describe('Chat Component - E2E Tests', () => {
  const user = userEvent.setup();
  let localStorageMock: ReturnType<typeof mockWindowFunctions>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock = mockWindowFunctions();
    
    // Mock the create mutation to prevent act() warnings
    mockCreateMutation.mockImplementation(() => {
      // Do nothing - this prevents the actual mutation from running
      // which would trigger state updates and cause act() warnings
    });
  });

  describe('UI Rendering & Layout', () => {
    it('renders the complete chat interface with all UI elements', async () => {
      await act(async () => {
        render(<Chat />);
      });

      // 1. Header elements
      expect(screen.getByText(/teddybox/)).toBeInTheDocument();
      expect(screen.getByText(/Powered by Next.js \+ tRPC/)).toBeInTheDocument();

      // 2. Sidebar elements
      expect(screen.getByText(/Recent Conversations/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /\+ New Chat/ })).toBeInTheDocument();
      expect(screen.getByText(/No conversations found/)).toBeInTheDocument();

      // 3. Main chat area
      expect(screen.getByText(/Welcome to your colorful chat/)).toBeInTheDocument();
      expect(screen.getByText(/Start a conversation by typing a message below/)).toBeInTheDocument();

      // 4. Input area
      expect(screen.getByPlaceholderText(/Type your message/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send/ })).toBeInTheDocument();
      expect(screen.getByText(/Press Enter to send/)).toBeInTheDocument();
      expect(screen.getByText(/0 message/)).toBeInTheDocument();

      // 5. Sidebar toggle
      expect(screen.getByRole('button', { name: /←/ })).toBeInTheDocument();
    });

    it('maintains proper layout structure and styling classes', async () => {
      await act(async () => {
        render(<Chat />);
      });

      // Check for main layout classes
      const mainContainer = document.querySelector('.min-h-screen');

      expect(mainContainer).toBeInTheDocument();

      // Check for sidebar
      const sidebar = screen.getByText(/Recent Conversations/).closest('div');
      expect(sidebar).toHaveClass('flex-1', 'overflow-y-auto', 'p-2');

      // Check for main content area
      const mainContent = screen.getByText(/Welcome to your colorful chat/).closest('div');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('User Interactions & Accessibility', () => {
    it('handles input interactions correctly', async () => {
      await act(async () => {
        render(<Chat />);
      });

      const input = screen.getByPlaceholderText(/Type your message/);
      const sendButton = screen.getByRole('button', { name: /Send/ });

      // Initially disabled (no conversation exists)
      expect(sendButton).toBeDisabled();

      // Type text - button should still be disabled without a conversation
      await user.type(input, 'Hello, world!');
      expect(input).toHaveValue('Hello, world!');
      expect(sendButton).toBeDisabled(); // Still disabled because no conversation exists

      // Clear text
      await user.clear(input);
      expect(input).toHaveValue('');
      expect(sendButton).toBeDisabled();

      // Type again
      await user.type(input, 'Test message');
      expect(input).toHaveValue('Test message');
      expect(sendButton).toBeDisabled(); // Still disabled because no conversation exists
    });

    it('provides proper keyboard navigation and accessibility', async () => {
      await act(async () => {
        render(<Chat />);
      });

      // 1. Skip navigation link
      const skipLink = screen.getByText(/Skip to chat input/);
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#chat-input');

      // 2. Input accessibility
      const input = screen.getByPlaceholderText(/Type your message/);
      expect(input).toHaveAttribute('aria-label', 'Type your message');
      expect(input).toHaveAttribute('aria-describedby', 'input-instructions');

      // 3. Send button accessibility
      const sendButton = screen.getByRole('button', { name: /Send/ });
      expect(sendButton).toHaveAttribute('aria-label', 'Send message');

      // 4. Instructions
      const instructions = screen.getByText(/Press Enter to send/);
      expect(instructions).toBeInTheDocument();
      expect(instructions).toHaveAttribute('id', 'input-instructions');
    });

    it('handles sidebar toggle functionality', async () => {
      await act(async () => {
        render(<Chat />);
      });

      const toggleButton = screen.getByRole('button', { name: /←/ });
      const sidebar = screen.getByText(/Recent Conversations/);

      // Initially visible
      expect(sidebar).toBeInTheDocument();

      // Toggle to hide
      await user.click(toggleButton);
      expect(screen.queryByText(/Recent Conversations/)).not.toBeInTheDocument();

      // Toggle to show
      await user.click(toggleButton);
      expect(screen.getByText(/Recent Conversations/)).toBeInTheDocument();
    });

    it('supports Enter key for sending messages', async () => {
      await act(async () => {
        render(<Chat />);
      });

      const input = screen.getByPlaceholderText(/Type your message/);
      
      // Type and press Enter
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');

      // Should maintain focus and value (since we're not actually sending)
      expect(input).toHaveFocus();
      expect(input).toHaveValue('Test message');
    });
  });

  describe('Responsive Design & UI States', () => {
    it('displays proper empty states and welcome messages', async () => {
      await act(async () => {
        render(<Chat />);
      });

      // Empty conversation state
      expect(screen.getByText(/No conversations found/)).toBeInTheDocument();

      // Welcome message
      expect(screen.getByText(/Welcome to your colorful chat/)).toBeInTheDocument();
      expect(screen.getByText(/Start a conversation by typing a message below/)).toBeInTheDocument();

      // Emoji decoration
      expect(screen.getByText('🌈')).toBeInTheDocument();

      // Usage stats
      expect(screen.getByText(/0 message/)).toBeInTheDocument();
    });

    it('shows proper button states and interactions', async () => {
      await act(async () => {
        render(<Chat />);
      });

      const newChatButton = screen.getByRole('button', { name: /\+ New Chat/ });
      const sendButton = screen.getByRole('button', { name: /Send/ });
      const toggleButton = screen.getByRole('button', { name: /←/ });

      // All buttons should be present and enabled
      expect(newChatButton).toBeInTheDocument();
      expect(newChatButton).not.toBeDisabled();
      expect(sendButton).toBeInTheDocument();
      expect(sendButton).toBeDisabled(); // Initially disabled
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).not.toBeDisabled();

      // Check button styling classes
      expect(newChatButton).toHaveClass('bg-gradient-to-r');
      expect(sendButton).toHaveClass('bg-gradient-to-r');
    });

    it('maintains consistent visual hierarchy and spacing', async () => {
      await act(async () => {
        render(<Chat />);
      });

      // Header spacing
      const header = screen.getByText(/teddybox/).closest('header');
      expect(header).toHaveClass('mb-6', 'pt-4');

      // Main content spacing
      const mainContent = screen.getByText(/Welcome to your colorful chat/).closest('div');
      expect(mainContent).toHaveClass('text-center', 'text-gray-500', 'py-12');

      // Input area spacing
      const inputArea = screen.getByPlaceholderText(/Type your message/).closest('div');
      expect(inputArea).toHaveClass('flex', 'gap-3');
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('gracefully handles empty data states', async () => {
      await act(async () => {
        render(<Chat />);
      });

      // Should show empty state without crashing
      expect(screen.getByText(/No conversations found/)).toBeInTheDocument();
      expect(screen.getByText(/Welcome to your colorful chat/)).toBeInTheDocument();

      // Should show proper counts
      expect(screen.getByText(/0 message/)).toBeInTheDocument();

      // Should maintain functionality
      const input = screen.getByPlaceholderText(/Type your message/);
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('');
    });

    it('maintains UI consistency during user interactions', async () => {
      await act(async () => {
        render(<Chat />);
      });

      // Rapid interactions
      const input = screen.getByPlaceholderText(/Type your message/);
      const toggleButton = screen.getByRole('button', { name: /←/ });

      // Type quickly
      await user.type(input, 'Message 1');
      await user.clear(input);
      await user.type(input, 'Message 2');
      await user.clear(input);
      await user.type(input, 'Message 3');

      // Should maintain state
      expect(input).toHaveValue('Message 3');

      // Toggle sidebar rapidly
      await user.click(toggleButton);
      await user.click(toggleButton);
      await user.click(toggleButton);

      // Should maintain final state
      expect(screen.queryByText(/Recent Conversations/)).not.toBeInTheDocument();
    });
  });

  describe('Performance & User Experience', () => {
    it('renders quickly and provides immediate feedback', async () => {
      const startTime = performance.now();
      
      await act(async () => {
        render(<Chat />);
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000); // 1 second

      // Should show content immediately
      expect(screen.getByText(/teddybox/)).toBeInTheDocument();
      expect(screen.getByText(/Welcome to your colorful chat/)).toBeInTheDocument();
    });

    it('provides smooth user interactions', async () => {
      await act(async () => {
        render(<Chat />);
      });

      const input = screen.getByPlaceholderText(/Type your message/);
      const toggleButton = screen.getByRole('button', { name: /←/ });

      // Test smooth typing
      await user.type(input, 'This is a test message to check typing performance');
      expect(input).toHaveValue('This is a test message to check typing performance');

      // Test smooth sidebar toggle
      await user.click(toggleButton);
      expect(screen.queryByText(/Recent Conversations/)).not.toBeInTheDocument();
      
      await user.click(toggleButton);
      expect(screen.getByText(/Recent Conversations/)).toBeInTheDocument();
    });

    it('maintains responsive design principles', async () => {
      await act(async () => {
        render(<Chat />);
      });

      // Check for responsive classes
      const mainContainer = document.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('flex');

      // Check for proper flexbox layout
      const sidebar = screen.getByText(/Recent Conversations/).closest('div');
      expect(sidebar).toHaveClass('flex-1', 'overflow-y-auto', 'p-2');

      // Check for proper overflow handling
      const mainContent = screen.getByText(/Welcome to your colorful chat/).closest('div');
      expect(mainContent).toHaveClass('text-center', 'text-gray-500', 'py-12');
    });
  });
});