import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import HomePage from './page';

describe('HomePage navigation contract (Task-11)', () => {
  it('renders generic admin navigation entries for the content project entry points', () => {
    const html = renderToString(React.createElement(HomePage));

    expect(html).toContain('AI Content Factory');
    expect(html).toContain('Content Projects');
    expect(html).toContain('PromptTemplate');
    expect(html).toContain('LLM Provider');
    expect(html).toContain('/content-projects');
    expect(html).toContain('/prompt-templates');
    expect(html).toContain('/llm-provider');
  });

  it('does not use book or chapter as core navigation concepts', () => {
    const html = renderToString(React.createElement(HomePage));

    expect(html).not.toMatch(/\b(book|chapter)\b/i);
  });
});
