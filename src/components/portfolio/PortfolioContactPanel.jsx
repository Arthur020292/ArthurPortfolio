import { useState } from 'react';
import { BRAND_COLOR, CONTACT_EMAIL } from '../../portfolio/constants';

export function PortfolioContactPanel({ motionState = 'idle' }) {
  const [formState, setFormState] = useState({
    company: '',
    email: '',
    message: '',
    name: '',
    projectType: '',
  });
  const [submitState, setSubmitState] = useState({
    message: '',
    status: 'idle',
  });
  const isSubmitting = submitState.status === 'submitting';

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitState({
      message: '',
      status: 'submitting',
    });

    try {
      const response = await fetch('/api/contact', {
        body: JSON.stringify(formState),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
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
      setSubmitState({
        message: result.message || 'Thanks, your message has been sent.',
        status: 'success',
      });
    } catch {
      setSubmitState({
        message: 'I could not send your message right now. Please try again later.',
        status: 'error',
      });
    }
  }

  return (
    <div
      className={`portfolio-right-panel relative flex min-h-dvh items-center justify-center overflow-hidden border-l border-slate-200 bg-[#fbfaf7] px-14 py-12 max-[980px]:min-h-[48vh] max-[980px]:border-l-0 max-[980px]:px-5 max-[640px]:px-4 max-[640px]:py-8 ${
        motionState === 'enter'
          ? 'portfolio-contact-panel-enter'
          : motionState === 'exit'
            ? 'portfolio-contact-panel-exit'
            : ''
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.9),transparent_26%),radial-gradient(circle_at_78%_74%,rgba(15,23,42,0.06),transparent_24%)]" />
      <div className="relative z-10 w-full max-w-[36rem] rounded-[32px] border border-white/65 bg-white/78 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-md max-[980px]:rounded-[26px] max-[980px]:p-6 max-[640px]:rounded-[22px] max-[640px]:p-4">
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
              className="min-h-44 rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none transition-colors focus:border-slate-400"
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

          <div className="mt-4 pt-3 max-[640px]:mt-3 max-[640px]:pt-2">
            <button
              className="inline-flex min-h-13 items-center justify-center rounded-full px-5 py-4 text-center text-[1rem] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 max-[640px]:w-full"
              disabled={isSubmitting}
              style={{ backgroundColor: BRAND_COLOR }}
              type="submit"
            >
              {isSubmitting ? 'Sending...' : 'Send message'}
            </button>

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

        <div className="mt-4">
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
