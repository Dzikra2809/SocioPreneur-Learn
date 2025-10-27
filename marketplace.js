// Marketplace functionality
class MarketplaceManager {
  constructor() {
    this.products = [];
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const response = await fetch('../data/mock-marketplace.json');
      this.products = await response.json();
      this.renderProducts();
    } catch (error) {
      console.error('Error loading products:', error);
      // app.showNotification('Gagal memuat data produk', 'error');
    }
  }

  renderProducts(productsToRender = this.products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    if (productsToRender.length === 0) {
      container.innerHTML = `
        <div class="text-center">
          <p>Tidak ada produk yang ditemukan.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = productsToRender.map(product => `
      <div class="card fade-in">
        <img src="${product.image}" alt="${product.name}" class="card__image"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IlBvcHBpbnMsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPlByb2R1Y3QgSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='">
        <div class="card__content">
          <div class="card__badge card__badge--social">Social Impact</div>
          <h3 class="card__title">${product.name}</h3>
          <p class="card__text">${product.description}</p>
          <div class="product-meta">
            <div class="product-meta__item">
              <strong>Penjual:</strong> ${product.seller}
            </div>
            <div class="product-meta__item">
              <strong>Kategori:</strong> ${product.category}
            </div>
            <div class="product-meta__item">
              <div class="rating">
                ${'★'.repeat(Math.floor(product.rating))} ${product.rating} (${product.reviews} ulasan)
              </div>
            </div>
            <div class="product-meta__item">
              <strong>Dampak:</strong> ${product.socialImpact}
            </div>
            <div class="product-meta__item">
              <strong>Stok:</strong> ${product.stock} tersisa
            </div>
          </div>
          <div class="product-tags">
            ${product.tags.map(tag => `<span class="badge">${tag}</span>`).join('')}
          </div>
          <div class="card__footer">
            <div class="card__price">${app.formatPrice(product.price)}</div>
            <button class="btn btn--primary" onclick="marketplaceManager.addToCart('${product.id}')"
                    ${product.stock === 0 ? 'disabled' : ''}>
              ${product.stock === 0 ? 'Habis' : 'Tambah ke Keranjang'}
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  searchProducts(query) {
    const filtered = app.searchItems(this.products, query, ['name', 'description', 'seller', 'category']);
    this.renderProducts(filtered);
  }

  filterProducts(category) {
    let filtered = this.products;
    if (category !== 'all') {
      filtered = this.products.filter(product => product.category === category);
    }
    this.renderProducts(filtered);
  }

  getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  addToCart(productId) {
    if (!app.currentUser) {
      app.showNotification('Silakan login terlebih dahulu', 'warning');
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    const product = this.getProductById(productId);
    if (!product) {
      app.showNotification('Produk tidak ditemukan', 'error');
      return;
    }

    if (product.stock === 0) {
      app.showNotification('Produk habis', 'warning');
      return;
    }

    app.addToCart(product);
    app.addImpactPoints(5, 'Menambahkan produk ke keranjang');
  }

  showCart() {
    if (app.cart.length === 0) {
      app.showNotification('Keranjang kosong', 'warning');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__content">
        <div class="modal__header">
          <h3>Keranjang Belanja</h3>
          <button class="modal__close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal__body">
          <div class="cart-items">
            ${app.cart.map(item => `
              <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item__image">
                <div class="cart-item__info">
                  <h4>${item.name}</h4>
                  <p>Harga: ${app.formatPrice(item.price)}</p>
                  <div class="cart-item__quantity">
                    <button onclick="marketplaceManager.updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="marketplaceManager.updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                  </div>
                </div>
                <div class="cart-item__total">
                  ${app.formatPrice(item.price * item.quantity)}
                </div>
                <button class="btn btn--small btn--ghost" onclick="marketplaceManager.removeFromCart('${item.id}')">
                  Hapus
                </button>
              </div>
            `).join('')}
          </div>
          <div class="cart-total">
            <h4>Total: ${app.formatPrice(this.getCartTotal())}</h4>
          </div>
        </div>
        <div class="modal__footer">
          <button class="btn btn--ghost" onclick="this.closest('.modal').remove()">Tutup</button>
          <button class="btn btn--primary" onclick="marketplaceManager.checkout()">Checkout</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  updateCartQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const item = app.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = newQuantity;
      app.saveCart();
      this.showCart(); // Refresh cart display
    }
  }

  removeFromCart(productId) {
    app.removeFromCart(productId);
    const modal = document.querySelector('.modal');
    if (modal && app.cart.length === 0) {
      modal.remove();
      app.showNotification('Keranjang kosong', 'warning');
    } else if (modal) {
      this.showCart(); // Refresh cart display
    }
  }

  getCartTotal() {
    return app.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  checkout() {
    if (app.cart.length === 0) {
      app.showNotification('Keranjang kosong', 'warning');
      return;
    }

    const modal = document.querySelector('.modal');
    if (modal) modal.remove();

    // Show checkout modal
    const checkoutModal = document.createElement('div');
    checkoutModal.className = 'modal';
    checkoutModal.innerHTML = `
      <div class="modal__content">
        <div class="modal__header">
          <h3>Checkout</h3>
          <button class="modal__close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal__body">
          <h4>Ringkasan Pesanan</h4>
          <div class="order-summary">
            ${app.cart.map(item => `
              <div class="order-item">
                <span>${item.name} x${item.quantity}</span>
                <span>${app.formatPrice(item.price * item.quantity)}</span>
              </div>
            `).join('')}
            <div class="order-total">
              <strong>Total: ${app.formatPrice(this.getCartTotal())}</strong>
            </div>
          </div>
          
          <form id="checkoutForm">
            <div class="form__group">
              <label class="form__label">Alamat Pengiriman</label>
              <textarea class="form__textarea" name="address" required placeholder="Masukkan alamat lengkap"></textarea>
            </div>
            <div class="form__group">
              <label class="form__label">Metode Pembayaran</label>
              <select class="form__select" name="payment" required>
                <option value="">Pilih metode pembayaran</option>
                <option value="transfer">Transfer Bank</option>
                <option value="ewallet">E-Wallet</option>
                <option value="cod">Bayar di Tempat</option>
              </select>
            </div>
            <div class="form__group">
              <label class="form__label">Catatan (Opsional)</label>
              <textarea class="form__textarea" name="notes" placeholder="Catatan untuk penjual"></textarea>
            </div>
          </form>
        </div>
        <div class="modal__footer">
          <button class="btn btn--ghost" onclick="this.closest('.modal').remove()">Batal</button>
          <button class="btn btn--primary" onclick="marketplaceManager.completeOrder()">Pesan Sekarang</button>
        </div>
      </div>
    `;

    document.body.appendChild(checkoutModal);
  }

  completeOrder() {
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    
    if (!form.checkValidity()) {
      app.showNotification('Mohon lengkapi semua field yang wajib diisi', 'warning');
      return;
    }

    // Simulate order processing
    const order = {
      id: Date.now().toString(),
      items: [...app.cart],
      total: this.getCartTotal(),
      address: formData.get('address'),
      payment: formData.get('payment'),
      notes: formData.get('notes'),
      date: new Date().toISOString(),
      status: 'pending'
    };

    // Save order to user data
    if (!app.currentUser.orders) {
      app.currentUser.orders = [];
    }
    app.currentUser.orders.push(order);
    authManager.updateUser(app.currentUser.id, app.currentUser);

    // Clear cart
    app.cart = [];
    app.saveCart();

    // Add impact points
    const impactPoints = Math.floor(order.total / 10000) * 5; // 5 points per 10k spent
    app.addImpactPoints(impactPoints, 'Berbelanja produk social impact');

    // Close modal and show success
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();

    app.showNotification('Pesanan berhasil dibuat! Terima kasih telah mendukung social impact.', 'success');
  }

  getCategories() {
    const categories = [...new Set(this.products.map(product => product.category))];
    return categories;
  }
}

// Initialize marketplace manager
const marketplaceManager = new MarketplaceManager();

// Marketplace search and filter handlers
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('productSearch');
  const filterSelect = document.getElementById('categoryFilter');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      marketplaceManager.searchProducts(e.target.value);
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      marketplaceManager.filterProducts(e.target.value);
    });

    // Populate category filter
    const categories = marketplaceManager.getCategories();
    filterSelect.innerHTML = `
      <option value="all">Semua Kategori</option>
      ${categories.map(category => `<option value="${category}">${category}</option>`).join('')}
    `;
  }

  // Add cart button to header if it exists
  const cartButton = document.getElementById('cartButton');
  if (cartButton) {
    cartButton.addEventListener('click', () => {
      marketplaceManager.showCart();
    });
  }
});