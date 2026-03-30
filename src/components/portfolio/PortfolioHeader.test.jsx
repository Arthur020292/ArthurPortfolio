/* @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { PortfolioHeader } from './PortfolioHeader';

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: () => ({
    addEventListener: () => {},
    addListener: () => {},
    dispatchEvent: () => true,
    matches: false,
    media: '',
    onchange: null,
    removeEventListener: () => {},
    removeListener: () => {},
  }),
});

describe('PortfolioHeader', () => {
  it('renders the primary nav links and active indicator', () => {
    render(
      <MemoryRouter>
        <PortfolioHeader activeRoute="projects" />
      </MemoryRouter>
    );

    const aboutLink = screen.getByRole('link', { name: 'About' });
    const projectLink = screen.getByRole('link', { name: 'Projects' });
    const contactLink = screen.getByRole('link', { name: 'Contact' });

    expect(screen.getByRole('link', { name: 'Arthur.' })).toBeInTheDocument();
    expect(aboutLink).toHaveClass('relative', 'z-10', 'transition-colors');
    expect(projectLink).toHaveAttribute('aria-current', 'page');
    expect(contactLink).toHaveClass('relative', 'z-10', 'transition-colors');
  });
});
