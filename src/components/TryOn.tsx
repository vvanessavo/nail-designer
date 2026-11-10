// Try on: the user's own hand photo with the five designed nails of one hand on top. Drag each
// nail onto a fingernail in the photo; tap a nail to show handles to resize and turn it.
// The photo never leaves the browser: it's only drawn on this canvas.
//
// Positions are kept in the photo's own pixels, so they stay put when the screen changes size.

import type Konva from 'konva'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Group, Image, Layer, Stage, Transformer } from 'react-konva'

// Where a nail sits: x and y as fractions of the photo's width and height (its middle), its
// size (1 = the starting size) and how far it's turned, in degrees.
export type Placement = { x: number; y: number; scale: number; rotation: number }

type TryOnProps = {
  photo: HTMLImageElement
  nails: HTMLCanvasElement[] // a picture of each nail, in order left to right on screen
  placements: Placement[] // where each nail sits (they start where App's startPlacements puts them)
  onPlacementsChange: (placements: Placement[]) => void
  stageRef: RefObject<Konva.Stage | null> // used to save the picture
}

// A nail starts this fraction of the photo's width wide (about right for a hand that fills
// most of the photo), and can be made 0.3 to 4 times that.
const START_WIDTH = 0.07
const MIN_SCALE = 0.3
const MAX_SCALE = 4

function TryOn({ photo, nails, placements, onPlacementsChange, stageRef }: TryOnProps) {
  // Measure the box the canvas can fill.
  const boxRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const element = boxRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const [selected, setSelected] = useState<number | null>(null)

  // Attach the handles to the selected nail.
  const transformerRef = useRef<Konva.Transformer>(null)
  useEffect(() => {
    const transformer = transformerRef.current
    if (!transformer) return
    const node = selected === null ? undefined : transformer.getStage()?.findOne(`#try-on-${selected}`)
    transformer.nodes(node ? [node] : [])
  }, [selected])

  // The photo, as large as fits, centred.
  const fit = Math.min(box.width / photo.width, box.height / photo.height) || 0
  const offsetX = (box.width - photo.width * fit) / 2
  const offsetY = (box.height - photo.height * fit) / 2
  const nailWidth = photo.width * START_WIDTH

  const save = (index: number, node: Konva.Node) => {
    onPlacementsChange(
      placements.map((placement, i) =>
        i === index
          ? {
              x: node.x() / photo.width,
              y: node.y() / photo.height,
              scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, Math.abs(node.scaleX()))),
              rotation: node.rotation(),
            }
          : placement,
      ),
    )
  }

  return (
    <div
      ref={boxRef}
      className="absolute inset-0 z-30 bg-white"
    >
      <Stage
        ref={stageRef}
        width={Math.floor(box.width)}
        height={Math.floor(box.height)}
        // A tap on the photo (not on a nail) puts the handles away.
        onPointerClick={(event) => {
          if (event.target.name() !== 'try-on-nail') setSelected(null)
        }}
      >
        <Layer>
          <Group
            name="photo-area"
            x={offsetX}
            y={offsetY}
            scaleX={fit}
            scaleY={fit}
          >
            <Image
              image={photo}
              width={photo.width}
              height={photo.height}
            />
            {nails.map((picture, index) => {
              const placement = placements[index]
              const height = nailWidth * (picture.height / picture.width)
              return (
                <Image
                  key={index}
                  id={`try-on-${index}`}
                  name="try-on-nail"
                  image={picture}
                  x={placement.x * photo.width}
                  y={placement.y * photo.height}
                  width={nailWidth}
                  height={height}
                  // Turn and resize around the nail's middle.
                  offsetX={nailWidth / 2}
                  offsetY={height / 2}
                  scaleX={placement.scale}
                  scaleY={placement.scale}
                  rotation={placement.rotation}
                  draggable
                  onPointerDown={() => setSelected(index)}
                  onDragEnd={(event) => save(index, event.target)}
                  onTransformEnd={(event) => save(index, event.target)}
                />
              )
            })}
          </Group>
          <Transformer
            ref={transformerRef}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            keepRatio={true}
            centeredScaling={true}
            flipEnabled={false}
            rotationSnaps={[0, 90, 180, 270]}
            rotationSnapTolerance={6}
            anchorSize={12}
            anchorCornerRadius={6}
            anchorStroke="#E11D48"
            anchorFill="white"
            borderStroke="#E11D48"
            // A bigger invisible grab area around each handle, for fingertips.
            anchorStyleFunc={(anchor) => anchor.hitStrokeWidth(14)}
            padding={10}
            rotateAnchorOffset={30}
          />
        </Layer>
      </Stage>
    </div>
  )
}

export default TryOn
