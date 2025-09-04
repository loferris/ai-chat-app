import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockWindowFunctions } from '../../../test/utils';
import { Chat } from '../Chat';

// Mock the tRPC module at the top level for basic functionality
vi.mock('../../../lib/trpc/client', () => ({
  trpc: {
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
  },
}));

describe('Chat Component', () => {
  let localStorageMock: ReturnType<typeof mockWindowFunctions>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock = mockWindowFunctions();
  });

  describe('Initial Render', () => {
    it('renders chat interface correctly', () => {
      render(<Chat />);

      expect(screen.getByText(/teddybox/)).toBeInTheDocument();
      expect(screen.getByText(/Powered by Next.js \+ tRPC/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Type your message/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send/ })).toBeInTheDocument();
    });

    it('displays welcome message when no messages exist', () => {
      render(<Chat />);

      expect(screen.getByText(/Welcome to your colorful chat/)).toBeInTheDocument();
      expect(screen.getByText(/Start a conversation by typing a message below/)).toBeInTheDocument();
    });

    it('shows sidebar with new chat button', () => {
      render(<Chat />);

      expect(screen.getByRole('button', { name: /\+ New Chat/ })).toBeInTheDocument();
      expect(screen.getByText(/Recent Conversations/)).toBeInTheDocument();
    });

    it('shows toggle sidebar button', () => {
      render(<Chat />);

      expect(screen.getByRole('button', { name: /←/ })).toBeInTheDocument();
    });

    it('shows empty state when no conversations exist', () => {
      render(<Chat />);

      expect(screen.getByText(/No conversations found/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<Chat />);

      expect(screen.getByLabelText(/Type your message/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Send message/)).toBeInTheDocument();
    });

    it('has skip navigation link', () => {
      render(<Chat />);

      const skipLink = screen.getByText(/Skip to chat input/);
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#chat-input');
    });

    it('has proper roles for messages area', () => {
      render(<Chat />);

      const messageArea = screen.getByRole('status');
      expect(messageArea).toBeInTheDocument();
      expect(messageArea).toHaveAttribute('aria-live', 'polite');
      expect(messageArea).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('User Interactions', () => {
    it('handles message input', async () => {
      const user = userEvent.setup();
      render(<Chat />);

      const input = screen.getByPlaceholderText(/Type your message/);
      await user.type(input, 'Hello, world!');
      expect(input).toHaveValue('Hello, world!');
    });

    it('disables send button when input is empty', () => {
      render(<Chat />);

      const sendButton = screen.getByRole('button', { name: /Send/ });
      expect(sendButton).toBeDisabled();
    });

    // Note: Send button enabling logic depends on conversation state
    // This will be tested in integration tests with proper data setup
  });

  describe('Sidebar Functionality', () => {
    it('toggles sidebar visibility', async () => {
      const user = userEvent.setup();
      render(<Chat />);

      const toggleButton = screen.getByRole('button', { name: /←/ });
      expect(screen.getByText(/Recent Conversations/)).toBeInTheDocument();

      await user.click(toggleButton);
      expect(screen.queryByText(/Recent Conversations/)).not.toBeInTheDocument();

      await user.click(toggleButton);
      expect(screen.getByText(/Recent Conversations/)).toBeInTheDocument();
    });

    it('has new chat button functionality', () => {
      render(<Chat />);

      const newChatButton = screen.getByRole('button', { name: /\+ New Chat/ });
      expect(newChatButton).toBeInTheDocument();
      expect(newChatButton).not.toBeDisabled();
    });
  });

  describe('Layout and Styling', () => {
    it('has proper CSS classes for styling', () => {
      render(<Chat />);

      const rootContainer = screen.getByText(/teddybox/).closest('div')?.parentElement?.parentElement;
      expect(rootContainer).toHaveClass('min-h-screen');
      expect(rootContainer).toHaveClass('bg-gradient-to-br');
    });

    it('has proper header styling', () => {
      render(<Chat />);

      const header = screen.getByText(/teddybox/).closest('header');
      expect(header).toHaveClass('mb-6', 'pt-4');
    });

    it('has proper input styling', () => {
      render(<Chat />);

      const input = screen.getByPlaceholderText(/Type your message/);
      expect(input).toHaveClass('px-4', 'py-3', 'border', 'rounded-xl');
    });

    it('has proper button styling', () => {
      render(<Chat />);

      const sendButton = screen.getByRole('button', { name: /Send/ });
      expect(sendButton).toHaveClass('px-6', 'py-3', 'rounded-xl', 'text-white');
    });
  });

  describe('Message Display', () => {
    it('shows message count display', () => {
      render(<Chat />);

      const messageCount = screen.getByText(/0 message/);
      expect(messageCount).toBeInTheDocument();
    });

    it('has reset conversation button', () => {
      render(<Chat />);

      const resetButton = screen.getByText(/Reset Conversation/);
      expect(resetButton).toBeInTheDocument();
      expect(resetButton).toHaveClass('text-red-500');
    });
  });
});
