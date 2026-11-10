// Share links: the whole design packed into the link itself, so nothing is stored on a
// server. The design goes after "#" in the link, a part browsers never send to the server.
//
// Packing: the design as text (JSON, numbers rounded), squeezed smaller with the browser's
// built-in compression where it has it, then turned into link-safe characters.

import type { Design } from './state/nailState'
import { upgrade } from './storage'

const PREFIX = '#d='

// Link-safe base64: + and / become - and _, and the = padding is dropped.
function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function squeeze(bytes: Uint8Array, mode: 'compress' | 'decompress'): Promise<Uint8Array> {
  const stream =
    mode === 'compress' ? new CompressionStream('deflate-raw') : new DecompressionStream('deflate-raw')
  const output = new Blob([new Uint8Array(bytes)]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(output).arrayBuffer())
}

// The link that opens this design. "z" marks a compressed design, "j" a plain one (for
// browsers without built-in compression).
export async function shareLinkFor(design: Design): Promise<string> {
  const json = JSON.stringify(design, (_key, value) =>
    typeof value === 'number' ? Math.round(value * 100) / 100 : value,
  )
  const bytes = new TextEncoder().encode(json)
  const packed =
    typeof CompressionStream === 'function'
      ? `z${toBase64Url(await squeeze(bytes, 'compress'))}`
      : `j${toBase64Url(bytes)}`
  return `${location.origin}${location.pathname}${PREFIX}${packed}`
}

// The design in the current page's link, if it has one (and it can be read).
export async function designFromLink(): Promise<Design | null> {
  if (!location.hash.startsWith(PREFIX)) return null
  try {
    const packed = location.hash.slice(PREFIX.length)
    const bytes = fromBase64Url(packed.slice(1))
    const json = packed[0] === 'z' ? await squeeze(bytes, 'decompress') : bytes
    return upgrade(JSON.parse(new TextDecoder().decode(json)))
  } catch {
    return null
  }
}

// Takes the design out of the address bar once it's been opened, so a reload shows the
// user's own (autosaved) design rather than the shared one again.
export function clearDesignFromLink() {
  history.replaceState(null, '', location.pathname + location.search)
}
