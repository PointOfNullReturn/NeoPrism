import type { ViewState } from '../state/documentTypes'

export const applyViewTransform = (ctx: CanvasRenderingContext2D, view: ViewState): void => {
  ctx.translate(-view.offsetX, -view.offsetY)
}

export const resetViewTransform = (ctx: CanvasRenderingContext2D): void => {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}
