import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PromptTemplateDetailPage from './[id]/page';
import PromptTemplatesPage from './page';

describe('PromptTemplate web pages contract (Task-13)', () => {
  it('renders PromptTemplate list, empty state, save entry, detail entry, and retry action', () => {
    const html = renderToString(React.createElement(PromptTemplatesPage));

    expect(html).toContain('PromptTemplates');
    expect(html).toContain('Template name');
    expect(html).toContain('Template content');
    expect(html).toContain('Save PromptTemplate');
    expect(html).toContain('PromptTemplate detail');
    expect(html).toContain('No PromptTemplates yet.');
    expect(html).toContain('Retry');
  });

  it('renders PromptTemplate detail metadata, purpose/version context, content, and retry action', () => {
    const html = renderToString(React.createElement(PromptTemplateDetailPage));

    expect(html).toContain('PromptTemplate Detail');
    expect(html).toContain('Content type, purpose, and version');
    expect(html).toContain('Template content');
    expect(html).toContain('Retry');
  });

  it('does not use book or chapter as PromptTemplate management concepts', () => {
    const html = [
      renderToString(React.createElement(PromptTemplatesPage)),
      renderToString(React.createElement(PromptTemplateDetailPage)),
    ].join('\n');

    expect(html).not.toMatch(/\b(book|chapter)\b/i);
  });
});
