document.addEventListener('DOMContentLoaded', function () {
    // Check for success message from loan request submission
    if (localStorage.getItem('loanRequestSuccess') === 'true') {
        showSuccessMessage();
        localStorage.removeItem('loanRequestSuccess');
    }

    loadLoans();
    setupFilters();
    setupSearch();
});

function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-notification';
    message.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Your loan request has been submitted successfully! Admin will review it soon.</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; margin-left: 10px;">&times;</button>
    `;
    document.body.appendChild(message);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, 5000);
}

let currentCategory = 'all';
let currentSearch = '';

async function loadLoans(category = 'all', search = '') {
    const container = document.querySelector('.loans-container');

    if (!container) {
        console.error('Loans container not found');
        return;
    }

    // Show loading state
    container.innerHTML = `
        <div class="loading" style="padding: 40px; text-align: center;">
            <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: var(--primary);"></i>
            <p style="margin-top: 20px; font-size: 18px;">Loading approved loans...</p>
        </div>
    `;

    try {
        let url = 'api-get-approved-loans.php?';
        if (category !== 'all') url += `category=${encodeURIComponent(category)}&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;

        console.log('Fetching from:', url); // Debug log

        const response = await fetch(url);

        console.log('Response status:', response.status); // Debug log
        console.log('Response ok:', response.ok); // Debug log

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        console.log('API Response:', data); // Debug log

        if (data.success && data.loans.length > 0) {
            container.innerHTML = '';
            data.loans.forEach(loan => {
                container.innerHTML += createLoanCard(loan);
            });
        } else {
            container.innerHTML = `
                <div class="empty-state" style="padding: 60px; text-align: center;">
                    <i class="fas fa-inbox" style="font-size: 64px; color: rgba(255,255,255,0.3); margin-bottom: 20px;"></i>
                    <h3 style="margin-bottom: 10px;">No approved loans found</h3>
                    <p style="color: rgba(255,255,255,0.7);">There are currently no approved loan requests matching your criteria.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading loans:', error);
        container.innerHTML = `
            <div class="empty-state" style="padding: 60px; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #dc4650; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px;">Error loading loans</h3>
                <p style="color: rgba(255,255,255,0.7);">Please try refreshing the page. Error: ${error.message}</p>
            </div>
        `;
    }
}

function createLoanCard(loan) {
    const category = loan.custom_category || loan.category;
    const duration = loan.custom_duration || (loan.duration_months ? `${loan.duration_months} months` : 'N/A');

    // Truncate reason if too long
    const reason = loan.reason.length > 200 ? loan.reason.substring(0, 200) + '...' : loan.reason;

    const documents = loan.documents || 'No documents';

    return `
        <article class="loan-card">
            <div class="card-header">
                <h3>User Name: ${loan.full_name || 'Anonymous'}</h3>
            </div>

            <div class="loan-info">
                <p><span class="label">Category:</span> <span class="tag">${category}</span></p>
                <p><span class="label">Reason:</span> ${reason}</p>
                <p><span class="label">Amount needed:</span> ${parseFloat(loan.amount).toLocaleString()} taka</p>
                <p><span class="label">Loan duration:</span> ${duration}</p>
                <p><span class="label">Repayment option:</span> ${loan.repayment_option}</p>
                <p><span class="label">Given document:</span> ${documents}</p>
            </div>

            <div class="card-footer">
                <div class="actions">
                    <a href="rate-borrower.html?loan_id=${loan.loan_id}" class="btn-rating">Submit Rating</a>
                    <a href="offer-form.html?loan_id=${loan.loan_id}" class="btn-offer">Make Offer</a>
                </div>
                <div class="stats">Accepted: ${loan.accepted_count || 0} &nbsp;&nbsp; Response: ${loan.response_count || 0}</div>
            </div>
        </article>
    `;
}

function getColorFromName(name) {
    const colors = ['2563eb', 'dc3545', '28a745', 'ffc107', '17a2b8', '6f42c1', 'fd7e14', '20c997'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active to clicked button
            this.classList.add('active');

            // Get filter value
            currentCategory = this.getAttribute('data-filter');

            // Reload loans with filter
            loadLoans(currentCategory, currentSearch);
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = this.value.trim();
                loadLoans(currentCategory, currentSearch);
            }, 500); // Wait 500ms after user stops typing
        });
    }
}
