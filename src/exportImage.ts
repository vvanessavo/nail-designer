// Pictures of the design: both hands at full view, whatever the zoom, without the selection
// dots or sticker handles, on the app's soft pink background. exportDesign downloads a sharp
// PNG; designThumbnail makes a small picture for the My designs list.

import type Konva from 'konva'
import type { RecipeGroup } from './recipe'

// Pixels per drawing unit. The drawing is about 500 units wide, so the picture is about
// 2000 px wide: at least twice the size the hands ever show on screen, so it stays sharp.
const PIXELS_PER_UNIT = 4
// Space around the hands, in drawing units.
const MARGIN = 20
const BACKGROUND = '#FFFFFF' // the app's white background

type Size = { width: number; height: number }

// Draws the design onto a new canvas, `pixelsPerUnit` pixels for every drawing unit.
// `size` is the drawing's size in drawing units (see drawingSize in handGeometry.ts).
function renderDesign(stage: Konva.Stage, size: Size, pixelsPerUnit: number): HTMLCanvasElement | null {
  // Hide what's only there for editing, and show the whole drawing at its own size.
  // All of this is put back straight after, before the screen is next redrawn, so nothing flickers.
  const editingOnly = [...stage.find('.target-dot'), ...stage.find('Transformer')].filter((node) =>
    node.visible(),
  )
  const view = { x: stage.x(), y: stage.y(), scaleX: stage.scaleX(), scaleY: stage.scaleY() }
  editingOnly.forEach((node) => node.hide())
  stage.position({ x: MARGIN, y: MARGIN })
  stage.scale({ x: 1, y: 1 })

  let hands: HTMLCanvasElement
  try {
    hands = stage.toCanvas({
      x: 0,
      y: 0,
      width: size.width + MARGIN * 2,
      height: size.height + MARGIN * 2,
      pixelRatio: pixelsPerUnit,
    })
  } finally {
    editingOnly.forEach((node) => node.show())
    stage.position({ x: view.x, y: view.y })
    stage.scale({ x: view.scaleX, y: view.scaleY })
  }

  // The drawing has a see-through background; paint it onto the pink.
  const picture = document.createElement('canvas')
  picture.width = hands.width
  picture.height = hands.height
  const context = picture.getContext('2d')
  if (!context) return null
  context.fillStyle = BACKGROUND
  context.fillRect(0, 0, picture.width, picture.height)
  context.drawImage(hands, 0, 0)
  return picture
}

// A small JPEG of the design (about 200 px wide), as text that can be stored with it.
export function designThumbnail(stage: Konva.Stage, size: Size): string {
  return renderDesign(stage, size, 0.4)?.toDataURL('image/jpeg', 0.8) ?? ''
}

// The recipe's look, in picture pixels.
const RECIPE = {
  margin: 80,
  title: '700 48px Nunito, sans-serif',
  heading: '700 32px Nunito, sans-serif',
  body: '400 30px Nunito, sans-serif',
  lineHeight: 44,
  groupGap: 28,
  ink: '#44403C', // Tailwind stone-700
  accent: '#BE123C', // Tailwind rose-700
}

// Breaks text into lines no wider than `width` pixels.
function wrap(context: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const tryLine = line ? `${line} ${word}` : word
    if (line && context.measureText(tryLine).width > width) {
      lines.push(line)
      line = word
    } else {
      line = tryLine
    }
  }
  if (line) lines.push(line)
  return lines
}

// A new, taller picture: the design on top, the recipe written underneath.
function addRecipe(picture: HTMLCanvasElement, recipe: RecipeGroup[]): HTMLCanvasElement {
  const width = picture.width - RECIPE.margin * 2
  const measure = document.createElement('canvas').getContext('2d')
  if (!measure) return picture
  // Work out every line first, to know how tall the picture needs to be.
  const blocks = recipe.map((group) => {
    measure.font = RECIPE.body
    return { heading: group.nails, lines: group.lines.flatMap((line) => wrap(measure, line, width)) }
  })
  const recipeHeight =
    RECIPE.lineHeight * 2 +
    blocks.reduce((total, block) => total + RECIPE.lineHeight * (block.lines.length + 1) + RECIPE.groupGap, 0) +
    RECIPE.margin
  const sheet = document.createElement('canvas')
  sheet.width = picture.width
  sheet.height = picture.height + recipeHeight
  const context = sheet.getContext('2d')
  if (!context) return picture
  context.fillStyle = BACKGROUND
  context.fillRect(0, 0, sheet.width, sheet.height)
  context.drawImage(picture, 0, 0)
  context.textBaseline = 'top'
  let y = picture.height
  context.fillStyle = RECIPE.accent
  context.font = RECIPE.title
  context.fillText('Nail recipe', RECIPE.margin, y)
  y += RECIPE.lineHeight * 2
  for (const block of blocks) {
    context.fillStyle = RECIPE.accent
    context.font = RECIPE.heading
    context.fillText(block.heading, RECIPE.margin, y)
    y += RECIPE.lineHeight
    context.fillStyle = RECIPE.ink
    context.font = RECIPE.body
    for (const line of block.lines) {
      context.fillText(line, RECIPE.margin, y)
      y += RECIPE.lineHeight
    }
    y += RECIPE.groupGap
  }
  return sheet
}

// Downloads the design as a PNG, with the recipe underneath if one is given.
export function exportDesign(
  stage: Konva.Stage,
  size: Size,
  recipe?: RecipeGroup[],
  fileName = recipe ? 'my-nail-design-recipe.png' : 'my-nail-design.png',
) {
  const drawn = renderDesign(stage, size, PIXELS_PER_UNIT)
  if (!drawn) return
  const picture = recipe ? addRecipe(drawn, recipe) : drawn

  // Download it: make a temporary link to the picture and click it.
  picture.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    // Give the browser a moment to start the download before freeing the picture.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}
