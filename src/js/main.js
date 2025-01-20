import Game from './game.js';

function main() {
    const canvasElement = document.getElementById("gameCanvas");
    const statusElement = document.getElementById("status");

    const game = new Game(canvasElement, statusElement);
    game.start();
}

window.onload = main;
