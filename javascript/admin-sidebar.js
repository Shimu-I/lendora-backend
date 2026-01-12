// javascript/load-sidebar.js
document.addEventListener('DOMContentLoaded', function () {
  fetch('admin-sidebar.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('admin-sidebar').innerHTML = html;

      // === NEW: Minimal code to highlight active item ===
      const currentPath = location.pathname.split('/').pop(); // gets the filename, e.g., "admin-loan-requests.html"

      const sidebarItems = document.querySelectorAll('#admin-sidebar .sidebar-item');
      sidebarItems.forEach(item => {
        const link = item.parentElement; // the <a> tag
        const href = link.getAttribute('href');
        const filename = href.split('/').pop(); // handle possible "../" in logout

        if (filename === currentPath || (currentPath === '' && filename === 'admin-dashboard.html')) { // optional: handle index as dashboard
          item.classList.add('active');
        }
      });
      // === End of new code ===
    });
});