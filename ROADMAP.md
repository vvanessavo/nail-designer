# Roadmap: Nail Designer MVP

25 working days across 5 weeks. One goal per day. Tick the box when the day's goal works in the browser and is merged to `main`.

**Current day: Day 3** (branch `feature/nail-state`)

## Week 1: Foundation, hand on screen

Goal: a hand renders, nails are clickable, skin tone changes the hand colour.

- [x] **Day 1:** Project scaffold. Vite + React + TypeScript, Tailwind, dependencies installed.
- [x] **Day 2:** Hand SVG. Five nails with ids `nail-0` to `nail-4`, rendered in `App.tsx`, each logs a click.
- [ ] **Day 3:** Nail selection with `useState`. Clicking a nail highlights it.
- [ ] **Day 4:** Core state model. `Nail` and `AppState` types, `useReducer` with `SET_SKIN_TONE` and `SELECT_NAIL`.
- [ ] **Day 5:** Skin tone picker. 6 to 8 swatches, hand colour updates live.

Milestone: clickable hand with live skin tone.

## Week 2: Nail shapes and base colour

Goal: pick a nail shape and paint a base colour on one nail or all nails.

- [ ] **Day 6:** Four nail shape paths (round, square, almond, coffin) stored in `shapes.ts`.
- [ ] **Day 7:** Shape switcher. `SET_SHAPE` action, four thumbnail buttons, applies to selected or all nails.
- [ ] **Day 8:** Colour picker with `react-colorful`. `SET_BASE_COLOR` action, nail fill updates.
- [ ] **Day 9:** Multi-select (shift-click) and an "Apply to all" button.
- [ ] **Day 10:** Toolbar layout housing shape and colour controls. Works at tablet width (768px and up).

Milestone: a fully colourable hand with real nail shapes.

## Week 3: Sticker system

Goal: place, move, and resize stickers on individual nails.

- [ ] **Day 11:** Migrate the nails to a `react-konva` Stage and Layer.
- [ ] **Day 12:** Six sticker SVG assets: star, heart, dot, sparkle, line, flower.
- [ ] **Day 13:** Sticker panel. Pick a sticker, click a nail, it places at the centre.
- [ ] **Day 14:** Drag, scale, and rotate stickers with the Konva Transformer.
- [ ] **Day 15:** Clip stickers to the nail boundary with `clipFunc`.

Milestone: decorate nails with moveable stickers.

## Week 4: French tip and finish

Goal: French tip overlay, matte/shiny toggle, editable stickers, undo.

- [ ] **Day 16:** French tip arch shape as a Konva shape, toggled by `hasFrenchTip`.
- [ ] **Day 17:** French tip controls. Tip colour picker and thickness slider.
- [ ] **Day 18:** Matte / shiny toggle using a CSS filter on the canvas container.
- [ ] **Day 19:** Edit sticker colour and delete a selected sticker.
- [ ] **Day 20:** Undo / redo with a history stack. Cmd+Z and Cmd+Shift+Z.

Milestone: a complete design tool.

## Week 5: Export, polish, ship

Goal: shareable, good-looking, exports a real PNG, works on touch devices.

- [ ] **Day 21:** PNG export with `stage.toDataURL()` at 2x resolution.
- [ ] **Day 22:** Touch and mobile support. Test and fix every interaction.
- [ ] **Day 23:** Visual polish. Palette, typography, hover and selected states.
- [ ] **Day 24:** Deploy to Vercel and test the live link on a phone.
- [ ] **Day 25:** User test with 3 people, fix the top 3 pain points.

Milestone: MVP shipped.

## Known hard days

- **Day 11:** Moving from React-rendered SVG to a canvas library is a conceptual shift. Read the `react-konva` docs before coding.
- **Day 14:** The Konva Transformer is where beginners get stuck. Start from a working example.
- **Day 25:** The most important day. Watch people use it without helping.

## Slack

Treat Fridays as flex days. The milestone matters more than ticking every card.
