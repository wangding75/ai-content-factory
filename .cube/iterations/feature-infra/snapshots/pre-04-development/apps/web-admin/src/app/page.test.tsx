import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import HomePage from './page';

describe('HomePage (Task-12)', () => {
  it('renders without throwing', () => {
    expect(() => renderToString(React.createElement(HomePage))).not.toThrow();
  });

  it('rendered HTML contains "AI Content Factory"', () => {
    const html = renderToString(React.createElement(HomePage));
    expect(html).toContain('AI Content Factory');
  });
});
