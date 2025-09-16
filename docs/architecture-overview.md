## Architecture Overview

- **App framework**: Next.js App Router (RSC + client components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + design tokens
- **UI**: Radix primitives + custom components
- **State**: Local React state; server actions for mutations; minimal client stores per feature
- **AI Layer**: Genkit flows/tools under `src/ai`, invoked from server components/actions
- **Data**: Firebase (Auth, Firestore, Storage), external APIs (OpenWeather, Google Maps)

### Layering
- `src/app`: routes, layouts, pages (RSC-first). Client islands within.
- `src/components`: presentational and interactive components.
- `src/features`: feature modules (optional migration target) bundling UI + hooks + services per domain.
- `src/lib`: framework-agnostic utilities, SDK initializers, pure functions.
- `src/ai`: Genkit configuration, flows, and tools.
- `src/hooks`: reusable React hooks.

### Cross-cutting concerns
- Error handling: user-friendly toasts, server-side validation with Zod.
- Observability: console logging in dev; room to add Sentry later.
- Accessibility: Radix primitives, ARIA labels, focus states.

### Data flow
- UI triggers server actions/flows → services call SDKs/APIs → results returned to RSC/clients.

### Build/deploy
- Next build; environment via `.env*`; support for local emulators where available.
