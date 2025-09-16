## Proposed App Structure

- `src/app`
	- `layout.tsx`: root shell (theme, providers)
	- `(public)/`: public pages (landing, login)
	- `(app)/`: authenticated area
		- `layout.tsx`: app shell (nav, sidebar)
		- `dashboard/`
		- `weather/`
		- `farm-map/`
		- `ai-assistant/`
		- `profile/`
	- `debug/`
		- `firebase/`

- `src/components`
	- `ui/`: primitives (buttons, inputs)
	- `charts/`, `maps/`, `forms/`

- `src/features` (optional migration)
	- `weather/`, `mapping/`, `crops/` each with `components/`, `services/`, `hooks/`

- `src/lib`
	- `firebase.ts`, `news-service.ts`, `utils.ts`

- `src/ai`
	- `genkit.ts`, `flows/`

Rationale: clear separation of concerns, feature encapsulation, and scalable routes.
