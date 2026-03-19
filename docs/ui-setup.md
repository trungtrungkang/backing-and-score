# UI: Tailwind CSS + shadcn/ui

## Stack

- **Tailwind CSS v3** — utility-first CSS (PostCSS)
- **shadcn/ui** — copy-paste components (Radix primitives + Tailwind)
- **lucide-react** — icons (configured in `components.json`)

## Config

- `tailwind.config.ts` — content paths, theme (colors from CSS vars), `tailwindcss-animate`
- `postcss.config.mjs` — tailwindcss + autoprefixer
- `src/app/globals.css` — `@tailwind` directives + CSS variables (light/dark)
- `components.json` — shadcn CLI config (aliases, style)
- `src/lib/utils.ts` — `cn()` for merging Tailwind classes

## Installed components

- `src/components/ui/button.tsx` — Button (variants: default, destructive, outline, secondary, ghost, link; sizes)
- `src/components/ui/input.tsx` — Input
- `src/components/ui/card.tsx` — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `src/components/ui/label.tsx` — Label (for forms)

## Usage

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Button variant="outline" size="sm">Click</Button>
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>...</CardContent></Card>
```

## Adding more components

Use the shadcn CLI (with Tailwind v3, use the same config; components may need small tweaks if they assume v4):

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

Or copy component code from [ui.shadcn.com](https://ui.shadcn.com/docs/components) and place under `src/components/ui/`. Ensure dependencies (e.g. `@radix-ui/react-*`) are installed.

## Dark mode

CSS variables in `globals.css` support `.dark` on an ancestor. For system preference, `prefers-color-scheme: dark` is applied on `:root`. To toggle dark mode manually, add a class `dark` to `<html>` (e.g. via a theme provider).
