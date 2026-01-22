// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // Category button functionality
    const categoryButtons = document.querySelectorAll('.category-btn');
    const customCategoryInput = document.getElementById('customCategory');
    const hiddenCategoryInput = document.getElementById('hiddenCategory');
    let selectedCategory = '';

    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            selectedCategory = this.dataset.category;
            hiddenCategoryInput.value = selectedCategory; // Update hidden input

            // Show/hide custom input based on selection
            if (selectedCategory === 'custom') {
                customCategoryInput.style.display = 'inline-block';
                customCategoryInput.required = true;
            } else {
                customCategoryInput.style.display = 'none';
                customCategoryInput.value = '';
                customCategoryInput.required = false;
            }
        });
    });

    // Initialize - hide custom category input
    if (customCategoryInput) {
        customCategoryInput.style.display = 'none';
    }

    // Duration functionality (Radio buttons now handle checking natively)
    const durationRadios = document.querySelectorAll('input[name="duration"]');
    const customDurationInput = document.getElementById('customDuration');

    durationRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.checked) {
                if (this.value === 'custom') {
                    customDurationInput.style.display = 'inline-block';
                    customDurationInput.required = true;
                } else {
                    customDurationInput.style.display = 'none';
                    customDurationInput.value = '';
                    customDurationInput.required = false;
                }
            }
        });
    });

    // Initialize - hide custom duration input
    if (customDurationInput) {
        customDurationInput.style.display = 'none';
    }

    // Repayment option (Radio buttons handle selection natively)
    // No specific JS needed unless showing/hiding extra fields

    // File upload functionality
    const uploadBtn = document.querySelector('.upload-btn');
    const proofUpload = document.getElementById('proofUpload');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    if (uploadBtn && proofUpload) {
        uploadBtn.addEventListener('click', function (e) {
            e.preventDefault();
            proofUpload.click();
        });

        proofUpload.addEventListener('change', function (e) {
            const files = e.target.files;
            if (files.length > 0) {
                let fileNames = [];
                for (let i = 0; i < files.length; i++) {
                    fileNames.push(files[i].name);
                }
                // Display selected files next to the button
                if (fileNameDisplay) {
                    if (files.length === 1) {
                        fileNameDisplay.textContent = `✓ ${fileNames[0]}`;
                    } else {
                        fileNameDisplay.textContent = `✓ ${files.length} files selected`;
                    }
                }
            } else {
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = '';
                }
            }
        });
    }

    // Form submission validation
    const loanForm = document.getElementById('loanRequestForm');
    if (loanForm) {
        loanForm.addEventListener('submit', function (e) {
            // Validate category selection
            if (!hiddenCategoryInput.value) {
                e.preventDefault();
                alert('Please select a category.');
                return;
            }

            // Validate confirmation checkbox
            const confirmation = document.getElementById('confirmation');
            if (confirmation && !confirmation.checked) {
                e.preventDefault();
                alert('Please confirm that all information provided is true.');
                return;
            }

            // Allow form to submit to PHP
        });
    }

    // Real-time validation feedback
    const requiredInputs = document.querySelectorAll('input[required], textarea[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function () {
            if (!this.value.trim()) {
                this.style.borderLeft = '3px solid #ff6b6b';
            } else {
                this.style.borderLeft = '3px solid #7dd3d3';
            }
        });

        input.addEventListener('focus', function () {
            this.style.borderLeft = 'none';
        });
    });

});