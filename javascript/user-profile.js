// Only run blur/toast for unauthenticated users
document.addEventListener('DOMContentLoaded', function() {
    fetch('api/api-get-user-profile.php', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (!data.success || data.error === 'Not logged in') {
                document.body.style.filter = 'blur(18px)';
                document.body.style.pointerEvents = 'none';
                var toast = document.createElement('div');
                toast.innerHTML = '<div style="display:flex;align-items:center;gap:12px;"><span style=\"font-size:1.6rem;color:#fff;background:#70C1BF;border-radius:50%;padding:8px;display:inline-block;\">&#9888;</span><span style=\"font-size:1.1rem;font-weight:500;color:#fff;\">Access Denied: Please <a href=\'login.html\' style=\'color:#70C1BF;text-decoration:underline;font-weight:700;\'>log in</a> or <a href=\'signup.html\' style=\'color:#70C1BF;text-decoration:underline;font-weight:700;\'>sign up</a> to view this page.</span></div>';
                toast.style.position = 'fixed';
                toast.style.top = '50%';
                toast.style.left = '50%';
                toast.style.transform = 'translate(-50%,-50%)';
                toast.style.background = 'rgba(10,31,47,0.98)';
                toast.style.border = '2px solid #70C1BF';
                toast.style.borderRadius = '16px';
                toast.style.padding = '28px 38px';
                toast.style.boxShadow = '0 6px 32px rgba(0,0,0,0.25)';
                toast.style.zIndex = '99999';
                toast.style.opacity = '1';
                toast.style.transition = 'none';
                toast.style.textAlign = 'center';
                toast.style.maxWidth = '90vw';
                toast.style.fontFamily = 'Roboto, Arial, sans-serif';
                document.body.appendChild(toast);
                // blocking alert fallback
                document.body.style.filter = 'blur(18px)';
                document.body.style.pointerEvents = 'none';
                alert('Access Denied: Please log in or sign up to view this page.');
                document.body.style.filter = '';
                document.body.style.pointerEvents = '';
                window.location.replace('login.html');
                return;
            }
            // ...existing code...
        })
        .catch(() => {
            // fallback: treat as not logged in
            document.body.style.filter = 'blur(18px)';
            document.body.style.pointerEvents = 'none';
            var toast = document.createElement('div');
            toast.innerHTML = '<div style="display:flex;align-items:center;gap:12px;"><span style=\"font-size:1.6rem;color:#fff;background:#70C1BF;border-radius:50%;padding:8px;display:inline-block;\">&#9888;</span><span style=\"font-size:1.1rem;font-weight:500;color:#fff;\">Access Denied: Please <a href=\'login.html\' style=\'color:#70C1BF;text-decoration:underline;font-weight:700;\'>log in</a> or <a href=\'signup.html\' style=\'color:#70C1BF;text-decoration:underline;font-weight:700;\'>sign up</a> to view this page.</span></div>';
            toast.style.position = 'fixed';
            toast.style.top = '50%';
            toast.style.left = '50%';
            toast.style.transform = 'translate(-50%,-50%)';
            toast.style.background = 'rgba(10,31,47,0.98)';
            toast.style.border = '2px solid #70C1BF';
            toast.style.borderRadius = '16px';
            toast.style.padding = '28px 38px';
            toast.style.boxShadow = '0 6px 32px rgba(0,0,0,0.25)';
            toast.style.zIndex = '99999';
            toast.style.opacity = '1';
            toast.style.transition = 'none';
            toast.style.textAlign = 'center';
            toast.style.maxWidth = '90vw';
            toast.style.fontFamily = 'Roboto, Arial, sans-serif';
            document.body.appendChild(toast);
            // fallback: blocking alert
            document.body.style.filter = 'blur(18px)';
            document.body.style.pointerEvents = 'none';
            alert('Access Denied: Please log in or sign up to view this page.');
            document.body.style.filter = '';
            document.body.style.pointerEvents = '';
            window.location.replace('login.html');
        });
});
document.addEventListener('DOMContentLoaded', function () {
    loadUserProfile();
    setupEventListeners();
});

let userData = null;

async function loadUserProfile() {
    try {
        const response = await fetch('api/api-get-user-profile.php', {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            userData = data;
            displayUserProfile(data);
            displayLoans(data.loans);
            displayFundingPosts(data.funding_posts);
            displayMyOffers(data.my_offers);
        } else {
            alert('Error loading profile: ' + data.error);
            if (data.error === 'Not logged in') {
                window.location = 'login.html';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load profile data');
    }
}

function displayUserProfile(data) {
    const { user, rating, stats } = data;

    // Update user name at top with verified badge
    const verifiedBadge = user.verification_status === 'verified'
        ? ' <i class="fas fa-check-circle verified-badge" title="Verified User"></i>'
        : '';
    document.getElementById('userName').innerHTML = (user.full_name || 'User Profile') + verifiedBadge;

    // Update all info items
    function safeVal(val) {
        return (val === undefined || val === null || val === '' || val === 'null' || val === 'undefined') ? 'N/A' : val;
    }
    document.getElementById('userId').textContent = safeVal(user.user_id);
    document.getElementById('userEmail').textContent = safeVal(user.email);
    document.getElementById('userUsername').textContent = safeVal(user.username);
    document.getElementById('userStudentId').textContent = safeVal(user.student_id);
    document.getElementById('userUniversity').textContent = safeVal(user.university);

    // Display status with color
    const statusText = user.verification_status ? user.verification_status.charAt(0).toUpperCase() + user.verification_status.slice(1) : 'N/A';
    const statusColor = user.verification_status === 'verified' ? '#70C1BF' : user.verification_status === 'rejected' ? '#dc4650' : '#f5b800';
    document.getElementById('userStatus').innerHTML = `<span style="color: ${statusColor}">${statusText}</span>`;

    document.getElementById('userRole').textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A';

    // Display rating
    const ratingText = rating.avg_rating > 0
        ? `${rating.avg_rating}★ from ${rating.rating_count} reviews`
        : 'No ratings yet';
    document.getElementById('userRating').textContent = ratingText;

    // Display stats
    document.getElementById('totalFundsCollected').textContent =
        `৳${parseFloat(stats.total_funding_received || 0).toLocaleString()}`;
    document.getElementById('totalLoansCollected').textContent =
        `৳${parseFloat(stats.total_loans_received || 0).toLocaleString()}`;

    // Update edit form
    document.getElementById('editFullName').value = user.full_name || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editStudentId').value = user.student_id || '';
    document.getElementById('editUniversity').value = user.university || '';

    // Update counts in section titles
    document.getElementById('loanCount').textContent = stats.loans.total_loans;
    document.getElementById('fundingCount').textContent = stats.funding.total_funding;
    document.getElementById('offersCount').textContent = stats.offers_made;
}

function displayLoans(loans) {
    const container = document.getElementById('loansContainer');

    if (!loans || loans.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">No loan requests yet</p>';
        return;
    }

    container.innerHTML = loans.map(loan => {
        const category = loan.custom_category || loan.category;
        const duration = loan.custom_duration || (loan.duration_months ? `${loan.duration_months} months` : 'N/A');
        const date = new Date(loan.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

        return `
            <div class="card">
                <div class="card-row">
                    <span class="card-label">Category</span>
                    <span class="badge badge-${category.toLowerCase().replace(' ', '-')}">${category}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Amount needed:</span>
                    <span class="card-value">${parseFloat(loan.amount).toLocaleString()} taka</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Duration:</span>
                    <span class="card-value">${duration}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Date:</span>
                    <span class="card-value">${date}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Status</span>
                    <span class="badge badge-${loan.status}">${loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</span>
                </div>
                ${loan.status === 'approved' ? `
                <div class="card-row">
                    <span class="card-label">Offers received</span>
                    <button onclick="viewLoanOffers(${loan.loan_id})" class="btn-view-small">${loan.offer_count} Offers</button>
                </div>` : ''}
                <a href="loan.html#loan-${loan.loan_id}" class="btn-view-details">View Details</a>
            </div>
        `;
    }).join('');
}

function displayFundingPosts(posts) {
    const container = document.getElementById('fundingContainer');

    if (!posts || posts.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">No funding posts yet</p>';
        return;
    }

    container.innerHTML = posts.map(post => {
        const category = post.custom_category || post.category;
        const date = new Date(post.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        const progress = post.current_amount && post.amount_needed
            ? Math.round((post.current_amount / post.amount_needed) * 100)
            : 0;

        return `
            <div class="card">
                <div class="card-row">
                    <span class="card-label">Category</span>
                    <span class="badge badge-${category.toLowerCase().replace(' ', '-')}">${category}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Target Amount:</span>
                    <span class="card-value">${parseFloat(post.amount_needed).toLocaleString()} taka</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Raised:</span>
                    <span class="card-value">${parseFloat(post.current_amount || 0).toLocaleString()} taka (${progress}%)</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Date:</span>
                    <span class="card-value">${date}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Status</span>
                    <span class="badge badge-${post.status}">${post.status.charAt(0).toUpperCase() + post.status.slice(1)}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Contributors:</span>
                    <span class="card-value">${post.contribution_count}</span>
                </div>
                <a href="funding-view.html?post_id=${post.post_id}" class="btn-view-details">View Details</a>
            </div>
        `;
    }).join('');
}

function displayMyOffers(offers) {
    const container = document.getElementById('offersContainer');

    if (!offers || offers.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">No offers made yet</p>';
        return;
    }

    container.innerHTML = offers.map(offer => {
        const category = offer.custom_category || offer.category;
        const date = new Date(offer.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

        return `
            <div class="card">
                <div class="card-row">
                    <span class="card-label">Borrower</span>
                    <span class="card-value">${offer.borrower_name}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Category</span>
                    <span class="badge badge-${category.toLowerCase().replace(' ', '-')}">${category}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Loan Amount:</span>
                    <span class="card-value">${parseFloat(offer.loan_amount).toLocaleString()} taka</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Your Offer:</span>
                    <span class="card-value">${parseFloat(offer.offer_amount).toLocaleString()} taka</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Interest Rate:</span>
                    <span class="card-value">${offer.interest_rate}%</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Date:</span>
                    <span class="card-value">${date}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Status</span>
                    <span class="badge badge-${offer.offer_status}">${offer.offer_status.charAt(0).toUpperCase() + offer.offer_status.slice(1)}</span>
                </div>
                <button class="btn-view-details" onclick="window.location='loan.html'">View Loan</button>
            </div>
        `;
    }).join('');
}

function setupEventListeners() {
    // Edit button
    const editBtn = document.querySelector('.btn-edit');
    const editModal = document.getElementById('editModal');
    const cancelBtn = document.querySelector('.btn-cancel');

    editBtn.addEventListener('click', () => {
        editModal.style.display = 'flex';
    });

    cancelBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    // Close modal when clicking outside
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    // Verify button - Upload university ID card
    const verifyBtn = document.getElementById('btnVerify');
    const fileInput = document.getElementById('verificationUpload');

    verifyBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Invalid File Type', 'Please select an image file (JPG, PNG, or GIF)', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('File Too Large', 'File size must be less than 5MB', 'error');
            return;
        }

        // Upload the file
        const formData = new FormData();
        formData.append('verification_document', file);

        try {
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

            const response = await fetch('api/api-upload-verification.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                showToast('Verification Uploaded!', 'Your document has been submitted and is pending admin approval.', 'success');
                loadUserProfile(); // Reload profile
            } else {
                showToast('Upload Failed', data.error, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Upload Failed', 'Failed to upload verification document. Please try again.', 'error');
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verify';
            fileInput.value = ''; // Reset file input
        }
    });

    // Edit form submission
    const editForm = document.getElementById('editProfileForm');
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(editForm);

        try {
            const response = await fetch('api/api-update-user-profile.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                alert('Profile updated successfully!');
                editModal.style.display = 'none';
                loadUserProfile(); // Reload profile

                // Update localStorage
                const fullName = formData.get('full_name');
                localStorage.setItem('userName', fullName);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update profile');
        }
    });
}

function viewLoanDetails(loanId) {
    window.location = `loan.html#loan-${loanId}`;
}

// Toast notification function
function showToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `success-toast ${type === 'error' ? 'error-toast' : ''}`;

    const icon = type === 'success'
        ? '<i class="fas fa-check-circle toast-icon"></i>'
        : '<i class="fas fa-exclamation-circle toast-icon"></i>';

    toast.innerHTML = `
        ${icon}
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}
