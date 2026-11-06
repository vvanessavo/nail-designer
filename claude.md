# Nail Designer

A mobile-first web app where people design their own nail sets: pick a hand, shape, colour, and decorations, then export a picture of the finished set. Built as a learning project, so the owner is a beginner developer building it from scratch.

## Who it's for

- Nail artists (salon and independent)
- Clients who have a clear vision but can't draw it or find the exact Pinterest reference
- DIY users trying designs at home

## Problem it solves

People have a specific set in mind but can't draw it, and they end up collaging several inspiration images to describe it. This app lets them build the set once and see it.

## MVP scope

The MVP proves one thing: a user can visualise a complete nail set without Photoshop or Pinterest collages.

> A user opens the app, sees a hand, picks a skin tone, picks a nail shape, paints a base colour on each nail, drops a few stickers, toggles matte or shiny, and exports a PNG.

**In scope**
- Hand template with skin tone selector
- 4 nail shapes: round, square, almond, coffin
- Solid base colour
- Stickers: star, heart, dot, sparkle, line, flower
- French tip overlay (colour and thickness)
- Matte / shiny toggle
- Select one, several, or all nails; apply to all
- Single-step undo
- PNG export

**Out of scope for now (do not build unless asked)**
Length slider, ombre/chrome/pearl/glitter finishes, freehand drawing, text tool, 3D elements, layers panel, accounts, cloud save, gallery or sharing.

## Tech stack

- React + TypeScript (Vite)
- Tailwind CSS (via `@tailwindcss/vite`)
- `react-konva` + `konva` for the drawing canvas (arrives around Day 11; the hand is plain SVG until then)
- `react-colorful` for colour picking
- State: `useState` / `useReducer` only. No Zustand, Redux, or backend for the MVP.
- ESLint (Vite template default)
- Node 22 via nvm (Vite requires Node ^20.19 or >=22.12)

## Commands

```bash
npm run dev      # start dev server at http://localhost:5173
npm run build    # type-check and production build
npm run lint     # ESLint
```

## Project structure

```
src/
  assets/          hand.svg and sticker SVGs
  components/      UI components (Hand, Toolbar, StickerPanel, etc.)
  state/           nailState.ts: types and reducer
  App.tsx
  main.tsx
  index.css        contains only: @import "tailwindcss";
```

Add new folders only when a feature needs them.

## Data model

Design decisions flow from this. Keep it in sync with `src/state/nailState.ts`.

```ts
type Finish = 'matte' | 'shiny'
type NailShape = 'round' | 'square' | 'almond' | 'coffin'

type Sticker = {
  id: string
  type: 'heart' | 'star' | 'dot' | 'sparkle' | 'line' | 'flower'
  x: number
  y: number
  scale: number
  color: string
}

type Nail = {
  id: number              // nail-0 ... nail-N
  shape: NailShape
  baseColor: string       // hex
  finish: Finish
  hasFrenchTip: boolean
  frenchTipColor: string
  stickers: Sticker[]
}

type AppState = {
  skinTone: string        // hex
  nails: Nail[]
  selectedNailIds: number[]
}
```

The current hand is one hand with 5 nails (`nail-0` pinky to `nail-4` thumb). A second hand (10 nails total) comes after the logic works.

## How to work on this project

**The owner is learning.** They chose to have Claude build directly in the CLI, so the default role is Builder, with these habits:

- Make the change, then give a short summary (2 to 4 lines): what changed, which files, and the one concept worth knowing (for example "this is `useReducer`, which centralises state updates").
- When introducing a React, TypeScript, SVG, or Konva concept for the first time, explain it in one or two plain sentences.
- Prefer the simplest approach that works. Don't add libraries, abstractions, or folders the current task doesn't need.
- If the owner says "let me try this one" or asks to be guided, switch to mentor mode for that task: explain, give hints, and let them write the code.
- Work one roadmap day at a time. Check `ROADMAP.md` for the current day and don't jump ahead.
- If a request conflicts with the MVP scope, say so and ask before building it.

## Git workflow (Feature Branch Workflow)

Claude has full Git access: it may create branches, commit, and merge into `main`.

- `main` always runs. Never commit directly to `main` except the merge itself.
- One branch per feature, named `feature/<short-name>` (for example `feature/nail-state`).
- Commit small and often, with a plain-language message in the imperative: `add nail selection state`.
- Before merging: `npm run build` and `npm run lint` pass, and the app works in the browser.
- Merge the feature branch into `main`, then tell the owner what was merged.
- Never force-push, rewrite history, or run `git reset --hard` without asking first.
- Ask before deleting branches, and ask before pushing to a remote.

## Code conventions

- Function components with hooks. No class components.
- TypeScript: no `any`. Define types for props and state.
- Styling with Tailwind utility classes. Use `className`, not `class`.
- JSX elements with more than 3 attributes put each attribute on its own line, closing `/>` on its own line.
- SVG nail elements keep their ids (`nail-0`, `nail-1`, ...). The ids are how nails are targeted.
- One component per file, file name matches the component name.
- Mobile and touch matter: use pointer events or make sure touch works for any new interaction.

## Definition of done (per roadmap day)

1. The day's goal in `ROADMAP.md` works in the browser.
2. No console errors, no TypeScript errors, lint passes.
3. Work is committed on a feature branch and merged to `main` once the day's goal is met.
4. The day's box in `ROADMAP.md` is ticked.

## Current status

See `ROADMAP.md`. Update the checkboxes there as days finish.
