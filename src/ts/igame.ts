import type { GameConfig } from './game-config';
import type { Snake } from './snake';
import type { ItemManager } from './item-manager';
import type { Renderer } from './renderer';

export interface IGame {
  config: GameConfig;
  ctx: CanvasRenderingContext2D;
  canvasElement: HTMLCanvasElement;
  snake: Snake;
  itemManager: ItemManager;
  renderer: Renderer;

  start(): void;

  iterate(timestampMs: DOMHighResTimeStamp, durationMs: number): void;

  updateState(durationMs: number): void;

  updateDirection(): void;
}
