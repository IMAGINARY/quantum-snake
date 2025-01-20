import Game from './game.js';

const BOARD_WIDTH = 50;
const BOARD_HEIGHT = 40;

const BLOCK_SIZE = 15;

const searchParams = new URLSearchParams(window.location.search);
const numQubits = parseInt(searchParams.get('numQubits')) || 2;
const numGates = parseInt(searchParams.get('numGates')) || 1;

function main() {
  const canvasElement = document.getElementById('gameCanvas');
  const statusElement = document.getElementById('status');

  const config = {
    boardWidth: BOARD_WIDTH,
    boardHeight: BOARD_HEIGHT,
    blockSize: BLOCK_SIZE,
    numQubits,
    numGates,
  };

  const game = new Game(canvasElement, statusElement, config);
  game.start();
}

window.onload = main;
