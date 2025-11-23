import type { ViewState, ZoomLevel } from '../state/documentTypes'

/** Draws transient tool previews (lines, rectangles) on a dedicated canvas overlay. */
export class OverlayRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D
  private zoom: ZoomLevel
  private view: ViewState

  constructor(
    canvas: HTMLCanvasElement,
    view: ViewState,
    zoom: ZoomLevel,
    ctx?: CanvasRenderingContext2D | null,
  ) {
    const context = ctx ?? canvas.getContext('2d')
    if (!context) {
      throw new Error('Unable to initialize overlay 2D context')
    }
    this.canvas = canvas
    this.context = context
    this.zoom = zoom
    this.view = view
    this.context.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    this.context.lineWidth = 1
  }

  setView(view: ViewState): void {
    this.view = view
  }

  setZoom(zoom: ZoomLevel): void {
    this.zoom = zoom
  }

  clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawLine(startX: number, startY: number, endX: number, endY: number): void {
    this.clear()
    this.context.save()
    this.context.translate(-this.view.offsetX * this.zoom, -this.view.offsetY * this.zoom)
    this.context.beginPath()
    this.context.moveTo(startX * this.zoom, startY * this.zoom)
    this.context.lineTo(endX * this.zoom, endY * this.zoom)
    this.context.stroke()
    this.context.restore()
  }

  drawRect(x: number, y: number, width: number, height: number): void {
    this.clear()
    this.context.save()
    this.context.translate(-this.view.offsetX * this.zoom, -this.view.offsetY * this.zoom)
    this.context.strokeRect(x * this.zoom, y * this.zoom, width * this.zoom, height * this.zoom)
    this.context.restore()
  }
}
