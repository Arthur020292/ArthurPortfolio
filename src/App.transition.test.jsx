// @vitest-environment jsdom

import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { getBrowseProjects } from './data/projects';

function createMatchMediaMock(matches = false) {
  return vi.fn().mockImplementation(() => ({
    addEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: '',
    onchange: null,
    removeEventListener: vi.fn(),
  }));
}

let scrollToDescriptor;

describe('portfolio route choreography', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');

    vi.stubGlobal('matchMedia', createMatchMediaMock(false));
    vi.stubGlobal('scrollTo', vi.fn());
    scrollToDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    });
    vi.stubGlobal(
      'requestAnimationFrame',
      (callback) => {
        callback(0);
        return 1;
      }
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal(
      'ResizeObserver',
      class {
        disconnect() {}

        observe() {}

        unobserve() {}
      }
    );
  });

  afterEach(() => {
    if (scrollToDescriptor) {
      Object.defineProperty(HTMLElement.prototype, 'scrollTo', scrollToDescriptor);
      scrollToDescriptor = undefined;
    } else {
      delete HTMLElement.prototype.scrollTo;
    }

    vi.unstubAllGlobals?.();
  });

  it('keeps the full projects grid mounted until the /contact handoff finishes', async () => {
    window.history.replaceState({}, '', '/projects');

    const user = userEvent.setup();
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const projectsRegion = await screen.findByRole('region', { name: 'Projects' });
    const projectLinks = within(projectsRegion).getAllByRole('link');

    expect(projectLinks.length).toBe(getBrowseProjects().length + 1);
    expect(within(projectsRegion).getByRole('link', { name: 'ContractsRx' })).toBeTruthy();

    const contactLink = screen.getAllByRole('link', { name: /^Contact$/ }).at(-1);

    expect(contactLink).toBeTruthy();

    await user.click(contactLink);

    const exitingStage = container.querySelector('.portfolio-left-stage-exit');

    expect(exitingStage).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
    expect(within(projectsRegion).getByRole('link', { name: 'ContractsRx' })).toBeTruthy();

    fireEvent.animationEnd(exitingStage);

    await screen.findByRole('textbox', { name: 'Name' });
    expect(screen.queryByRole('region', { name: 'Projects' })).toBeNull();
  });
});
