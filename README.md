This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Local Development

`apps/web` must call the local Minikube `api-gateway` during development. Do not let local web traffic fall back to production.

1. Start the local Minikube gateway path documented in `../../docs/minikube-mobile-gateway-runbook.md`.
2. Copy `.env.local.example` to `.env.local`.
3. Set:

```bash
NEXT_PUBLIC_ENV=LOCAL
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
PUBLIC_TOKEN_MAPBOX=<public local Mapbox token>
```

`NEXT_PUBLIC_API_URL` must point to `api-gateway`. Do not point the web app directly to `auth-service`, `profile-service`, `spot-service`, `catalog-service`, or `version-service`.

`NEXT_PUBLIC_*` and `PUBLIC_*` variables are browser-visible. Never put server secrets, credentials, private tokens, verification codes, or SMTP credentials in them.

Run the environment guard before development or review:

```bash
npm run check:env
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Production and preview deployments are configured in Vercel. Set the public environment variables in Vercel, not in source-controlled env files:

```bash
NEXT_PUBLIC_ENV=PRODUCTION
NEXT_PUBLIC_API_URL=https://api.sportseek.fr
PUBLIC_TOKEN_MAPBOX=<public production Mapbox token>
```

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
