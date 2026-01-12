// Category button functionality
const categoryButtons = document.querySelectorAll('.category-btn');
const customCategoryInput = document.getElementById('customCategory');
let selectedCategory = '';

categoryButtons.forEach(button => {
    button.addEventListener('click', function () {
        // Remove active class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        this.classList.add('active');

        selectedCategory = this.dataset.category;

        // Show/hide custom input based on selection
        if (selectedCategory === 'custom') {
            customCategoryInput.style.display = 'inline-block';
            customCategoryInput.focus(); // nice UX touch
        } else {
            customCategoryInput.style.display = 'none';
            customCategoryInput.value = '';
        }
    });
});

// Initialize - hide custom category input
customCategoryInput.style.display = 'none';

// Fund Breakdown functionality
let itemCount = 0;

function addBreakdownItem() {
    itemCount++;
    const container = document.getElementById('breakdownItems');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'breakdown-item';
    itemDiv.id = `item-${itemCount}`;

    itemDiv.innerHTML = `
        <input type="text" placeholder="Item Name" class="item-name">
        <input type="number" placeholder="Quantity" class="item-quantity" min="0">
        <input type="number" placeholder="Cost per unit" class="item-cost" min="0">
        <input type="number" placeholder="Total" class="item-total" readonly>
    `;

    container.appendChild(itemDiv);

    // Add event listeners for auto-calculation
    const quantityInput = itemDiv.querySelector('.item-quantity');
    const costInput = itemDiv.querySelector('.item-cost');
    const totalInput = itemDiv.querySelector('.item-total');

    function calculateItemTotal() {
        const quantity = parseFloat(quantityInput.value) || 0;
        const cost = parseFloat(costInput.value) || 0;
        const total = quantity * cost;
        totalInput.value = total.toFixed(2);
        calculateGrandTotal();
    }

    quantityInput.addEventListener('input', calculateItemTotal);
    costInput.addEventListener('input', calculateItemTotal);
}

function calculateGrandTotal() {
    const allTotals = document.querySelectorAll('.item-total');
    let grandTotal = 0;

    allTotals.forEach(input => {
        const value = parseFloat(input.value) || 0;
        grandTotal += value;
    });

    document.getElementById('totalAmount').value = `Total: $${grandTotal.toFixed(2)}`;
}

// Add Item Button
document.getElementById('addItemBtn').addEventListener('click', addBreakdownItem);

// Initialize with one item
addBreakdownItem();

// File Upload handlers
document.querySelector('.upload-btn').addEventListener('click', function () {
    document.getElementById('fileUpload').click();
});

document.getElementById('fileUpload').addEventListener('change', function (e) {
    const files = e.target.files;
    if (files.length > 0) {
        alert(`${files.length} file(s) selected`);
    }
});

// NID Upload handler
document.querySelector('.change-btn').addEventListener('click', function () {
    document.getElementById('nidUpload').click();
});

document.getElementById('nidUpload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const nidInput = document.querySelector('.nid-upload input[type="text"]');
        nidInput.value = file.name;
    }
});

// Other purpose input visibility
const otherCheckbox = document.querySelector('input[name="purpose"][value="other"]');
const otherInput = document.getElementById('otherPurpose');

otherCheckbox.addEventListener('change', function () {
    if (this.checked) {
        otherInput.style.display = 'inline-block';
    } else {
        otherInput.style.display = 'none';
        otherInput.value = '';
    }
});

// Initialize other input as hidden
otherInput.style.display = 'none';

// Form submission
document.getElementById('fundraiserForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate category selection
    if (!selectedCategory) {
        alert('Please select a category.');
        return;
    }

    // Validate required fields
    const updateCommitment = document.getElementById('updateCommitment');
    const confirmation = document.getElementById('confirmation');

    if (!updateCommitment.checked) {
        alert('Please agree to provide updates during the fundraiser.');
        return;
    }

    if (!confirmation.checked) {
        alert('Please confirm that the information provided is accurate.');
        return;
    }

    // Collect form data
    const formData = {
        category: selectedCategory,
        customCategory: customCategoryInput.value,
        title: document.getElementById('title').value,
        summary: document.getElementById('summary').value,
        location: document.getElementById('location').value,
        numPeople: document.getElementById('numPeople').value,
        ageGroup: document.getElementById('ageGroup').value,
        purposes: Array.from(document.querySelectorAll('input[name="purpose"]:checked')).map(cb => cb.value),
        otherPurpose: document.getElementById('otherPurpose').value,
        breakdownItems: [],
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        socialMedia: document.getElementById('socialMedia').value,
        actionPlan: document.getElementById('actionPlan').value,
        shareReceipts: document.querySelector('input[name="shareReceipts"]:checked').value,
        extraFunds: Array.from(document.querySelectorAll('input[name="extraFunds"]:checked')).map(cb => cb.value)
    };

    // Collect breakdown items
    const breakdownItems = document.querySelectorAll('.breakdown-item');
    breakdownItems.forEach(item => {
        const itemData = {
            name: item.querySelector('.item-name').value,
            quantity: item.querySelector('.item-quantity').value,
            cost: item.querySelector('.item-cost').value,
            total: item.querySelector('.item-total').value
        };
        if (itemData.name && itemData.quantity && itemData.cost) {
            formData.breakdownItems.push(itemData);
        }
    });

    // Log form data (in real application, this would be sent to a server)
    console.log('Form submitted:', formData);

    // Show success message
    alert('Fundraiser created successfully!');

    // Optionally reset the form
    // this.reset();
});

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