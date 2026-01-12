// Category button functionality
const categoryButtons = document.querySelectorAll('.category-btn');
const customCategoryInput = document.getElementById('customCategory');
let selectedCategory = '';

categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        selectedCategory = this.dataset.category;
        
        // Show/hide custom input based on selection
        if (selectedCategory === 'custom') {
            customCategoryInput.style.display = 'inline-block';
        } else {
            customCategoryInput.style.display = 'none';
            customCategoryInput.value = '';
        }
    });
});

// Initialize - hide custom category input
customCategoryInput.style.display = 'none';

// Duration checkbox functionality - only one can be selected
const durationCheckboxes = document.querySelectorAll('input[name="duration"]');
const customDurationInput = document.getElementById('customDuration');

durationCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            // Uncheck all other duration checkboxes
            durationCheckboxes.forEach(cb => {
                if (cb !== this) {
                    cb.checked = false;
                }
            });
            
            // Show custom input if custom is selected
            if (this.value === 'custom') {
                customDurationInput.style.display = 'inline-block';
            } else {
                customDurationInput.style.display = 'none';
                customDurationInput.value = '';
            }
        }
    });
});

// Initialize - hide custom duration input
customDurationInput.style.display = 'none';

// Repayment option checkbox functionality - only one can be selected
const repaymentCheckboxes = document.querySelectorAll('input[name="repayment"]');

repaymentCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            // Uncheck all other repayment checkboxes
            repaymentCheckboxes.forEach(cb => {
                if (cb !== this) {
                    cb.checked = false;
                }
            });
        }
    });
});

// File upload functionality
document.querySelector('.upload-btn').addEventListener('click', function() {
    document.getElementById('proofUpload').click();
});

document.getElementById('proofUpload').addEventListener('change', function(e) {
    const files = e.target.files;
    if (files.length > 0) {
        let fileNames = [];
        for (let i = 0; i < files.length; i++) {
            fileNames.push(files[i].name);
        }
        alert(`${files.length} file(s) uploaded:\n${fileNames.join('\n')}`);
    }
});

// Form submission
document.getElementById('loanRequestForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate category selection
    if (!selectedCategory) {
        alert('Please select a category.');
        return;
    }
    
    // Validate duration selection
    const selectedDuration = document.querySelector('input[name="duration"]:checked');
    if (!selectedDuration) {
        alert('Please select a loan duration.');
        return;
    }
    
    // Validate custom duration if selected
    if (selectedDuration.value === 'custom' && !customDurationInput.value.trim()) {
        alert('Please enter a custom duration.');
        return;
    }
    
    // Validate repayment option
    const selectedRepayment = document.querySelector('input[name="repayment"]:checked');
    if (!selectedRepayment) {
        alert('Please select a repayment option.');
        return;
    }
    
    // Validate confirmation checkbox
    const confirmation = document.getElementById('confirmation');
    if (!confirmation.checked) {
        alert('Please confirm that all information provided is true and authentic.');
        return;
    }
    
    // Collect form data
    const formData = {
        category: selectedCategory,
        customCategory: customCategoryInput.value,
        amountNeeded: document.getElementById('amountNeeded').value,
        duration: selectedDuration.value,
        customDuration: customDurationInput.value,
        repaymentOption: selectedRepayment.value,
        reason: document.getElementById('reason').value,
        proofDocuments: document.getElementById('proofUpload').files.length
    };
    
    // Log form data (in real application, this would be sent to a server)
    console.log('Loan request submitted:', formData);
    
    // Show success message
    alert('Loan request submitted successfully!');
    
    // Optionally reset the form
    // this.reset();
    // categoryButtons.forEach(btn => btn.classList.remove('active'));
    // selectedCategory = '';
});

// Real-time validation feedback
const requiredInputs = document.querySelectorAll('input[required], textarea[required]');
requiredInputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.style.borderLeft = '3px solid #ff6b6b';
        } else {
            this.style.borderLeft = '3px solid #7dd3d3';
        }
    });
    
    input.addEventListener('focus', function() {
        this.style.borderLeft = 'none';
    });
});