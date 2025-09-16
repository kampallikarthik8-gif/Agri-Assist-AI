## Environment & Config

- Local: `.env.local` for secrets; never commit.
- Example: create `.env.local.example` with keys only.

### Keys
- OpenWeather: `OPENWEATHER_API_KEY`
- Google Maps (public): `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Firebase (public web config): `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- Genkit Google AI: `GEMINI_API_KEY` or `GOOGLE_API_KEY`

### Deployment
- Set the same keys in your hosting provider (Vercel/Cloud Run/App Hosting).
- Restart deployments to apply changes.
