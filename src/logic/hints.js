import { RECIPES } from '../data/recipes.js';
import { ELEMENTS_DATA } from '../data/elements.js';
import { unlockedElements } from './gameState.js';

/**
 * Возвращает все доступные подсказки — комбинации, где:
 * - все ингредиенты уже открыты
 * - хотя бы один результат ещё НЕ открыт
 */
export function getAvailableHints() {
  const hints = [];

  for (const [key, result] of Object.entries(RECIPES)) {
    const ingredients = key.split('+');
    const allUnlocked = ingredients.every(id => unlockedElements.includes(id));
    if (!allUnlocked) continue;

    const resultIds = Array.isArray(result) ? result : [result];
    const hasNewResult = resultIds.some(id => !unlockedElements.includes(id));
    if (!hasNewResult) continue;

    hints.push({ ingredients, result: resultIds });
  }

  return hints;
}

/**
 * Возвращает все рецепты, в которых участвует elementId:
 * - Показывает рецепты, где все ингредиенты открыты
 * - Разделяет на "новые" (результат не открыт) и "известные"
 */
export function getHintsForElement(elementId) {
  const newRecipes = [];
  const knownRecipes = [];

  for (const [key, result] of Object.entries(RECIPES)) {
    const ingredients = key.split('+');
    if (!ingredients.includes(elementId)) continue;

    const allUnlocked = ingredients.every(id => unlockedElements.includes(id));
    if (!allUnlocked) continue;

    const resultIds = Array.isArray(result) ? result : [result];
    const hasNewResult = resultIds.some(id => !unlockedElements.includes(id));

    const entry = { ingredients, result: resultIds };
    if (hasNewResult) {
      newRecipes.push(entry);
    } else {
      knownRecipes.push(entry);
    }
  }

  return { newRecipes, knownRecipes };
}

/**
 * Возвращает один случайный элемент, который можно создать прямо сейчас
 */
export function getRandomHint() {
  const hints = getAvailableHints();
  if (hints.length === 0) return null;

  const random = hints[Math.floor(Math.random() * hints.length)];
  // Возвращаем первый неоткрытый результат
  const unknownResult = random.result.find(id => !unlockedElements.includes(id));
  return unknownResult ? ELEMENTS_DATA[unknownResult] : null;
}
