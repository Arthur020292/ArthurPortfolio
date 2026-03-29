import { forwardRef } from 'react';
import { useIsMobileViewport } from '../../hooks/useIsMobileViewport';
import { Link, useNavigate } from '../../router-dom';

function hasModifiedClick(event) {
  return (
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.button !== 0
  );
}

function lockMobileScroll() {
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const body = document.body;

  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overflow = 'hidden';
}

export const PortfolioNavLink = forwardRef(function PortfolioNavLink(
  {
    children,
    className = '',
    onClick,
    replace,
    state,
    target,
    to,
    ...props
  },
  ref
) {
  const navigate = useNavigate();
  const isMobileViewport = useIsMobileViewport();

  function handleClick(event) {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (target && target !== '_self') {
      return;
    }

    if (!isMobileViewport || hasModifiedClick(event)) {
      return;
    }

    event.preventDefault();
    lockMobileScroll();
    navigate(to, { replace, state });
  }

  return (
    <Link
      className={className}
      onClick={handleClick}
      ref={ref}
      replace={replace}
      state={state}
      target={target}
      to={to}
      {...props}
    >
      {children}
    </Link>
  );
});
