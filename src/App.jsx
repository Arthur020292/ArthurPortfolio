import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { aboutContent, designOptions, projects } from './data';

const DESIGN_ONE_PATH = '/design1';
const DESIGN_ONE_NAME = 'Design 1';
const DESIGN_TWO_PATH = '/design2';
const DESIGN_TWO_NAME = 'Design 2';
const DESIGN_TWO_EXIT_MS = 220;
const DESIGN_TWO_ENTER_MS = 420;
const DESIGN_TWO_DEFAULT_PROJECT = projects[0];

function useDocumentMeta(title, description) {
  useEffect(() => {
    document.title = title;

    const meta = document.querySelector('meta[name="description"]');

    if (meta) {
      meta.setAttribute('content', description);
    }
  }, [description, title]);
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

function SafeImage({
  alt,
  className = '',
  fallbackClassName = '',
  fallbackLabel = 'Preview',
  src,
}) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError) {
    return (
      <div
        aria-label={alt}
        className={`grid place-items-center bg-white/50 text-center ${fallbackClassName || className}`}
        role="img"
      >
        <span className="font-heading text-lg tracking-[-0.03em] text-slate-600">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      src={src}
    />
  );
}

function DesignIndexPage() {
  useDocumentMeta(
    'Arthur Baduyen | Design Index',
    'A table of contents for Arthur Baduyen portfolio design explorations and layout directions.'
  );

  return (
    <main className="min-h-dvh bg-white px-8 py-12 max-[720px]:px-5">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-xs font-bold tracking-[0.18em] text-slate-500 uppercase">
          Designs
        </p>
        <h1 className="font-heading text-[clamp(2rem,4vw,3.2rem)] leading-[1.02] font-bold tracking-[-0.03em] text-slate-900">
          Portfolio design directions
        </h1>

        <div className="mt-10 grid gap-4">
          {designOptions.map((design) => (
            <Link
              key={design.path}
              className="block border-b border-slate-200 py-4 text-[1.15rem] text-slate-900 no-underline transition-colors hover:text-slate-500"
              to={design.path}
            >
              {design.name}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function ProfileRail() {
  return (
    <aside className="sticky top-0 flex h-dvh flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_36%),linear-gradient(180deg,#232b30_0%,#1d2529_100%)] px-9 py-10 text-slate-50 max-[920px]:static max-[920px]:h-auto max-[920px]:gap-8 max-[920px]:px-6 max-[920px]:py-8">
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <div className="grid h-31 w-31 place-items-center rounded-full border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.06)),#8b98a2] shadow-[inset_0_1px_10px_rgba(255,255,255,0.14)]">
          <span className="font-heading text-[2rem] font-bold tracking-[0.08em]">
            AB
          </span>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold tracking-[0.18em] text-white/95 uppercase">
            Senior Product Designer
          </p>
          <h1 className="font-heading text-[clamp(2.2rem,4vw,3rem)] leading-[1.02] font-bold tracking-[-0.03em] text-white">
            Arthur
            <br />
            Baduyen
          </h1>
          <p className="mt-4 text-[1.05rem] font-medium text-slate-100">
            AI-Augmented Design &amp; Development
          </p>
          <p className="mt-4 max-w-[30ch] text-[1.05rem] leading-[1.75] text-white/78">
            Senior Product Designer with 10+ years of experience designing and
            delivering digital products from concept to production, with a focus
            on UX systems, frontend-ready design, and AI-assisted product
            development.
          </p>
        </div>

        <div className="mt-auto grid gap-4">
          <a
            className="inline-flex min-h-13 items-center justify-center rounded-full bg-slate-50 px-5 py-4 text-center text-[1.02rem] font-semibold text-slate-900 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(6,8,10,0.18)]"
            href="mailto:arthur.baduyen@gmail.com"
          >
            arthur.baduyen@gmail.com
          </a>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-lg text-white/90">
            <a
              className="border-b border-white/25 pb-0.5 transition-colors hover:text-white"
              href="https://www.linkedin.com/in/arthurbaduyenf/"
              rel="noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
            <a
              className="border-b border-white/25 pb-0.5 transition-colors hover:text-white"
              href="/assets/ARTHURBADUYEN_2024.pdf"
              rel="noreferrer"
              target="_blank"
            >
              Resume
            </a>
          </div>
        </div>
      </div>

      <footer className="mt-8 border-t border-white/12 pt-4 text-sm text-white/65">
        © {new Date().getFullYear()} Arthur Baduyen
      </footer>
    </aside>
  );
}

function ProjectCard({ project }) {
  return (
    <Link
      className="group grid gap-4 text-inherit no-underline transition-transform duration-200 hover:-translate-y-1 hover:opacity-90"
      to={`projects/${project.slug}`}
    >
      <SafeImage
        alt={project.cardAlt}
        className="aspect-[1.08/1] w-full rounded-md border border-slate-200 bg-slate-50 object-cover"
        fallbackLabel={project.name}
        src={project.cardImage}
      />
      <div>
        <h3 className="font-heading text-[2rem] leading-none font-bold tracking-[-0.03em] text-slate-900">
          {project.name}
        </h3>
        <p className="mt-2 max-w-[34ch] text-[1.05rem] leading-[1.7] text-slate-500">
          {project.cardSummary}
        </p>
      </div>
    </Link>
  );
}

function DesignOneHomePage() {
  useDocumentMeta(
    `Arthur Baduyen | ${DESIGN_ONE_NAME}`,
    'Minimal portfolio of Arthur Baduyen, a Senior Product Designer specializing in AI-augmented design, UX systems, and frontend-ready product experiences.'
  );

  return (
    <div>
      <div className="mb-8 max-w-[820px]">
        <p className="mb-3 text-xs font-bold tracking-[0.18em] text-slate-900 uppercase">
          Projects
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-[720px]:grid-cols-1">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}

function DesignOneProjectPage() {
  const { slug } = useParams();
  const project = projects.find((entry) => entry.slug === slug);

  useDocumentMeta(
    project?.metaTitle ?? `Arthur Baduyen | ${DESIGN_ONE_NAME}`,
    project?.metaDescription ??
      'Minimal portfolio of Arthur Baduyen, a Senior Product Designer specializing in AI-augmented design, UX systems, and frontend-ready product experiences.'
  );

  if (!project) {
    return <Navigate replace to={DESIGN_ONE_PATH} />;
  }

  return (
    <div>
      <Link
        className="mb-7 inline-flex items-center gap-2 text-[0.94rem] text-slate-500 no-underline transition-colors hover:text-slate-900"
        to={DESIGN_ONE_PATH}
      >
        <span aria-hidden="true">←</span>
        <span>Back to selected projects</span>
      </Link>

      <header className="grid gap-4">
        <p className="text-xs font-bold tracking-[0.18em] text-slate-900 uppercase">
          {project.category}
        </p>
        <h2 className="font-heading text-[clamp(2.2rem,4vw,3.8rem)] leading-[1.02] font-bold tracking-[-0.03em] text-slate-900">
          {project.name}
        </h2>
        <p className="max-w-[64ch] text-[1.12rem] leading-[1.8] text-slate-500">
          {project.overview}
        </p>
      </header>

      <figure className="mt-7 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
        <SafeImage
          alt={project.heroAlt}
          className="w-full"
          fallbackLabel={project.name}
          src={project.heroImage}
        />
      </figure>

      <div className="mt-6 grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">
        <MetaCard label="Role" value={project.role} />
        <MetaCard label="Duration" value={project.duration} />
        <MetaCard label="Focus" value={project.focus} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 max-[720px]:grid-cols-1">
        <InfoCard title="Challenge">{project.challenge}</InfoCard>
        <InfoCard title="Approach">{project.approach}</InfoCard>
        <InfoCard title="Selected Work">
          <ul className="list-disc space-y-3 pl-5">
            {project.selectedWork.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard title="Outcome">{project.outcome}</InfoCard>
      </div>

      <section
        aria-labelledby={`${project.slug}-screens`}
        className="mt-6 grid grid-cols-2 gap-4 max-[720px]:grid-cols-1"
      >
        <h3
          className="col-span-full font-heading text-[1.2rem] font-bold text-slate-900 max-[720px]:col-span-1"
          id={`${project.slug}-screens`}
        >
          Selected screens
        </h3>
        {project.gallery.map((image) => (
          <figure
            className="overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50"
            key={image.src}
          >
            <SafeImage
              alt={image.alt}
              className="w-full"
              fallbackLabel={project.name}
              src={image.src}
            />
          </figure>
        ))}
      </section>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <h3 className="font-heading text-xl font-bold text-slate-900">
            {project.ctaTitle}
          </h3>
          <p className="mt-2 max-w-[48ch] text-[1rem] leading-[1.75] text-slate-500">
            {project.ctaBody}
          </p>
        </div>
        <a
          className="inline-flex min-h-13 items-center justify-center rounded-full bg-slate-900 px-5 py-4 text-center text-[1rem] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
          href="mailto:arthur.baduyen@gmail.com"
        >
          Start a conversation
        </a>
      </section>
    </div>
  );
}

function MetaCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <span className="mb-1 block text-[0.76rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
        {label}
      </span>
      <strong className="text-[0.98rem] leading-[1.5] text-slate-900">
        {value}
      </strong>
    </article>
  );
}

function InfoCard({ children, title }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 text-[1rem] leading-[1.75] text-slate-500">
      <h3 className="mb-3 font-heading text-[1.18rem] font-bold text-slate-900">
        {title}
      </h3>
      <div>{children}</div>
    </article>
  );
}

function DesignOneLayout() {
  const location = useLocation();
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="grid min-h-dvh w-full max-w-dvw grid-cols-[minmax(320px,380px)_minmax(0,1fr)] overflow-hidden max-[920px]:grid-cols-1">
      <ProfileRail />
      <section
        className="h-dvh overflow-y-auto overflow-x-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.94),#ffffff_24%)] px-14 py-12 max-[920px]:h-auto max-[920px]:overflow-visible max-[920px]:px-6 max-[920px]:py-9"
        ref={panelRef}
      >
        <div className="animate-content-enter" key={location.pathname}>
          <Outlet />
        </div>
      </section>
    </div>
  );
}

function parseDesignTwoRoute(pathname) {
  const relativePath = pathname.replace(`${DESIGN_TWO_PATH}/`, '');

  if (!relativePath || pathname === DESIGN_TWO_PATH) {
    return { key: 'about', type: 'about' };
  }

  if (relativePath === 'about') {
    return { key: 'about', type: 'about' };
  }

  if (relativePath === 'contact') {
    return { key: 'contact', type: 'contact' };
  }

  const match = relativePath.match(/^projects\/([^/]+)$/);

  if (match) {
    const project = projects.find((entry) => entry.slug === match[1]);

    if (project) {
      return {
        key: `project:${project.slug}`,
        project,
        type: 'project',
      };
    }
  }

  return { key: 'missing', type: 'missing' };
}

function DesignTwoLayout() {
  const location = useLocation();
  const actualRoute = parseDesignTwoRoute(location.pathname);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [displayedRoute, setDisplayedRoute] = useState(actualRoute);
  const [transitionState, setTransitionState] = useState('idle');

  useDocumentMeta(
    actualRoute.type === 'project'
      ? actualRoute.project.metaTitle
      : actualRoute.type === 'about'
        ? `Arthur Baduyen | ${DESIGN_TWO_NAME} About`
        : actualRoute.type === 'contact'
          ? `Arthur Baduyen | ${DESIGN_TWO_NAME} Contact`
          : `Arthur Baduyen | ${DESIGN_TWO_NAME}`,
    actualRoute.type === 'project'
      ? actualRoute.project.metaDescription
      : actualRoute.type === 'about'
        ? 'About Arthur Baduyen, Senior Product Designer with a focus on UX systems, product thinking, and AI-assisted development.'
        : actualRoute.type === 'contact'
          ? 'Contact Arthur Baduyen about product design, UI/UX, and AI-augmented design collaboration.'
          : 'Immersive portfolio exploration for Arthur Baduyen.'
  );

  useEffect(() => {
    if (actualRoute.type === 'missing' || actualRoute.key === displayedRoute.key) {
      return undefined;
    }

    if (prefersReducedMotion) {
      setDisplayedRoute(actualRoute);
      setTransitionState('idle');
      return undefined;
    }

    setTransitionState('exit');

    const swapTimer = window.setTimeout(() => {
      setDisplayedRoute(actualRoute);
      setTransitionState('enter');
    }, DESIGN_TWO_EXIT_MS);

    const finishTimer = window.setTimeout(() => {
      setTransitionState('idle');
    }, DESIGN_TWO_EXIT_MS + DESIGN_TWO_ENTER_MS);

    return () => {
      window.clearTimeout(swapTimer);
      window.clearTimeout(finishTimer);
    };
  }, [actualRoute, displayedRoute.key, prefersReducedMotion]);

  if (actualRoute.type === 'missing') {
    return <Navigate replace to={`${DESIGN_TWO_PATH}/projects/${DESIGN_TWO_DEFAULT_PROJECT.slug}`} />;
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-white">
      <div className="relative grid min-h-dvh grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)] overflow-hidden bg-white max-[980px]:grid-cols-1">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[45%] z-20 hidden w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(223,218,210,0.35),rgba(223,218,210,0.8),rgba(223,218,210,0.35))] shadow-[0_0_18px_rgba(255,255,255,0.55)] max-[980px]:hidden"
        />
        <section className="design-two-copy relative flex h-dvh min-h-dvh flex-col overflow-y-auto overflow-x-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,250,250,0.98))] px-12 py-10 max-[980px]:h-auto max-[980px]:min-h-0 max-[980px]:overflow-visible max-[980px]:border-b max-[980px]:border-[#ece7df] max-[980px]:px-7 max-[980px]:py-8">
          <DesignTwoHeader activeRoute={actualRoute.type} />
          <div
            className={`mt-10 flex-1 ${transitionState === 'exit' ? 'design-two-left-stage-exit' : ''} ${transitionState === 'enter' ? 'design-two-left-stage-enter' : ''}`}
            key={displayedRoute.key}
          >
            <DesignTwoLeftContent route={displayedRoute} />
          </div>
        </section>

        <section
          className={`relative h-dvh min-h-dvh ${displayedRoute.type === 'about' ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'} ${transitionState === 'exit' ? 'design-two-right-stage-exit' : ''} ${transitionState === 'enter' ? 'design-two-right-stage-enter' : ''} max-[980px]:h-auto max-[980px]:overflow-visible`}
          key={`${displayedRoute.key}-panel`}
        >
          <DesignTwoRightContent route={displayedRoute} />
        </section>
      </div>
    </main>
  );
}

function DesignTwoHeader({ activeRoute }) {
  return (
    <div className="flex items-center gap-6 text-[0.8rem] text-slate-500">
      <Link
        className="font-heading text-[1.05rem] font-bold text-slate-900 no-underline"
        to={DESIGN_TWO_PATH}
      >
        Arthur.
      </Link>
      <Link
        className={`transition-colors ${activeRoute === 'about' ? 'text-slate-900' : 'hover:text-slate-900'}`}
        to={DESIGN_TWO_PATH}
      >
        About
      </Link>
      <Link
        className={`transition-colors ${activeRoute === 'contact' ? 'text-slate-900' : 'hover:text-slate-900'}`}
        to={`${DESIGN_TWO_PATH}/contact`}
      >
        Contact
      </Link>
    </div>
  );
}

function DesignTwoLeftContent({ route }) {
  if (route.type === 'about') {
    return <DesignTwoAboutContent />;
  }

  if (route.type === 'contact') {
    return <DesignTwoContactContent />;
  }

  return <DesignTwoProjectDetails project={route.project} />;
}

function DesignTwoProjectDetails({ project }) {
  const currentIndex = projects.findIndex((entry) => entry.slug === project.slug);
  const previousProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <div className="flex h-full flex-col">
      <div className="design-two-left-item">
        <p className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
          {project.shortMeta.label}
        </p>
        <h1 className="mt-4 font-heading text-[clamp(2.6rem,5vw,4.7rem)] leading-[0.95] font-bold tracking-[-0.055em] text-slate-900">
          {project.name}
        </h1>
      </div>

      <div className="design-two-left-item mt-8 max-w-[28rem]">
        <p className="text-[1.08rem] leading-[1.85] text-slate-500">
          {project.shortMeta.summary}
        </p>
      </div>

      <dl className="design-two-left-item mt-8 grid gap-5 text-sm text-slate-500">
        {project.shortMeta.details.map((item) => (
          <div key={item.label}>
            <dt className="text-[0.68rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
              {item.label}
            </dt>
            <dd className="mt-1 text-[0.98rem] leading-[1.6] text-slate-800">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="design-two-left-item mt-auto border-t border-slate-200 pt-7">
        <div className="flex items-center gap-4 text-[0.96rem]">
          {previousProject ? (
            <Link
              className="text-slate-500 transition-colors hover:text-slate-900"
              to={`${DESIGN_TWO_PATH}/projects/${previousProject.slug}`}
            >
              Previous project
            </Link>
          ) : (
            <span className="cursor-not-allowed text-slate-300">Previous project</span>
          )}
          <span className="text-slate-300">|</span>
          {nextProject ? (
            <Link
              className="text-slate-500 transition-colors hover:text-slate-900"
              to={`${DESIGN_TWO_PATH}/projects/${nextProject.slug}`}
            >
              Next project
            </Link>
          ) : (
            <span className="cursor-not-allowed text-slate-300">Next project</span>
          )}
        </div>
      </div>
    </div>
  );
}

function DesignTwoAboutContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="design-two-left-item">
        <p className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
          About
        </p>
        <h1 className="mt-4 font-heading text-[clamp(2.4rem,4vw,4.1rem)] leading-[0.95] font-bold tracking-[-0.05em] text-slate-900">
          {aboutContent.title}
        </h1>
      </div>

      <div className="design-two-left-item mt-8 grid gap-5">
        {aboutContent.summary.map((paragraph) => (
          <p
            className="max-w-[30rem] text-[1.02rem] leading-[1.8] text-slate-500"
            key={paragraph}
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div className="design-two-left-item mt-10 grid gap-7 max-[980px]:grid-cols-1">
        <div>
          <p className="text-[0.68rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Strengths
          </p>
          <ul className="mt-3 grid gap-2 text-[0.98rem] text-slate-700">
            {aboutContent.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[0.68rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Tools
          </p>
          <ul className="mt-3 grid gap-2 text-[0.98rem] text-slate-700">
            {aboutContent.tools.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="design-two-left-item mt-auto border-t border-slate-200 pt-7">
        <p className="text-[0.68rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
          Experience
        </p>
        <div className="mt-3 grid gap-3 text-[0.95rem] text-slate-700">
          {aboutContent.experience.map((item) => (
            <p key={item}>
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesignTwoContactContent() {
  const [formState, setFormState] = useState({
    email: '',
    message: '',
    name: '',
  });

  const mailtoHref = `mailto:arthur.baduyen@gmail.com?subject=${encodeURIComponent(
    formState.name ? `Portfolio inquiry from ${formState.name}` : 'Portfolio inquiry'
  )}&body=${encodeURIComponent(
    `Name: ${formState.name || ''}\nEmail: ${formState.email || ''}\n\n${formState.message || ''}`
  )}`;

  return (
    <div className="flex h-full flex-col">
      <div className="design-two-left-item">
        <p className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
          Contact
        </p>
        <h1 className="mt-4 font-heading text-[clamp(2.3rem,4vw,4rem)] leading-[0.96] font-bold tracking-[-0.05em] text-slate-900">
          Let&apos;s talk about your next product.
        </h1>
        <p className="mt-6 max-w-[29rem] text-[1.02rem] leading-[1.8] text-slate-500">
          This is an inline prototype form. Fill it out and I&apos;ll open an email draft with your message.
        </p>
      </div>

      <form className="design-two-left-item mt-8 grid gap-4">
        <label className="grid gap-2">
          <span className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Name
          </span>
          <input
            className="rounded-full border border-slate-200 px-5 py-3 text-slate-900 outline-none transition-colors focus:border-slate-400"
            name="name"
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            type="text"
            value={formState.name}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Email
          </span>
          <input
            className="rounded-full border border-slate-200 px-5 py-3 text-slate-900 outline-none transition-colors focus:border-slate-400"
            name="email"
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            type="email"
            value={formState.email}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Message
          </span>
          <textarea
            className="min-h-36 rounded-[24px] border border-slate-200 px-5 py-4 text-slate-900 outline-none transition-colors focus:border-slate-400"
            name="message"
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                message: event.target.value,
              }))
            }
            value={formState.message}
          />
        </label>
      </form>

      <div className="design-two-left-item mt-auto border-t border-slate-200 pt-7">
        <a
          className="inline-flex min-h-13 items-center justify-center rounded-full bg-slate-900 px-5 py-4 text-center text-[1rem] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
          href={mailtoHref}
        >
          Open email draft
        </a>
      </div>
    </div>
  );
}

function DesignTwoRightContent({ route }) {
  if (route.type === 'about') {
    return <DesignTwoAboutProjects />;
  }

  if (route.type === 'contact') {
    return <DesignTwoContactPanel />;
  }

  return <DesignTwoProjectViewer project={route.project} />;
}

function DesignTwoAboutProjects() {
  return (
    <div className="design-two-right-panel flex h-full min-h-full flex-col border-l border-slate-200 bg-[#fbfaf7] max-[980px]:min-h-[55vh] max-[980px]:border-l-0">
      <div className="border-b border-slate-200 px-10 py-7 max-[980px]:px-7">
        <p className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
          Projects
        </p>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-px bg-slate-200 max-[980px]:grid-cols-2 max-[720px]:grid-cols-1">
        {projects.map((project) => (
          <Link
            className="group flex min-h-0 flex-col justify-between bg-[#fbfaf7] p-8 text-inherit no-underline transition-colors hover:text-slate-500 max-[980px]:p-6"
            key={project.slug}
            to={`${DESIGN_TWO_PATH}/projects/${project.slug}`}
          >
            <div>
              <h2 className="max-w-[11ch] font-heading text-[clamp(2rem,2.2vw,2.8rem)] leading-[0.98] font-medium tracking-[-0.04em] text-slate-900">
                {project.name}
              </h2>
            </div>

            <div className="mt-8">
              <p className="text-[0.78rem] font-bold tracking-[0.14em] text-slate-400 uppercase">
                {project.category}
              </p>
              <div className="mt-4 h-1.5 w-12 rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full"
                  style={{ backgroundColor: project.design2Color }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function DesignTwoContactPanel() {
  return (
    <div className="design-two-right-panel flex min-h-dvh items-center justify-center bg-[#f6f3ee] px-14 py-12 max-[980px]:min-h-[48vh] max-[980px]:px-7">
      <div className="max-w-xl text-center">
        <p className="text-[0.72rem] font-bold tracking-[0.18em] text-slate-400 uppercase">
          Contact
        </p>
        <h2 className="mt-4 font-heading text-[clamp(2.3rem,4vw,4.2rem)] leading-[0.95] font-bold tracking-[-0.05em] text-slate-900">
          Tell me what you&apos;re building.
        </h2>
        <p className="mt-6 text-[1.05rem] leading-[1.8] text-slate-500">
          Product design, design systems, UX strategy, and AI-augmented product work.
        </p>
      </div>
    </div>
  );
}

function DesignTwoProjectViewer({ project }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [screenIndex, setScreenIndex] = useState(0);
  const [displayedScreenIndex, setDisplayedScreenIndex] = useState(0);
  const [screenTransition, setScreenTransition] = useState('idle');
  const [screenDirection, setScreenDirection] = useState('next');
  const currentScreen = project.screens[displayedScreenIndex];

  useEffect(() => {
    setScreenIndex(0);
    setDisplayedScreenIndex(0);
    setScreenTransition('idle');
  }, [project.slug]);

  useEffect(() => {
    if (screenIndex === displayedScreenIndex) {
      return undefined;
    }

    if (prefersReducedMotion) {
      setDisplayedScreenIndex(screenIndex);
      setScreenTransition('idle');
      return undefined;
    }

    setScreenTransition('exit');

    const swapTimer = window.setTimeout(() => {
      setDisplayedScreenIndex(screenIndex);
      setScreenTransition('enter');
    }, 240);

    const finishTimer = window.setTimeout(() => {
      setScreenTransition('idle');
    }, 560);

    return () => {
      window.clearTimeout(swapTimer);
      window.clearTimeout(finishTimer);
    };
  }, [displayedScreenIndex, prefersReducedMotion, screenIndex]);

  function handleScreenChange(nextIndex) {
    if (
      nextIndex < 0 ||
      nextIndex >= project.screens.length ||
      nextIndex === screenIndex
    ) {
      return;
    }

    setScreenDirection(nextIndex > screenIndex ? 'next' : 'previous');
    setScreenIndex(nextIndex);
  }

  return (
    <div
      className="design-two-right-panel relative flex min-h-dvh items-center justify-center overflow-hidden px-14 py-12 max-[980px]:min-h-[55vh] max-[980px]:px-6"
      style={{ backgroundColor: project.design2Color }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(rgba(21,22,25,0.12)_0.9px,transparent_0.9px)] bg-[size:6px_6px] opacity-18" />
      <div className="relative flex h-full w-full items-center justify-center">
        <div
          className={`design-two-screen-frame max-w-[min(76%,820px)] overflow-hidden rounded-[24px] bg-white/35 shadow-[0_26px_60px_rgba(15,18,25,0.18)] backdrop-blur-[2px] max-[980px]:max-w-[88%] ${
            screenTransition === 'exit'
              ? screenDirection === 'next'
                ? 'design-two-screen-exit-next'
                : 'design-two-screen-exit-previous'
              : ''
          } ${
            screenTransition === 'enter'
              ? screenDirection === 'next'
                ? 'design-two-screen-enter-next'
                : 'design-two-screen-enter-previous'
              : ''
          }`}
          key={`${project.slug}-${displayedScreenIndex}`}
        >
          <SafeImage
            alt={currentScreen.alt}
            className="max-h-[72vh] w-full object-contain"
            fallbackClassName="h-[52vh] w-[min(76vw,760px)] rounded-[24px]"
            fallbackLabel={project.name}
            src={currentScreen.src}
          />
        </div>
      </div>

      <div className="absolute bottom-[4%] left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 rounded-full bg-white/85 px-4 py-3 text-[0.92rem] shadow-[0_18px_40px_rgba(18,20,24,0.16)] backdrop-blur-sm">
        <button
          className={`rounded-full px-3 py-2 transition-colors ${screenIndex === 0 ? 'cursor-not-allowed text-slate-300' : 'text-slate-700 hover:bg-slate-100'}`}
          disabled={screenIndex === 0}
          onClick={() => handleScreenChange(screenIndex - 1)}
          type="button"
        >
          Previous
        </button>
        <span className="min-w-22 text-center font-medium text-slate-700">
          {screenIndex + 1} / {project.screens.length}
        </span>
        <button
          className={`rounded-full px-3 py-2 transition-colors ${screenIndex === project.screens.length - 1 ? 'cursor-not-allowed text-slate-300' : 'text-slate-700 hover:bg-slate-100'}`}
          disabled={screenIndex === project.screens.length - 1}
          onClick={() => handleScreenChange(screenIndex + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<DesignIndexPage />} path="/" />

      <Route element={<DesignOneLayout />} path={DESIGN_ONE_PATH}>
        <Route element={<DesignOneHomePage />} index />
        <Route element={<DesignOneProjectPage />} path="projects/:slug" />
      </Route>

      <Route element={<Navigate replace to={DESIGN_TWO_PATH} />} path={`${DESIGN_TWO_PATH}/about`} />
      <Route element={<DesignTwoLayout />} path={`${DESIGN_TWO_PATH}/*`} />

      <Route
        element={<Navigate replace to={DESIGN_ONE_PATH} />}
        path="/projects/:slug"
      />
      <Route
        element={<Navigate replace to={DESIGN_ONE_PATH} />}
        path="/designs/editorial-split"
      />
      <Route
        element={<Navigate replace to={`${DESIGN_ONE_PATH}/projects/mrioa`} />}
        path="/designs/editorial-split/projects/mrioa"
      />
      <Route
        element={
          <Navigate replace to={`${DESIGN_ONE_PATH}/projects/contractsrx`} />
        }
        path="/designs/editorial-split/projects/contractsrx"
      />
      <Route
        element={
          <Navigate replace to={`${DESIGN_ONE_PATH}/projects/chromedia`} />
        }
        path="/designs/editorial-split/projects/chromedia"
      />
      <Route
        element={<Navigate replace to={`${DESIGN_ONE_PATH}/projects/nlrp`} />}
        path="/designs/editorial-split/projects/nlrp"
      />
      <Route
        element={
          <Navigate replace to={`${DESIGN_ONE_PATH}/projects/spokehealth`} />
        }
        path="/designs/editorial-split/projects/spokehealth"
      />
      <Route
        element={<Navigate replace to={DESIGN_ONE_PATH} />}
        path="/work.html"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
