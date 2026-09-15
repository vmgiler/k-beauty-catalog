const CART_STORAGE_KEY = 'k-beauty-cart';
let cart = loadCart();
let imageZoom = 1;
let imagePanX = 0;
let imagePanY = 0;
let imageDidPan = false;
let imageIsPanning = false;

function openImageModal(src, alt) {
    const modal = document.getElementById('image-modal');
    const preview = document.getElementById('image-modal-preview');
    preview.src = src;
    preview.alt = alt;
    resetImageZoom();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeImageModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('image-modal').classList.remove('open');
    document.body.style.overflow = '';
}

function zoomImage(amount) {
    imageZoom = Math.min(3, Math.max(1, imageZoom + amount));
    applyImageTransform();
    document.getElementById('image-zoom-level').textContent = `${Math.round(imageZoom * 100)}%`;
}

function handleImageWheel(event) {
    event.preventDefault();
    zoomImage(event.deltaY < 0 ? 0.1 : -0.1);
}

function resetImageZoom() {
    imageZoom = 1;
    imagePanX = 0;
    imagePanY = 0;
    const preview = document.getElementById('image-modal-preview');
    if (preview) {
        preview.style.transform = 'translate(0px, 0px) scale(1)';
        preview.classList.remove('dragging');
    }
    const zoomLevel = document.getElementById('image-zoom-level');
    if (zoomLevel) zoomLevel.textContent = '100%';
}

function applyImageTransform() {
    const preview = document.getElementById('image-modal-preview');
    const stage = document.querySelector('.image-modal-stage');
    if (!preview || !stage) return;

    const maxPanX = Math.max(0, (preview.offsetWidth * imageZoom - stage.clientWidth) / 2);
    const maxPanY = Math.max(0, (preview.offsetHeight * imageZoom - stage.clientHeight) / 2);
    imagePanX = Math.min(maxPanX, Math.max(-maxPanX, imagePanX));
    imagePanY = Math.min(maxPanY, Math.max(-maxPanY, imagePanY));
    preview.style.transform = `translate(${imagePanX}px, ${imagePanY}px) scale(${imageZoom})`;
}

function startImagePan(event) {
    imageIsPanning = true;
    imageDidPan = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add('dragging');
    event.preventDefault();
}

function moveImagePan(event) {
    if (!imageIsPanning) return;
    imageDidPan = imageDidPan || Math.abs(event.movementX) > 0 || Math.abs(event.movementY) > 0;
    imagePanX += event.movementX;
    imagePanY += event.movementY;
    applyImageTransform();
    event.preventDefault();
}

function endImagePan(event) {
    if (!imageIsPanning) return;
    imageIsPanning = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    event.currentTarget.classList.remove('dragging');
}

function handlePreviewClick() {
    if (imageDidPan) {
        imageDidPan = false;
        return;
    }
    resetImageZoom();
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeImageModal();
});

function renderProducts(items) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = items.map(p => `
        <div class="product-card">
            <div class="product-img-wrap" onclick="openImageModal('${p.image}', '${p.name.replace(/'/g, "\\'")}')">
                <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <span class="brand">${p.brand}</span>
                <h3 class="product-title">${p.name}</h3>
                <div class="product-bottom">
                    <span class="price">$${p.price.toFixed(2)}</span>
                    <button class="add-btn" onclick="addToCart(${p.id})" ${getCartQuantity(p.id) >= p.stock ? 'disabled' : ''}>
                        ${getCartQuantity(p.id) >= p.stock ? 'Agotado' : 'Añadir'}
                    </button>
                </div>
                <span class="stock-label">Disponibles: ${Math.max(0, p.stock - getCartQuantity(p.id))}</span>
            </div>
        </div>
    `).join('');
}

function filterCategory(cat, btn, updateUrl = true) {
    const validCategory = cat === 'all' || products.some(product => product.category === cat);
    if (!validCategory) cat = 'all';

    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    const activeButton = btn || document.querySelector(`[data-category="${cat}"]`);
    if (activeButton) activeButton.classList.add('active');

    if (updateUrl) {
        const url = new URL(window.location.href);
        if (cat === 'all') url.searchParams.delete('category');
        else url.searchParams.set('category', cat);
        window.history.pushState({}, '', url);
    }

    renderProducts(cat === 'all' ? products : products.filter(p => p.category === cat));
}

function loadCategoryFromUrl() {
    const requestedCategory = new URLSearchParams(window.location.search).get('category');
    const category = requestedCategory && products.some(product => product.category === requestedCategory)
        ? requestedCategory
        : 'all';
    filterCategory(category, null, false);
}

window.addEventListener('popstate', loadCategoryFromUrl);

function loadCart() {
    try {
        const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
        if (!Array.isArray(savedCart)) return [];

        return savedCart.reduce((validItems, savedItem) => {
            const product = products.find(item => item.id === Number(savedItem.id));
            const quantity = Math.min(Number(savedItem.qty), product ? product.stock : 0);
            if (product && Number.isInteger(quantity) && quantity > 0) {
                validItems.push({ ...product, qty: quantity });
            }
            return validItems;
        }, []);
    } catch (error) {
        return [];
    }
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.map(item => ({ id: item.id, qty: item.qty }))));
}

function getCartQuantity(id) {
    const item = cart.find(cartItem => cartItem.id === id);
    return item ? item.qty : 0;
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const existingItem = cart.find(item => item.id === id);
    if (existingItem && existingItem.qty >= product.stock) return;

    if (existingItem) existingItem.qty += 1;
    else cart.push({ ...product, qty: 1 });
    saveCart();
    updateCartUI();
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    const product = products.find(p => p.id === id);
    if (!item || !product) return;

    item.qty = Math.min(product.stock, item.qty + delta);
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cart-count').innerText = totalCount;

    const itemsContainer = document.getElementById('cart-items');
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p style="text-align:center; color: var(--text-light); margin-top:2rem;">El carrito está vacío</p>';
    } else {
        itemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img class="cart-item-image" src="${item.image}" alt="${item.name}" loading="lazy">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} c/u</p>
                    <span class="cart-item-subtotal">Subtotal: $${(item.price * item.qty).toFixed(2)}</span>
                </div>
                <div class="cart-controls">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)" ${item.qty >= item.stock ? 'disabled' : ''}>+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})" aria-label="Eliminar ${item.name}" title="Eliminar producto">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
    document.getElementById('print-btn').disabled = cart.length === 0;
    renderPrintSummary(total);
    renderProducts(getVisibleProducts());
}

function getVisibleProducts() {
    const activeCategory = document.querySelector('.cat-btn.active')?.dataset.category || 'all';
    return activeCategory === 'all' ? products : products.filter(product => product.category === activeCategory);
}

function toggleCart() {
    document.getElementById('cart-modal').classList.toggle('open');
}

function renderPrintSummary(total) {
    const summary = document.getElementById('print-summary');
    const date = new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());

    summary.innerHTML = `
        <h1>Resumen de pedido K-Beauty</h1>
        <p>Fecha: ${date}</p>
        <table>
            <thead>
                <tr><th>Imagen</th><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
                ${cart.map(item => `
                    <tr>
                        <td><img class="print-image" src="${item.image}" alt="${item.name}"></td>
                        <td>${item.brand} - ${item.name}</td>
                        <td>${item.qty}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>$${(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot><tr><td colspan="4">Total estimado</td><td>$${total.toFixed(2)}</td></tr></tfoot>
        </table>
    `;
}

function printCart() {
    if (cart.length === 0) {
        alert('Añade al menos un producto al carrito');
        return;
    }
    document.getElementById('cart-modal').classList.remove('open');
    window.print();
}

loadCategoryFromUrl();
updateCartUI();
