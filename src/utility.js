'use strict';

function renderBoard(mat, selector) {
  var strHTML = '<table border="0"><tbody>';
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var cell = EMPTY;
      var dataSet = `hidden cell-${i}-${j}`;
      strHTML +=
        `<td onclick="cellClicked(this,${i},${j})" class="` +
        dataSet +
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
function renderCell(i, j, clicked = false) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell-${i}-${j}`);
  if (gBoard[i][j].isMine && clicked) {
    elCell.innerHTML = MINE;
    elCell.style.backgroundColor = 'red';
    elCell.classList.remove('hidden');
  } else {
    elCell.innerHTML = gBoard[i][j].minesAroundCount
      ? gBoard[i][j].minesAroundCount
      : EMPTY;
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
