// Enhanced Modern Farm JavaScript - UX Improvements

// State Management
let selectedBox = null;
let selectedAddons = [];
let orderTotal = 0;
let availability = {
    birds: 12,
    bees: 8
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updatePickupDate();
    loadAvailability();
    setupEventListeners();
});

// Pickup Date Calculation
function calculateNextPickupDate() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Find first Sunday of next month
    let firstSunday = new Date(currentYear, currentMonth, 1);
    
    // If we're past the first Sunday of current month, go to next month
    const firstSundayThisMonth = new Date(currentYear, currentMonth, 1);
    while (firstSundayThisMonth.getDay() !== 0) {
        firstSundayThisMonth.setDate(firstSundayThisMonth.getDate() + 1);
    }
    
    if (now > firstSundayThisMonth) {
        firstSunday = new Date(currentYear, currentMonth + 1, 1);
    }
    
    while (firstSunday.getDay() !== 0) {
        firstSunday.setDate(firstSunday.getDate() + 1);
    }
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    
    return `${monthNames[firstSunday.getMonth()]} ${firstSunday.getDate()}, ${firstSunday.getFullYear()}`;
}

function updatePickupDate() {
    const nextDate = calculateNextPickupDate();
    const dateElements = document.querySelectorAll('#next-pickup-date, #pickup-date-display, #cash-pickup-date');
    dateElements.forEach(el => {
        if (el) el.textContent = nextDate;
    });
}

// Availability Management
function loadAvailability() {
    const stored = localStorage.getItem('chickabees_availability');
    if (stored) {
        availability = JSON.parse(stored);
    }
    updateAvailabilityDisplay();
}

function saveAvailability() {
    localStorage.setItem('chickabees_availability', JSON.stringify(availability));
}

function updateAvailabilityDisplay() {
    const birdsEl = document.getElementById('birds-availability');
    const beesEl = document.getElementById('bees-availability');
    
    if (birdsEl) {
        birdsEl.textContent = availability.birds > 0 ? `${availability.birds} available` : 'SOLD OUT';
        if (availability.birds === 0) birdsEl.classList.add('sold-out');
        else if (availability.birds < 5) birdsEl.classList.add('low');
    }
    
    if (beesEl) {
        beesEl.textContent = availability.bees > 0 ? `${availability.bees} available` : 'SOLD OUT';
        if (availability.bees === 0) beesEl.classList.add('sold-out');
        else if (availability.bees < 5) beesEl.classList.add('low');
    }
}

// Box Selection
function selectBox(boxType) {
    if (availability[boxType] === 0) {
        alert('Sorry, this box is sold out for this month!');
        return;
    }
    
    selectedBox = boxType;
    
    // Update UI
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-box="${boxType}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Show add-ons
    document.getElementById('addons-section').style.display = 'block';
    document.getElementById('addons-section').scrollIntoView({ behavior: 'smooth' });
    
    // Update progress
    document.getElementById('dot-addons').classList.add('active');
    
    // Show order form
    setTimeout(() => {
        document.getElementById('order-form').style.display = 'block';
    }, 500);
    
    // Update total
    updateTotal();
    
    // Show order summary
    document.getElementById('order-summary').style.display = 'block';
}

// Total Calculation
function updateTotal() {
    let total = 0;
    
    // Base box price
    if (selectedBox === 'birds') total += 40;
    else if (selectedBox === 'bees') total += 20;
    
    // Add-ons
    const addons = [
        { id: 'honey-10oz', price: 10, name: 'Extra Honey (10oz)' },
        { id: 'honey-20oz', price: 20, name: 'Extra Honey (20oz)' },
        { id: 'eggs-6', price: 5, name: 'Extra 6 Eggs' },
        { id: 'sourdough', price: 8, name: 'Extra Sourdough' }
    ];
    
    selectedAddons = [];
    addons.forEach(addon => {
        const checkbox = document.getElementById(addon.id);
        if (checkbox && checkbox.checked) {
            total += addon.price;
            selectedAddons.push(addon);
        }
    });
    
    orderTotal = total;
    
    // Update displays
    updateOrderSummary();
    updatePaymentTotals();
}

function updateOrderSummary() {
    const summaryEl = document.getElementById('summary-items');
    if (!summaryEl) return;
    
    let html = '';
    
    // Base box
    if (selectedBox) {
        const boxName = selectedBox === 'birds' ? 'The Birds Box' : 'The Bees Box';
        const boxPrice = selectedBox === 'birds' ? 40 : 20;
        html += `<div class="summary-item">
            <span>${boxName}</span>
            <span>$${boxPrice}</span>
        </div>`;
    }
    
    // Add-ons
    selectedAddons.forEach(addon => {
        html += `<div class="summary-item">
            <span>${addon.name}</span>
            <span>+$${addon.price}</span>
        </div>`;
    });
    
    summaryEl.innerHTML = html;
    
    // Update total
    const totalEl = document.getElementById('summary-total');
    if (totalEl) totalEl.textContent = orderTotal.toFixed(2);
}

function updatePaymentTotals() {
    const elements = ['venmo-total', 'cash-total'];
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = orderTotal.toFixed(2);
    });
}

// Form Handling
function setupEventListeners() {
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Update progress
            document.getElementById('dot-contact').classList.add('active');
            
            // Show payment section
            document.getElementById('payment-section').style.display = 'block';
            document.getElementById('payment-section').scrollIntoView({ behavior: 'smooth' });
            
            // Update progress
            document.getElementById('dot-payment').classList.add('active');
        });
    }
}

// Payment Selection
function selectPayment(method) {
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    const selectedOpt = event.currentTarget;
    selectedOpt.classList.add('selected');
    
    // Show appropriate details
    if (method === 'venmo') {
        document.getElementById('venmo-details').style.display = 'block';
        document.getElementById('cash-details').style.display = 'none';
    } else {
        document.getElementById('cash-details').style.display = 'block';
        document.getElementById('venmo-details').style.display = 'none';
    }
}

// Order Completion
function completeOrder() {
    // Collect order data
    const orderData = {
        box: selectedBox,
        addons: selectedAddons,
        total: orderTotal,
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        specialRequests: document.getElementById('special-requests').value,
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        pickupDate: calculateNextPickupDate()
    };
    
    // Decrement availability
    if (selectedBox) {
        availability[selectedBox]--;
        saveAvailability();
    }
    
    // Submit to Google Forms (integration from main site)
    submitOrderToGoogleForm(orderData);
    
    // Show success message
    showOrderSuccess(orderData);
}

// Google Forms Integration
function submitOrderToGoogleForm(orderData) {
    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdQpI5B9_CCZMzDFuoNXjPT20BkeR31qdTxPn1ckoiRDDNSTw/formResponse';
    
    // Map order data to form entry IDs
    const formData = new FormData();
    formData.append('entry.123456789', orderData.name); // Replace with actual entry IDs
    formData.append('entry.987654321', orderData.email);
    formData.append('entry.456789123', orderData.box);
    formData.append('entry.789123456', orderData.addons.map(a => a.name).join(', '));
    formData.append('entry.321654987', orderData.total);
    formData.append('entry.654987321', orderData.specialRequests);
    
    // Submit via fetch (no-cors mode)
    fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    });
}

// Success Display
function showOrderSuccess(orderData) {
    const mainContent = document.querySelector('main') || document.body;
    
    mainContent.innerHTML = `
        <section class="order-success">
            <div class="container">
                <div class="success-icon">✓</div>
                <h2 class="success-title">Order Confirmed!</h2>
                <p class="success-message">
                    Thank you, ${orderData.name}! We'll see you on ${orderData.pickupDate} 
                    between 9-11 AM for pickup.
                </p>
                <div class="success-details glass">
                    <h3>Order Summary</h3>
                    <p><strong>${orderData.box === 'birds' ? 'The Birds Box' : 'The Bees Box'}</strong></p>
                    ${orderData.addons.length > 0 ? '<p>Add-ons: ' + orderData.addons.map(a => a.name).join(', ') + '</p>' : ''}
                    <p><strong>Total: $${orderData.total}</strong></p>
                    <p>Payment: ${orderData.paymentMethod === 'venmo' ? 'Venmo (please complete payment)' : 'Cash at pickup'}</p>
                </div>
                <button class="btn btn-primary" onclick="location.reload()">Place Another Order</button>
            </div>
        </section>
    `;
}

// Smooth Scrolling
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function scrollToStory() {
    document.getElementById('story').scrollIntoView({ behavior: 'smooth' });
}

// Smooth scrolling for all anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});