import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ContentProjectDetailPage from './[id]/page';
import NewContentProjectPage from './new/page';
import ContentProjectsPage from './page';

type ContentTypeScenario = 'available' | 'empty';

function createProjectPageHtml(contentTypes: ContentTypeScenario): string {
  const ScenarioPage = NewContentProjectPage as React.ComponentType<{ contentTypes: ContentTypeScenario }>;

  return renderToString(React.createElement(ScenarioPage, { contentTypes }));
}

describe('Content project web pages contract (Task-12)', () => {
  it('renders the project list empty state, create entry, and retry action', () => {
    const html = renderToString(React.createElement(ContentProjectsPage));

    expect(html).toContain('Content Projects');
    expect(html).toContain('Create Content Project');
    expect(html).toContain('No content projects yet.');
    expect(html).toContain('Retry');
  });

  it('renders a create form with Novel as the only open content type option', () => {
    const html = createProjectPageHtml('available');

    expect(html).toContain('Create Content Project');
    expect(html).toContain('Project name');
    expect(html).toContain('Content type');
    expect(html).toContain('Target platform');
    expect(html).toContain('Target content count');
    expect(html).toContain('Novel');
    expect(html).not.toContain('No available content types.');
    expect(html).not.toMatch(/<option[^>]*>(Article|Short Video|Social Post)<\/option>/i);
  });

  it('renders unavailable content type feedback with disabled create submission', () => {
    const html = createProjectPageHtml('empty');

    expect(html).toContain('No available content types.');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Create<\/button>/);
    expect(html).not.toContain('Novel');
  });

  it('renders project detail, related PromptTemplate and LLM Provider entries, save, delete, and retry actions', () => {
    const html = renderToString(React.createElement(ContentProjectDetailPage));

    expect(html).toContain('Content Project Detail');
    expect(html).toContain('Project basic information');
    expect(html).toContain('PromptTemplate entry');
    expect(html).toContain('Default LLM Provider entry');
    expect(html).toContain('Save');
    expect(html).toContain('Delete');
    expect(html).toContain('Retry');
    expect(html).toContain('Confirm delete');
  });

  it('does not use book or chapter as project management concepts', () => {
    const html = [
      renderToString(React.createElement(ContentProjectsPage)),
      renderToString(React.createElement(NewContentProjectPage as React.ComponentType<{ contentTypes: ContentTypeScenario }>, { contentTypes: 'available' })),
      renderToString(React.createElement(ContentProjectDetailPage)),
    ].join('\n');

    expect(html).not.toMatch(/\b(book|chapter)\b/i);
  });
});
