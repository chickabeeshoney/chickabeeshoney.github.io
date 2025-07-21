// Shopping Cart System
class ShoppingCart {
    constructor() {
        this.items = [];
        this.loadFromStorage();
        this.updateCartDisplay();
        this.setupEventListeners();
    }

    // Load cart from localStorage
    loadFromStorage() {
        const saved = localStorage.getItem('chickabees-cart');
        if (saved) {
            this.items = JSON.parse(saved);
        }
    }

    // Save cart to localStorage
    saveToStorage() {
        localStorage.setItem('chickabees-cart', JSON.stringify(this.items));
    }

    // Add item to cart
    addItem(product, size, price, quantity) {
        const existingItem = this.items.find(item => 
            item.product === product && item.size === size
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                product,
                size,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                id: Date.now() + Math.random()
            });
        }

        this.saveToStorage();
        this.updateCartDisplay();
        this.showCartFeedback();
    }

    // Remove item from cart
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveToStorage();
        this.updateCartDisplay();
    }

    // Update item quantity
    updateQuantity(itemId, newQuantity) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = parseInt(newQuantity);
                this.saveToStorage();
                this.updateCartDisplay();
            }
        }
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveToStorage();
        this.updateCartDisplay();
    }

    // Get total price
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Get total items count
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    // Update cart display
    updateCartDisplay() {
        this.updateCartCount();
        this.updateMiniCart();
        this.updateCartSummary();
    }

    // Update cart count badge
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        const count = this.getItemCount();
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // Update mini cart
    updateMiniCart() {
        const miniCartItems = document.getElementById('mini-cart-items');
        const miniCartTotal = document.getElementById('mini-cart-total');
        
        if (!miniCartItems) return;

        if (this.items.length === 0) {
            miniCartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            miniCartItems.innerHTML = this.items.map(item => `
                <div class="mini-cart-item">
                    <div class="mini-cart-item-info">
                        <div class="mini-cart-item-name">${item.product}</div>
                        <div class="mini-cart-item-details">${item.size} - Qty: ${item.quantity}</div>
                    </div>
                    <div class="mini-cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `).join('');
        }

        if (miniCartTotal) {
            miniCartTotal.textContent = this.getTotal().toFixed(2);
        }
    }

    // Update cart summary in build box
    updateCartSummary() {
        const cartItems = document.getElementById('cart-items');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartTotal = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn-main');

        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">No items selected</p>';
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.product}</div>
                        <div class="cart-item-details">${item.size} - Qty: ${item.quantity}</div>
                    </div>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `).join('');
            if (checkoutBtn) checkoutBtn.disabled = false;
        }

        const subtotal = this.getTotal();
        const subscription = document.querySelector('input[name="subscription"]:checked')?.value;
        let total = subtotal;

        if (subscription === 'monthly') {
            total = subtotal * 0.9; // 10% discount
        } else if (subscription === 'quarterly') {
            total = subtotal * 0.85; // 15% discount
        }

        if (cartSubtotal) cartSubtotal.textContent = subtotal.toFixed(2);
        if (cartTotal) cartTotal.textContent = total.toFixed(2);
    }

    // Show cart feedback
    showCartFeedback() {
        const feedback = document.createElement('div');
        feedback.className = 'cart-feedback';
        feedback.textContent = 'Item added to cart!';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--secondary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }

    // Setup event listeners
    setupEventListeners() {
        // Cart icon click
        const cartIcon = document.getElementById('cart-icon');
        const miniCart = document.getElementById('mini-cart');
        const closeMiniCart = document.querySelector('.close-mini-cart');

        if (cartIcon && miniCart) {
            cartIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                miniCart.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!miniCart.contains(e.target) && !cartIcon.contains(e.target)) {
                    miniCart.classList.remove('active');
                }
            });
        }

        if (closeMiniCart) {
            closeMiniCart.addEventListener('click', () => {
                miniCart.classList.remove('active');
            });
        }

        // Subscription option change
        const subscriptionInputs = document.querySelectorAll('input[name="subscription"]');
        subscriptionInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateCartDisplay();
            });
        });
    }
}

// Initialize cart
const cart = new ShoppingCart();

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        const newsletterButton = newsletterForm.querySelector('button');
        const originalButtonText = newsletterButton.textContent;
        
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            
            newsletterButton.textContent = 'Signing up...';
            newsletterButton.disabled = true;
            
            setTimeout(() => {
                newsletterButton.textContent = '✓ Subscribed!';
                newsletterButton.style.background = 'var(--secondary-color)';
                
                setTimeout(() => {
                    e.target.reset();
                    newsletterButton.textContent = originalButtonText;
                    newsletterButton.disabled = false;
                    newsletterButton.style.background = '';
                }, 3000);
            }, 1000);
        });
    }

    // Build Your Own Box functionality
    setupBuildBoxListeners();

    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });

    // Calendar add to calendar functionality
    const calendarButtons = document.querySelectorAll('.add-calendar-btn');
    calendarButtons.forEach(button => {
        button.addEventListener('click', function() {
            const date = this.dataset.date;
            addToCalendar(date);
        });
    });

    // Recipe button clicks
    const recipeButtons = document.querySelectorAll('.recipe-btn');
    recipeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recipeCard = this.closest('.recipe-card');
            const recipeName = recipeCard.querySelector('h3').textContent;
            showRecipeModal(recipeName, recipeCard);
        });
    });

    // Google Maps loading
    const loadMapButton = document.querySelector('.load-map-btn');
    if (loadMapButton) {
        loadMapButton.addEventListener('click', function() {
            loadGoogleMap();
        });
    }

    // Order button clicks (existing boxes)
    const orderButtons = document.querySelectorAll('.order-btn');
    orderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const item = this.dataset.box || this.dataset.product;
            showOrderModal(item);
        });
    });

    // Pre-order button clicks
    const preorderButtons = document.querySelectorAll('.preorder-btn');
    preorderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const item = this.dataset.box || this.dataset.product;
            showPreorderModal(item);
        });
    });

    // Waitlist button clicks
    const waitlistButtons = document.querySelectorAll('.waitlist-btn');
    waitlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const item = this.dataset.product;
            showWaitlistModal(item);
        });
    });

    // Checkout button click
    const checkoutBtn = document.getElementById('checkout-btn-main');
    const checkoutBtnMini = document.getElementById('checkout-btn');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.items.length === 0) return;
            
            const pickupDate = document.getElementById('pickup-date').value;
            if (!pickupDate) {
                alert('Please select a pickup date before checkout.');
                return;
            }
            
            showCheckoutModal();
        });
    }

    if (checkoutBtnMini) {
        checkoutBtnMini.addEventListener('click', function() {
            if (cart.items.length === 0) return;
            showCheckoutModal();
        });
    }

    // Smooth scrolling for navigation links
    const navLinksAll = document.querySelectorAll('a[href^="#"]');
    navLinksAll.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.box-card, .product-card, .story-content p, .testimonial-card, .recipe-card, .blog-post, .calendar-month, .gallery-item, .selector-item');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // Seasonal theme functionality
    function updateSeasonalTheme() {
        const currentMonth = new Date().getMonth();
        const body = document.body;
        
        body.classList.remove('spring', 'summer', 'fall', 'winter');
        
        if (currentMonth >= 2 && currentMonth <= 4) {
            body.classList.add('spring');
        } else if (currentMonth >= 5 && currentMonth <= 7) {
            body.classList.add('summer');
        } else if (currentMonth >= 8 && currentMonth <= 10) {
            body.classList.add('fall');
        } else {
            body.classList.add('winter');
        }
    }

    updateSeasonalTheme();
});

// Build Your Own Box Setup
function setupBuildBoxListeners() {
    // Size option change listeners
    const sizeInputs = document.querySelectorAll('.size-options input[type="radio"]');
    sizeInputs.forEach(input => {
        input.addEventListener('change', function() {
            const product = this.name.split('-')[0];
            updateAddToCartButton(product);
        });
    });

    // Quantity button listeners
    const qtyButtons = document.querySelectorAll('.qty-btn');
    qtyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = this.dataset.product;
            const input = document.querySelector(`.qty-input[data-product="${product}"]`);
            const isPlus = this.classList.contains('plus');
            
            let currentValue = parseInt(input.value) || 0;
            const max = parseInt(input.max) || 10;
            
            if (isPlus && currentValue < max) {
                currentValue++;
            } else if (!isPlus && currentValue > 0) {
                currentValue--;
            }
            
            input.value = currentValue;
            updateAddToCartButton(product);
        });
    });

    // Quantity input listeners
    const qtyInputs = document.querySelectorAll('.qty-input');
    qtyInputs.forEach(input => {
        input.addEventListener('input', function() {
            const product = this.dataset.product;
            updateAddToCartButton(product);
        });
    });

    // Add to cart button listeners
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = this.dataset.product;
            const sizeInput = document.querySelector(`input[name="${product}-size"]:checked`);
            const quantityInput = document.querySelector(`.qty-input[data-product="${product}"]`);
            
            if (!sizeInput || !quantityInput || parseInt(quantityInput.value) === 0) {
                return;
            }
            
            const size = sizeInput.nextElementSibling.textContent;
            const price = sizeInput.dataset.price;
            const quantity = parseInt(quantityInput.value);
            
            cart.addItem(product, size, price, quantity);
            
            // Reset quantity to 0
            quantityInput.value = 0;
            updateAddToCartButton(product);
        });
    });
}

// Update add to cart button state
function updateAddToCartButton(product) {
    const sizeInput = document.querySelector(`input[name="${product}-size"]:checked`);
    const quantityInput = document.querySelector(`.qty-input[data-product="${product}"]`);
    const addButton = document.querySelector(`.add-to-cart-btn[data-product="${product}"]`);
    
    if (!addButton) return;
    
    const hasSize = sizeInput !== null;
    const hasQuantity = quantityInput && parseInt(quantityInput.value) > 0;
    
    addButton.disabled = !(hasSize && hasQuantity);
}

// Show checkout modal
function showCheckoutModal() {
    const pickupDate = document.getElementById('pickup-date')?.value;
    const subscription = document.querySelector('input[name="subscription"]:checked')?.value;
    const subscriptionText = subscription === 'monthly' ? 'Monthly Subscription' : 
                            subscription === 'quarterly' ? 'Quarterly Subscription' : 'One-time Order';
    
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.innerHTML = `
        <div class="modal-content checkout-modal">
            <h3>Checkout</h3>
            <div class="checkout-summary">
                <h4>Order Summary</h4>
                <div class="checkout-items">
                    ${cart.items.map(item => `
                        <div class="checkout-item">
                            <span>${item.product} (${item.size})</span>
                            <span>Qty: ${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="checkout-total">
                    <strong>Total: $${document.getElementById('cart-total')?.textContent || cart.getTotal().toFixed(2)}</strong>
                </div>
                <div class="checkout-details">
                    <p><strong>Delivery:</strong> ${subscriptionText}</p>
                    ${pickupDate ? `<p><strong>Pickup Date:</strong> ${new Date(pickupDate).toLocaleDateString()}</p>` : ''}
                </div>
            </div>
            
            <div class="checkout-form">
                <h4>Your Information</h4>
                <form id="checkout-form">
                    <input type="text" placeholder="Full Name" required>
                    <input type="email" placeholder="Email Address" required>
                    <input type="tel" placeholder="Phone Number" required>
                    <textarea placeholder="Special instructions or notes"></textarea>
                    
                    <div class="payment-instructions">
                        <h4>Payment Instructions</h4>
                        <p>Please send payment via Venmo to:</p>
                        <p class="venmo-display">@chickabeesoakland</p>
                        <p>Include your name and order details in the payment note.</p>
                    </div>
                    
                    <button type="submit" class="submit-order-btn">Complete Order</button>
                </form>
            </div>
            
            <button class="close-modal">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    addModalStyles();
    setupModalClose(modal);
    
    // Handle checkout form submission
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('.submit-order-btn');
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = 'Order Submitted!';
            alert('Order submitted successfully! You will receive a confirmation email shortly.');
            cart.clearCart();
            modal.remove();
        }, 2000);
    });
}

// Helper functions (keeping existing ones)
function addToCalendar(date) {
    const startDate = new Date(date + 'T09:00:00');
    const endDate = new Date(date + 'T11:00:00');
    
    const calendarEvent = {
        title: 'Chickabees Pickup',
        start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        description: 'Monthly pickup for Chickabees fresh products',
        location: 'Montclair, Oakland, CA'
    };
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEvent.title)}&dates=${calendarEvent.start}/${calendarEvent.end}&details=${encodeURIComponent(calendarEvent.description)}&location=${encodeURIComponent(calendarEvent.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
}

function loadGoogleMap() {
    const mapContainer = document.getElementById('pickup-map');
    mapContainer.innerHTML = `
        <div style="width: 100%; height: 300px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <div style="text-align: center;">
                <p style="margin: 0; font-size: 1.1rem; color: #333;">Montclair, Oakland</p>
                <p style="margin: 0.5rem 0 0 0; color: #666;">Interactive map would load here with Google Maps API</p>
                <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">Exact address provided after order confirmation</p>
            </div>
        </div>
    `;
}

function showOrderModal(item) {
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>How to Order "${item}"</h3>
            <p><strong>Step 1:</strong> Send payment via Venmo to:</p>
            <p class="venmo-display">@chickabeesoakland</p>
            <p><strong>Step 2:</strong> Include your name and "${item}" in the payment note</p>
            <p><strong>Step 3:</strong> Pick up on the first Sunday of the month<br>9:00 AM - 11:00 AM in Montclair, Oakland</p>
            <button class="close-modal">Got it!</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    addModalStyles();
    setupModalClose(modal);
}

function showPreorderModal(item) {
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Pre-Order "${item}"</h3>
            <p>Reserve your ${item} for next month's delivery!</p>
            <form class="preorder-form">
                <input type="text" placeholder="Your name" required>
                <input type="email" placeholder="Your email" required>
                <textarea placeholder="Any special requests or notes"></textarea>
                <p><strong>Payment:</strong> Send to @chickabeesoakland on Venmo with "Pre-order ${item}" in the note</p>
                <button type="submit">Submit Pre-Order</button>
            </form>
            <button class="close-modal">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    addModalStyles();
    setupModalClose(modal);
    
    const form = modal.querySelector('.preorder-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Pre-order Submitted!';
        submitBtn.disabled = true;
        setTimeout(() => {
            modal.remove();
        }, 2000);
    });
}

function showWaitlistModal(item) {
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Join Waitlist for "${item}"</h3>
            <p>Get notified when ${item} becomes available!</p>
            <form class="waitlist-form">
                <input type="text" placeholder="Your name" required>
                <input type="email" placeholder="Your email" required>
                <button type="submit">Join Waitlist</button>
            </form>
            <button class="close-modal">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    addModalStyles();
    setupModalClose(modal);
    
    const form = modal.querySelector('.waitlist-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Added to Waitlist!';
        submitBtn.disabled = true;
        setTimeout(() => {
            modal.remove();
        }, 2000);
    });
}

function showRecipeModal(recipeName, recipeCard) {
    const ingredients = Array.from(recipeCard.querySelectorAll('.recipe-ingredients li'))
        .map(li => li.textContent).join('</li><li>');
    
    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.innerHTML = `
        <div class="modal-content recipe-modal">
            <h3>${recipeName}</h3>
            <div class="recipe-full">
                <h4>Ingredients:</h4>
                <ul><li>${ingredients}</li></ul>
                <h4>Instructions:</h4>
                <ol>
                    <li>This is a sample recipe. Replace with actual instructions.</li>
                    <li>Mix ingredients according to your preferred method.</li>
                    <li>Bake or prepare as needed.</li>
                    <li>Enjoy your homemade creation!</li>
                </ol>
                <p><em>For the freshest ingredients, order from our monthly boxes!</em></p>
            </div>
            <button class="close-modal">Close Recipe</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    addModalStyles();
    setupModalClose(modal);
}

function addModalStyles() {
    if (document.querySelector('.modal-styles')) return;
    
    const style = document.createElement('style');
    style.className = 'modal-styles';
    style.textContent = `
        .order-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }
        .modal-content {
            background: var(--bg-white);
            padding: 2.5rem;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            animation: slideUp 0.3s ease;
        }
        .checkout-modal {
            max-width: 600px;
        }
        .modal-content h3 {
            font-family: 'Playfair Display', serif;
            color: var(--primary-color);
            margin-bottom: 1.5rem;
            font-size: 1.75rem;
        }
        .checkout-summary {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: var(--bg-linen);
            border-radius: 12px;
        }
        .checkout-items {
            margin-bottom: 1rem;
        }
        .checkout-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-light);
        }
        .checkout-item:last-child {
            border-bottom: none;
        }
        .checkout-total {
            text-align: center;
            font-size: 1.2rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 2px solid var(--primary-color);
        }
        .checkout-form input, .checkout-form textarea {
            width: 100%;
            padding: 0.75rem;
            margin-bottom: 1rem;
            border: 1px solid var(--border-light);
            border-radius: 8px;
            font-family: 'Lato', sans-serif;
            font-size: 1rem;
        }
        .payment-instructions {
            background: var(--bg-cream);
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }
        .submit-order-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 30px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: background 0.3s ease;
        }
        .submit-order-btn:hover {
            background: var(--accent-color);
        }
        .cart-feedback {
            animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .close-modal {
            background: var(--secondary-color);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 30px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
            width: 100%;
            transition: all 0.3s ease;
        }
        .close-modal:hover {
            background: var(--primary-color);
            transform: translateY(-2px);
        }
        .preorder-form, .waitlist-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        .preorder-form input, .preorder-form textarea,
        .waitlist-form input, .waitlist-form textarea {
            padding: 0.75rem;
            border: 1px solid var(--border-light);
            border-radius: 8px;
            font-family: 'Lato', sans-serif;
            font-size: 1rem;
        }
        .preorder-form button[type="submit"],
        .waitlist-form button[type="submit"] {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 30px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        .preorder-form button[type="submit"]:hover,
        .waitlist-form button[type="submit"]:hover {
            background: var(--accent-color);
        }
        .recipe-modal {
            max-width: 600px;
        }
        .recipe-full h4 {
            color: var(--primary-color);
            margin: 1.5rem 0 1rem 0;
        }
        .recipe-full ul, .recipe-full ol {
            margin-left: 1.5rem;
        }
        .recipe-full li {
            margin-bottom: 0.5rem;
            line-height: 1.5;
        }
        .venmo-display {
            font-size: 1.5rem;
            color: var(--primary-color);
            font-weight: bold;
            margin: 1rem 0;
            text-align: center;
        }
        .modal-content p {
            margin-bottom: 1rem;
            line-height: 1.6;
        }
    `;
    document.head.appendChild(style);
}

function setupModalClose(modal) {
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}