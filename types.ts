export enum BoardColorName {
  GREEN = '绿',
  BLUE = '蓝',
  RED = '红',
  WHITE = '白',
  YELLOW = '黄',
  BLACK = '黑',
  PURPLE = '紫',
  COPPER = '铜'
}

export interface BoardColorDef {
  name: BoardColorName;
  key: string;
  light: string; // Mask over Copper
  deep: string;  // Mask over FR4
}

export enum SurfaceFinishName {
  GOLD = '沉金',
  SILVER = '喷锡'
}

export interface SurfaceFinishDef {
  name: SurfaceFinishName;
  key: string;
  color: string;
}

export interface ProcessingOptions {
  boardColorKey: string;
  finishKey: string;
  dither: boolean;
  sensitivity: number; // 0-100, default 50
}

// The categorization of a pixel in the PCB structure
export enum PcbLayerType {
  SUBSTRATE = 0, // Exposed FR4 (Mask Opening, No Copper)
  DEEP = 1,      // Mask over FR4 (No Copper)
  LIGHT = 2,     // Mask over Copper (Trace)
  PAD = 3,       // Exposed Copper (Mask Opening + Finish)
  SILKSCREEN = 4 // Ink
}

export interface PaletteColors {
  substrate: { r: number; g: number; b: number };
  deep: { r: number; g: number; b: number };
  light: { r: number; g: number; b: number };
  pad: { r: number; g: number; b: number };
  silkscreen: { r: number; g: number; b: number };
}