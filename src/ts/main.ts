import { guardedQuerySelector } from './guarded-query-selectors';
import { Game } from './game';
import type { GameConfig } from './game-config';

const BOARD_WIDTH = 50;
const BOARD_HEIGHT = 40;

const BLOCK_SIZE = 15;

const searchParams = new URLSearchParams(window.location.search);
const numQubits = parseInt(searchParams.get('numQubits') ?? '2', 10);
const numGates = parseInt(searchParams.get('numGates') ?? '1', 10);
const autoPlay = (searchParams.get('autoPlay') ?? 'true') === 'true';

function main() {
  const canvasElement = guardedQuerySelector(HTMLCanvasElement, '#gameCanvas');
  const statusElement = guardedQuerySelector(HTMLDivElement, '#status');

  const config: GameConfig = {
    boardWidth: BOARD_WIDTH,
    boardHeight: BOARD_HEIGHT,
    blockSize: BLOCK_SIZE,
    numQubits,
    numGates,
    autoPlay,
  };

  const game = new Game(canvasElement, statusElement, config);
  game.start();
}

window.onload = main;
