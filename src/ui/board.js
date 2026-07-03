import { getNextBoardElementId, addBoardElementState, updateBoardElementPositionState } from '../logic/gameState.js';
import { handleDragStartFromBoard } from './dragDrop.js';

export function positionElement(el, x, y) {
  const gameBoardEl = document.getElementById('game-board');
  const boardRect = gameBoardEl.getBoundingClientRect();
  el.style.left = `${x - boardRect.left}px`;
  el.style.top = `${y - boardRect.top}px`;
}

export function createBoardElementDOM(elData) {
  const elNode = document.createElement('div');
  elNode.className = 'element on-board';
  elNode.innerHTML = `
    <div class="icon">${elData.icon}</div>
    <div class="name">${elData.name}</div>
  `;
  return elNode;
}

export function addBoardElement(elementId, x, y, domElement) {
  const boardId = getNextBoardElementId();
  const boardItem = { id: boardId, elementId, x, y, domElement };
  
  addBoardElementState(boardItem);
  
  domElement.addEventListener('mousedown', (e) => handleDragStartFromBoard(e, boardItem));
  return boardItem;
}

export function updateBoardElementPosition(boardId, x, y) {
  updateBoardElementPositionState(boardId, x, y);
}
