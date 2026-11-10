# Product Requirements: Nail Designer

Status: MVP in progress. Owner: Vanessa. Last updated: 2026-11-06.

This document covers what we're building and why. For the build order, user stories, and status, see `ROADMAP.md`. For how Claude should work in this repo, see `CLAUDE.md`.

## 1. Vision

Anyone with a clear picture of their ideal nails can design the full set in minutes and show it to a nail artist, or follow it at home.

## 2. Problem

- People have a specific set in mind but can't draw it or find the exact Pinterest reference.
- They end up pulling from several images to describe one set, and the result gets lost in translation.

## 3. Target users

| User | Need | How they use the app |
|---|---|---|
| Client with a clear vision | Show an artist exactly what they want | Designs a set, exports a picture, brings it to the appointment |
| Nail artist (salon or independent) | Align with clients before starting; share design options | Mocks up sets for clients, saves time on consultation |
| DIY user | Try designs before committing at home | Experiments with shapes, colours, and decorations |

MVP priority is the client with a clear vision. Artist-specific workflows come after the MVP.

## 4. Goals and success metrics

Goal for the MVP: a user can visualise a complete nail set without Photoshop or Pinterest collages.

| Metric | Target (proposed, adjust as needed) |
|---|---|
| A new user completes a full design (shape, colour, a sticker, export) | 3 of 3 test users, unaided |
| Time to first exported design | Under 5 minutes |
| Works on phone and tablet | No broken interactions in manual testing on both |
| Exported image is something users would actually show someone | At least 2 of 3 test users say yes |

## 5. Scope

### MVP (must have)
- Hand template with skin tone selector
- 4 nail shapes: round, square, almond, coffin
- Solid base colour
- Select one, several, or all nails; apply to all
- 2D stickers with move, resize, and rotate (since 2026-11-09: real nail-art motifs, see Release 1.1)
- French tip overlay with adjustable colour and thickness
- PNG export
- Works with touch

### MVP (should have)
- Matte / shiny finish toggle
- Edit sticker colour, delete a sticker
- Single-step undo (full undo/redo is a stretch)
- Visual polish

### Release 1.1: richer design (owner asked, 2026-11-09)
Pulled forward from the later releases below (roadmap epic E6):
- More shapes: stiletto, squoval, natural
- Nail length slider with short / medium / long presets
- Special bases: ombre, chrome, pearl, glitter
- Copy one nail's design onto other nails
- Redo
- Freehand drawing on a nail
- Text on a nail
- Autosave in the browser and a My designs list (no accounts; nothing leaves the device)
- Mirror one hand's design onto the other
- Recent colours
- Real nail-art stickers: daisy, cherry blossom, rose, leaf vine, bow, cherries, strawberry, butterfly, smiley, heart, evil eye, moon and stars, twinkle star, swirl
- Gems: round, teardrop and square rhinestones, pearls, studs (Release 1.3)

### Release 1.2: start and share (owner asked, 2026-11-09)
- Starter designs to begin from
- Design recipe sheet: the picture plus a per-nail list of what to recreate (answers the open question in section 9)
- Share link with the design packed into the URL (no server)

### Release 1.3: more nail art (owner asked, 2026-11-09)
- French tip styles: deep, micro, V, side, double line, reverse
- Gems: rhinestones, pearls, studs
- Patterns: marble, tortoiseshell, leopard, checkerboard, floral
- Trending effects: cat-eye, aura, jelly / sheer

### Not in the MVP
Tracked here so they aren't built by accident. Do not build unless the owner asks.

| Later release | Features |
|---|---|
| Release 5: platform | Accounts, cloud save, design gallery and sharing, artist tools, native mobile app, salon price and time estimates |
| Later ideas | Live camera try-on (augmented reality), compare two designs side by side |

Moved into Release 1.4 (roadmap epic E9) at the owner's request, 2026-11-09: textured finishes, undertone control and grayscale hand, layers, 3D nail art, and trying a design on a photo of your own hand (a still photo, placed by hand; not live camera).

## 6. Non-functional requirements

- Mobile-first: touch input works for every interaction; layout is usable from phone width and up.
- Tablet: layout works from 768px wide.
- Performance: interactions feel instant (selecting a nail, changing a colour).
- Accessibility basics: controls reachable by keyboard where practical, sufficient text contrast, labels on icon-only buttons.
- Privacy: no accounts and no data leaves the browser in the MVP. Autosave keeps designs in the browser only; a share link carries the design inside the link itself.

## 7. Data model

The shape of the app's state. Keep in sync with `src/state/nailState.ts` once it exists.

```ts
type Finish = 'shiny' | 'matte' | 'satin' | 'velvet' | 'sugar'
type NailShape = 'round' | 'square' | 'almond' | 'coffin' | 'stiletto' | 'squoval' | 'natural'

type Sticker = {
  id: string
  type: 'gem-round' | 'gem-teardrop' | 'gem-square' | 'gem-cluster' | 'pearl' | 'stud'
      | 'chrome-heart' | 'chrome-star' | 'chrome-blob' | 'chrome-swirl' | 'chrome-line' | 'charm-bow'
      | 'water-drop' | 'gel-bow' | 'gel-flower' | 'pearl-cluster'
      | 'daisy' | 'dot-flower' | 'bloom' | 'blossom' | 'rose' | 'vine' | 'heart' | 'twinkle'
      | 'stars' | 'swirl' | 'cherries' | 'strawberry' | 'bow' | 'text'
  x: number              // offset from the centre of the nail (0, 0 = centred)
  y: number
  scale: number           // 1 = default size, about 70% of the nail's width (0.3 to 1.6)
  rotation: number        // degrees, clockwise
  color: string
  text?: string           // only for 'text': up to 12 characters
  font?: 'script' | 'bold' // only for 'text'
}

type Nail = {
  id: number              // nail-0 ... nail-N
  shape: NailShape
  length: number          // 1 = the shape's usual length (0.5 to 2)
  baseColor: string       // hex
  baseEffect: 'plain' | 'ombre' | 'chrome' | 'pearl' | 'glitter'
    | 'marble' | 'tortoise' | 'leopard' | 'checker' | 'floral' | 'cat-eye' | 'aura' | 'jelly'
  effectColor: string     // ombre: the colour at the tip; glitter: the glitter; patterns: the pattern
  effectAmount: number    // 0 to 1: cat-eye band position, aura glow size, jelly polish strength
  finish: Finish
  hasFrenchTip: boolean
  frenchTipColor: string
  frenchTipThickness: number // share of the free edge the tip covers in the middle (0.3 to 1.3)
  frenchTipStyle: 'classic' | 'deep' | 'micro' | 'v' | 'side' | 'double' | 'reverse'
  stickers: Sticker[]
  strokes: Stroke[]       // freehand drawing: { id, color, width, points: [x, y, ...], pen?, opacity? }
                          // pen: 'fine' | 'fountain' | 'brush' | 'dots'; opacity: 0.15 (sheer) to 1
}

type AppState = {
  skinTone: string        // hex
  undertone: 'warm' | 'neutral' | 'cool'
  grayscaleHand: boolean  // the hand drawn in grey so the nails stand out
  linesOverStickers: boolean // drawn lines in front of stickers (false: behind)
  nails: Nail[]
  selectedNailIds: number[]
  applyToAll: boolean     // true: changes go on every nail; false: only the selected nails
}
```

The app shows two hands side by side with 10 nails, numbered left to right on screen: left hand `nail-0` (pinky) to `nail-4` (thumb), right hand `nail-5` (thumb) to `nail-9` (pinky).

## 8. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Moving from SVG to react-konva mid-project breaks existing nail behaviour | Rework | Keep nail ids and state shape unchanged; migrate as its own story before adding stickers |
| Stickers spill outside the nail while moving or scaling | Looks broken | Dedicated clipping story; test near edges |
| Touch and drag conflicts on phones | Core interaction unusable | Test on a real device as part of every interactive story, not only at the end |
| Placeholder hand looks too crude to be convincing | Users don't take it seriously | Polish story near the end; shape and colour logic is the priority |
| Scope creep from the full feature wishlist | MVP never ships | Anything in "Not in the MVP" needs an explicit decision from the owner |

## 9. Assumptions and open questions

- Assumption: the product is delivered as a mobile-first web app for the MVP. A native app is a later decision.
- Decided: the MVP shows both hands (10 nails) so a full set can be designed and exported.
- Decided (2026-11-09): Save offers both: the picture alone, or the picture with a recipe sheet listing what's on each nail (E7-S2).
- Open question: how much undertone control is needed beyond a set of skin tone swatches?
