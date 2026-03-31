/* @vitest-environment jsdom */

import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

function installMatchMedia({ mobile = false, reducedMotion = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query) => {
      const matches =
        (query.includes('max-width') && mobile) ||
        (query.includes('prefers-reduced-motion') && reducedMotion);

      return {
        addEventListener: () => {},
        addListener: () => {},
        dispatchEvent: () => true,
        matches,
        media: query,
        onchange: null,
        removeEventListener: () => {},
        removeListener: () => {},
      };
    },
  });
}

function installScrollTo() {
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: () => {},
  });

  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: () => {},
  });
}

function renderAt(pathname) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <App />
    </MemoryRouter>
  );
}

describe('portfolio layout regressions', () => {
  installScrollTo();

  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('keeps the /projects grid visible until the reverse transition finishes', async () => {
    installMatchMedia({ mobile: false, reducedMotion: false });
    const { container } = renderAt('/projects/');

    expect(screen.getByText('Portland Pedal Power')).toBeInTheDocument();

    fireEvent.click(
      container.querySelector('section[aria-label="Portfolio details"] nav[aria-label="Primary"] a[href="/"]')
    );

    expect(screen.getByText('Portland Pedal Power')).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelector('.portfolio-left-stage-exit')).toBeTruthy();
    });

    expect(screen.getByText('Portland Pedal Power')).toBeInTheDocument();
    expect(screen.getByLabelText('Projects')).toBeInTheDocument();
  });

  it.each(['/', '/projects/', '/projects/nlrp/'])(
    'shows the shared mobile footer CTA exactly once on %s',
    async (pathname) => {
      installMatchMedia({ mobile: true, reducedMotion: false });
      renderAt(pathname);

      await waitFor(() => {
        expect(screen.getAllByRole('link', { name: 'Start a conversation' })).toHaveLength(1);
      });
    }
  );
});
