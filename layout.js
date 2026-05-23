/**
 * gastrowerke – layout.js
 * Gemeinsamer Header + Footer HTML-Snippet für alle statischen Seiten.
 * Wird per insertAdjacentHTML in jede Seite eingefügt, sodass
 * Header, Navigation, Drawer und Cart-Sidebar überall identisch sind.
 *
 * Einbindung in HTML:
 *   <div id="gw-header-root"></div>
 *   <div id="gw-footer-root"></div>
 *   <script src="layout.js"></script>
 *   <script src="pages-common.js"></script>
 */

'use strict';

(function injectLayout(){
  /* ── HEADER ───────────────────────────────────────────────── */
  const headerHTML=`
<div class="topbar">
  <div class="container">
    <div class="topbar-inner">
      <div class="topbar-left">📞 +49 (0) 631 / 123 45 67 &nbsp;|&nbsp; Mo–Fr 8–17 Uhr</div>
      <div class="topbar-right">
        <a href="preisliste.html">📋 Preisliste</a>
        <a href="kontakt.html">✉ Kontakt</a>
        <a href="login.html" class="hdr-login-link">👤 Login</a>
        <a href="konto.html" class="hdr-account-link" style="display:none">👤 Konto</a>
      </div>
    </div>
  </div>
</div>
<header id="main-header">
  <div class="header-inner container">
    <a href="index.html" class="logo">gastro<em>werke</em></a>
    <div class="search-wrap">
      <form class="search-form" id="searchForm" role="search">
        <input type="search" id="searchInput" placeholder="Produkt suchen …" autocomplete="off" aria-label="Suche">
        <button type="submit" aria-label="Suche">🔍</button>
      </form>
      <div class="search-dropdown" id="searchDropdown"></div>
    </div>
    <div class="header-actions">
      <button class="hdr-btn" id="mobileSearchToggle" style="display:none" title="Suche"><span class="icon">🔍</span><span>Suche</span></button>
      <a href="wishlist.html" class="hdr-btn" style="position:relative" title="Wunschliste">
        <span class="icon">♡</span><span>Wunschliste</span>
        <span class="wish-badge" id="wishBadge" style="display:none">0</span>
      </a>
      <a href="login.html" class="hdr-btn hdr-login-link" title="Anmelden"><span class="icon">👤</span><span>Konto</span></a>
      <a href="konto.html" class="hdr-btn hdr-account-link" title="Mein Konto" style="display:none"><span class="icon">👤</span><span>Konto</span></a>
      <button class="hdr-btn hdr-btn-cart" id="cartBtn" title="Warenkorb">
        <span class="icon">🛒</span><span>Warenkorb</span>
        <span class="cart-badge" id="cartBadge" style="display:none">0</span>
      </button>
      <button class="mobile-toggle" id="menuToggle" aria-label="Menü" aria-expanded="false">☰</button>
    </div>
  </div>
  <div class="mobile-search-bar" id="mobileSearchBar" style="display:none">
    <div class="container">
      <form class="search-form" id="mobileSearchForm">
        <input type="search" id="mobileSearchInput" placeholder="Produkt suchen …" autocomplete="off">
        <button type="submit">🔍</button>
      </form>
      <div class="search-dropdown" id="mobileSearchDropdown"></div>
    </div>
  </div>
</header>
<nav class="main-nav" aria-label="Hauptnavigation">
  <div class="container">
    <div class="nav-inner">
      <a href="index.html" class="nav-link">🏠 Start</a>
      <a href="kategorie.html?cat=Edelstahlm%C3%B6bel" class="nav-link">🔩 Edelstahlmöbel</a>
      <a href="kategorie.html?cat=Gastrotechnik" class="nav-link">🍳 Gastrotechnik</a>
      <a href="kategorie.html?cat=K%C3%BChlung+%26+Tiefk%C3%BChl" class="nav-link">❄️ Kühlung</a>
      <a href="kategorie.html?sale=true" class="nav-link">🔥 SALE <span class="nav-badge">SALE</span></a>
      <a href="kategorie.html?new=true" class="nav-link">✨ Neuheiten</a>
      <a href="preisliste.html" class="nav-link">📋 Preisliste</a>
      <a href="ueber-uns.html" class="nav-link">ℹ️ Über uns</a>
      <a href="kontakt.html" class="nav-link">✉ Kontakt</a>
    </div>
  </div>
</nav>
<div class="nav-overlay" id="navOverlay" aria-hidden="true"></div>
<nav class="nav-drawer" id="navDrawer" aria-label="Mobile Navigation">
  <div class="drawer-header">
    <div class="drawer-logo">gastro<em>werke</em></div>
    <button class="drawer-close" id="drawerClose" aria-label="Schließen">✕</button>
  </div>
  <div class="drawer-links">
    <a href="index.html">🏠 Startseite</a>
    <div class="drawer-section-label">Kategorien</div>
    <a href="kategorie.html?cat=Edelstahlm%C3%B6bel">🔩 Edelstahlmöbel</a>
    <a href="kategorie.html?cat=Gastrotechnik">🍳 Gastrotechnik</a>
    <a href="kategorie.html?cat=K%C3%BChlung+%26+Tiefk%C3%BChl">❄️ Kühlung &amp; Tiefkühl</a>
    <a href="kategorie.html?sale=true">🔥 SALE</a>
    <a href="kategorie.html?new=true">✨ Neuheiten</a>
    <div class="drawer-section-label">Service</div>
    <a href="preisliste.html">📋 Preisliste</a>
    <a href="ueber-uns.html">ℹ️ Über uns</a>
    <a href="kontakt.html">✉ Kontakt</a>
    <a href="konditionen.html">📄 Konditionen</a>
    <a href="wishlist.html">♡ Wunschliste</a>
    <a href="cart.html">🛒 Warenkorb</a>
    <a href="login.html" class="hdr-login-link">👤 Anmelden</a>
    <a href="konto.html" class="hdr-account-link" style="display:none">👤 Mein Konto</a>
    <div class="drawer-section-label">Rechtliches</div>
    <a href="impressum.html">📋 Impressum</a>
    <a href="datenschutz.html">🔒 Datenschutz</a>
    <a href="agb.html">📃 AGB</a>
    <a href="widerrufsrecht.html">↩ Widerrufsrecht</a>
  </div>
</nav>
<div class="cart-overlay" id="cartOverlay"></div>
<aside class="cart-sidebar" id="cartSidebar" aria-label="Warenkorb">
  <div class="cart-sidebar-header">
    <h3>🛒 Warenkorb</h3>
    <button class="cart-sidebar-close" id="closeSidebar" aria-label="Schließen">✕</button>
  </div>
  <div class="cart-sidebar-items"></div>
  <div class="cart-sidebar-footer">
    <div class="cart-sidebar-totals">
      <div class="cart-sidebar-totals-row"><span>Netto</span><span class="cart-sidebar-net-val">–</span></div>
      <div class="cart-sidebar-totals-row"><span>Versand</span><span class="cart-sidebar-shipping-val">–</span></div>
      <div class="cart-sidebar-totals-row total"><span>Gesamt</span><span class="cart-sidebar-total-val">–</span></div>
    </div>
    <a href="checkout.html" class="btn-go-checkout">Zur Kasse →</a>
    <a href="cart.html" class="btn-go-cart">Warenkorb anzeigen</a>
  </div>
</aside>`;

  /* ── FOOTER ───────────────────────────────────────────────── */
  const footerHTML=`
<footer>
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">gastro<em>werke</em></div>
        <p class="footer-desc">Ihr Profi-Partner für Gastrogeräte, Edelstahlmöbel und Großküchentechnik. Über 3.000 Artikel für Restaurants, Hotels und Großküchen.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:4px">
          <span style="background:rgba(255,255,255,.08);padding:5px 10px;border-radius:6px;font-size:11px">🔒 SSL</span>
          <span style="background:rgba(255,255,255,.08);padding:5px 10px;border-radius:6px;font-size:11px">💳 PayPal</span>
          <span style="background:rgba(255,255,255,.08);padding:5px 10px;border-radius:6px;font-size:11px">📦 DHL</span>
          <span style="background:rgba(255,255,255,.08);padding:5px 10px;border-radius:6px;font-size:11px">↩ 30T Rückgabe</span>
        </div>
      </div>
      <div>
        <div class="footer-col-title">Shop</div>
        <ul class="footer-links">
          <li><a href="kategorie.html">Alle Produkte</a></li>
          <li><a href="kategorie.html?sale=true">Sale</a></li>
          <li><a href="kategorie.html?new=true">Neuheiten</a></li>
          <li><a href="preisliste.html">Preisliste</a></li>
          <li><a href="wishlist.html">Wunschliste</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title">Service</div>
        <ul class="footer-links">
          <li><a href="ueber-uns.html">Über uns</a></li>
          <li><a href="kontakt.html">Kontakt</a></li>
          <li><a href="konditionen.html">Konditionen</a></li>
          <li><a href="agb.html">AGB</a></li>
          <li><a href="widerrufsrecht.html">Widerrufsrecht</a></li>
        </ul>
      </div>
      <div>
        <div class="footer-col-title">Kontakt</div>
        <ul class="footer-contact">
          <li><span>📍</span><span>Industriestraße 14<br>67655 Kaiserslautern</span></li>
          <li><span>📞</span><span>+49 (0) 631 / 123 45 67</span></li>
          <li><span>✉</span><span>info@gastrowerke.de</span></li>
          <li><span>🕐</span><span>Mo–Fr: 8:00–17:00 Uhr</span></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="footer-bottom">
      <span class="footer-copy">© 2024 gastrowerke GmbH. Alle Rechte vorbehalten.</span>
      <nav class="footer-legal" aria-label="Rechtliche Links">
        <a href="impressum.html">Impressum</a>
        <a href="datenschutz.html">Datenschutz</a>
        <a href="agb.html">AGB</a>
        <a href="widerrufsrecht.html">Widerrufsrecht</a>
      </nav>
    </div>
  </div>
</footer>
<button class="back-to-top" id="backToTop" aria-label="Nach oben">↑</button>`;

  /* ── Inject ───────────────────────────────────────────────── */
  const headerRoot=document.getElementById('gw-header-root');
  const footerRoot=document.getElementById('gw-footer-root');
  if(headerRoot)headerRoot.outerHTML=headerHTML;
  if(footerRoot)footerRoot.outerHTML=footerHTML;

  // Active Nav-Link setzen
  const path=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-link').forEach(l=>{
    try{
      const lp=new URL(l.href,location.href).pathname.split('/').pop();
      if(lp===path)l.classList.add('active');
    }catch{}
  });
})();
