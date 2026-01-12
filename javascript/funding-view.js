const openBtn = document.querySelector('.open-popup-btn');
const popup = document.getElementById('fundingPopup');
const closeBtn = document.getElementById('closePopup');

openBtn.addEventListener('click', () => {
  popup.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
  popup.style.display = 'none';
});

// Close when clicking outside
popup.addEventListener('click', (e) => {
  if (e.target === popup) {
    popup.style.display = 'none';
  }
});