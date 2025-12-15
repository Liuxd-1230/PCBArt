import { BoardColorDef, BoardColorName, SurfaceFinishDef, SurfaceFinishName } from './types';

// Constants defined in the prompt
export const SUBSTRATE_COLOR = '#a7a763';

export const BOARD_COLORS: BoardColorDef[] = [
  { name: BoardColorName.GREEN, key: 'green', light: '#266f36', deep: '#16612e' },
  { name: BoardColorName.BLUE, key: 'blue', light: '#0059af', deep: '#002763' },
  { name: BoardColorName.RED, key: 'red', light: '#d10305', deep: '#8f0300' },
  { name: BoardColorName.WHITE, key: 'white', light: '#e2e2e2', deep: '#f6f6f6' },
  { name: BoardColorName.YELLOW, key: 'yellow', light: '#e59500', deep: '#b19a0c' },
  { name: BoardColorName.BLACK, key: 'black', light: '#000000', deep: '#101010' },
  { name: BoardColorName.PURPLE, key: 'purple', light: '#760853', deep: '#18001d' },
  { name: BoardColorName.COPPER, key: 'copper', light: '#ef9e53', deep: '#655c45' },
];

export const SURFACE_FINISHES: SurfaceFinishDef[] = [
  { name: SurfaceFinishName.GOLD, key: 'gold', color: '#bf9a39' },
  { name: SurfaceFinishName.SILVER, key: 'silver', color: '#818181' },
];

export const SILKSCREEN_NORMAL = '#ffffff';
export const SILKSCREEN_ON_WHITE = '#000000';
