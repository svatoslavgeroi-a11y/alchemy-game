export let unlockedElements = ['water', 'fire', 'earth', 'air'];
export let openCategoryLeft = 'basic';
export let openCategoryRight = 'water';
export let craftingSlots = [null, null, null]; // elementIds

const listeners = {};

export function subscribe(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

export function emit(event, data) {
  if (listeners[event]) {
    listeners[event].forEach(cb => cb(data));
  }
}

export function setOpenCategoryLeft(cat) {
  openCategoryLeft = cat;
}
export function setOpenCategoryRight(cat) {
  openCategoryRight = cat;
}

export function loadProgress() {
  const saved = localStorage.getItem('alchemy_progress');
  if (saved) {
    try {
      let parsed = JSON.parse(saved);
      // Миграция старых ID на новые
      parsed = parsed.map(id => id === 'sun' ? 'star' : id);
      
      unlockedElements.splice(0, unlockedElements.length, ...parsed);
      ['water', 'fire', 'earth', 'air'].forEach(el => {
        if (!unlockedElements.includes(el)) unlockedElements.push(el);
      });
    } catch(e) {
      console.error('Error loading progress', e);
    }
  }
}

export function saveProgress() {
  localStorage.setItem('alchemy_progress', JSON.stringify(unlockedElements));
}

export function addUnlockedElement(id) {
  if (!unlockedElements.includes(id)) {
    unlockedElements.push(id);
    saveProgress();
    emit('elementUnlocked', [id]);
    return true;
  }
  return false;
}

export function setCraftingSlot(index, elementId) {
  craftingSlots[index] = elementId;
}

export function clearCraftingSlots() {
  craftingSlots[0] = null;
  craftingSlots[1] = null;
  craftingSlots[2] = null;
}
