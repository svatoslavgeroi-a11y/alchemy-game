export function showToast(elData) {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.innerHTML = `
    <div class="toast-icon">${elData.icon}</div>
    <div class="toast-content">
      <h4>Новое открытие!</h4>
      <p>${elData.name}</p>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
