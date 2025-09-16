## Design System Guidelines

- Typography: adopt a consistent scale; leverage Tailwind presets.
- Colors: base tokens (primary, secondary, success, warning, danger). Prefer CSS variables.
- Spacing: 4/8 grid; consistent container widths.
- Components: build on Radix + custom `ui/*` primitives (Button, Input, Select, Dialog, Sheet, Tabs, Toast).
- Icons: Lucide icons centralized in `components/icons.tsx`.
- Accessibility: focus outlines, keyboard nav, ARIA labels; test with screen readers.
- Theming: dark mode support via CSS variables and class toggles.
