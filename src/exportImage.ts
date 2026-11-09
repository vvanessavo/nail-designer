// Saves the finished design as a PNG picture: both hands at full view, whatever the zoom,
// without the selection dots or sticker handles, on the app's soft pink background.

import type Konva from 'konva'
import { HANDS_HEIGHT, HANDS_WIDTH } from './components/Hands'

// Pixels per drawing unit. The drawing is about 500 units wide, so the picture is about
// 2000 px wide: at least twice the size the hands ever show on screen, so it stays sharp.
const PIXELS_PER_UNIT = 4
// Space around the hands, in drawing units.
const MARGIN = 20
const BACKGROUND = '#FFF1F2' // Tailwind rose-50, the app's background

export function exportDesign(stage: Konva.Stage, fileName = 'my-nail-design.png') {
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
      width: HANDS_WIDTH + MARGIN * 2,
      height: HANDS_HEIGHT + MARGIN * 2,
      pixelRatio: PIXELS_PER_UNIT,
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
  if (!context) return
  context.fillStyle = BACKGROUND
  context.fillRect(0, 0, picture.width, picture.height)
  context.drawImage(hands, 0, 0)

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
