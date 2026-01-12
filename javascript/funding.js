

window.addEventListener('load', () => {
    // Add the fade-in class
    document.body.classList.add('fade-in');

    // Enable scrolling after fade-in
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
  });



// ---------------------
// FILTERS
// ---------------------

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove 'active' from all buttons
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const posts = document.querySelectorAll('.card');

    posts.forEach(post => {
      if (filter === 'all' || post.dataset.filter === filter) {
        post.style.display = 'block';
      } else {
        post.style.display = 'none';
      }
    });
  });
});

// ---------------------
// SEARCH
// ---------------------
document.getElementById('searchInput').addEventListener('input', e => {
  const term = e.target.value.toLowerCase();
  const posts = document.querySelectorAll('.card');

  posts.forEach(post => {
    const title = post.querySelector('h3').textContent.toLowerCase();
    const desc = post.querySelector('p').textContent.toLowerCase();

    if (title.includes(term) || desc.includes(term)) {
      post.style.display = 'block';
    } else {
      post.style.display = 'none';
    }
  });
});

// funding-payment-integration.js - Simple integration for donate buttons

document.addEventListener('DOMContentLoaded', function() {
  
  // Get all donate buttons
  const donateButtons = document.querySelectorAll('.donate-btn');
  
  // Add click event to each donate button
  donateButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the card element
      const card = this.closest('.card');
      
      // Get the goal amount from this specific card
      const goalAmountElement = card.querySelector('.goal-amount');
      let amount = '10000.00'; // Default amount
      
      if (goalAmountElement) {
        // Extract amount from text (remove currency symbol)
        const goalText = goalAmountElement.textContent.trim();
        amount = goalText.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except decimal
        
        // If no decimal, add .00
        if (!amount.includes('.')) {
          amount = amount + '.00';
        }
      }
      
      // Show payment overlay
      showPaymentOverlay(amount);
    });
  });
  
  // Function to show payment overlay
  function showPaymentOverlay(amount) {
    const overlay = document.getElementById('paymentOverlay');
    
    if (overlay) {
      // Update amount
      const amountInput = overlay.querySelector('#amount');
      const payAmountSpan = overlay.querySelector('#payAmount');
      
      if (amountInput) amountInput.value = amount;
      if (payAmountSpan) payAmountSpan.textContent = amount;
      
      // Show overlay
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }
  
});


document.addEventListener("DOMContentLoaded", function () {
  const createBtn = document.getElementById("createPostBtn");

  if (createBtn) {
    createBtn.addEventListener("click", function () {
      window.location.href = "funding_interface_form.html";
    });
  }
});

