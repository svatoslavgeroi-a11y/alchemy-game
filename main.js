import './style.css';
import './src/ui/modal.css';
import './src/ui/crafting.css';
import { loadProgress, setOpenCategoryLeft, setOpenCategoryRight, subscribe } from './src/logic/gameState.js';
import { renderInventory, updateStats, setSearchQuery, addNewElementsToInventory } from './src/ui/inventory.js';
import { setupEncyclopedia } from './src/ui/encyclopedia.js';
import { setupCraftingStation } from './src/logic/engine.js';
import { validateRecipes } from './src/data/recipes.js';
import { ELEMENTS_DATA } from './src/data/elements.js';
import { setupHintSystem, closeHintPanel } from './src/ui/hints.js';

function init() {
  validateRecipes(ELEMENTS_DATA);
  loadProgress();
  renderInventory();
  updateStats();
  setupEventListeners();
  setupEncyclopedia();
  setupCraftingStation();
  setupHintSystem();
  
  subscribe('elementUnlocked', (ids) => {
    addNewElementsToInventory(ids);
    updateStats();
  });
}

function setupEventListeners() {
  
  // Закрытие панелей при клике мимо них
  document.addEventListener('click', (e) => {
    if (window.isDraggingOrJustDropped) return;
    
    const isClickInsideCircle = e.target.closest('.category-circle');
    const isClickInsideContainer = e.target.closest('.category-container');
    const isClickInsideSearch = e.target.closest('.search-container');
    
    if (!isClickInsideCircle && !isClickInsideContainer && !isClickInsideSearch) {
      setOpenCategoryLeft(null);
      setOpenCategoryRight(null);
      document.querySelectorAll('.category-circle').forEach(h => h.classList.remove('open'));
      document.querySelectorAll('.category-container:not(.search-results-panel)').forEach(c => c.classList.remove('open'));
    }
    
    // Закрываем панель подсказок при клике вне неё и вне элементов инвентаря
    const isClickInsideHintPanel = e.target.closest('#hint-panel');
    const isClickOnInventoryItem = e.target.closest('.inventory-item');
    if (!isClickInsideHintPanel && !isClickOnInventoryItem) {
      closeHintPanel();
    }
  });
  
  // Предотвращаем стандартный drag&drop браузера
  document.addEventListener('dragstart', e => e.preventDefault());
  
  // Поиск
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  
  if (searchInput && searchClearBtn) {
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const val = e.target.value.trim();
      searchClearBtn.style.display = val ? 'block' : 'none';
      
      searchTimeout = setTimeout(() => {
        setSearchQuery(val);
      }, 150);
    });
    
    searchClearBtn.addEventListener('click', () => {
      clearTimeout(searchTimeout);
      searchInput.value = '';
      setSearchQuery('');
      searchClearBtn.style.display = 'none';
      searchInput.focus();
    });
  }
}

// Запуск
init();
