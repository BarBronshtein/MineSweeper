'use strict';

function renderBoard(mat, selector, isGameOn = true) {
  var strHTML = '<table border="0"><tbody>';
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var cell = gBoard[i][j].isMine && !isGameOn ? MINE : EMPTY;
      const showMines = isGameOn ? '' : gBoard[i][j].isMine ? 'lost' : '';
      var className = `${showMines} hidden cell-${i}-${j}`;
      strHTML +=
        `<td oncontextmenu="cellMarked(event,${i},${j})" onclick="cellClicked(this,${i},${j})" class="` +
        className +
        '"> ' +
        cell +
        ' </td>';
    }
    strHTML += '</tr>';
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

function renderFlag(i, j) {
  const elCell = document.querySelector(`.cell-${i}-${j}`);
  elCell.innerHTML = elCell.innerHTML === FLAG ? EMPTY : FLAG;
}

function renderCell(i, j, clicked = false) {
  // Select the elCell and set the value
  const elCell = document.querySelector(`.cell-${i}-${j}`);
  if (gBoard[i][j].isMine && clicked) {
    elCell.innerHTML = MINE;
    elCell.style.backgroundColor = 'red';
  } else {
    if (!gBoard[i][j].minesAroundCount) elCell.innerHTML = EMPTY;
    else if (gBoard[i][j].minesAroundCount === 1)
      setValueAndColor(elCell, 'blue', i, j);
    else if (gBoard[i][j].minesAroundCount === 2)
      setValueAndColor(elCell, 'green', i, j);
    else setValueAndColor(elCell, 'red', i, j);
  }
  elCell.classList.remove('hidden');
}

function setValueAndColor(elCell, color, i, j) {
  elCell.innerHTML = gBoard[i][j].minesAroundCount;
  elCell.style.color = color;
}

function getRandomInc(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandEmptyCells() {
  const emptyCells = [];
  for (let i = 0; i < gLevel.SIZE; i++) {
    for (let j = 0; j < gLevel.SIZE; j++) {
      if (
        !gBoard[i][j].isMine &&
        !gBoard[i][j].isShown &&
        !gBoard[i][j].isMarked
      )
        emptyCells.push({ i, j });
    }
  }
  return emptyCells;
}

function restoreCell(i, j, toRestore = false) {
  // Setting cell to default (before clicked)

  const elCell = document.querySelector(`.cell-${i}-${j}`);
  if (gBoard[i][j].isShown && !toRestore) return;
  elCell.classList.add('hidden');
  if (elCell.innerHTML === MINE) elCell.style.backgroundColor = '#c9c9c9';
  elCell.innerHTML = EMPTY;
}

function revealcell(i, j) {
  const elCell = document.querySelector(`.cell-${i}-${j}`);
  elCell.classList.toggle('reveal');
}
