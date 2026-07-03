import { CATEGORIES } from '../data/constants.js';
import { ELEMENTS_DATA } from '../data/elements.js';
import { RECIPES, isTerminalElement } from '../data/recipes.js';
import { unlockedElements, openCategoryLeft, openCategoryRight, setOpenCategoryLeft, setOpenCategoryRight } from '../logic/gameState.js';
import { handleDragStartFromInventory } from './dragDrop.js';
import { showHintForElement } from './hints.js';

let searchQuery = '';

export function setSearchQuery(query) {
  searchQuery = query;
  renderInventory();
}

function setupItemA11y(elNode) {
  elNode.setAttribute('role', 'button');
  elNode.setAttribute('tabindex', '0');
  elNode.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      elNode.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }
  });
}

export function renderInventory() {
  const inventoryEl = document.getElementById('inventory');
  const inventoryRightEl = document.getElementById('inventory-right');
  const mainArea = document.getElementById('main-area');
  
  if (!inventoryEl) return;

  inventoryEl.innerHTML = '';
  if (inventoryRightEl) inventoryRightEl.innerHTML = '';
  
  document.querySelectorAll('.category-container').forEach(c => c.remove());
  
  const fragmentLeft = document.createDocumentFragment();
  const fragmentRight = document.createDocumentFragment();
  const fragmentMain = document.createDocumentFragment();
  
  const grouped = {};
  let searchResults = [];
  
  unlockedElements.forEach(elementId => {
    const elData = ELEMENTS_DATA[elementId];
    if (!elData) return;
    
    if (searchQuery && elData.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      searchResults.push(elData);
    }
    
    const cat = elData.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(elData);
  });
  
  const leftCategories = ['basic', 'nature', 'geography', 'flora', 'fauna'];
  const rightCategories = ['minerals', 'materials', 'society', 'space', 'fun', 'other'];
  const categoryOrder = [...leftCategories, ...rightCategories];
  
  if (!grouped[openCategoryLeft]) {
    setOpenCategoryLeft(leftCategories.find(id => grouped[id]) || null);
  }
  if (!grouped[openCategoryRight]) {
    setOpenCategoryRight(rightCategories.find(id => grouped[id]) || null);
  }
  
  categoryOrder.forEach(catId => {
    if (!grouped[catId]) return;
    const elements = grouped[catId];
    
    const catConfig = CATEGORIES[catId] || { name: 'Разное', icon: '📦' };
    const isRightPanel = rightCategories.includes(catId);
    const isOpen = isRightPanel ? (catId === openCategoryRight) : (catId === openCategoryLeft);
    const parentEl = isRightPanel ? inventoryRightEl : inventoryEl;
    
    const catCircle = document.createElement('div');
    catCircle.className = `category-circle ${isOpen ? 'open' : ''}`;
    catCircle.innerHTML = catConfig.icon;
    catCircle.setAttribute('role', 'button');
    catCircle.setAttribute('tabindex', '0');
    catCircle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        catCircle.click();
      }
    });
    const targetFragment = isRightPanel ? fragmentRight : fragmentLeft;
    targetFragment.appendChild(catCircle);
    
    const catContainer = document.createElement('div');
    catContainer.className = `category-container ${isOpen ? 'open' : ''} ${isRightPanel ? 'right-panel' : ''}`;
    catContainer.dataset.category = catId;
    
    elements.forEach(elData => {
      const isTerminal = isTerminalElement(elData.id);
      const elNode = document.createElement('div');
      elNode.className = `element inventory-item ${isTerminal ? 'is-terminal' : ''}`;
      elNode.dataset.id = elData.id;
      elNode.innerHTML = `
        <div class="icon">${elData.icon}</div>
        <div class="name">${elData.name}</div>
        ${isTerminal ? '<div class="terminal-badge" title="Конечный элемент"></div>' : ''}
      `;
      
      elNode.addEventListener('mousedown', handleDragStartFromInventory);
      elNode.addEventListener('click', (e) => {
        if (window.isDraggingOrJustDropped) return;
        e.stopPropagation();
        showHintForElement(elData.id);
      });
      setupItemA11y(elNode);
      catContainer.appendChild(elNode);
    });
    
    fragmentMain.appendChild(catContainer);
    
    function positionPanel() {
      if (!catContainer.classList.contains('open')) return;
      const circleRect = catCircle.getBoundingClientRect();
      const mainRect = mainArea.getBoundingClientRect();
      
      if (isRightPanel) {
        catContainer.style.left = 'auto';
        catContainer.style.right = `${mainRect.right - circleRect.left + 10}px`;
      } else {
        catContainer.style.right = 'auto';
        catContainer.style.left = `${circleRect.right - mainRect.left + 10}px`;
      }
      
      const panelHeight = catContainer.offsetHeight;
      let top = circleRect.top - mainRect.top + circleRect.height / 2 - panelHeight / 2;
      
      if (top < 10) top = 10;
      if (top + panelHeight > mainRect.height - 10) top = mainRect.height - panelHeight - 10;
      
      catContainer.style.top = `${top}px`;
    }
    
    if (isOpen) {
      requestAnimationFrame(positionPanel);
    }
    
    catCircle.addEventListener('click', () => {
      if (isRightPanel) {
        setOpenCategoryRight(catId);
        inventoryRightEl.querySelectorAll('.category-circle').forEach(h => h.classList.remove('open'));
        document.querySelectorAll('.category-container.right-panel').forEach(c => c.classList.remove('open'));
      } else {
        setOpenCategoryLeft(catId);
        inventoryEl.querySelectorAll('.category-circle').forEach(h => h.classList.remove('open'));
        document.querySelectorAll('.category-container:not(.right-panel):not(.search-results-panel)').forEach(c => c.classList.remove('open'));
      }
      
      catCircle.classList.add('open');
      catContainer.classList.add('open');
      requestAnimationFrame(positionPanel);
    });
  });
  
  inventoryEl.appendChild(fragmentLeft);
  if (inventoryRightEl) inventoryRightEl.appendChild(fragmentRight);
  mainArea.appendChild(fragmentMain);
  
  // Render search results if active
  if (searchQuery) {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'category-container open search-results-panel';
    
    if (searchResults.length === 0) {
      searchContainer.innerHTML = '<div style="color: rgba(255,255,255,0.5); padding: 20px;">Ничего не найдено</div>';
    } else {
      searchResults.forEach(elData => {
        const isTerminal = isTerminalElement(elData.id);
        const elNode = document.createElement('div');
        elNode.className = `element inventory-item ${isTerminal ? 'is-terminal' : ''}`;
        elNode.dataset.id = elData.id;
        elNode.innerHTML = `
          <div class="icon">${elData.icon}</div>
          <div class="name">${elData.name}</div>
          ${isTerminal ? '<div class="terminal-badge" title="Конечный элемент"></div>' : ''}
        `;
        elNode.addEventListener('mousedown', handleDragStartFromInventory);
        elNode.addEventListener('click', (e) => {
          if (window.isDraggingOrJustDropped) return;
          e.stopPropagation();
          showHintForElement(elData.id);
        });
        setupItemA11y(elNode);
        searchContainer.appendChild(elNode);
      });
    }
    mainArea.appendChild(searchContainer);
    document.querySelectorAll('.category-container:not(.search-results-panel)').forEach(c => c.style.display = 'none');
  }
}

let cachedTotalElements = null;
let cachedTotalReactions = null;

export function updateStats() {
  const elementsCountEl = document.getElementById('elements-count');
  const reactionsCountEl = document.getElementById('reactions-count');
  
  if (!elementsCountEl || !reactionsCountEl) return;
  
  if (cachedTotalElements === null) {
    cachedTotalElements = Object.keys(ELEMENTS_DATA).length;
    cachedTotalReactions = Object.keys(RECIPES).length;
  }
  
  let discoveredReactions = 0;
  for (const result of Object.values(RECIPES)) {
    const resultIds = Array.isArray(result) ? result : [result];
    if (resultIds.every(id => unlockedElements.includes(id))) {
      discoveredReactions++;
    }
  }

  elementsCountEl.textContent = `${unlockedElements.length} / ${cachedTotalElements}`;
  reactionsCountEl.textContent = `${discoveredReactions} / ${cachedTotalReactions}`;
}

export function addNewElementsToInventory(resultIds) {
  let needsFullRender = false;
  
  resultIds.forEach(id => {
    const elData = ELEMENTS_DATA[id];
    if (!elData) return;
    
    const catId = elData.category || 'other';
    const container = document.querySelector(`.category-container[data-category="${catId}"]`);
    
    if (!container) {
      needsFullRender = true;
    } else {
      const isTerminal = isTerminalElement(elData.id);
      const elNode = document.createElement('div');
      elNode.className = `element inventory-item ${isTerminal ? 'is-terminal' : ''}`;
      elNode.dataset.id = elData.id;
      elNode.innerHTML = `
        <div class="icon">${elData.icon}</div>
        <div class="name">${elData.name}</div>
        ${isTerminal ? '<div class="terminal-badge" title="Конечный элемент"></div>' : ''}
      `;
      elNode.addEventListener('mousedown', handleDragStartFromInventory);
      elNode.addEventListener('click', (e) => {
        if (window.isDraggingOrJustDropped) return;
        e.stopPropagation();
        showHintForElement(elData.id);
      });
      setupItemA11y(elNode);
      container.appendChild(elNode);
    }
  });
  
  if (needsFullRender) {
    renderInventory();
  }
}
