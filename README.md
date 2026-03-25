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

### Contact form note

The current live contact experience opens a mail draft in the browser, so Cloudflare Pages
works fine for the site as-is.

There is also an `api/` folder in this repo from a serverless-mail setup, but that code is
not used by the current contact UI and will not automatically run on Cloudflare Pages without
being migrated to Cloudflare Pages Functions or Workers.

## Optional Serverless Email

The current contact page uses a `mailto:` flow, so no backend is required for deployment.

This repo still includes an optional `api/contact.js` serverless mail implementation from an
earlier setup. If you want to use that later, you will need these environment variables:

- `RESEND_API_KEY` - your Resend API key
- `RESEND_FROM_EMAIL` - sender address, ideally on a verified domain
- `CONTACT_TO_EMAIL` - inbox that should receive portfolio inquiries

If you use `onboarding@resend.dev` as the sender, Resend keeps the account in testing mode and
only allows sending to the email address tied to the Resend account. To send to any other inbox,
verify a domain in Resend and change `RESEND_FROM_EMAIL` to an address on that domain.

If you want to use that backend on Cloudflare later, it should be migrated to Cloudflare Pages
Functions or Workers first.
