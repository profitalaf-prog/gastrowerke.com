/**
 * gastrowerke – cart.js
 * Vollständige Warenkorb-Logik: Anzeige, Menge, Preisberechnung, Render
 */

'use strict';

const SHIPPING_FREE_THRESHOLD = 100;
const SHIPPING_COST = 9.90;
const VAT_RATE = 0.19;

function getCart() { return JSON.parse(localStorage.getItem('gw_cart') || '[]'); }
function saveCartLocal(cart) {
  localStorage.setItem('gw_cart', JSON.stringify(cart));
  if (typeof updateCartBadge === 'function') updateCartBadge();
  if (typeof updateMiniCart === 'function') updateMiniCart();
}

function calcShipping(subtotal) {
  return subtotal > 0 && subtotal < SHIPPING_FREE_THRESHOLD ? SHIPPING_COST : 0;
}

function calcTotals(cart) {
  const subtotal = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const shipping = calcShipping(subtotal);
  const gross = subtotal + shipping;
  const net = gross / (1 + VAT_RATE);
  const vat = gross - net;
  return { subtotal, shipping, gross, net, vat };
}

function renderCartPage() {
  const container = document.getElementById('cart-items-container');
  const summaryEl = document.getElementById('cart-summary');
  if (!container) return;

  const cart = getCart();
  const fmt = p => p.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-full">
        <div class="cart-empty-icon">🛒</div>
        <h2>Ihr Warenkorb ist leer</h2>
        <p>Sie haben noch keine Artikel in Ihren Warenkorb gelegt.</p>
        <a href="kategorie.html" class="btn-primary-large">Jetzt einkaufen</a>
      </div>`;
    if (summaryEl) summaryEl.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="cart-table-head">
      <span>Produkt</span><span>Preis</span><span>Menge</span><span>Gesamt</span><span></span>
    </div>
    ${cart.map(item => `
      <div class="cart-row" data-id="${item.id}">
        <div class="cart-row-product">
          <div class="cart-row-img">${`<img src="${item.image||'snowflake.svg'}" alt="${item.name}" onerror="this.src='snowflake.svg'">`}</div>
          <div class="cart-row-info">
            <a href="produkt.html?slug=${item.slug}" class="cart-row-name">${item.name}</a>
            <div class="cart-row-sku">Art-Nr: ${item.sku || '–'}</div>
          </div>
        </div>
        <div class="cart-row-price">${fmt(item.price)}</div>
        <div class="cart-row-qty">
          <button class="qty-btn" onclick="cartPageChangeQty(${item.id},-1)">−</button>
          <input class="qty-input" type="number" value="${item.qty || 1}" min="1" onchange="cartPageSetQty(${item.id},this.value)">
          <button class="qty-btn" onclick="cartPageChangeQty(${item.id},1)">+</button>
        </div>
        <div class="cart-row-total">${fmt(item.price * (item.qty || 1))}</div>
        <div class="cart-row-remove">
          <button class="cart-remove-btn" onclick="cartPageRemove(${item.id})" title="Entfernen">✕</button>
        </div>
      </div>`).join('')}`;

  const { subtotal, shipping, gross, net, vat } = calcTotals(cart);
  const remaining = SHIPPING_FREE_THRESHOLD - subtotal;

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="cart-summary-box">
        <h3 class="cart-summary-title">Bestellübersicht</h3>
        ${remaining > 0 ? `<div class="cart-free-shipping-hint">Noch <strong>${fmt(remaining)}</strong> bis zum kostenlosen Versand!</div>` : '<div class="cart-free-shipping-ok">✓ Kostenloser Versand!</div>'}
        <div class="cart-summary-row"><span>Zwischensumme</span><span>${fmt(subtotal)}</span></div>
        <div class="cart-summary-row"><span>Versand</span><span>${shipping === 0 ? 'Kostenlos' : fmt(shipping)}</span></div>
        <div class="cart-summary-row cart-summary-net"><span>Netto (ohne MwSt.)</span><span>${fmt(net)}</span></div>
        <div class="cart-summary-row cart-summary-vat"><span>MwSt. 19 %</span><span>${fmt(vat)}</span></div>
        <div class="cart-summary-row cart-summary-total"><span>Gesamtbetrag</span><span>${fmt(gross)}</span></div>
        <a href="checkout.html" class="btn-checkout">Zur Kasse →</a>
        <a href="kategorie.html" class="btn-continue">Weiter einkaufen</a>
        <div class="cart-trust-row">
          <span>🔒 SSL-verschlüsselt</span>
          <span>📦 Schnelle Lieferung</span>
          <span>↩ 30 Tage Rückgabe</span>
        </div>
      </div>`;
  }
}

function cartPageChangeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  saveCartLocal(cart);
  renderCartPage();
}

function cartPageSetQty(id, val) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  const q = parseInt(val, 10);
  if (isNaN(q) || q < 1) { cartPageRemove(id); return; }
  item.qty = q;
  saveCartLocal(cart);
  renderCartPage();
}

function cartPageRemove(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCartLocal(cart);
  renderCartPage();
  if (typeof showToast === 'function') showToast('Artikel entfernt.');
}

// Globale Exports
window.cartPageChangeQty = cartPageChangeQty;
window.cartPageSetQty = cartPageSetQty;
window.cartPageRemove = cartPageRemove;
window.gwCart = { getCart, saveCartLocal, calcTotals, renderCartPage };
