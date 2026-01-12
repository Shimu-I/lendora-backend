// admin-shortcut.js  → works on ALL pages automatically
(() => {
  let altPressed = false;

  // Listen for Alt key
  document.addEventListener('keydown', e => {
    if (e.key === 'Alt') altPressed = true;
    if (altPressed && e.key.toLowerCase() === 'b') {
      // Change this URL to your actual admin login page
      window.location.href = '/admin-login.html';   // ← change this if needed
    }
  });

  document.addEventListener('keyup', e => {
    if (e.key === 'Alt') altPressed = false;
  });

  // Prevent browser bookmark bar from opening
  document.addEventListener('keydown', e => {
    if (e.altKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
    }
  });
})();