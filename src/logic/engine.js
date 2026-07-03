import { RECIPES, isTerminalElement } from '../data/recipes.js';
import { ELEMENTS_DATA } from '../data/elements.js';
import { craftingSlots, clearCraftingSlots, addUnlockedElement } from './gameState.js';
import { showToast } from '../ui/notifications.js';
import { renderSlot } from '../ui/dragDrop.js';

let currentResultId = null;

export function checkRecipe() {
  const activeElements = craftingSlots.filter(id => id !== null);
  const outputContainer = document.getElementById('crafting-output');
  
  if (!outputContainer) return;
  
  if (activeElements.length < 2) {
    clearResultSlot(outputContainer);
    return;
  }
  
  const pairOrTriplet = activeElements.sort().join('+');
  const resultId = RECIPES[pairOrTriplet];
  
  if (resultId) {
    const resultIds = Array.isArray(resultId) ? resultId : [resultId];
    showResultSlot(outputContainer, resultIds);
  } else {
    clearResultSlot(outputContainer);
  }
}

function showResultSlot(containerEl, resultIds) {
  currentResultId = resultIds;
  containerEl.innerHTML = '';
  
  resultIds.forEach(resultId => {
    const isTerminal = isTerminalElement(resultId);
    const elData = ELEMENTS_DATA[resultId];
    
    const slotEl = document.createElement('div');
    slotEl.className = 'result-slot';
    slotEl.onclick = collectResult;
    
    slotEl.innerHTML = `
      <div class="element on-board new-discovery ${isTerminal ? 'is-terminal' : ''}">
        <div class="icon">${elData.icon}</div>
        <div class="name">${elData.name}</div>
        ${isTerminal ? '<div class="terminal-badge" title="Конечный элемент"></div>' : ''}
      </div>`;
      
    containerEl.appendChild(slotEl);
  });
}

function clearResultSlot(containerEl) {
  currentResultId = null;
  containerEl.innerHTML = '';
}

export function collectResult(e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  if (!currentResultId) return;
  
  const resultIds = Array.isArray(currentResultId) ? currentResultId : [currentResultId];
  
  // Очищаем входные слоты
  clearCraftingSlots();
  renderSlot(0);
  renderSlot(1);
  renderSlot(2);
  
  // Очищаем результат
  const outputContainer = document.getElementById('crafting-output');
  clearResultSlot(outputContainer);
  
  // Добавляем в инвентарь
  let newElements = [];
  let lastToastData = null;
  
  resultIds.forEach(resultId => {
    if (addUnlockedElement(resultId)) {
      newElements.push(resultId);
      lastToastData = ELEMENTS_DATA[resultId];
    }
  });
  
  if (newElements.length > 0) {
    if (lastToastData) showToast(lastToastData); // Показываем тост хотя бы для одного
  }
}

export function setupCraftingStation() {
  const clearBtn = document.getElementById('clear-slots-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearCraftingSlots();
      renderSlot(0);
      renderSlot(1);
      renderSlot(2);
      checkRecipe();
    });
  }
}
