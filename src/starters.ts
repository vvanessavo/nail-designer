// Starter designs: ready-made looks to begin from, based on popular real nail sets.
// Each is a full set of 10 nails. Picking one keeps the user's own skin tone.

import { createNail, type Nail, type Sticker } from './state/nailState'

export type Starter = {
  id: string
  name: string
  nails: Nail[]
}

// The finger of each nail, left pinky (0) to right pinky (9). Accent nails are usually the
// ring fingers.
const RING_FINGERS = [1, 8]

// A set where every nail looks the same, with optional changes for some nails.
function allNails(look: Partial<Nail>, perNail: (id: number) => Partial<Nail> = () => ({})): Nail[] {
  return Array.from({ length: 10 }, (_, id) => ({ ...createNail(id), ...look, ...perNail(id) }))
}

function sticker(id: string, type: Sticker['type'], color: string, x = 0, y = 0, scale = 1): Sticker {
  return { id, type, x, y, scale, rotation: 0, color }
}

export const STARTERS: Starter[] = [
  {
    id: 'classic-french',
    name: 'Classic French',
    nails: allNails({
      shape: 'squoval',
      length: 1.3,
      baseColor: '#F6DCD6',
      hasFrenchTip: true,
      frenchTipColor: '#FFFFFF',
      frenchTipThickness: 0.9,
    }),
  },
  {
    id: 'glazed-donut',
    name: 'Glazed donut',
    nails: allNails({ shape: 'almond', length: 1.1, baseColor: '#F2E9E1', baseEffect: 'pearl' }),
  },
  {
    id: 'red-almond',
    name: 'Red almond',
    nails: allNails({ shape: 'almond', length: 1.2, baseColor: '#B3122E' }),
  },
  {
    id: 'milky-white',
    name: 'Milky white',
    nails: allNails({ shape: 'squoval', length: 0.8, baseColor: '#F5F0EA' }),
  },
  {
    id: 'baby-boomer',
    name: 'Baby boomer',
    nails: allNails({
      shape: 'coffin',
      length: 1.1,
      baseColor: '#F3C9C4',
      baseEffect: 'ombre',
      effectColor: '#FFFFFF',
    }),
  },
  {
    id: 'lavender-chrome',
    name: 'Lavender chrome',
    nails: allNails({ shape: 'almond', length: 1.2, baseColor: '#B9A4D9', baseEffect: 'chrome' }),
  },
  {
    id: 'cherry-accent',
    name: 'Cherry accent',
    nails: allNails({ shape: 'round', length: 1.1, baseColor: '#F6DCD6' }, (id) =>
      RING_FINGERS.includes(id)
        ? { baseColor: '#FFFFFF', stickers: [sticker(`starter-cherry-${id}`, 'cherries', '#D7263D', 0, -1, 1.6)] }
        : {},
    ),
  },
  {
    id: 'midnight-stars',
    name: 'Midnight stars',
    nails: allNails({ shape: 'stiletto', length: 1, baseColor: '#1C1C1C', finish: 'shiny' }, (id) =>
      RING_FINGERS.includes(id)
        ? {
            baseEffect: 'glitter',
            effectColor: '#D4AF37',
            stickers: [
              sticker(`starter-star-a-${id}`, 'twinkle', '#D4AF37', -1.5, -4, 1.1),
              sticker(`starter-star-b-${id}`, 'twinkle', '#D4AF37', 2, 3, 0.7),
            ],
          }
        : {},
    ),
  },
]
