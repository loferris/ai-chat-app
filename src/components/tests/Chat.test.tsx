import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from '../Chat';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
                          setItem: vi.fn((key: string, value: string) => {
                            store[key] = value.toString();
                          }),
                          removeItem: vi.fn((key: string) => {
                            delete store[key];
                          }),
                          clear: vi.fn(() => {
                            store = {};
                          })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock scrollIntoView
Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: vi.fn(),
});

// Use vi.hoisted to avoid hoisting issues with vi.mock
const mocks = vi.hoisted(() => ({
  mockCreateAssistant: vi.fn(() => ({
    getResponse: vi.fn().mockResolvedValue('Mock response'),
  }))
}));

vi.mock('../../services/assistant', () => ({
  createAssistant: mocks.mockCreateAssistant,
}));

describe('Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset environment variables
    vi.unstubAllEnvs();
    // Reset the mock to default implementation
    mocks.mockCreateAssistant.mockImplementation(() => ({
      getResponse: vi.fn().mockResolvedValue('Mock response'),
    }));
  });

  it('renders chat interface correctly', () => {
    render(<Chat />);

    expect(screen.getByText(/teddybox/)).toBeInTheDocument();
    expect(screen.getByText(/Welcome to your colorful chat/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type your message/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send/ })).toBeInTheDocument();
  });

  it('displays welcome message when no messages exist', () => {
    render(<Chat />);

    expect(screen.getByText(/Welcome to your colorful chat/)).toBeInTheDocument();
    expect(screen.getByText(/Start a conversation/)).toBeInTheDocument();
  });

  it('sends a message when user types and clicks send', async () => {
    const user = userEvent.setup();
    render(<Chat />);

    const input = screen.getByPlaceholderText(/Type your message/);
    const sendButton = screen.getByRole('button', { name: /Send/ });

    await user.type(input, 'Hello, assistant!');
    await user.click(sendButton);

    // Check user message appears
    expect(await screen.findByText('Hello, assistant!')).toBeInTheDocument();

    // Wait for assistant response
    expect(await screen.findByText('Mock response')).toBeInTheDocument();
  });

  it('sends message with Enter key', async () => {
    const user = userEvent.setup();
    render(<Chat />);

    const input = screen.getByPlaceholderText(/Type your message/);
    await user.type(input, 'Hello via Enter!');
    await user.keyboard('{Enter}');

    expect(await screen.findByText('Hello via Enter!')).toBeInTheDocument();
    expect(await screen.findByText('Mock response')).toBeInTheDocument();
  });

  it('does not send empty messages', async () => {
    const user = userEvent.setup();
    render(<Chat />);

    const sendButton = screen.getByRole('button', { name: /Send/ });
    await user.click(sendButton);

    // Should still show welcome message (no messages sent)
    expect(screen.getByText(/Welcome to your colorful chat/)).toBeInTheDocument();
  });

  it('disables input and button while loading', async () => {
    const user = userEvent.setup();

    // Mock assistant to have a delay
    mocks.mockCreateAssistant.mockImplementation(() => ({
      getResponse: vi.fn(() => new Promise(resolve => setTimeout(() => resolve('Delayed response'), 300))),
    }));

    render(<Chat />);

    const input = screen.getByPlaceholderText(/Type your message/);
    const sendButton = screen.getByRole('button', { name: /Send/ });

    await user.type(input, 'Test message');
    await user.click(sendButton);

    // Check disabled state during loading (use findBy to wait for the state change)
    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
      expect(sendButton).toHaveTextContent('Sending...');
    });
  });

  it('shows mock mode when no API key is provided', () => {
    // Mock localStorage to return null for forceMock
    vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
      if (key === 'forceMock') return null;
      return null;
    });

    // Mock environment variables to simulate no API key
    vi.stubEnv('VITE_OPENROUTER_API_KEY', '');
    vi.stubEnv('VITE_USE_MOCK', 'true');

    render(<Chat />);

    expect(screen.getByText(/Using Mock Assistant/)).toBeInTheDocument();
  });

  it('shows API connected status when API key is provided', () => {
    vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
      if (key === 'forceMock') return 'false'; // Force API mode
      return null;
    });

    // Mock environment variables to simulate having an API key
    vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key');
    vi.stubEnv('VITE_USE_MOCK', 'false');

    render(<Chat />);

    // Use custom matcher for text that might be split across elements
    expect(screen.getByText((content) => {
      return content.includes('Connected to OpenRouter API');
    })).toBeInTheDocument();
  });

  it('toggles between mock and API mode', async () => {
    const user = userEvent.setup();

    vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
      if (key === 'forceMock') return 'false'; // Start in API mode
      return null;
    });

    vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key');
    vi.stubEnv('VITE_USE_MOCK', 'false');

    render(<Chat />);

    // Initially connected to API (use custom matcher)
    expect(screen.getByText((content) => {
      return content.includes('Connected to OpenRouter API');
    })).toBeInTheDocument();

    // Click toggle button
    const toggleButton = screen.getByRole('button', { name: /Switch to Mock/ });
    await user.click(toggleButton);

    // Should set localStorage and reload
    expect(localStorage.setItem).toHaveBeenCalledWith('forceMock', 'true');
  });

  it('tracks cost when assistant provides cost information', async () => {
    const user = userEvent.setup();

    // Mock assistant to return cost
    mocks.mockCreateAssistant.mockImplementation(() => ({
      getResponse: vi.fn().mockResolvedValue({
        response: 'Mock response with cost',
        model: 'test-model',
        cost: 0.001234
      }),
    }));

    render(<Chat />);

    const input = screen.getByPlaceholderText(/Type your message/);
    const sendButton = screen.getByRole('button', { name: /Send/ });

    await user.type(input, 'Test cost tracking');
    await user.click(sendButton);

    // Wait for response
    expect(await screen.findByText('Mock response with cost')).toBeInTheDocument();

    // Check cost display in the message (look for the cost in a div with specific class)
    const messageCost = await screen.findByText((content, element) => {
      // Look for the cost value in an element with the cost class
      return content.includes('0.001234') &&
      element?.classList?.contains('text-purple-300');
    });
    expect(messageCost).toBeInTheDocument();

    // Check session cost display (look for the fixed position cost tracker)
    const sessionCost = await screen.findByText((content, element) => {
      // Look for cost in the fixed session cost display
      return content.includes('0.001234') &&
      element?.parentElement?.classList?.contains('fixed');
    });
    expect(sessionCost).toBeInTheDocument();
  });

  it('resets conversation when reset button is clicked', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true); // Mock confirm dialog

    render(<Chat />);

    // Send a message first
    const input = screen.getByPlaceholderText(/Type your message/);
    const sendButton = screen.getByRole('button', { name: /Send/ });

    await user.type(input, 'Test message');
    await user.click(sendButton);

    // Wait for response
    expect(await screen.findByText('Mock response')).toBeInTheDocument();

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /Reset Conversation/ });
    await user.click(resetButton);

    // Should show welcome message again
    expect(screen.getByText(/Welcome to your colorful chat/)).toBeInTheDocument();
  });

  it('dismisses error message when close button is clicked', async () => {
    const user = userEvent.setup();

    // Mock assistant to throw error during initialization
    mocks.mockCreateAssistant.mockImplementation(() => {
      throw new Error('Test error');
    });

    render(<Chat />);

    // Wait for error message
    const errorMessage = await screen.findByText(/Failed to initialize assistant/);
    expect(errorMessage).toBeInTheDocument();

    // Click dismiss button
    const dismissButton = screen.getByRole('button', { name: /Dismiss/ });
    await user.click(dismissButton);

    // Error message should be gone
    expect(screen.queryByText(/Failed to initialize assistant/)).not.toBeInTheDocument();
  });

  it('persists cost and conversation count in localStorage', async () => {
    const user = userEvent.setup();

    // Mock assistant to return cost
    mocks.mockCreateAssistant.mockImplementation(() => ({
      getResponse: vi.fn().mockResolvedValue({
        response: 'Response with cost',
        model: 'test-model',
        cost: 0.001
      }),
    }));

    render(<Chat />);

    const input = screen.getByPlaceholderText(/Type your message/);
    const sendButton = screen.getByRole('button', { name: /Send/ });

    await user.type(input, 'Test message');
    await user.click(sendButton);

    // Wait for response
    expect(await screen.findByText('Response with cost')).toBeInTheDocument();

    // Check localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith('chatCost', expect.any(String));
    expect(localStorage.setItem).toHaveBeenCalledWith('chatConversations', expect.any(String));
  });

  it('loads cost and conversation count from localStorage', () => {
    // Set up localStorage with existing values
    vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
      switch (key) {
        case 'chatCost': return '0.005';
        case 'chatConversations': return '3';
        default: return null;
      }
    });

    render(<Chat />);

    // Check that cost is displayed
    expect(screen.getByText(/\$0\.005000/)).toBeInTheDocument();
  });

  it('formats timestamps correctly', async () => {
    const user = userEvent.setup();
    render(<Chat />);

    const input = screen.getByPlaceholderText(/Type your message/);
    const sendButton = screen.getByRole('button', { name: /Send/ });

    await user.type(input, 'Test timestamp');
    await user.click(sendButton);

    // Wait for response
    expect(await screen.findByText('Mock response')).toBeInTheDocument();

    // Check that timestamps are displayed (format: HH:MM)
    const timeElements = await screen.findAllByText(/\d{1,2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });
});
