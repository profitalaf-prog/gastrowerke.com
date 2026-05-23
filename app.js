/**
 * gastrowerke – app.js
 * Gemeinsame Hilfsfunktionen, Produktdaten laden, Header/Drawer, Toast, Search
 */

'use strict';

// ─── PRODUKTE LADEN ──────────────────────────────────────────────────────────
async function loadProducts() {
  if (window._gwProducts) return window._gwProducts;
  try {
    const r = await fetch('products.json');
    const data = await r.json();
    window._gwProducts = data;
    return data;
  } catch {
    return [];
  }
}

// ─── HILFSFUNKTIONEN ─────────────────────────────────────────────────────────
function formatPrice(p) {
  return p.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function formatPriceNet(p) {
  return (p / 1.19).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function starsHtml(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '½';
  while (s.replace(/½/g, '').length + (half ? 1 : 0) < 5) s += '☆';
  return s;
}

function buildCard(p) {
  const badgeCls = { sale: 'badge-sale', new: 'badge-new', hot: 'badge-hot', top: 'badge-top' }[p.badge] || 'badge-new';
  const badgeHtml = p.badge ? `<div class="product-badges"><span class="badge ${badgeCls}">${p.badgeLabel}</span></div>` : '';
  const priceHtml = p.oldPrice
    ? `<div><span class="product-price">${formatPrice(p.price)}</span><span class="product-price-old">${formatPrice(p.oldPrice)}</span></div>`
    : `<span class="product-price">${formatPrice(p.price)}</span>`;
  const wished = isWished(p.id);
  return `<article class="product-card reveal">
    <a href="produkt.html?slug=${p.slug}">
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='snowflake.svg'">
        ${badgeHtml}
        <button class="product-wishlist${wished ? ' wished' : ''}" onclick="event.preventDefault();toggleWishById(${p.id},this)" title="Wunschliste">${wished ? '❤️' : '♡'}</button>
      </div>
    </a>
    <div class="product-body">
      <div class="product-category">${p.category}</div>
      <a href="produkt.html?slug=${p.slug}" class="product-name">${p.name}</a>
      <div class="product-stars">${starsHtml(p.rating)} <span class="product-review-count">(${p.reviews})</span></div>
      <div class="product-meta">
        ${priceHtml}
        <button class="btn-add-cart" onclick="addToCartById(${p.id},this)">🛒 <span class="cart-label">In den Korb</span></button>
      </div>
    </div>
  </article>`;
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const existing = document.getElementById('gw-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'gw-toast';
  t.textContent = msg;
  const bg = type === 'error' ? '#e63946' : type === 'wish' ? '#e63946' : 'var(--primary)';
  Object.assign(t.style, {
    position: 'fixed', bottom: '80px', left: '50%',
    transform: 'translateX(-50%) translateY(14px)',
    background: bg, color: 'white', padding: '12px 24px',
    borderRadius: '50px', fontSize: '13px', fontWeight: '600',
    boxShadow: '0 4px 20px rgba(0,0,0,.25)', zIndex: '9999',
    opacity: '0', transition: 'opacity .25s, transform .25s',
    whiteSpace: 'nowrap', maxWidth: '90vw', textAlign: 'center', pointerEvents: 'none'
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(14px)'; setTimeout(() => t.remove(), 300); }, 2800);
}

// ─── WARENKORB ───────────────────────────────────────────────────────────────
function getCart() { return JSON.parse(localStorage.getItem('gw_cart') || '[]'); }
function saveCart(cart) { localStorage.setItem('gw_cart', JSON.stringify(cart)); updateCartBadge(); updateMiniCart(); }

function addToCartById(productId, btn) {
  const products = window._gwProducts || [];
  const p = products.find(x => x.id === productId);
  if (!p) return;
  const cart = getCart();
  const ex = cart.find(i => i.id === p.id);
  if (ex) ex.qty = (ex.qty || 1) + 1;
  else cart.push({ id: p.id, name: p.name, shortName: p.shortName, price: p.price, image: p.image, slug: p.slug, qty: 1 });
  saveCart(cart);
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = '✓ Hinzugefügt'; btn.style.background = '#2a9d8f'; btn.disabled = true;
    setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; }, 1400);
  }
  showToast('"' + (p.shortName || p.name) + '" wurde in den Warenkorb gelegt.');
}

function removeFromCart(id) {
  let cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  saveCart(cart);
}

function setQty(id, val) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const q = parseInt(val, 10);
  if (q < 1) { removeFromCart(id); return; }
  item.qty = q;
  saveCart(cart);
}

function cartTotal() {
  return getCart().reduce((s, i) => s + i.price * (i.qty || 1), 0);
}

function cartCount() {
  return getCart().reduce((s, i) => s + (i.qty || 1), 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const cnt = cartCount();
  badges.forEach(b => { b.textContent = cnt; b.style.display = cnt > 0 ? 'flex' : 'none'; });
}

// ─── MINI CART / SIDEBAR ─────────────────────────────────────────────────────
function updateMiniCart() {
  const sidebar = document.getElementById('cartSidebar');
  if (!sidebar) return;
  const cart = getCart();
  const body = sidebar.querySelector('.cart-sidebar-items');
  const totalEl = sidebar.querySelector('.cart-sidebar-total-val');
  const netEl = sidebar.querySelector('.cart-sidebar-net-val');
  const shippingEl = sidebar.querySelector('.cart-sidebar-shipping-val');
  if (!body) return;
  if (cart.length === 0) {
    body.innerHTML = `<div class="cart-empty-state"><div style="font-size:48px;margin-bottom:12px">🛒</div><strong>Ihr Warenkorb ist leer</strong><p>Entdecken Sie unsere Produkte und legen Sie los.</p><a href="kategorie.html" class="btn-accent" style="display:inline-block;margin-top:16px;padding:10px 24px;background:var(--accent);color:white;border-radius:50px;font-weight:600;font-size:13px">Produkte entdecken</a></div>`;
  } else {
    body.innerHTML = cart.map(item => `
      <div class="cart-sidebar-item">
        <div class="cart-sidebar-img">${item.image ? `<img src="${item.image}" alt="${item.name}" onerror="this.src='snowflake.svg'">` : '🛒'}</div>
        <div class="cart-sidebar-info">
          <a href="produkt.html?slug=${item.slug}" class="cart-sidebar-name">${item.shortName || item.name}</a>
          <div class="cart-sidebar-price">${formatPrice(item.price)}</div>
          <div class="cart-qty-row">
            <button class="qty-btn" onclick="changeQty(${item.id},-1);updateMiniCart()">−</button>
            <input class="qty-input" type="number" value="${item.qty || 1}" min="1" onchange="setQty(${item.id},this.value);updateMiniCart()">
            <button class="qty-btn" onclick="changeQty(${item.id},1);updateMiniCart()">+</button>
            <button class="cart-remove-btn" onclick="removeFromCart(${item.id});updateMiniCart()" title="Entfernen">🗑</button>
          </div>
        </div>
      </div>`).join('');
  }
  const total = cartTotal();
  const shipping = total > 0 && total < 100 ? 9.90 : 0;
  const gross = total + shipping;
  const net = gross / 1.19;
  if (totalEl) totalEl.textContent = formatPrice(gross);
  if (netEl) netEl.textContent = formatPrice(net);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Kostenlos' : formatPrice(shipping);
}

function openCart() {
  const s = document.getElementById('cartSidebar');
  const o = document.getElementById('cartOverlay');
  if (s) s.classList.add('open');
  if (o) o.classList.add('open');
  document.body.style.overflow = 'hidden';
  updateMiniCart();
}

function closeCart() {
  const s = document.getElementById('cartSidebar');
  const o = document.getElementById('cartOverlay');
  if (s) s.classList.remove('open');
  if (o) o.classList.remove('open');
  document.body.style.overflow = '';
}

// ─── WUNSCHLISTE ─────────────────────────────────────────────────────────────
function getWishlist() { return JSON.parse(localStorage.getItem('gw_wishlist') || '[]'); }
function saveWishlist(list) { localStorage.setItem('gw_wishlist', JSON.stringify(list)); updateWishBadge(); }
function isWished(id) { return getWishlist().includes(id); }

function toggleWishById(id, btn) {
  let list = getWishlist();
  if (list.includes(id)) {
    list = list.filter(x => x !== id);
    if (btn) { btn.textContent = '♡'; btn.classList.remove('wished'); }
    showToast('Aus der Wunschliste entfernt.', 'info');
  } else {
    list.push(id);
    if (btn) { btn.textContent = '❤️'; btn.classList.add('wished'); }
    showToast('Zur Wunschliste hinzugefügt.', 'wish');
  }
  saveWishlist(list);
}

function updateWishBadge() {
  const badges = document.querySelectorAll('.wish-badge');
  const cnt = getWishlist().length;
  badges.forEach(b => { b.textContent = cnt; b.style.display = cnt > 0 ? 'flex' : 'none'; });
}

// ─── SUCHE ───────────────────────────────────────────────────────────────────
function searchProducts(query, products) {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.shortName && p.shortName.toLowerCase().includes(q)) ||
    (p.sku && p.sku.toLowerCase().includes(q))
  ).slice(0, 8);
}

function renderDropdown(results, dropdownEl) {
  if (results.length === 0) {
    dropdownEl.innerHTML = '<div class="search-no-results">Keine Produkte gefunden.</div>';
  } else {
    let html = `<div class="search-dropdown-header">Produkte (${results.length})</div>`;
    results.forEach(p => {
      html += `<div class="search-result-item" onclick="window.location='produkt.html?slug=${p.slug}'">
        <div class="search-result-img"><img src="${p.image}" alt="${p.name}" onerror="this.src='snowflake.svg'" style="width:100%;height:100%;object-fit:cover;border-radius:6px"></div>
        <div class="search-result-info"><strong>${p.name}</strong><span>${p.category}</span></div>
        <div class="search-result-price">${formatPrice(p.price)}</div>
      </div>`;
    });
    dropdownEl.innerHTML = html;
  }
  dropdownEl.classList.add('open');
}

function closeDropdown(el) { el.classList.remove('open'); }

function setupSearch(inputEl, dropdownEl, formEl, products) {
  if (!inputEl || !dropdownEl) return;
  let timer;
  inputEl.addEventListener('input', () => {
    clearTimeout(timer);
    const val = inputEl.value.trim();
    if (val.length < 2) { closeDropdown(dropdownEl); return; }
    timer = setTimeout(() => renderDropdown(searchProducts(val, products), dropdownEl), 160);
  });
  inputEl.addEventListener('focus', () => {
    if (inputEl.value.trim().length >= 2) renderDropdown(searchProducts(inputEl.value.trim(), products), dropdownEl);
  });
  document.addEventListener('click', e => { if (!formEl.contains(e.target)) closeDropdown(dropdownEl); });
  formEl.addEventListener('submit', e => {
    const val = inputEl.value.trim();
    if (val) { e.preventDefault(); window.location = `kategorie.html?q=${encodeURIComponent(val)}`; }
  });
}

// ─── DRAWER / HEADER ─────────────────────────────────────────────────────────
function initDrawer() {
  const toggle = document.getElementById('menuToggle');
  const overlay = document.getElementById('navOverlay');
  const drawer = document.getElementById('navDrawer');
  const closeB = document.getElementById('drawerClose');
  if (!toggle) return;

  function openD() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeD() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  toggle.onclick = openD;
  if (closeB) closeB.onclick = closeD;
  if (overlay) overlay.onclick = closeD;
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeD(); closeCart(); } });

  // Accordion in Drawer
  document.querySelectorAll('.drawer-accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const sub = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      if (sub) sub.hidden = isOpen;
    });
  });
}

function initHeader() {
  const header = document.getElementById('main-header');
  if (header) window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 40), { passive: true });
  const btt = document.getElementById('backToTop');
  if (btt) {
    window.addEventListener('scroll', () => btt.classList.toggle('visible', scrollY > 480), { passive: true });
    btt.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ─── REVEAL OBSERVER ─────────────────────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.06 });
  els.forEach(el => obs.observe(el));
}

// ─── RECENTLY VIEWED ─────────────────────────────────────────────────────────
function addRecentlyViewed(id) {
  let rv = JSON.parse(localStorage.getItem('gw_rv') || '[]');
  rv = rv.filter(x => x !== id);
  rv.unshift(id);
  rv = rv.slice(0, 8);
  localStorage.setItem('gw_rv', JSON.stringify(rv));
}

function getRecentlyViewed() {
  return JSON.parse(localStorage.getItem('gw_rv') || '[]');
}

// ─── AUTH CHECK ──────────────────────────────────────────────────────────────
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('gw_current_user') || 'null');
}

function updateAuthLinks() {
  const user = getCurrentUser();
  const loginLinks = document.querySelectorAll('.hdr-login-link');
  const accountLinks = document.querySelectorAll('.hdr-account-link');
  loginLinks.forEach(l => { l.style.display = user ? 'none' : ''; });
  accountLinks.forEach(l => { l.style.display = user ? '' : 'none'; if (user) l.title = user.name; });
}

// ─── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const products = await loadProducts();
  window._gwProducts = products;

  updateCartBadge();
  updateWishBadge();
  updateMiniCart();
  initDrawer();
  initHeader();
  initReveal();
  updateAuthLinks();

  // Cart sidebar toggle
  const cartBtn = document.getElementById('cartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartBtn) cartBtn.onclick = openCart;
  if (cartOverlay) cartOverlay.onclick = closeCart;
  const closeSidebar = document.getElementById('closeSidebar');
  if (closeSidebar) closeSidebar.onclick = closeCart;

  // Search setup
  const si = document.getElementById('searchInput');
  const sd = document.getElementById('searchDropdown');
  const sf = document.getElementById('searchForm');
  if (si && sd && sf) setupSearch(si, sd, sf, products);

  const msi = document.getElementById('mobileSearchInput');
  const msd = document.getElementById('mobileSearchDropdown');
  const msf = document.getElementById('mobileSearchForm');
  if (msi && msd && msf) setupSearch(msi, msd, msf, products);

  // Mobile search toggle
  const msToggle = document.getElementById('mobileSearchToggle');
  const msBar = document.getElementById('mobileSearchBar');
  if (msToggle && msBar) {
    msToggle.onclick = () => {
      const open = msBar.style.display === 'block';
      msBar.style.display = open ? 'none' : 'block';
      if (!open && msi) msi.focus();
    };
  }
});
