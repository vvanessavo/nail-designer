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
| 1.0 | E5: Export and launch | Export a PNG, works on touch, live link, tested with real users | Done except the user test, which is on hold |
| 1.1 | E6: Richer design | More shapes, length, special bases, copy design, redo, freehand, text, autosave, mirror hands, recent colours | In progress |
| 1.2 | E7: Start and share | Starter designs, design recipe sheet, share link | Backlog |
| 1.3 | E8: More nail art | French tip styles, gems and pearls, patterns, trending effects | Backlog |

## Now

E5-S4 (deploy) is done: the app is live at https://nail-designer-phi.vercel.app. E6-S2 (nail length) and E6-S11 (real nail-art stickers, done out of order at the owner's request) are done, E6-S3 (special bases), E6-S4 (copy a design) and E6-S5 (redo). Next: **E6-S6, freehand drawing**. Order: E6, then E7, then E8. The user test (E5-S5) is on hold until the owner asks for it.

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

### E5-S2: Touch and mobile support. P0. Done
As a user on a phone or tablet, every feature works.
Done when: every interaction from E1 to E5 has been tested on a phone and a tablet, with no tap-versus-drag conflicts.
So far: an automated touch run of every interaction (31 checks) passes on 5 simulated sizes, from a 320px phone to an iPad in landscape: taps, multi-select, colour picker drag, panel and tab-row swipes, slider, sticker place / drag / resize / turn / recolour / delete, zoom, pan, pinch, undo and save. Pans, pinches and sticker drags never count as nail taps. Fixes: no double-tap page zoom, no long-press menu on the hands, no grey tap flash, and a bigger invisible grab area on the sticker handles (about 26px). From the owner's phone test: sticker colours couldn't be changed. Fixed: the sticker colour row always works (with no sticker selected it sets the colour for the next stickers placed), Gold and Silver come first, and each sticker responds to taps in a circle at least 32px across, since stickers are only about 8px wide on a phone. 2026-11-09: the owner ran the full checklist on a real device and everything works.

### E5-S3: Visual polish. P1. Done
Done when: the app has an intentional palette and typography, clear hover and selected states, and consistent spacing.
Built as: the "Soft blush" look the owner chose. A blush background (#FFF5F5, `bg-blush`), white panels, warm grey text (Tailwind stone), one rose accent (rose-600) for selected items and Save, and the Nunito font (loaded in the background from Google Fonts). The theme lives in `src/index.css`. Every button has hover and pressed feedback (tiles press in, swatches grow, floating buttons tint rose), and a rose focus ring shows for keyboard users. Panels use the same spacing throughout. Also: rounded webbing between the fingers instead of square notches, a nail favicon, the page title "Nail Designer", and a matching phone address-bar colour.

### E5-S4: Deploy. P0. Done
Done when: the app is live on Vercel at a shareable link and works on a phone.
Built as: the GitHub repository is connected to Vercel (Vite settings detected, nothing changed), so every push to `main` redeploys automatically. Live at https://nail-designer-phi.vercel.app. The full touch run passes against the live site on all 5 phone and tablet sizes.

### E5-S5: User test. P0. On hold
On hold at the owner's request (2026-11-09); not scheduled until the owner asks for it.
Done when: 3 people have used the app without help, observations are written down, and the top 3 issues are fixed. Compare results against the success metrics in `PRD.md`.
Depends on: E5-S4.

---

## E6: Richer design (Release 1.1)

Pulled forward from the later releases at the owner's request. Every new feature also works with undo, with touch, and in exported pictures.

### E6-S1: More nail shapes. P1. Done
As a user, I can choose stiletto, squoval or natural nails, so more real styles are possible.
Done when: stiletto (long, sharp point), squoval (square with soft corners) and natural (short, follows the fingertip) sit next to the four existing shapes in the Shape tab, and French tips, stickers and clipping work on all of them.
Built as: three new cases in `src/shapes.ts` (stiletto 1.4x the nail's width past the fingertip, squoval 0.38x with rounded corners, natural 0.18x with a gentle curve), and a second row in the Shape tab (4 + 3 buttons).

### E6-S2: Nail length. P1. Done
As a user, I can make nails shorter or longer, so the set matches the length I want.
Done when: a length slider plus Short / Medium / Long presets in the Shape tab change how far the free edge grows, for the selected or all nails, stored per nail, and tips, stickers and clipping follow the new length.
Depends on: E6-S1.
Built as: a `length` field per nail (1 = the shape's usual length, 0.5 to 2), `SET_LENGTH`, and a Length row in the Shape tab with Short (0.6) / Medium (1) / Long (1.5) and a slider. Every outline in `src/shapes.ts` scales with it. The drawing's top moves up when nails get long (`drawingTop` in the new `src/handGeometry.ts`), so tips and dots are never cut off, on screen or in saved pictures; with usual-length nails the layout is unchanged.

### E6-S3: Special bases. P1. Done
As a user, I can choose an ombre, chrome, pearl or glitter base, so I can try popular effects.
Done when: the Colour tab offers Plain, Ombre (fades from the base colour to a second colour I pick), Chrome (mirror-like metal shine), Pearl (soft shimmer) and Glitter (sparkly specks), stored per nail, visible on screen and in the exported picture.
Built as: `baseEffect` and `effectColor` per nail, `SET_BASE_EFFECT` / `SET_EFFECT_COLOR`, and an effect row in the Colour tab (Plain, Ombre, Chrome, Pearl, Glitter) with a second colour row for ombre ("Fades to") and glitter. Ombre and chrome are gradients on the nail's own fill; pearl (a see-through rainbow sheen) and glitter (70 specks in three shades, always in the same places per nail) are drawn by `src/components/NailEffect.tsx`. Colour mixing helpers are in `src/colour.ts`.

### E6-S4: Copy a design to other nails. P1. Done
As a user, I can copy one nail's whole design onto other nails, so I don't rebuild it nail by nail.
Done when: with one nail chosen, a Copy design action lets me tap other nails (or all) to paste its shape, length, colours, base effect, tip, finish, stickers and drawings onto them, in one undo step.
Built as: with one nail chosen (Each nail mode), a "Copy design" link appears next to "1 nail chosen". Copy mode shows a bar over the hands ("Copying the left middle finger"); each tapped nail gets the whole design (`PASTE_DESIGN`, copied stickers get new ids), each paste is its own undo step, "Paste to all" is one step, and Done or Escape ends copy mode. Drawings and text (E6-S6, E6-S7) must be copied too when they're added.

### E6-S5: Redo. P1. Done
As a user, I can redo something I undid.
Done when: a Redo button next to Undo, plus Cmd+Shift+Z / Ctrl+Y, steps forward again; making a new change after undoing clears the redo steps.
Depends on: E4-S5.
Built as: a `future` list in `historyReducer` (UNDO moves the current design onto it, REDO brings it back, any new design change empties it), a Redo arrow button joined to Undo (`src/components/UndoRedoButtons.tsx`), and Cmd+Shift+Z / Ctrl+Shift+Z / Ctrl+Y.

### E6-S6: Freehand drawing. P1. Backlog
As a user, I can draw on a nail with my finger or mouse, so I can make designs no sticker covers.
Done when: a Draw tab with a pen colour and thickness lets me draw lines on a nail that stay clipped to it, each line can be undone, an eraser or "clear drawing" removes them, and drawing never pans or selects by accident.

### E6-S7: Text on a nail. P1. Backlog
As a user, I can put short text (initials, a word) on a nail.
Done when: I can type up to about 10 characters, place it on a nail, and move, resize, turn, recolour and delete it like a sticker; it stays clipped to the nail.

### E6-S8: Autosave and My designs. P1. Backlog
As a user, my design is never lost when I refresh or close the tab, and I can keep several designs.
Done when: the current design is saved in the browser (localStorage) after every change and comes back on reload; a "My designs" list lets me save the current design under a name, open, rename and delete saved designs, and start a new one. Nothing leaves the device.

### E6-S9: Mirror to the other hand. P1. Backlog
As a user, I can copy one hand's design onto the other hand, so both hands match.
Done when: "Copy left hand to right" and "Copy right hand to left" put each finger's design on the matching finger of the other hand (thumb to thumb, pinky to pinky), with stickers, drawings and text flipped left to right, in one undo step.
Depends on: E6-S4.

### E6-S11: Real nail-art stickers. P1. Done
As a user, the stickers look like designs people actually get on their nails.
Done when: the basic shapes are replaced by real nail-art motifs, drawn like decals in several colours, recolourable without losing their details, small by default so several fit on a nail, and placed where I tap.
Built as: 14 stickers in `src/stickers.ts` (daisy, cherry blossom, rose, leaf vine, bow, cherries, strawberry, butterfly, smiley, outlined heart, evil eye, moon and stars, twinkle star, swirl), each a stack of layers on a 24 x 24 grid in either the sticker's main colour or a fixed detail colour. They start in their own colours ("Original"); the colour row changes the main colour. Default size is about a third of the nail's width (0.5x to 3.2x). A new sticker goes where you tap the nail (the middle if you tap the finger), and when tap areas overlap the sticker closest to your finger is chosen. The sticker row scrolls sideways. Built before E6-S3 because the owner said the old stickers didn't look like real nail designs.

### E6-S10: Recent colours. P1. Backlog
As a user, I can reuse colours I've just used, so matching nails is one tap.
Done when: every colour picker (polish, tip, stickers, pen, ombre) shows a row of the last 6 colours used anywhere in the design, newest first.

---

## E7: Start and share (Release 1.2)

Starting points and ways to take a design to an artist.

### E7-S1: Starter designs. P1. Backlog
As a new user, I can start from a ready-made look, so I get a good result right away.
Done when: a Start from a design option shows 6 to 8 starter looks with previews (for example classic French, glazed donut chrome, red almond, milky white, leopard accent) and picking one loads it in one undo step, ready to edit.
Depends on: E6 (uses its shapes and effects).

### E7-S2: Design recipe sheet. P1. Backlog
As a user, I can save a sheet that tells my nail artist exactly how to recreate the set.
Done when: Save offers "Picture" and "Picture + recipe"; the recipe version adds, under the hands, a list per nail of shape, length, base colour (name and hex), effect, finish, tip, stickers, gems and text, grouping nails that are the same.
Answers the PRD open question about a design sheet.

### E7-S3: Share link. P1. Backlog
As a user, I can send my artist a link that opens my exact design.
Done when: a Share action creates a link with the whole design packed into it (no server, no account), opening it on any device shows the design ready to view or edit, and on phones it opens the phone's share menu.

---

## E8: More nail art (Release 1.3)

More kinds of nail art, built after E7.

### E8-S1: French tip styles. P1. Backlog
As a user, I can choose the French tip style.
Done when: the French tip tab offers Classic, Deep, Micro, V, Side, Double line and Reverse (a half-moon at the cuticle), each working with tip colour, thickness, every shape and clipping.

### E8-S2: Gems and pearls. P1. Backlog
As a user, I can add rhinestones, pearls and studs that look raised and catch the light.
Done when: a Gems section offers at least round, teardrop and square rhinestones, pearls and metal studs, with a highlight and shadow so they look 3D; they place, move, resize, turn and delete like stickers and appear in the exported picture.

### E8-S3: Patterns. P1. Backlog
As a user, I can choose a patterned base.
Done when: marble, tortoiseshell, leopard, checkerboard and a simple floral are offered as base effects, with the pattern's main colours adjustable, clipped to the nail, and visible in the exported picture.
Depends on: E6-S3.

### E8-S4: Trending effects. P1. Backlog
As a user, I can try cat-eye, aura and jelly nails.
Done when: cat-eye (a shimmering band I can move), aura (a soft glow in the middle of the nail in a second colour) and jelly / sheer (see-through polish with an adjustable strength, the natural nail showing through) are offered as base effects.
Depends on: E6-S3.

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
| 2026-11-09 | The owner pulled these later-release features forward, before the user test: more shapes, length, special bases, copy design, redo, freehand drawing, text (epic E6). Grayscale hand, undertone control, layers, 3D and the platform features stay later |
| 2026-11-09 | The owner added artist-inspired features: autosave and My designs, mirror hands, recent colours (E6), starter designs, recipe sheet, share link (E7, before the user test), and French tip styles, gems, patterns, trending effects (E8, after the user test). Photo try-on, side-by-side comparison and salon pricing are recorded as later |
| 2026-11-09 | The user test (E5-S5) is on hold at the owner's request; E8 no longer waits for it. Order: E6, E7, E8 |
| 2026-11-09 | Visual style: "Soft blush" (blush background, rose accent, Nunito), chosen by the owner over "Salon chic" and "Playful pop" |
| 2026-11-09 | The finish switch lives in the Colour tab rather than its own tab: it's part of the polish, and fewer tabs fit better on a phone |
| 2026-11-09 | Zoom lives in the hands area (buttons bottom-right), not the toolbar, so it's available in every tab. While zoomed, a one-finger drag pans; stickers are moved by dragging them directly |
