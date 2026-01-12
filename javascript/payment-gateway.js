// javascript/payment-gateway.js

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Select DOM elements
    const overlay = document.getElementById('paymentGatewayOverlay');
    const closeBtn = document.getElementById('closePaymentBtn');
    const payBtn = document.getElementById('confirmPayBtn');
    const amountInput = document.getElementById('amount');
    const payAmountSpan = document.getElementById('payAmount');
    const tabs = document.querySelectorAll('.payment-tabs .tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // 1. Tab Switching Logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Remove active class from all contents
            tabContents.forEach(c => c.classList.remove('active'));

            // Activate clicked tab
            tab.classList.add('active');
            
            // Show corresponding content
            const targetId = tab.getAttribute('data-tab') === 'cards' ? 'cardsTab' : 'mobileTab';
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 2. Open Modal Logic
    // Attach event listeners to any button with class 'donate-btn'
    document.body.addEventListener('click', function(e) {
        if (e.target.classList.contains('donate-btn') || e.target.closest('.donate-btn')) {
            e.preventDefault();
            const button = e.target.classList.contains('donate-btn') ? e.target : e.target.closest('.donate-btn');
            
            // Get amount from data attribute or default to 1000
            const amount = button.getAttribute('data-amount') || '1000.00';
            
            openPaymentGateway(amount);
        }
    });

    // Function to open the overlay
    function openPaymentGateway(amount) {
        // Update the text/values
        if(amountInput) amountInput.value = parseFloat(amount).toFixed(2);
        if(payAmountSpan) payAmountSpan.textContent = parseFloat(amount).toFixed(2);

        // Show the overlay
        overlay.style.display = 'flex';
        // Small timeout to allow CSS transition if you have one
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
        
        document.body.style.overflow = 'hidden'; // Stop background scrolling
    }

    // 3. Close Modal Logic
    function closePaymentGateway() {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300); // Wait for CSS transition
        document.body.style.overflow = '';
    }

    // Close on button click
    if(closeBtn) {
        closeBtn.addEventListener('click', closePaymentGateway);
    }

    // Close on click outside
    window.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closePaymentGateway();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePaymentGateway();
        }
    });

    // 4. Payment Processing Logic
    if(payBtn) {
        payBtn.addEventListener('click', function() {
            const currentAmount = amountInput.value;
            alert('Processing payment of ' + currentAmount + ' ৳');
            
            // Here you would add your actual API call
            
            // On success:
            // closePaymentGateway();
        });
    }
});