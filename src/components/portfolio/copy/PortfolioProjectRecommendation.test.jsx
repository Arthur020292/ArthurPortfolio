/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import {
  flattenProjectRecommendations,
  pickNextRecommendation,
} from './projectRecommendation';
import { PortfolioProjectRecommendation } from './PortfolioProjectRecommendation';

function mockMatchMedia(matches) {
  const listeners = new Set();

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query) => ({
      addEventListener: (_, listener) => listeners.add(listener),
      addListener: (listener) => listeners.add(listener),
      dispatchEvent: () => true,
      matches: query.includes('prefers-reduced-motion') ? matches : false,
      media: query,
      onchange: null,
      removeEventListener: (_, listener) => listeners.delete(listener),
      removeListener: (listener) => listeners.delete(listener),
    })),
  });

  return listeners;
}

describe('project recommendations', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('flattens the grouped recommendation copy and weights the major projects', () => {
    const entries = flattenProjectRecommendations();
    const zipEntries = entries.filter((entry) => entry.slug === 'zip');
    const chronomediaEntries = entries.filter((entry) => entry.slug === 'chronomedia');
    const mspEntries = entries.filter((entry) => entry.slug === 'msp');

    expect(zipEntries).toHaveLength(4);
    expect(chronomediaEntries).toHaveLength(4);
    expect(mspEntries).toHaveLength(2);
  });

  it('avoids showing the same project twice in a row when there are alternatives', () => {
    const entries = [
      { key: 'zip-0', reason: 'multi-role platform work', slug: 'zip' },
      { key: 'zip-1', reason: 'healthcare product design', slug: 'zip' },
      { key: 'chronomedia-0', reason: 'internal operations workflows', slug: 'chronomedia' },
    ];

    expect(pickNextRecommendation(entries, entries[0], () => 0)).toEqual(entries[2]);
  });

  it('rotates the helper copy, pauses on hover, and keeps the clickable project link stable in reduced motion', () => {
    mockMatchMedia(false);
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <PortfolioProjectRecommendation />
      </MemoryRouter>
    );

    const initialLink = screen.getByRole('link');
    const initialProgressFill = screen.getByTestId('recommendation-progress-fill');
    const label = screen.getByText(/recommended next/i);
    const labelRow = label.closest('div');

    expect(initialLink).toHaveTextContent('ZIP');
    expect(initialLink).toHaveAttribute('href', '/projects/zip');
    expect(initialLink).toHaveStyle('color: #eb6e51');
    expect(labelRow).not.toBeNull();
    expect(labelRow).toHaveClass('flex', 'items-center', 'gap-3');
    expect(labelRow).toContainElement(label);
    expect(within(labelRow).getByTestId('recommendation-progress-track')).toHaveClass(
      'portfolio-recommendation-progress-track',
      'h-0.5',
      'w-8'
    );
    expect(initialProgressFill).toHaveStyle('animation-duration: 8000ms');

    act(() => {
      vi.advanceTimersByTime(8000);
    });

    const rotatedLink = screen.getByRole('link');
    const rotatedProgressFill = screen.getByTestId('recommendation-progress-fill');

    expect(rotatedLink).not.toHaveTextContent('ZIP');
    expect(rotatedLink.getAttribute('href')).toMatch(/^\/projects\//);
    expect(rotatedLink).toHaveStyle('color: #eb6e51');
    expect(rotatedProgressFill).not.toBe(initialProgressFill);

    fireEvent.mouseEnter(screen.getByText(/recommended next/i).closest('div'));

    const pausedText = screen.getByRole('link').textContent;
    expect(screen.getByTestId('recommendation-progress-fill')).toHaveStyle(
      'animation-play-state: paused'
    );

    act(() => {
      vi.advanceTimersByTime(8000);
    });

    expect(screen.getByRole('link').textContent).toBe(pausedText);

    fireEvent.mouseLeave(screen.getByText(/recommended next/i).closest('div'));

    expect(screen.getByTestId('recommendation-progress-fill')).toHaveStyle(
      'animation-play-state: running'
    );

    act(() => {
      vi.advanceTimersByTime(8000);
    });

    expect(screen.getByRole('link').textContent).not.toBe(pausedText);
  });

  it('stays stable when the user prefers reduced motion', () => {
    mockMatchMedia(true);
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <PortfolioProjectRecommendation />
      </MemoryRouter>
    );

    const initialLink = screen.getByRole('link');
    const progressFill = screen.queryByTestId('recommendation-progress-fill');

    expect(initialLink).toHaveTextContent('ZIP');
    expect(progressFill).toBeNull();

    act(() => {
      vi.advanceTimersByTime(24000);
    });

    expect(screen.getByRole('link')).toHaveTextContent('ZIP');
  });
});
