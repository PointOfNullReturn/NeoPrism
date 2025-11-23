import type {
  DocumentState,
  IndexedDocument,
  PaletteColor,
  ViewState,
} from '../state/documentTypes'

interface RendererOptions {
  zoom: number
  context?: CanvasRenderingContext2D
  offscreenCanvas?: HTMLCanvasElement
  offscreenContext?: CanvasRenderingContext2D
  view?: ViewState
}

const RGBA_CHANNELS = 4
const DEFAULT_PALETTE_COLOR: PaletteColor = { r: 0, g: 0, b: 0, a: 255 }

/**
 * Responsible for drawing document pixels to a target canvas using an offscreen buffer.
 */
export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D
  private readonly offscreenCanvas: HTMLCanvasElement
  private readonly offscreenContext: CanvasRenderingContext2D
  private zoom: number
  private view: ViewState | null

  constructor(canvas: HTMLCanvasElement, options: RendererOptions) {
    const context = options.context !== undefined ? options.context : canvas.getContext('2d')
    if (!context) {
      throw new Error('Unable to initialize 2D context')
    }

    const offscreenCanvas =
      options.offscreenCanvas !== undefined
        ? options.offscreenCanvas
        : document.createElement('canvas')
    const offscreenContext =
      options.offscreenContext !== undefined
        ? options.offscreenContext
        : offscreenCanvas.getContext('2d')
    if (!offscreenContext) {
      throw new Error('Unable to initialize offscreen 2D context')
    }

    this.canvas = canvas
    this.context = context
    this.offscreenCanvas = offscreenCanvas
    this.offscreenContext = offscreenContext
    this.offscreenContext.imageSmoothingEnabled = false
    this.zoom = options.zoom
    this.view = options.view ?? null
  }

  /** Adjusts the zoom level that will be applied on the next render. */
  setZoom(zoom: number): void {
    this.zoom = zoom
  }

  /** Updates the view (offsets/grid) applied when drawing. */
  setView(view: ViewState): void {
    this.view = view
  }

  /** Renders the supplied document using the current zoom level. */
  render(document: DocumentState): void {
    const scaledWidth = document.width * this.zoom
    const scaledHeight = document.height * this.zoom
    if (this.canvas.width !== scaledWidth || this.canvas.height !== scaledHeight) {
      this.canvas.width = scaledWidth
      this.canvas.height = scaledHeight
    }

    this.offscreenCanvas.width = document.width
    this.offscreenCanvas.height = document.height

    const imageData = this.offscreenContext.createImageData(document.width, document.height)
    if (isIndexedDocument(document)) {
      writeIndexedToImageData(document, imageData.data)
    } else {
      writeRGBAToImageData(document.pixels, imageData.data)
    }

    this.offscreenContext.putImageData(imageData, 0, 0)
    this.context.save()
    this.context.imageSmoothingEnabled = false

    if (this.view) {
      this.context.translate(-this.view.offsetX * this.zoom, -this.view.offsetY * this.zoom)
    }

    this.context.clearRect(
      -this.canvas.width,
      -this.canvas.height,
      this.canvas.width * 3,
      this.canvas.height * 3,
    )
    this.context.drawImage(
      this.offscreenCanvas,
      0,
      0,
      document.width,
      document.height,
      0,
      0,
      scaledWidth,
      scaledHeight,
    )

    if (this.view?.showGrid) {
      drawGrid(this.context, document.width, document.height, this.zoom)
    }

    this.context.restore()
  }
}

const isIndexedDocument = (document: DocumentState): document is IndexedDocument =>
  document.mode === 'indexed8'

const writeIndexedToImageData = (document: IndexedDocument, output: Uint8ClampedArray): void => {
  const pixels = document.pixels
  const palette = document.palette
  for (let i = 0; i < pixels.length; i += 1) {
    const paletteColor = palette[pixels[i]] || DEFAULT_PALETTE_COLOR
    const offset = i * RGBA_CHANNELS
    output[offset] = paletteColor.r
    output[offset + 1] = paletteColor.g
    output[offset + 2] = paletteColor.b
    output[offset + 3] = paletteColor.a
  }
}

const writeRGBAToImageData = (pixels: Uint32Array, output: Uint8ClampedArray): void => {
  const buffer = new Uint8Array(pixels.buffer)
  output.set(buffer)
}

export const drawGrid = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
): void => {
  if (zoom < 2) {
    return
  }
  context.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  context.lineWidth = 1
  context.beginPath()

  for (let x = 0; x <= width; x += 1) {
    const px = x * zoom
    context.moveTo(px, 0)
    context.lineTo(px, height * zoom)
  }
  for (let y = 0; y <= height; y += 1) {
    const py = y * zoom
    context.moveTo(0, py)
    context.lineTo(width * zoom, py)
  }

  context.stroke()
}
