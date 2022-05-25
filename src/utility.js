'use strict';

function renderBoard(mat, selector, isGameOn = true) {
  var strHTML = '<table border="0"><tbody>';
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var cell = gBoard[i][j].isMine ? MINE : EMPTY;
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
    elCell.classList.remove('hidden');
  } else {
    switch (gBoard[i][j].minesAroundCount) {
      case 0:
        elCell.innerHTML = EMPTY;
        break;
      case 1:
        elCell.innerHTML = gBoard[i][j].minesAroundCount;
        elCell.style.color = 'blue';
        break;
      case 2:
        elCell.innerHTML = gBoard[i][j].minesAroundCount;
        elCell.style.color = 'green';
        break;
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        elCell.innerHTML = gBoard[i][j].minesAroundCount;
        elCell.style.color = 'red';
        break;
    }
  }
  if (!gBoard[i][j].isMine) elCell.classList.remove('hidden');
  return elCell.innerHTML;
}

function getRandomInc(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandEmptyCells() {
  const emptyCells = [];
  for (let i = 0; i < gLevel.SIZE; i++) {
    for (let j = 0; j < gLevel.SIZE; j++) {
      if (!gBoard[i][j].isShown) emptyCells.push({ i, j });
    }
  }
  return emptyCells;
}
