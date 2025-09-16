## AI Layer (Genkit) Standards

- `src/ai/genkit.ts`: single entry configuring plugins and default model.
- Flows live in `src/ai/flows/*`.
- Each flow exports:
	- `defineTool` (where user-invoked), `defineFlow` for orchestration
	- Zod `inputSchema` and `outputSchema`
- Access external APIs via `src/lib/*` helpers, not directly inside flows.
- Error mapping: throw descriptive errors; UI catches and surfaces clear messages.

### Env
- `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) required for `@genkit-ai/googleai`.

### Dev server
- `npm run genkit:dev` to explore flows locally.
