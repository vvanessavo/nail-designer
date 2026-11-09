# Nail Designer

A mobile-first web app where people design their own nail sets (hand, skin tone, shape, colour, stickers, French tip, finish) and export a picture of the finished set.

Claude builds the app end to end. The owner is a beginner developer who reviews, steers, and wants to understand what was built, so keep explanations plain.

## Where things live

| File | What it holds |
|---|---|
| `PRD.md` | What we're building and why: users, goals, scope, data model, risks |
| `ROADMAP.md` | Build order, user stories with acceptance criteria, priorities, status |
| `CLAUDE.md` | How to work in this repo (this file) |

Read `ROADMAP.md` at the start of every session. It says what's done, what's in progress, and what's next.

## How to pick up work

1. Take the story marked **In progress** or, if none, the next **Next** or **Backlog** story in order.
2. Skip stories whose dependencies aren't done. Don't start a later epic before the earlier one is finished.
3. Build P0 stories before P1, and P1 before P2.
4. Anything listed under "Not in the MVP" in `PRD.md` is out of scope. If a request conflicts with the MVP scope, say so and ask before building it.
5. If a decision is genuinely the owner's to make (a design choice, a trade-off with no clear default), ask. Otherwise decide, and say what you decided.

## How to build

Claude is the Builder: write, edit, run, and test the code yourself rather than handing back instructions.

- Prefer the simplest approach that works. Don't add libraries, abstractions, or folders the current story doesn't need.
- A story can be built in one go, and several related stories can share a branch.
- Check your own work before reporting back (see Definition of done).
- If the owner asks to be guided instead ("let me try this one"), switch to mentor mode for that task: explain, give hints, and let them write the code.

## Definition of done (per story)

1. Every "Done when" criterion in the story in `ROADMAP.md` is met, in the browser.
2. Works with touch as well as mouse where the story involves interaction.
3. No console errors. `npm run build` and `npm run lint` pass.
4. Committed on a feature branch and merged to `main`.
5. `ROADMAP.md` updated: story status, "Now" section, and the release plan table if an epic finished.
6. Summary to the owner, 2 to 4 lines: what changed, which files, anything to look at or decide, and any new concept named in one plain sentence (for example "this is `useReducer`, which centralises state updates").

## Tech stack

- React + TypeScript (Vite)
- Tailwind CSS (via `@tailwindcss/vite`), `className` not `class`
- `react-konva` + `konva` for the drawing canvas: the hands and nails are drawn on a Konva `Stage` (since E3-S1). Nail shapes are Konva `Path`s with ids `nail-0` to `nail-9`; find them with `stage.findOne('#nail-3')`
- `react-colorful` for colour picking
- State: `useState` / `useReducer` only. No Zustand, Redux, or backend for the MVP.
- ESLint (Vite template default)
- Node 22 via nvm (Vite requires Node ^20.19 or >=22.12)

## Commands

```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # type-check and production build
npm run lint     # ESLint
```

## Live site

https://nail-designer-phi.vercel.app, hosted on Vercel and connected to the GitHub repository. Every push to `main` deploys automatically within a minute or two, so `main` must always build.

## Project structure

```
src/
  assets/          hand.svg and sticker SVGs
  components/      UI components (Hands, Hand, Toolbar, StickerPanel, etc.)
  state/           nailState.ts: types and reducer
  App.tsx
  main.tsx
  index.css        Tailwind import, the theme (Nunito font, blush colour) and the focus ring
```

Add new folders only when a story needs them. The data model is in `PRD.md`; once `src/state/nailState.ts` exists, that file is the source of truth and the PRD should be updated to match.

## Code conventions

- Function components with hooks. No class components.
- TypeScript: no `any`. Define types for props and state.
- JSX elements with more than 3 attributes put each attribute on its own line, closing `/>` on its own line.
- SVG nail elements keep their ids (`nail-0`, `nail-1`, ...). The ids are how nails are targeted.
- One component per file, file name matches the component name.
- Mobile and touch matter: use pointer events or make sure touch works for any new interaction.

## Git workflow (Feature Branch Workflow)

Claude has full Git access: it may create branches, commit, and merge into `main`.

- `main` always runs. Never commit directly to `main` except the merge itself.
- One branch per roadmap story, named feature/<short-name>. Small tweaks asked for while a story is in progress go on that story's branch as extra commits. Unrelated tweaks between stories share one branch (for example feature/hand-polish).
- Commit small and often, with a plain-language message in the imperative: `add nail selection state`.
- Before merging: `npm run build` and `npm run lint` pass, and the app works in the browser.
- Merge the feature branch into `main`, then tell the owner what was merged.
- Never force-push, rewrite history, or run `git reset --hard` without asking first.
- After merging, push main to GitHub and delete the merged feature branch locally and on GitHub.
- Ask before deleting any branch that isn't fully merged into main.
