import { describe, it, expect } from 'vitest';
import { MockAssistant } from '../mockAssistant';

describe('MockAssistant', () => {
  it('returns a response after delay', async () => {
    const assistant = new MockAssistant();
    const start = Date.now();
    const response = await assistant.getResponse('Hello');
    const duration = Date.now() - start;

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
    expect(response).toContain('Hello'); // Check that the user message is included in response

    expect(duration).toBeGreaterThanOrEqual(900);
    expect(duration).toBeLessThan(1100);
  });

  it('accepts conversation history', async () => {
    const assistant = new MockAssistant();
    const history = [
      { id: '1', role: 'user', content: 'Hi', timestamp: new Date() },
     { id: '2', role: 'assistant', content: 'Hello!', timestamp: new Date() },
    ];

    const response = await assistant.getResponse('How are you?', history);

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response).toContain('How are you?'); // Check that the user message is included
  });
});
