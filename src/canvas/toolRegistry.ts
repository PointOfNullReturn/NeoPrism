import { PencilTool } from './tools/PencilTool'
import { EraserTool } from './tools/EraserTool'
import { LineTool } from './tools/LineTool'
import { RectangleTool } from './tools/RectangleTool'
import { FillTool } from './tools/FillTool'
import { PickerTool } from './tools/PickerTool'
import type { Tool } from './Tool'

const tools: Record<string, Tool> = {
  pencil: new PencilTool(),
  eraser: new EraserTool(),
  line: new LineTool(),
  rectangle: new RectangleTool(),
  fill: new FillTool(),
  picker: new PickerTool(),
}

export const getToolById = (id: string): Tool | null => tools[id] ?? null
