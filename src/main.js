'use strict';
var gBoard;
var gInterval;
const EMPTY = ' ';
const MINE = '💣';
const FLAG = '🚩';
const elTimer = document.querySelector('.timer');
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
};

initGame();

function initGame() {
  //   init();
  //   setDifficulty(el, gLevel);
  gBoard = createBoard();
  renderBoard(gBoard, '.board-container');
}

function init() {
  // Initiallizing all global variables
  gGame.showCount = 0;
  gGame.markedCount = 0;
  gGame.secsPassed = 0;
  clearInterval(gInterval);
}

function setDifficulty(el, level) {
  if (el.textContent === 'easy') {
    level.SIZE = 4;
    level.MINES = 2;
  } else if (el.textContent === 'medium') {
    level.SIZE = 8;
    level.MINES = 12;
  } else if (el.textContent === 'hard') {
    level.SIZE = 12;
    level.MINES = 30;
  }
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
  if (!elCell.classList.contains('hidden')) return;
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
    // TODO: Update minesaroundcount to all cells
    countNegsMines();
  }
  if (gBoard[i][j].isMine) {
    endGame();
    renderCell(i, j, true);
    return;
  }
  // TODO:reveal cell
  renderCellsAround(i, j);
  //   expandShown(gBoard, elCell, i, j);
  // TODO:render them on board
  //   if (!gGame.isOn) renderMines(gBoard);
}

function cellMarked(elCell) {}

function checkGameOver() {}

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

function endGame() {
  // TODO:finish game functionallity
  console.log('Too bad you lost');
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
  gBoard[i][j].isShown = true;

  if (gBoard[i][j].minesAroundCount) {
    renderCell(i, j);
    return;
  }
  for (let idx = i - 1; idx < i + 2; idx++) {
    if (idx < 0 || idx >= gLevel.SIZE) continue;

    for (let secondIdx = j - 1; secondIdx < j + 2; secondIdx++) {
      if (secondIdx < 0 || secondIdx >= gLevel.SIZE) continue;

      const neighborCell = renderCell(idx, secondIdx);
      // Checks if we are not in the current square so the recursion wont be infinite
      if (i === idx && j === idx) continue;

      if (neighborCell === EMPTY && !gBoard[idx][secondIdx].isShown) {
        renderCellsAround(idx, secondIdx);
      }
    }
  }
}
