import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import LlmProviderPage from './page';

type LlmProviderScenario = 'configured' | 'empty';

function renderProviderPage(provider: LlmProviderScenario): string {
  const ScenarioPage = LlmProviderPage as React.ComponentType<{ provider: LlmProviderScenario }>;

  return renderToString(React.createElement(ScenarioPage, { provider }));
}

describe('LLM Provider web page contract (Task-14)', () => {
  it('renders provider configuration, unconfigured status, save, and retry entry points', () => {
    const html = renderProviderPage('empty');

    expect(html).toContain('LLM Provider');
    expect(html).toContain('Provider name');
    expect(html).toContain('Model');
    expect(html).toContain('Base URL');
    expect(html).toContain('API Key');
    expect(html).toContain('API key configured status');
    expect(html).toContain('Not configured');
    expect(html).toContain('Save Provider');
    expect(html).toContain('Retry');
  });

  it('uses a password input for API key write-only entry and renders only masked key previews', () => {
    const html = renderProviderPage('configured');

    expect(html).toContain('type="password"');
    expect(html).toContain('sk-***abcd');
    expect(html).not.toContain('sk-test-1234567890abcd');
    expect(html).not.toContain('encryptedApiKeyValue');
  });

  it('does not use book or chapter as provider configuration concepts', () => {
    const html = renderToString(React.createElement(LlmProviderPage));

    expect(html).not.toMatch(/\b(book|chapter)\b/i);
  });
});
