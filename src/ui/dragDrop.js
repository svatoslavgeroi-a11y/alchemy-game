import { ELEMENTS_DATA } from '../data/elements.js';
import { RECIPES, isTerminalElement } from '../data/recipes.js';
import { craftingSlots, setCraftingSlot } from '../logic/gameState.js';
import { checkRecipe } from '../logic/engine.js';

export let draggingItem = null;
let dropTimeout = null;

export function handleDragStartFromInventory(e) {
  if (e.button !== 0) return;
  
  const elementId = e.currentTarget.dataset.id;
  const elData = ELEMENTS_DATA[elementId];
  
  let hasMoved = false;
  let clone = null;

  function onMove(moveEvent) {
    if (!hasMoved) {
      hasMoved = true;
      window.isDraggingOrJustDropped = true;
      if (dropTimeout) clearTimeout(dropTimeout);

      clone = document.createElement('div');
      clone.className = 'element on-board dragging';
      clone.innerHTML = `<div class="icon">${elData.icon}</div><div class="name">${elData.name}</div>`;
      document.body.appendChild(clone);

      draggingItem = {
        domElement: clone,
        elementId: elementId,
        sourceSlotIndex: null,
        offsetX: clone.offsetWidth / 2,
        offsetY: clone.offsetHeight / 2
      };

      cacheSlots();
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }
    positionDraggingElement(clone, moveEvent.clientX, moveEvent.clientY);
  }

  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    // If mouse didn't move — this was a click, don't block
    if (!hasMoved) {
      window.isDraggingOrJustDropped = false;
    }
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

export function handleDragStartFromSlot(e, slotIndex) {
  if (e.button !== 0) return;
  const elementId = craftingSlots[slotIndex];
  if (!elementId) return;
  
  window.isDraggingOrJustDropped = true;
  if(dropTimeout) clearTimeout(dropTimeout);
  
  const elData = ELEMENTS_DATA[elementId];
  const slotEl = document.querySelector(`.craft-slot[data-index="${slotIndex}"]`);
  
  // Очищаем слот
  slotEl.innerHTML = '';
  setCraftingSlot(slotIndex, null);
  
  const clone = document.createElement('div');
  clone.className = 'element on-board dragging';
  clone.innerHTML = `<div class="icon">${elData.icon}</div><div class="name">${elData.name}</div>`;
  
  document.body.appendChild(clone);
  
  draggingItem = {
    domElement: clone,
    elementId: elementId,
    sourceSlotIndex: slotIndex,
    offsetX: clone.offsetWidth / 2,
    offsetY: clone.offsetHeight / 2
  };
  
  positionDraggingElement(clone, e.clientX, e.clientY);
  
  cacheSlots();
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);
  
  checkRecipe(); // Проверяем рецепт после изъятия элемента
}

let cachedSlots = [];
let pendingDragFrame = false;
let currentMouseX = 0;
let currentMouseY = 0;

function handleDragMove(e) {
  if (!draggingItem) return;
  e.preventDefault();
  
  currentMouseX = e.clientX;
  currentMouseY = e.clientY;
  
  if (!pendingDragFrame) {
    pendingDragFrame = true;
    requestAnimationFrame(updateDragPosition);
  }
}

function updateDragPosition() {
  if (!draggingItem) {
    pendingDragFrame = false;
    return;
  }
  
  positionDraggingElement(draggingItem.domElement, currentMouseX, currentMouseY);
  
  document.querySelectorAll('.craft-slot').forEach(slot => slot.classList.remove('drag-over'));
  const targetSlot = getSlotUnderCursor(currentMouseX, currentMouseY);
  if (targetSlot) {
    targetSlot.classList.add('drag-over');
  }
  pendingDragFrame = false;
}

function handleDragEnd(e) {
  if (!draggingItem) return;
  
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
  
  const domElement = draggingItem.domElement;
  domElement.remove();
  
  document.querySelectorAll('.craft-slot').forEach(slot => slot.classList.remove('drag-over'));
  
  const targetSlot = getSlotUnderCursor(e.clientX, e.clientY);
  
  if (targetSlot) {
    const slotIndex = parseInt(targetSlot.dataset.index);
    const existingElementId = craftingSlots[slotIndex];
    
    // Если в слоте уже есть элемент, меняем их местами, 
    // если мы перетащили из другого слота
    if (existingElementId && draggingItem.sourceSlotIndex !== null) {
       setCraftingSlot(draggingItem.sourceSlotIndex, existingElementId);
       renderSlot(draggingItem.sourceSlotIndex);
    }
    
    setCraftingSlot(slotIndex, draggingItem.elementId);
    renderSlot(slotIndex);
  } else {
    // Бросили мимо слотов - элемент просто исчезает
  }
  
  draggingItem = null;
  cachedSlots = [];
  checkRecipe();
  
  dropTimeout = setTimeout(() => {
    window.isDraggingOrJustDropped = false;
  }, 100);
}

function positionDraggingElement(el, x, y) {
  el.style.left = `${x - draggingItem.offsetX}px`;
  el.style.top = `${y - draggingItem.offsetY}px`;
}

function cacheSlots() {
  cachedSlots = Array.from(document.querySelectorAll('.craft-slot')).map(slot => {
    const rect = slot.getBoundingClientRect();
    return {
      slot: slot,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2
    };
  });
}

function getSlotUnderCursor(x, y) {
  let closestSlot = null;
  let minDistance = 80; // Радиус притяжения в пикселях

  for (let i = 0; i < cachedSlots.length; i++) {
    const cached = cachedSlots[i];
    const dist = Math.sqrt(Math.pow(cached.centerX - x, 2) + Math.pow(cached.centerY - y, 2));
    if (dist < minDistance) {
      minDistance = dist;
      closestSlot = cached.slot;
    }
  }

  return closestSlot;
}

export function renderSlot(index) {
  const slotEl = document.querySelector(`.craft-slot[data-index="${index}"]`);
  if (!slotEl) return;
  
  const elementId = craftingSlots[index];
  if (elementId) {
    const isTerminal = isTerminalElement(elementId);
    const elData = ELEMENTS_DATA[elementId];
    slotEl.innerHTML = `<div class="element on-board ${isTerminal ? 'is-terminal' : ''}">
        <div class="icon">${elData.icon}</div>
        <div class="name">${elData.name}</div>
        ${isTerminal ? '<div class="terminal-badge" title="Конечный элемент"></div>' : ''}
      </div>`;
    
    slotEl.firstElementChild.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      handleDragStartFromSlot(e, index);
    });
  } else {
    slotEl.innerHTML = '';
  }
}
