import { ELEMENTS_DATA } from '../data/elements.js';
import { RECIPES } from '../data/recipes.js';
import { unlockedElements } from '../logic/gameState.js';
import { CATEGORIES } from '../data/constants.js';

export function setupEncyclopedia() {
  const btn = document.getElementById('encyclopedia-btn');
  const modal = document.getElementById('encyclopedia-modal');
  const closeBtn = document.getElementById('close-encyclopedia');
  const listEl = document.getElementById('encyclopedia-list');

  if (!btn || !modal) return;

  btn.addEventListener('click', () => {
    renderEncyclopedia(listEl);
    modal.classList.add('show');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
}

function renderEncyclopedia(container) {
  container.innerHTML = '';
  
  // Создаем карту обратных рецептов (result -> list of pairs)
  const recipesMap = {};
  for (const [pair, result] of Object.entries(RECIPES)) {
    const resultIds = Array.isArray(result) ? result : [result];
    resultIds.forEach(resId => {
      if (!recipesMap[resId]) recipesMap[resId] = [];
      recipesMap[resId].push(pair);
    });
  }

  // Группируем открытые элементы по категориям
  const grouped = {};
  unlockedElements.forEach(id => {
    const elData = ELEMENTS_DATA[id];
    if (elData) {
      const cat = elData.category || 'other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(elData);
    }
  });

  // Порядок категорий
  const categoryOrder = ['basic', 'nature', 'geography', 'flora', 'fauna', 'minerals', 'materials', 'society', 'space', 'fun', 'other'];

  categoryOrder.forEach(catId => {
    if (!grouped[catId]) return;
    
    const catConfig = CATEGORIES[catId] || { name: 'Разное', icon: '📦' };
    
    const catHeader = document.createElement('h3');
    catHeader.className = 'encyclopedia-category-title';
    catHeader.innerHTML = `${catConfig.icon} ${catConfig.name}`;
    container.appendChild(catHeader);

    const grid = document.createElement('div');
    grid.className = 'encyclopedia-grid';

    grouped[catId].forEach(elData => {
      const itemEl = document.createElement('div');
      itemEl.className = 'encyclopedia-item';
      
      const resultHtml = `
        <div class="result-element">
          <div class="icon">${elData.icon}</div>
          <div class="name">${elData.name}</div>
        </div>
      `;

      let recipeHtml = '';
      if (recipesMap[elData.id]) {
        // Берем первый рецепт (пока у нас 1 рецепт на элемент)
        const pair = recipesMap[elData.id][0];
        const ids = pair.split('+');
        const icons = ids.map(id => `<span>${ELEMENTS_DATA[id] ? ELEMENTS_DATA[id].icon : '?'}</span>`);
        
        recipeHtml = `
          <div class="recipe-formula">
            ${icons.join(' + ')}
          </div>
        `;
      } else {
        recipeHtml = `<div class="recipe-formula badge-basic">Базовый элемент</div>`;
      }

      itemEl.innerHTML = resultHtml + recipeHtml;
      grid.appendChild(itemEl);
    });

    container.appendChild(grid);
  });
}
