export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingPath {
  points: DrawingPoint[];
  color: string;
  width: number;
}

export interface Shape {
  type: 'rectangle' | 'circle' | 'line' | 'triangle' | 'arrow' | 'star';
  start: DrawingPoint;
  end: DrawingPoint;
  color: string;
  width: number;
}

export interface EmojiElement {
  id: string;
  emoji: string;
  position: DrawingPoint;
  size: number;
}

export interface CanvasState {
  paths: DrawingPath[];
  shapes: Shape[];
  emojis: EmojiElement[];
}