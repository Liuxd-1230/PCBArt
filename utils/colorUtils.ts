import { BOARD_COLORS, SUBSTRATE_COLOR, SURFACE_FINISHES, SILKSCREEN_NORMAL, SILKSCREEN_ON_WHITE } from "../constants";
import { PaletteColors, PcbLayerType } from "../types";

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export const hexToRgb = (hex: string): Rgb => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

export const getPalette = (boardKey: string, finishKey: string): PaletteColors => {
  const board = BOARD_COLORS.find(b => b.key === boardKey) || BOARD_COLORS[0];
  const finish = SURFACE_FINISHES.find(f => f.key === finishKey) || SURFACE_FINISHES[0];
  
  const silkscreenHex = board.key === 'white' ? SILKSCREEN_ON_WHITE : SILKSCREEN_NORMAL;

  return {
    substrate: hexToRgb(SUBSTRATE_COLOR),
    deep: hexToRgb(board.deep),
    light: hexToRgb(board.light),
    pad: hexToRgb(finish.color),
    silkscreen: hexToRgb(silkscreenHex)
  };
};

const getSaturation = (c: Rgb): number => {
  return Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
};

// Weighted distance: RGB + Saturation
export const getColorDistanceSq = (c1: Rgb, c2: Rgb): number => {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  // Standard RGB distance
  const rgbDistance = dr * dr + dg * dg + db * db;
  
  // Saturation difference
  const sat1 = getSaturation(c1);
  const sat2 = getSaturation(c2);
  const satDistance = (sat1 - sat2) ** 2;

  return rgbDistance + satDistance * 0.8; 
};

export const findClosestLayer = (pixel: Rgb, palette: PaletteColors, sensitivity: number = 50): PcbLayerType => {
  let minDistance = Infinity;
  let layer = PcbLayerType.DEEP;

  // Sensitivity maps to a scaling factor for the "special" layers.
  // Sensitivity 0   (Strict)  -> Factor 0.5 (Biases are doubled/halved appropriately to be stricter)
  // Sensitivity 50  (Normal)  -> Factor 1.0
  // Sensitivity 100 (Loose)   -> Factor 1.5
  
  // Actually, let's look at the bias values.
  // To make PAD easier to select (High Tolerance), we reduce its penalty.
  // To make LIGHT easier to select, we reduce its penalty.
  
  // Normalized 0..2
  const s = sensitivity / 50; 

  const check = (type: PcbLayerType, color: Rgb, baseBias: number) => {
    // If baseBias > 1 (Penalty), higher sensitivity should reduce it towards 1.
    // If baseBias < 1 (Bonus), higher sensitivity should reduce it further (or keep it attractive).
    
    let finalBias = baseBias;
    
    if (baseBias > 1.0) {
      // It's a penalty (like PAD 1.5). 
      // If s=2 (Max sensitivity), we want bias ~1.0. 
      // If s=0.5 (Min sensitivity), we want bias ~2.0.
      finalBias = 1.0 + (baseBias - 1.0) * (2 - s); // Heuristic
      if (finalBias < 1.0) finalBias = 1.0;
    } else if (baseBias < 1.0) {
      // It's a bonus (like LIGHT 0.6).
      // If s=2 (Max sensitivity), we want bias ~0.4 (Stronger pull).
      // If s=0 (Min sensitivity), we want bias ~1.0 (No pull).
      finalBias = 1.0 - (1.0 - baseBias) * s;
      if (finalBias < 0.1) finalBias = 0.1;
    }

    const d = getColorDistanceSq(pixel, color) * finalBias;
    if (d < minDistance) {
      minDistance = d;
      layer = type;
    }
  };

  // 1. Silkscreen: Neutral
  check(PcbLayerType.SILKSCREEN, palette.silkscreen, 1.0);

  // 2. Pad: Base Penalty 1.5. 
  // High Sensitivity -> Closer to 1.0 (easier to pick).
  // Low Sensitivity -> Higher penalty (harder to pick).
  check(PcbLayerType.PAD, palette.pad, 1.5);

  // 3. Light: Base Bonus 0.6.
  // High Sensitivity -> Closer to 0.4 (stronger attraction).
  // Low Sensitivity -> Closer to 1.0 (weaker attraction).
  check(PcbLayerType.LIGHT, palette.light, 0.6);

  // 4. Deep: Base Bonus 0.8
  check(PcbLayerType.DEEP, palette.deep, 0.8);

  // 5. Substrate: Neutral
  check(PcbLayerType.SUBSTRATE, palette.substrate, 1.0);

  return layer;
};

export const getLayerColor = (type: PcbLayerType, palette: PaletteColors): Rgb => {
  switch (type) {
    case PcbLayerType.SILKSCREEN: return palette.silkscreen;
    case PcbLayerType.PAD: return palette.pad;
    case PcbLayerType.LIGHT: return palette.light;
    case PcbLayerType.DEEP: return palette.deep;
    case PcbLayerType.SUBSTRATE: return palette.substrate;
    default: return palette.deep;
  }
};