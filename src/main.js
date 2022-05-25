'use strict';
var gBoard;
var gInterval;
const gSmiley = ['😁', '😮', '🤕', '😎'];
const LIVE = '❣️';
const EMPTY = ' ';
const MINE = '💣';
const FLAG = '🚩';
const elTimer = document.querySelector('.timer');
const elSmiley = document.querySelector('.smiley');
const elFlags = document.querySelector('.flags');
const gLevel = {
  SIZE: 4,
  MINES: 2,
  marksLeft: 2,
};
const gGame = {
  isOn: false,
  showCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
};

initGame();

function initGame() {
  init();
  gBoard = createBoard();
  renderBoard(gBoard, '.board-container');
}

function init() {
  // Initiallizing all global variables
  gGame.showCount = 0;
  gGame.markedCount = 0;
  gGame.secsPassed = 0;
  elFlags.textContent = gLevel.MINES;
  elSmiley.textContent = gSmiley[0];
  elTimer.textContent = gGame.secsPassed;
  gGame.isOn = true;
  gGame.lives = 3;
  clearInterval(gInterval);
}

function setDifficulty(el) {
  console.log(el.value);
  if (el.value === 'easy') {
    gLevel.SIZE = 4;
    gLevel.MINES = 2;
    gLevel.marksLeft = gLevel.MINES;
  } else if (el.value === 'medium') {
    gLevel.SIZE = 8;
    gLevel.MINES = 12;
    gLevel.marksLeft = gLevel.MINES;
  } else if (el.value === 'hard') {
    gLevel.SIZE = 12;
    gLevel.MINES = 30;
    gLevel.marksLeft = gLevel.MINES;
  }
  initGame();
}

function createBoard() {
  const board = [];
  for (let i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
    }
  }
  console.log(board);
  return board;
}

function cellClicked(elCell, i, j) {
  // Guard
  if (
    !elCell.classList.contains('hidden') ||
    !gGame.isOn ||
    gBoard[i][j].isMarked
  )
    return;
  // Change cell to shown
  gBoard[i][j].isShown = true;
  // First move
  if (!gGame.secsPassed) {
    // To prevent exploiting mouse clicks
    gGame.secsPassed = 0.0001;
    // Start game timer
    startTimer();
    // Create mines in random position
    createRandomMines(gBoard);
    // Update mines around counter to all cells
    countNegsMines();
  }
  if (gBoard[i][j].isMine) {
    gGame.lives--;
    if (!gGame.lives) {
      endGame(false);
      // Render mines on board if game stepped on a mine
      renderBoard(gBoard, '.board-container', false);
    }
    if (checkGameOver()) endGame();
    renderCell(i, j, true);
    return;
  }
  // Reveals cells around empty cells
  renderCellsAround(i, j);
  //   expandShown(gBoard, elCell, i, j);
  if (checkGameOver()) {
    endGame();
    renderCell(i, j);
    return;
  }
}

function cellMarked(ev, i, j) {
  ev.preventDefault();
  if (gBoard[i][j].isShown || !gGame.isOn) return;

  if (gBoard[i][j].isMarked) {
    removeFlag(i, j);
  } else {
    if (!gLevel.marksLeft) return;
    putFlag(i, j);
  }
}

function checkGameOver() {
  let shownCells = 0;
  let shownMines = 0;
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard.length; j++) {
      if (gBoard[i][j].isShown === true) shownCells++;
      if (gBoard[i][j].isShown === true && gBoard[i][j].isMine) shownMines++;
    }
  }

  return shownCells - shownMines === gLevel.SIZE ** 2 - gLevel.MINES;
}

function createRandomMines(board) {
  // Putting mines in random locations
  const emptyCells = getRandEmptyCells();
  for (let i = 0; i < gLevel.MINES; i++) {
    const location = emptyCells.splice(
      getRandomInc(0, emptyCells.length - 1),
      1
    )[0];
    board[location.i][location.j].isMine = true;
  }
}

function startTimer() {
  // Starts game timer
  gInterval = setInterval(() => {
    gGame.secsPassed++;
    elTimer.textContent = gGame.secsPassed.toFixed(1).slice(0, 1);
  }, 1000);
}

function endGame(isVictory = true) {
  // TODO:finish game functionallity
  gGame.isOn = false;
  elSmiley.textContent = isVictory ? gSmiley[3] : gSmiley[2];
  clearInterval(gInterval);
  // Add a game over msg to be displayed on screen
}

function countNegsMines() {
  // Loops over the entire board and adds amount of mines around each cell
  for (let i = 0; i < gLevel.SIZE; i++) {
    for (let j = 0; j < gLevel.SIZE; j++) {
      gBoard[i][j].minesAroundCount = setMinesNegsCount(i, j);
    }
  }
}

function setMinesNegsCount(i, j) {
  // Sets mines around count for all cells
  let mines = 0;
  for (let idx = i - 1; idx < i + 2; idx++) {
    if (idx < 0 || idx >= gLevel.SIZE) continue;
    for (let secondIdx = j - 1; secondIdx < j + 2; secondIdx++) {
      if (secondIdx < 0 || secondIdx >= gLevel.SIZE) continue;

      if (gBoard[idx][secondIdx].isMine) mines++;
    }
  }
  return mines;
}

function renderCellsAround(i, j) {
  // Shows how many cells around the cell are mines
  // setting the cur cell to shown
  gBoard[i][j].isShown = true;

  // Checks if we didnt covered all cells when recursivley revealing cells
  if (checkGameOver()) endGame();
  // Our recursion function stop condtion & If cell marked dont render
  if (gBoard[i][j].minesAroundCount && !gBoard[i][j].isMarked) {
    renderCell(i, j);
    return;
  }
  for (let idx = i - 1; idx < i + 2; idx++) {
    if (idx < 0 || idx >= gLevel.SIZE) continue;

    for (let secondIdx = j - 1; secondIdx < j + 2; secondIdx++) {
      if (secondIdx < 0 || secondIdx >= gLevel.SIZE) continue;
      // If marked dont render
      if (gBoard[idx][secondIdx].isMarked) continue;

      const neighborCell = renderCell(idx, secondIdx);
      // Checks if we are not in the current square so the recursion wont be infinite
      if (i === idx && j === idx) continue;

      if (neighborCell === EMPTY && !gBoard[idx][secondIdx].isShown)
        renderCellsAround(idx, secondIdx);
      // All neighbors cells that have mines around need to be set to shown
      else {
        gBoard[idx][secondIdx].isShown = true;
      }
    }
  }
}

function putFlag(i, j) {
  gBoard[i][j].isMarked = true;
  gLevel.marksLeft--;
  elFlags.textContent = gLevel.marksLeft;
  renderFlag(i, j);
}

function removeFlag(i, j) {
  gBoard[i][j].isMarked = false;
  gLevel.marksLeft++;
  elFlags.textContent = gLevel.marksLeft;
  renderFlag(i, j);
}
