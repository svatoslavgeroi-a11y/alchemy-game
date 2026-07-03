import { ELEMENTS_DATA } from '../data/elements.js';
import { getRandomHint, getHintsForElement } from '../logic/hints.js';

let hintPanel = null;
let currentElementId = null;
let activeHighlights = [];

// ─── Подсветка элементов в инвентаре ────────────────────────────────────────

function clearHighlights() {
  activeHighlights.forEach(el => el.classList.remove('hint-highlight'));
  activeHighlights = [];
}

export function highlightElements(ids) {
  clearHighlights();
  ids.forEach(id => {
    document.querySelectorAll(`.inventory-item[data-id="${id}"]`).forEach(el => {
      el.classList.add('hint-highlight');
      activeHighlights.push(el);
    });
  });
}

// ─── Рендер строки рецепта ────────────────────────────────────────────────────

function renderRecipeRow(ingredients, result, isNew, onHover) {
  const row = document.createElement('div');
  row.className = `hint-row ${isNew ? 'hint-row--new' : 'hint-row--known'}`;

  // Ингредиенты
  const ingredientsEl = document.createElement('div');
  ingredientsEl.className = 'hint-ingredients';
  ingredients.forEach((id, i) => {
    const elData = ELEMENTS_DATA[id];
    if (!elData) return;

    const chip = document.createElement('div');
    chip.className = 'hint-chip';
    chip.innerHTML = `<span class="hint-chip-icon">${elData.icon}</span><span class="hint-chip-name">${elData.name}</span>`;
    ingredientsEl.appendChild(chip);

    if (i < ingredients.length - 1) {
      const plus = document.createElement('span');
      plus.className = 'hint-plus';
      plus.textContent = '+';
      ingredientsEl.appendChild(plus);
    }
  });

  // Стрелка
  const arrow = document.createElement('span');
  arrow.className = 'hint-arrow';
  arrow.textContent = '→';

  // Результат
  const resultEl = document.createElement('div');
  resultEl.className = 'hint-result';

  result.forEach(id => {
    const elData = ELEMENTS_DATA[id];
    if (!elData) return;

    if (isNew) {
      // Не раскрываем — только ???
      const chip = document.createElement('div');
      chip.className = 'hint-chip hint-chip--hidden';
      chip.innerHTML = `<span class="hint-chip-icon">❓</span><span class="hint-chip-name">???</span>`;
      resultEl.appendChild(chip);
    } else {
      const chip = document.createElement('div');
      chip.className = 'hint-chip';
      chip.innerHTML = `<span class="hint-chip-icon">${elData.icon}</span><span class="hint-chip-name">${elData.name}</span>`;
      resultEl.appendChild(chip);
    }
  });

  row.appendChild(ingredientsEl);
  row.appendChild(arrow);
  row.appendChild(resultEl);

  // Подсветка при наведении
  if (isNew) {
    const othersInRecipe = ingredients.filter(id => id !== currentElementId);
    row.addEventListener('mouseenter', () => highlightElements(othersInRecipe));
    row.addEventListener('mouseleave', clearHighlights);
  }

  return row;
}

// ─── Рендер панели подсказок ──────────────────────────────────────────────────

function renderHintPanel(elementId) {
  currentElementId = elementId;
  const elData = ELEMENTS_DATA[elementId];
  if (!elData || !hintPanel) return;

  const { newRecipes, knownRecipes } = getHintsForElement(elementId);

  const header = hintPanel.querySelector('.hint-panel-header-title');
  header.innerHTML = `${elData.icon} <span>${elData.name}</span>`;

  const body = hintPanel.querySelector('.hint-panel-body');
  body.innerHTML = '';

  // Переключатель вкладок
  const tabs = hintPanel.querySelectorAll('.hint-tab');
  tabs.forEach(t => t.classList.remove('active'));

  // Контент для вкладок (сохраняем в dataset)
  hintPanel.dataset.elementId = elementId;

  function showTab(tabName) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    body.innerHTML = '';
    clearHighlights();

    const recipes = tabName === 'new' ? newRecipes : knownRecipes;

    if (recipes.length === 0) {
      body.innerHTML = `<div class="hint-empty">${tabName === 'new' ? 'Нет доступных новых рецептов' : 'Нет открытых рецептов'}</div>`;
      return;
    }

    recipes.forEach(({ ingredients, result }) => {
      body.appendChild(renderRecipeRow(ingredients, result, tabName === 'new'));
    });
  }

  tabs.forEach(tab => {
    tab.onclick = () => showTab(tab.dataset.tab);
  });

  // Показать вкладку "new" по умолчанию, если есть новые
  showTab(newRecipes.length > 0 ? 'new' : 'known');

  openHintPanel();
}

// ─── Открытие / закрытие панели ──────────────────────────────────────────────

export function openHintPanel() {
  if (!hintPanel) return;
  hintPanel.classList.add('open');
}

export function closeHintPanel() {
  if (!hintPanel) return;
  hintPanel.classList.remove('open');
  clearHighlights();
  currentElementId = null;
}

// ─── Инициализация ────────────────────────────────────────────────────────────

export function setupHintSystem() {
  // Создаём панель
  hintPanel = document.createElement('div');
  hintPanel.id = 'hint-panel';
  hintPanel.className = 'hint-panel';
  hintPanel.innerHTML = `
    <div class="hint-panel-header">
      <div class="hint-panel-header-title"></div>
      <button class="hint-panel-close" title="Закрыть">✖</button>
    </div>
    <div class="hint-tabs">
      <button class="hint-tab active" data-tab="new">🔮 Новые</button>
      <button class="hint-tab" data-tab="known">✅ Открытые</button>
    </div>
    <div class="hint-panel-body"></div>
  `;
  document.getElementById('app').appendChild(hintPanel);

  // Закрытие кнопкой
  hintPanel.querySelector('.hint-panel-close').addEventListener('click', closeHintPanel);

  // Кнопка 💡 — случайная подсказка (тост)
  const hintBtn = document.getElementById('hint-btn');
  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      closeHintPanel();
      const hint = getRandomHint();
      if (!hint) {
        showNotification('Больше нет доступных подсказок!', 'info');
        return;
      }

      // Показываем иконку без имени
      const toast = document.createElement('div');
      toast.className = 'hint-toast';
      toast.innerHTML = `
        <div class="hint-toast-icon">${hint.icon}</div>
        <div class="hint-toast-text">Ты можешь создать этот элемент!</div>
      `;
      document.getElementById('toast-container').appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('show'));
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, 3500);
    });
  }
}

// ─── Публичный метод для вызова из inventory.js ───────────────────────────────

export function showHintForElement(elementId) {
  if (currentElementId === elementId && hintPanel?.classList.contains('open')) {
    closeHintPanel();
    return;
  }
  renderHintPanel(elementId);
}
