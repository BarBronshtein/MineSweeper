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
// const elLives= document.querySelector('.lives');
const elEndMsg = document.querySelector('.end-msg');
const elHints = document.querySelector('.hints');
const elSafeClick = document.querySelector('.safeclick');

const gLevel = {
  SIZE: 4,
  MINES: 2,
  marksLeft: 2,
  difficulty: 'easy',
};
const gGame = {
  isOn: false,
  showCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
  hints: 3,
  safeClicks: 3,
  isHintOn: false,
  history: [],
};

function initGame() {
  init();
  gBoard = createBoard();
  renderBoard(gBoard, '.board-container');
}

function init() {
  // Initiallizing all global variables
  gGame.history = [];
  gGame.isHintOn = false;
  gGame.safeClicks = 3;
  gGame.hints = 3;
  gGame.showCount = 0;
  gGame.markedCount = 0;
  gGame.secsPassed = 0;
  gGame.lives = 3;
  gGame.isOn = true;
  elFlags.textContent = gLevel.MINES;
  elSmiley.textContent = gSmiley[0];
  elTimer.textContent = gGame.secsPassed;
  clearInterval(gInterval);
}

function setDifficulty(el) {
  console.log(el.value);
  if (el.value === 'easy') {
    difficulty(el.value, 4, 2);
  } else if (el.value === 'medium') {
    difficulty(el.value, 8, 12);
  } else if (el.value === 'hard') {
    difficulty(el.value, 12, 30);
  }
  initGame();
}

function difficulty(difficulty, size, mines) {
  gLevel.difficulty = difficulty;
  gLevel.SIZE = size;
  gLevel.MINES = mines;
  gLevel.marksLeft = mines;
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

  gGame.history.push({ i, j });
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

  // When player activated hint
  if (gGame.isHintOn) {
    gBoard[i][j].isShown = false;
    showAndHideCells(i, j);
    return;
  }
  // When hitting a mine
  if (gBoard[i][j].isMine) {
    gGame.lives--;
    // Checks if we our out of lives
    if (!gGame.lives) {
      endGame(false);
      // Render all mines on board if lost all lives
      renderBoard(gBoard, '.board-container', false);
    }
    if (gLevel.difficulty === 'easy' && checkGameOver()) endGame();
    elSmiley.textContent = gSmiley[1];
    setTimeout(
      () => (elSmiley.textContent = gGame.isOn ? gSmiley[0] : gSmiley[3]),
      400
    );
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
  // Mark or Unmark cell
  ev.preventDefault();
  if (gBoard[i][j].isShown || !gGame.isOn) return;

  if (gBoard[i][j].isMarked) {
    removeFlag(i, j);
  } else {
    if (!gLevel.marksLeft) {
      return;
    }
    putFlag(i, j);
  }
}

function checkGameOver() {
  let shownCells = 0;
  let rightMark = 0;
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard.length; j++) {
      if (gBoard[i][j].isShown === true) shownCells++;
      if (!gBoard[i][j].isShown && gBoard[i][j].isMine && gBoard[i][j].isMarked)
        rightMark++;
    }
  }
  if (shownCells === gLevel.SIZE ** 2) return true;
  return (
    shownCells === gLevel.SIZE ** 2 - gLevel.MINES && rightMark === gLevel.MINES
  );
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
    elTimer.textContent = gGame.secsPassed.toFixed(1);
  }, 1000);
}

function endGame(isVictory = true) {
  let msg = isVictory ? 'You Won' : 'You Lost';
  // TODO:finish game functionallity
  gGame.isOn = false;
  elSmiley.textContent = isVictory ? gSmiley[3] : gSmiley[2];
  clearInterval(gInterval);
  elEndMsg.innerHTML = `<h2 class="${isVictory ? 'won' : 'lose'}">${msg}</h2>`;
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
      // If marked dont render cell
      if (gBoard[idx][secondIdx].isMarked) continue;

      renderCell(idx, secondIdx);
      // Checks if we are not in the current square so the recursion wont be infinite
      if (i === idx && j === idx) continue;

      if (!gBoard[idx][secondIdx].isShown) renderCellsAround(idx, secondIdx);
      gBoard[idx][secondIdx].isShown = true;
    }
  }
}

function putFlag(i, j) {
  gBoard[i][j].isMarked = true;
  gLevel.marksLeft--;
  elFlags.textContent = gLevel.marksLeft;
  renderFlag(i, j);
  if (!gLevel.marksLeft) if (checkGameOver()) endGame();
}

function removeFlag(i, j) {
  gBoard[i][j].isMarked = false;
  gLevel.marksLeft++;
  elFlags.textContent = gLevel.marksLeft;
  renderFlag(i, j);
}

function showAndHideCells(i, j) {
  // Showing cells in a sqaure and 1 sec after hides them
  for (let idx = i - 1; idx < i + 2; idx++) {
    if (idx < 0 || idx >= gLevel.SIZE) continue;

    for (let secondIdx = j - 1; secondIdx < j + 2; secondIdx++) {
      if (secondIdx < 0 || secondIdx >= gLevel.SIZE) continue;
      renderCell(idx, secondIdx, true);

      setTimeout(() => {
        gGame.isHintOn = false;
        restoreCell(idx, secondIdx);
      }, 1000);
    }
  }
}

function hint() {
  // Guard
  if (!gGame.hints) return;
  gGame.isHintOn = true;
  gGame.hints--;
}

function safeClick() {
  // Guard
  if (!gGame.safeClicks) return;
  gGame.safeClicks--;
  const emptyCellsIdx = getRandEmptyCells();
  const emptyCellIdx = emptyCellsIdx.splice(
    getRandomInc(0, emptyCellsIdx.length - 1)
  )[0];
  revealcell(emptyCellIdx.i, emptyCellIdx.j);
  setTimeout(() => revealcell(emptyCellIdx.i, emptyCellIdx.j), 1000);
}

function undo() {
  if (!gGame.history.length) return;
  const { i, j } = gGame.history.pop();
  restoreMove(i, j);
}

function restoreMove(i, j) {
  // Hiding all cells we discovered prev move
  if (!gGame.isOn) return;
  gBoard[i][j].isShown = false;

  // Our recursion function stop condtion & If cell marked dont render
  if (gBoard[i][j].minesAroundCount && !gBoard[i][j].isMarked) {
    if (gBoard[i][j].isMine) gGame.lives++;
    restoreCell(i, j, true);
    return;
  }
  for (let idx = i - 1; idx < i + 2; idx++) {
    if (idx < 0 || idx >= gLevel.SIZE) continue;

    for (let secondIdx = j - 1; secondIdx < j + 2; secondIdx++) {
      if (secondIdx < 0 || secondIdx >= gLevel.SIZE) continue;
      // If marked dont restore cell
      if (gBoard[idx][secondIdx].isMarked) continue;

      if (gBoard[i][j].isMine) gGame.lives++;
      restoreCell(idx, secondIdx, true);
      // Checks if we are not in the current square so the recursion wont be infinite
      if (i === idx && j === idx) continue;

      if (gBoard[idx][secondIdx].isShown) {
        gBoard[idx][secondIdx].isShown = false;
        restoreMove(idx, secondIdx);
      }
    }
  }
}
