// notification-overlay.js - Add this to your profile pages

document.addEventListener('DOMContentLoaded', function() {
  
  // Create overlay with your exact notification HTML structure
  const overlayHTML = `
    <div id="notificationOverlay" class="notification-overlay" style="display: none;">
      <div class="frame">
        <button class="close-overlay" id="closeNotificationOverlay">
          <i class="fas fa-times"></i>
        </button>
        <h1 class="title">Notifications</h1>

        <div class="notification-box">
          <div class="user-info">
            <img src="images/elli.png" alt="Elli_user" class="avatar">
            <div class="user-details">
              <p class="username">User Name: Elli_user</p>
              <p class="status">Loan Offer Accepted</p>
            </div>
          </div>

          <p class="message">
            The borrower has accepted your offer for a College (Education) loan.
          </p>
        </div>

        <!-- Add more notification boxes here as needed -->
        
      </div>
    </div>
  `;
  
  // Insert overlay into body
  document.body.insertAdjacentHTML('beforeend', overlayHTML);
  
  // Get elements
  const notificationBtn = document.querySelector('.btn-notifications');
  const overlay = document.getElementById('notificationOverlay');
  const closeBtn = document.getElementById('closeNotificationOverlay');
  
  // Open overlay when notification button is clicked
  if (notificationBtn) {
    notificationBtn.addEventListener('click', function(e) {
      e.preventDefault();
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Add fade-in animation
      setTimeout(() => {
        overlay.classList.add('active');
      }, 10);
    });
  }
  
  // Close overlay function
  function closeOverlay() {
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }
  
  // Close when X button is clicked
  if (closeBtn) {
    closeBtn.addEventListener('click', closeOverlay);
  }
  
  // Close when clicking outside the frame
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      closeOverlay();
    }
  });
  
  // Close with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.style.display === 'flex') {
      closeOverlay();
    }
  });
  
  // Optional: Add click animation to notification boxes
  const notificationBoxes = overlay.querySelectorAll('.notification-box');
  notificationBoxes.forEach(box => {
    box.addEventListener('click', function() {
      this.style.transform = 'scale(0.98)';
      setTimeout(() => this.style.transform = '', 150);
    });
  });
  
});