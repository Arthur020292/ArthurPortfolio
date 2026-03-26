import { useEffect, useRef, useState } from 'react';
import { BRAND_COLOR, CONTACT_EMAIL } from '../../portfolio/constants';

export function PortfolioContactPanel({ motionState = 'idle' }) {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  const [formState, setFormState] = useState({
    company: '',
    email: '',
    message: '',
    name: '',
    projectType: '',
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [submitState, setSubmitState] = useState({
    message: '',
    status: 'idle',
  });
  const turnstileContainerRef = useRef(null);
  const turnstileWidgetIdRef = useRef(null);
  const isSubmitting = submitState.status === 'submitting';
  const requiresTurnstile = Boolean(turnstileSiteKey);
  const isSubmitDisabled = isSubmitting || (requiresTurnstile && !turnstileToken);

  useEffect(() => {
    if (
      !turnstileSiteKey ||
      typeof window === 'undefined' ||
      !turnstileContainerRef.current
    ) {
      return undefined;
    }

    const renderWidget = () => {
      if (
        !window.turnstile ||
        !turnstileContainerRef.current ||
        turnstileWidgetIdRef.current !== null
      ) {
        return;
      }

      turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        callback: (token) => setTurnstileToken(token),
        'error-callback': () => setTurnstileToken(''),
        'expired-callback': () => setTurnstileToken(''),
        sitekey: turnstileSiteKey,
      });
    };

    const existingScript = document.querySelector(
      'script[data-portfolio-turnstile="true"]'
    );

    if (existingScript) {
      if (window.turnstile) {
        renderWidget();
      } else {
        existingScript.addEventListener('load', renderWidget, { once: true });
      }
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.dataset.portfolioTurnstile = 'true';
      script.addEventListener('load', renderWidget, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      setTurnstileToken('');

      if (turnstileWidgetIdRef.current !== null && window.turnstile?.remove) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [turnstileSiteKey]);

  function resetTurnstile() {
    setTurnstileToken('');

    if (turnstileWidgetIdRef.current !== null && window.turnstile?.reset) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitState({
      message: '',
      status: 'submitting',
    });

    try {
      const response = await fetch('/api/contact', {
        body: JSON.stringify({
          ...formState,
          turnstileToken,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        if (requiresTurnstile) {
          resetTurnstile();
        }

        setSubmitState({
          message: result.message || 'I could not send your message right now.',
          status: 'error',
        });
        return;
      }

      setFormState({
        company: '',
        email: '',
        message: '',
        name: '',
        projectType: '',
      });
      if (requiresTurnstile) {
        resetTurnstile();
      }
      setSubmitState({
        message: result.message || 'Thanks, your message has been sent.',
        status: 'success',
      });
    } catch {
      if (requiresTurnstile) {
        resetTurnstile();
      }

      setSubmitState({
        message: 'I could not send your message right now. Please try again later.',
        status: 'error',
      });
    }
  }

  return (
    <div
      className={`portfolio-right-panel relative flex min-h-dvh items-center justify-center overflow-hidden border-l border-slate-200 bg-[#fbfaf7] px-14 py-12 max-[980px]:min-h-0 max-[980px]:items-start max-[980px]:justify-start max-[980px]:border-l-0 max-[980px]:px-5 max-[980px]:py-5 max-[640px]:px-4 max-[640px]:py-4 ${
        motionState === 'enter'
          ? 'portfolio-contact-panel-enter'
          : motionState === 'exit'
            ? 'portfolio-contact-panel-exit'
            : ''
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.9),transparent_26%),radial-gradient(circle_at_78%_74%,rgba(15,23,42,0.06),transparent_24%)]" />
      <div className="relative z-10 w-full max-w-[36rem] rounded-[32px] border border-white/65 bg-white/78 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-md max-[980px]:rounded-[24px] max-[980px]:p-5 max-[640px]:rounded-[20px] max-[640px]:p-4">
        <form aria-busy={isSubmitting} className="grid gap-4" onSubmit={handleSubmit}>
          <div aria-hidden="true" className="hidden">
            <label className="block">
              Company
              <input
                autoComplete="off"
                name="company"
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    company: event.target.value,
                  }))
                }
                tabIndex={-1}
                type="text"
                value={formState.company}
              />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
              Name
            </span>
            <input
              autoComplete="name"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-900 outline-none transition-colors focus:border-slate-400"
              name="name"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Your name"
              required
              type="text"
              value={formState.name}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
              Email
            </span>
            <input
              autoComplete="email"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-900 outline-none transition-colors focus:border-slate-400"
              name="email"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="you@company.com"
              required
              type="email"
              value={formState.email}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
              Project Type
            </span>
            <select
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-900 outline-none transition-colors focus:border-slate-400"
              name="projectType"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  projectType: event.target.value,
                }))
              }
              value={formState.projectType}
            >
              <option value="">Select one if helpful</option>
              <option value="New product">New product</option>
              <option value="Redesign">Redesign</option>
              <option value="Design system">Design system</option>
              <option value="Frontend-ready design">Frontend-ready design</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
              Message
            </span>
            <textarea
              className="min-h-44 rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none transition-colors focus:border-slate-400 max-[640px]:min-h-32"
              name="message"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              placeholder="A quick overview of what you're building, where you need help, and what timeline you're working with."
              required
              value={formState.message}
            />
          </label>

          {requiresTurnstile ? (
            <div className="mt-1">
              <div ref={turnstileContainerRef} />
            </div>
          ) : null}

          <div className="mt-3 pt-2 max-[640px]:mt-2 max-[640px]:pt-1">
            <button
              className="inline-flex min-h-13 items-center justify-center rounded-full px-5 py-4 text-center text-[1rem] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 max-[640px]:w-full"
              disabled={isSubmitDisabled}
              style={{ backgroundColor: BRAND_COLOR }}
              type="submit"
            >
              {isSubmitting ? 'Sending...' : 'Send message'}
            </button>

            {requiresTurnstile && !turnstileToken ? (
              <p className="mt-3 text-[0.9rem] text-slate-500">
                Complete the security check before sending your message.
              </p>
            ) : null}

            <p
              aria-atomic="true"
              aria-live="polite"
              className={`mt-4 text-[0.95rem] ${
                submitState.status === 'error' ? 'text-red-600' : 'text-slate-500'
              }`}
              role={submitState.status === 'error' ? 'alert' : 'status'}
            >
              {submitState.message}
            </p>
          </div>
        </form>

        <div className="mt-3">
          <a
            className="text-[0.95rem] text-slate-600 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-900"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            Prefer your email app instead?
          </a>
        </div>
      </div>
    </div>
  );
}
