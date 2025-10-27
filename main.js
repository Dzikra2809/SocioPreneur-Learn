// Main application JavaScript
class SociopreneurApp {
  constructor() {
    this.currentUser = null;
    this.cart = [];
    this.init();
  }

  init() {
    this.loadUserSession();
    this.loadCart();
    this.setupEventListeners();
    this.updateAuthUI();
  }

  // Authentication methods
  loadUserSession() {
    const userData = localStorage.getItem('sociopreneur_user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  saveUserSession() {
    if (this.currentUser) {
      localStorage.setItem('sociopreneur_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('sociopreneur_user');
    }
  }

  logout() {
    this.currentUser = null;
    this.saveUserSession();
    this.updateAuthUI();
    window.location.href = '/';
  }

  // Cart methods
  loadCart() {
    const cartData = localStorage.getItem('sociopreneur_cart');
    if (cartData) {
      this.cart = JSON.parse(cartData);
    }
  }

  saveCart() {
    localStorage.setItem('sociopreneur_cart', JSON.stringify(this.cart));
    this.updateCartUI();
  }

  addToCart(product) {
    const existingItem = this.cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
    this.saveCart();
    this.showNotification('Produk ditambahkan ke keranjang!', 'success');
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
  }

  // UI update methods
  updateAuthUI() {
    const authButtons = document.querySelector('.header__auth');
    if (!authButtons) return;

    if (this.currentUser) {
      authButtons.innerHTML = `
        <div class="user-menu">
          <span>Halo, ${this.currentUser.name}</span>
          <a href="dashboard.html" class="btn btn--small btn--primary">Dashboard</a>
          <button onclick="app.logout()" class="btn btn--small btn--ghost">Logout</button>
        </div>
      `;
    } else {
      // authButtons.innerHTML = `
      //   <a href="login.html" class="btn btn--small btn--outline">Masuk</a>
      //   <a href="pages/signup.html" class="btn btn--small btn--primary">Daftar</a>
      // `;
    }
  }

  updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }
  }

  // Utility methods
  showNotification(message, type = 'info') {
    // Simple floating notification used across the app. Keeps it non-blocking so redirects work.
    try {
      const notification = document.createElement('div');
      notification.className = `alert alert--${type}`;
      notification.textContent = message;
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.right = '20px';
      notification.style.zIndex = '1001';
      notification.style.minWidth = '250px';
      notification.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
      notification.style.borderRadius = '8px';
      notification.style.padding = '0.75rem 1rem';

      document.body.appendChild(notification);

      // Auto-remove after 2.5s
      setTimeout(() => {
        if (notification && notification.parentNode) notification.parentNode.removeChild(notification);
      }, 2500);
    } catch (e) {
      // Fail silently; notifications shouldn't block app flow
      console.error('showNotification error', e);
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  // Event listeners
  setupEventListeners() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.header__mobile-toggle');
    const nav = document.querySelector('.header__nav');
    
    if (mobileToggle && nav) {
      mobileToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
      });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (nav && !nav.contains(e.target) && !mobileToggle.contains(e.target)) {
        nav.classList.remove('active');
      }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Impact points system
  addImpactPoints(points, action) {
    if (!this.currentUser) return;

    this.currentUser.impactPoints = (this.currentUser.impactPoints || 0) + points;
    this.currentUser.impactHistory = this.currentUser.impactHistory || [];
    this.currentUser.impactHistory.push({
      points,
      action,
      date: new Date().toISOString()
    });

    this.saveUserSession();
    this.showNotification(`+${points} Impact Points untuk ${action}!`, 'success');
  }

  // Search functionality
  searchItems(items, query, fields = ['title', 'name', 'description']) {
    if (!query) return items;
    
    const searchTerm = query.toLowerCase();
    return items.filter(item => 
      fields.some(field => 
        item[field] && item[field].toLowerCase().includes(searchTerm)
      )
    );
  }

  // Filter functionality
  filterItems(items, filters) {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all') return true;
        return item[key] === value;
      });
    });
  }
}

// Initialize app
const app = new SociopreneurApp();

// Utility functions for forms
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function showFormError(fieldName, message) {
  const field = document.querySelector(`[name="${fieldName}"]`);
  if (!field) return;

  // Remove existing error
  const existingError = field.parentNode.querySelector('.form__error');
  if (existingError) {
    existingError.remove();
  }

  // Add new error
  const errorDiv = document.createElement('div');
  errorDiv.className = 'form__error';
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

function clearFormErrors() {
  document.querySelectorAll('.form__error').forEach(error => error.remove());
}

// Loading state management
function showLoading(element) {
  const loader = document.createElement('div');
  loader.className = 'loading';
  loader.innerHTML = '<div class="loading"></div>';
  element.appendChild(loader);
}

function hideLoading(element) {
  const loader = element.querySelector('.loading');
  if (loader) {
    loader.remove();
  }
}

// Image lazy loading
function setupLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', setupLazyLoading);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SociopreneurApp, app };
}