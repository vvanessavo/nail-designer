# Roadmap and Backlog: Nail Designer MVP

What we're building and why is in `PRD.md`. How Claude works in this repo is in `CLAUDE.md`. This file holds the build order, the user stories, and their status.

Priority: **P0** must have for the MVP, **P1** should have, **P2** stretch.
Status: `Done`, `In progress`, `Next`, `Backlog`.
Build the epics in order. Within an epic, build stories in order unless a story says otherwise.

## Release plan

| Release | Epic | Outcome | Status |
|---|---|---|---|
| 0.1 | E1: Hand and state | A hand on screen, nails selectable, skin tone changes | Done |
| 0.2 | E2: Shape and colour | Choose a nail shape and paint a base colour | Done |
| 0.3 | E3: Stickers | Place, move, and resize stickers on nails | Done |
| 0.4 | E4: French tip, finish, undo | A complete design tool | Done |
| 1.0 | E5: Export and launch | Export a PNG, works on touch, live link, tested with real users | In progress |

## Now

E5-S1 (export as PNG) is done. Next: **E5-S2, touch and mobile support** (test every feature on a real phone and tablet).

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

### E2-S3: Base colour. P0. Done
As a user, I can pick a colour for the selected nails, so I can paint the base.
Done when: a `react-colorful` picker sets the base colour on the selected nails through `SET_BASE_COLOR` and the nail fill updates immediately.
Depends on: E1-S4.

### E2-S4: Multi-select and apply to all. P0. Done
As a user, I can select several nails or all of them, so I don't repeat the same change ten times.
Done when: shift-click (and a tap equivalent on touch) adds or removes nails from the selection, and an "Apply to all" action applies the current shape and colour to every nail.
Built as: an "Each nail / All nails" switch at the top of the Shape and Colour tabs (`applyToAll` in state). In Each nail mode every tap (or shift-click) adds or removes a nail, with a count and a Clear link. A dot marks the nails a change will go to.
Depends on: E2-S2, E2-S3.

### E2-S5: Toolbar layout. P0. Done
As a user, I find all the controls in one consistent place.
Done when: shape and colour controls live in one toolbar, usable at phone width and from 768px up with no overlap.
Built as: a ribbon-style toolbar (`src/components/Toolbar.tsx`), one tab per feature. Checked at 320, 390, 768 and 1280px wide: nothing off-screen, open panels capped at 45% of the screen height (scroll inside), and the hands shrink to stay fully visible.

---

## E3: Stickers (Release 0.3)

### E3-S1: Move nails to react-konva. P0. Done
Technical enabler. Do this before any other E3 story.
Done when: the nails render in a `react-konva` Stage and Layer, clicking and selection work as before, shape and colour from E2 still work, and nail ids and state shape are unchanged.
Depends on: E2 complete.

### E3-S2: Sticker assets. P0. Done
Done when: six simple SVG stickers exist (star, heart, dot, sparkle, line, flower), single colour, stored in `src/assets/stickers/`.
Built as: one `<path>` per file on a 24 x 24 grid. `src/stickers.ts` loads them and exposes each outline, so Konva can draw a sticker in any colour.

### E3-S3: Place a sticker. P0. Done
As a user, I can add a sticker to a nail, so I can decorate it.
Done when: a sticker panel shows the six stickers, picking one and then choosing a nail places it at the centre of that nail, and it is saved in that nail's `stickers` in state.
Depends on: E3-S1, E3-S2.

### E3-S4: Move, resize, and rotate a sticker. P0. Done
As a user, I can adjust a sticker, so it sits exactly where I imagined.
Done when: a placed sticker can be dragged, scaled, and rotated with the Konva Transformer, with mouse and touch, and the new position is saved in state.
Built as: in the Stickers tab (nothing picked), tap a sticker to show handles. Drag inside the box to move (centre stays on the nail), corners resize from the middle (0.3x to 1.6x), the top handle turns it (snaps to straight). Tap elsewhere to put the handles away.
Depends on: E3-S3.

### E3-S5: Keep stickers inside the nail. P0. Done
As a user, my designs never spill outside the nail.
Done when: sticker content is clipped to the nail shape for every shape, including while moving and scaling near the edges.
Built as: each nail's stickers sit in a Konva `Group` clipped to the nail's own outline. While dragging, the sticker's middle can't leave the nail outline: past the edge it stops at the edge. The handles are drawn outside the clip, so they stay visible.
Depends on: E3-S4.

### E3-S6: Zoom in on a hand. P1. Done
As a user on a phone, I can zoom in on one hand, so nails and stickers are big enough to see and work on.
Done when: a zoom control (and pinch on touch) enlarges the hands, I can pan to the hand or nail I'm working on, a reset button returns to the full view, and taps, sticker placement and sticker editing still hit the right nail while zoomed.
Built as: −, + and Reset buttons in the bottom-right corner of the hands area (up to 4x). Pinch on touch, and trackpad pinch or Ctrl + scroll on a computer, zoom around the fingers or mouse. While zoomed, dragging anywhere except a sticker pans. The canvas now fills the whole area below the toolbar, so a zoomed view uses all of the screen. A pinch or pan never counts as a tap.
Depends on: E3-S3. Best built after E3-S4 so dragging stickers and panning don't conflict.

---

## E4: French tip, finish, undo (Release 0.4)

### E4-S1: French tip overlay. P0. Done
As a user, I can add a French tip to a nail, because it's one of the most requested designs.
Done when: a toggle adds or removes an arched tip overlay on the selected nails, stored as `hasFrenchTip`, and it stays within the nail shape.
Built as: a French tip tab with the Each nail / All nails switch and an on / off switch (`SET_FRENCH_TIP`). The tip is `frenchTipPath` in `src/shapes.ts`: everything above a curved smile line, clipped to the nail outline like the stickers, and drawn under them. It covers 80% of the free edge in the middle. The nail's edge line is now drawn last, on top of the tip and stickers.

### E4-S2: French tip controls. P0. Done
As a user, I can change the tip colour and thickness.
Done when: a tip colour picker and a thickness slider update the overlay immediately, for the selected nails or all nails.
Built as: under the French tip switch, once the target nails have a tip: a Thin to Thick slider (`SET_FRENCH_TIP_THICKNESS`, new `frenchTipThickness` field, 0.3 to 1.3, starts at 0.8) and the same colour swatches and custom picker as the Colour tab (`SET_FRENCH_TIP_COLOR`).
Depends on: E4-S1.

### E4-S3: Matte and shiny finish. P1. Done
As a user, I can switch between matte and shiny, so I can see how the finish looks.
Done when: a toggle changes the finish visibly and the state is held in `finish`.
Built as: a Shiny / Matte switch in the Colour tab, under the swatches (`SET_FINISH`). Shiny draws two white highlight streaks that fade down the nail; matte draws a faint white haze that flattens the colour. Both go over the tip and stickers, like a top coat. Nails start shiny.

### E4-S4: Edit and delete a sticker. P1. Done
As a user, I can recolour or remove a sticker I've placed.
Done when: selecting a sticker shows a colour picker and a delete control, and both update state and display immediately.
Built as: under the hint in the Stickers tab, a sideways-scrolling row of colour swatches (plus Gold and Silver) and a delete button. They're greyed out until you tap a placed sticker. They're always shown so the panel never changes height: a taller panel re-fits the hands and moves the sticker out from under your finger. Recolouring goes through `UPDATE_STICKER`, deleting through `DELETE_STICKER`. On a computer, Delete or Backspace also removes the selected sticker.
Depends on: E3-S4.

### E4-S5: Undo. P1. Done
As a user, I can undo a mistake.
Done when: Cmd+Z (and an on-screen undo button for touch) reverts the last change. Redo is a stretch (P2).
Built as: `historyReducer` in `src/state/nailState.ts` keeps up to 50 earlier designs. Every design change saves one; choosing nails doesn't. Quick runs of the same change (under 0.6 s apart, e.g. dragging the colour picker or the thickness slider) count as one step. Undo puts back skin tone and nails, and keeps the current nail selection. An Undo button sits bottom-left of the hands area, and Cmd+Z / Ctrl+Z work except while typing in a text box. Redo isn't built.

---

## E5: Export and launch (Release 1.0)

### E5-S1: Export as PNG. P0. Done
As a user, I can save my design as an image, so I can show it to my artist or keep it.
Done when: an export button downloads a sharp PNG (2x resolution) of the finished hand with no selection highlights or toolbar in it.
Built as: a Save button at the right end of the toolbar downloads `my-nail-design.png` (`src/exportImage.ts`). It always shows both hands in full, whatever the zoom, on the app's pink background with a small margin, without the selection dots or sticker handles. It's 4 pixels per drawing unit (2180 x 1488 px): at least twice the size the hands show on any screen.

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
| 2026-11-06 | An "Each nail / All nails" switch decides where shape and colour changes go; tapping a nail switches to Each nail. Targeted nails are marked with a small dark dot above the tip instead of a red outline |
| 2026-11-06 | Multi-select on touch: in Each nail mode a tap adds or removes a nail (no long-press), with a Clear link; tapping a nail in All nails mode starts a fresh selection with that nail |
| 2026-11-07 | Added E3-S6, zoom in on a hand: both hands share a phone's width, so nails and stickers are small; zooming makes decorating practical |
| 2026-11-09 | The finish switch lives in the Colour tab rather than its own tab: it's part of the polish, and fewer tabs fit better on a phone |
| 2026-11-09 | Zoom lives in the hands area (buttons bottom-right), not the toolbar, so it's available in every tab. While zoomed, a one-finger drag pans; stickers are moved by dragging them directly |
