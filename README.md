# Arthur Baduyen Portfolio

React + Tailwind portfolio site for Arthur Baduyen.

## Stack

- React
- React Router
- Tailwind CSS
- Vite

## Project Structure

- `src/App.jsx` - app shell, routes, and page UI
- `src/data.js` - project content and metadata
- `src/styles.css` - Tailwind import plus app-level styles
- `public/assets/` - images and PDFs served by Vite

## Development

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Build for production:
   `npm run build`

## CI/CD

GitHub Actions runs CI for pull requests into `main` and for direct pushes to `main`.
The workflow installs dependencies with `npm ci` and validates the production build with
`npm run build`.

Deployment can stay in Cloudflare Pages:

- preview deployments for branch and pull request changes
- production deployments from `main`

## Cloudflare Pages

This project is ready to deploy on Cloudflare Pages as a static React/Vite site.

Use these settings in the Cloudflare Pages dashboard:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

### SPA routing

The app uses React Router, so client-side routes like `/design2` and `/design2/contact`
need to resolve to `index.html` on direct visits. That is already configured via:

- `public/_redirects`

### Static images and files

All portfolio images and PDFs can stay in:

- `public/assets/`

Those files are served directly by Cloudflare Pages. Basic caching headers for assets and
the favicon are already configured via:

- `public/_headers`

### Connect the repo

1. Push the latest code to GitHub.
2. In Cloudflare, go to `Workers & Pages` -> `Create application` -> `Pages` -> `Connect to Git`.
3. Select this repository.
4. Use the build settings above.
5. Deploy.

### Contact form

The contact page posts to `/api/contact`.

For local Vite development, this repo includes dev middleware in `vite.config.js`.

For Cloudflare Pages production, this repo includes a Pages Function at:

- `functions/api/contact.js`

### Email environment variables

Set these variables in Cloudflare Pages under `Settings > Variables and Secrets`:

- `RESEND_API_KEY` - your Resend API key
- `RESEND_FROM_EMAIL` - sender address, ideally on a verified domain
- `CONTACT_TO_EMAIL` - inbox that should receive portfolio inquiries
- `CONTACT_ALLOWED_ORIGINS` - comma-separated list of allowed extra origins, if needed
- `CONTACT_RATE_LIMIT_MAX` - optional max contact attempts per IP in the rate-limit window
- `CONTACT_RATE_LIMIT_WINDOW_MS` - optional rate-limit window in milliseconds
- `TURNSTILE_SECRET_KEY` - optional Cloudflare Turnstile secret for bot protection
- `VITE_TURNSTILE_SITE_KEY` - optional Cloudflare Turnstile site key for the contact form

If you use `onboarding@resend.dev` as the sender, Resend keeps the account in testing mode and
only allows sending to the email address tied to the Resend account. To send to any other inbox,
verify a domain in Resend and change `RESEND_FROM_EMAIL` to an address on that domain.

Because this site is deployed on Cloudflare Pages, changing those production variables requires
redeploying the site before the new values take effect.

### Security baseline

The contact endpoint supports:

- optional Turnstile verification before email is sent
- origin checks for incoming form submissions
- best-effort per-IP rate limiting in the application layer
- stricter response headers via `public/_headers`

### Production rate limiting in Cloudflare

For stronger production protection, add a Cloudflare WAF rate limiting rule for the contact
endpoint. This is configured in Cloudflare, not in the repo.

Recommended rule:

- Expression:
  `(http.request.uri.path eq "/api/contact" and http.request.method eq "POST")`
- Characteristics:
  `IP`
- Rate:
  `5 requests`
- Period:
  `10 minutes`
- Action:
  `Block`
- Mitigation timeout:
  `10 minutes`

Where to configure it:

1. Open your zone in Cloudflare.
2. Go to `Security` -> `WAF` -> `Rate limiting rules`.
3. Create a new rule with the settings above.

This complements the in-app limiter. The in-app limiter is useful, but Cloudflare edge rate
limiting is the stronger production control.
