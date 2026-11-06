# Roadmap and Backlog: Nail Designer MVP

What we're building and why is in `PRD.md`. How Claude works in this repo is in `CLAUDE.md`. This file holds the build order, the user stories, and their status.

Priority: **P0** must have for the MVP, **P1** should have, **P2** stretch.
Status: `Done`, `In progress`, `Next`, `Backlog`.
Build the epics in order. Within an epic, build stories in order unless a story says otherwise.

## Release plan

| Release | Epic | Outcome | Status |
|---|---|---|---|
| 0.1 | E1: Hand and state | A hand on screen, nails selectable, skin tone changes | Done |
| 0.2 | E2: Shape and colour | Choose a nail shape and paint a base colour | In progress |
| 0.3 | E3: Stickers | Place, move, and resize stickers on nails | Backlog |
| 0.4 | E4: French tip, finish, undo | A complete design tool | Backlog |
| 1.0 | E5: Export and launch | Export a PNG, works on touch, live link, tested with real users | Backlog |

## Now

E2-S2 (choose a nail shape) is done. Next: **E2-S3, base colour.**

---

## E1: Hand and state (Release 0.1)

### E1-S1: Project scaffold. P0. Done
Developer setup so the app can be built and run.
Done when: Vite, React, TypeScript, and Tailwind run, dependencies are installed, and the dev server starts.

### E1-S2: Hand template. P0. Done
As a user, I see a hand with each nail as its own element, so I can work on one nail at a time.
Done when: two SVG hands render side by side with ten nails, ids `nail-0` to `nail-9` numbered left to right on screen, and clicking each nail registers which one it is.

### E1-S3: Select a nail. P0. Done
As a user, I can click a nail and see it is selected, so I know which nail my changes will apply to.
Done when: clicking a nail highlights it, clicking another moves the highlight, and selection is held in React state.

### E1-S4: App state model. P0. Done
Technical foundation for every later story.
Done when: `Nail` and `AppState` types exist in `src/state/nailState.ts`, a `useReducer` handles `SELECT_NAIL` and `SET_SKIN_TONE`, and the hand reads from that state.
Depends on: E1-S3.

### E1-S5: Skin tone picker. P0. Done
As a user, I can pick a skin tone so the hand looks like mine.
Done when: 6 to 8 swatches covering fair to deep are shown, picking one updates the hand colour immediately, and the nails stay visible against every tone.
Depends on: E1-S4.

---

## E2: Shape and colour (Release 0.2)

### E2-S1: Nail shape paths. P0. Done
Technical foundation for choosing shapes.
Done when: round, square, almond, and coffin paths exist in `src/shapes.ts` and each renders correctly in place of a nail.

### E2-S2: Choose a nail shape. P0. Done
As a user, I can choose a nail shape for the selected nails, so the set matches what I want.
Done when: four shape buttons with previews are shown, picking one changes the selected nails (or all nails if none are selected), and the choice is held in state through `SET_SHAPE`.
Depends on: E1-S4, E2-S1.

### E2-S3: Base colour. P0. Next
As a user, I can pick a colour for the selected nails, so I can paint the base.
Done when: a `react-colorful` picker sets the base colour on the selected nails through `SET_BASE_COLOR` and the nail fill updates immediately.
Depends on: E1-S4.

### E2-S4: Multi-select and apply to all. P0. Backlog
As a user, I can select several nails or all of them, so I don't repeat the same change ten times.
Done when: shift-click (and a tap equivalent on touch) adds or removes nails from the selection, and an "Apply to all" action applies the current shape and colour to every nail.
Depends on: E2-S2, E2-S3.

### E2-S5: Toolbar layout. P0. Backlog
As a user, I find all the controls in one consistent place.
Done when: shape and colour controls live in one toolbar, usable at phone width and from 768px up with no overlap.
Started early: the ribbon-style toolbar (`src/components/Toolbar.tsx`) exists with a Skin tone tab. Each new control is added as a tab.

---

## E3: Stickers (Release 0.3)

### E3-S1: Move nails to react-konva. P0. Backlog
Technical enabler. Do this before any other E3 story.
Done when: the nails render in a `react-konva` Stage and Layer, clicking and selection work as before, shape and colour from E2 still work, and nail ids and state shape are unchanged.
Depends on: E2 complete.

### E3-S2: Sticker assets. P0. Backlog
Done when: six simple SVG stickers exist (star, heart, dot, sparkle, line, flower), single colour, stored in `src/assets/stickers/`.

### E3-S3: Place a sticker. P0. Backlog
As a user, I can add a sticker to a nail, so I can decorate it.
Done when: a sticker panel shows the six stickers, picking one and then choosing a nail places it at the centre of that nail, and it is saved in that nail's `stickers` in state.
Depends on: E3-S1, E3-S2.

### E3-S4: Move, resize, and rotate a sticker. P0. Backlog
As a user, I can adjust a sticker, so it sits exactly where I imagined.
Done when: a placed sticker can be dragged, scaled, and rotated with the Konva Transformer, with mouse and touch, and the new position is saved in state.
Depends on: E3-S3.

### E3-S5: Keep stickers inside the nail. P0. Backlog
As a user, my designs never spill outside the nail.
Done when: sticker content is clipped to the nail shape for every shape, including while moving and scaling near the edges.
Depends on: E3-S4.

---

## E4: French tip, finish, undo (Release 0.4)

### E4-S1: French tip overlay. P0. Backlog
As a user, I can add a French tip to a nail, because it's one of the most requested designs.
Done when: a toggle adds or removes an arched tip overlay on the selected nails, stored as `hasFrenchTip`, and it stays within the nail shape.

### E4-S2: French tip controls. P0. Backlog
As a user, I can change the tip colour and thickness.
Done when: a tip colour picker and a thickness slider update the overlay immediately, for the selected nails or all nails.
Depends on: E4-S1.

### E4-S3: Matte and shiny finish. P1. Backlog
As a user, I can switch between matte and shiny, so I can see how the finish looks.
Done when: a toggle changes the finish visibly and the state is held in `finish`.

### E4-S4: Edit and delete a sticker. P1. Backlog
As a user, I can recolour or remove a sticker I've placed.
Done when: selecting a sticker shows a colour picker and a delete control, and both update state and display immediately.
Depends on: E3-S4.

### E4-S5: Undo. P1. Backlog
As a user, I can undo a mistake.
Done when: Cmd+Z (and an on-screen undo button for touch) reverts the last change. Redo is a stretch (P2).

---

## E5: Export and launch (Release 1.0)

### E5-S1: Export as PNG. P0. Backlog
As a user, I can save my design as an image, so I can show it to my artist or keep it.
Done when: an export button downloads a sharp PNG (2x resolution) of the finished hand with no selection highlights or toolbar in it.

### E5-S2: Touch and mobile support. P0. Backlog
As a user on a phone or tablet, every feature works.
Done when: every interaction from E1 to E5 has been tested on a phone and a tablet, with no tap-versus-drag conflicts.

### E5-S3: Visual polish. P1. Backlog
Done when: the app has an intentional palette and typography, clear hover and selected states, and consistent spacing.

### E5-S4: Deploy. P0. Backlog
Done when: the app is live on Vercel at a shareable link and works on a phone.

### E5-S5: User test. P0. Backlog
Done when: 3 people have used the app without help, observations are written down, and the top 3 issues are fixed. Compare results against the success metrics in `PRD.md`.
Depends on: E5-S4.

---

## Decisions log

| Date | Decision |
|---|---|
| 2026-11-06 | Claude builds the app end to end; the owner reviews and steers |
| 2026-11-06 | Plan organised by epics and prioritised stories instead of daily tasks |
| 2026-11-06 | MVP uses one hand with 5 nails; a second hand is post-MVP |
| 2026-11-06 | Changed: MVP shows two hands with 10 nails (`nail-0` to `nail-9`, left to right). Replaces the decision above |
| 2026-11-06 | Controls live in a ribbon-style toolbar at the top (like Word or Canva): one tab per feature, the tab expands into its options when clicked |
