'use strict';
var gCustom = {
  gameCustom: false,
  minesLeft: 0,
};
const form = document.querySelector('form');

function openForm() {
  form.classList.remove('invisible');
}

function startCustomGame(e) {
  e.preventDefault();
  resetGameVar();
  customChanges();
  resetEl();
  gBoard = createBoard();
  renderBoard(gBoard, '.board-container');
  form.classList.add('invisible');
}

function customChanges() {
  gCustom.gameCustom = true;
  const mines = +document.getElementById('mines').value;
  gGame.safeClicks = +document.getElementById('safeclicks').value;
  gGame.hints = +document.getElementById('hints').value;
  gLevel.SIZE = +document.getElementById('size').value;
  gGame.lives = +document.getElementById('lives').value;
  gLevel.MINES = mines < gLevel.SIZE ** 2 ? mines : gLevel.SIZE;
  gLevel.marksLeft = gLevel.MINES;
  gCustom.minesLeft = gLevel.marksLeft;
}

function placeMine(elCell, i, j) {
  if (gBoard[i][j].isMine) return;
  gCustom.minesLeft--;
  elCell.innerHTML = MINE;
  gBoard[i][j].isMine = true;
}
