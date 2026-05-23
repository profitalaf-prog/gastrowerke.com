/**
 * gastrowerke – pages-common.js
 * Gemeinsamer Initialisierungs-Code für alle statischen Seiten
 * (Header, Drawer, Cart-Sidebar, Toast, Wishlist, CartBadge, Auth-Links)
 */

'use strict';

/* ── Preis-Formatter ─────────────────────────────────────────── */
function formatPrice(p){
  return p.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
}

/* ── Toast ────────────────────────────────────────────────────── */
function showToast(msg, type='success'){
  const existing=document.getElementById('gw-toast');
  if(existing)existing.remove();
  const t=document.createElement('div');
  t.id='gw-toast';
  t.textContent=msg;
  const bg=type==='error'?'#e63946':type==='wish'?'#e63946':'var(--primary)';
  Object.assign(t.style,{
    position:'fixed',bottom:'80px',left:'50%',
    transform:'translateX(-50%) translateY(14px)',
    background:bg,color:'white',padding:'12px 24px',
    borderRadius:'50px',fontSize:'13px',fontWeight:'600',
    boxShadow:'0 4px 20px rgba(0,0,0,.25)',zIndex:'9999',
    opacity:'0',transition:'opacity .25s,transform .25s',
    whiteSpace:'nowrap',maxWidth:'90vw',textAlign:'center',pointerEvents:'none'
  });
  document.body.appendChild(t);
  requestAnimationFrame(()=>{t.style.opacity='1';t.style.transform='translateX(-50%) translateY(0)';});
  setTimeout(()=>{t.style.opacity='0';t.style.transform='translateX(-50%) translateY(14px)';setTimeout(()=>t.remove(),300);},2800);
}

/* ── Warenkorb ────────────────────────────────────────────────── */
function getCart(){return JSON.parse(localStorage.getItem('gw_cart')||'[]');}
function saveCart(cart){
  localStorage.setItem('gw_cart',JSON.stringify(cart));
  updateCartBadge();
  updateMiniCart();
}
function cartCount(){return getCart().reduce((s,i)=>s+(i.qty||1),0);}
function cartTotal(){return getCart().reduce((s,i)=>s+i.price*(i.qty||1),0);}

function addToCartById(productId,btn){
  const products=window._gwProducts||[];
  const p=products.find(x=>x.id===productId);
  if(!p)return;
  const cart=getCart();
  const ex=cart.find(i=>i.id===p.id);
  if(ex)ex.qty=(ex.qty||1)+1;
  else cart.push({id:p.id,name:p.name,shortName:p.shortName,price:p.price,image:p.image,slug:p.slug,sku:p.sku,qty:1});
  saveCart(cart);
  if(btn){
    const orig=btn.innerHTML;
    btn.innerHTML='✓ Hinzugefügt';btn.style.background='#2a9d8f';btn.disabled=true;
    setTimeout(()=>{btn.innerHTML=orig;btn.style.background='';btn.disabled=false;},1400);
  }
  showToast('"'+(p.shortName||p.name)+'" wurde in den Warenkorb gelegt.');
}

function removeFromCart(id){
  saveCart(getCart().filter(i=>i.id!==id));
}
function changeQty(id,delta){
  const cart=getCart();
  const item=cart.find(i=>i.id===id);
  if(!item)return;
  item.qty=Math.max(1,(item.qty||1)+delta);
  saveCart(cart);
}
function setQty(id,val){
  const cart=getCart();
  const item=cart.find(i=>i.id===id);
  if(!item)return;
  const q=parseInt(val,10);
  if(isNaN(q)||q<1){removeFromCart(id);return;}
  item.qty=q;
  saveCart(cart);
}

function updateCartBadge(){
  const cnt=cartCount();
  document.querySelectorAll('.cart-badge').forEach(b=>{
    b.textContent=cnt;
    b.style.display=cnt>0?'flex':'none';
  });
}

/* ── Mini-Cart Sidebar ────────────────────────────────────────── */
function updateMiniCart(){
  const sidebar=document.getElementById('cartSidebar');
  if(!sidebar)return;
  const body=sidebar.querySelector('.cart-sidebar-items');
  const totalEl=sidebar.querySelector('.cart-sidebar-total-val');
  const netEl=sidebar.querySelector('.cart-sidebar-net-val');
  const shipEl=sidebar.querySelector('.cart-sidebar-shipping-val');
  if(!body)return;
  const cart=getCart();
  if(cart.length===0){
    body.innerHTML=`<div class="cart-empty-state"><div style="font-size:48px;margin-bottom:12px">🛒</div><strong>Ihr Warenkorb ist leer</strong><p>Entdecken Sie unsere Produkte.</p><a href="kategorie.html" style="display:inline-block;margin-top:14px;padding:10px 22px;background:var(--accent);color:white;border-radius:50px;font-weight:600;font-size:13px">Produkte entdecken</a></div>`;
  }else{
    body.innerHTML=cart.map(item=>`
      <div class="cart-sidebar-item">
        <div class="cart-sidebar-img">${item.image?`<img src="${item.image}" alt="${item.name}" onerror="this.src='snowflake.svg'">`:''}</div>
        <div class="cart-sidebar-info">
          <a href="produkt.html?slug=${item.slug}" class="cart-sidebar-name">${item.shortName||item.name}</a>
          <div class="cart-sidebar-price">${formatPrice(item.price)}</div>
          <div class="cart-qty-row">
            <button class="qty-btn" onclick="changeQty(${item.id},-1);updateMiniCart()">−</button>
            <input class="qty-input" type="number" value="${item.qty||1}" min="1" onchange="setQty(${item.id},this.value);updateMiniCart()">
            <button class="qty-btn" onclick="changeQty(${item.id},1);updateMiniCart()">+</button>
            <button class="cart-remove-btn" onclick="removeFromCart(${item.id});updateMiniCart()" title="Entfernen">🗑</button>
          </div>
        </div>
      </div>`).join('');
  }
  const total=cartTotal();
  const shipping=total>0&&total<100?9.90:0;
  const gross=total+shipping;
  const net=gross/1.19;
  if(totalEl)totalEl.textContent=formatPrice(gross);
  if(netEl)netEl.textContent=formatPrice(net);
  if(shipEl)shipEl.textContent=shipping===0?'Kostenlos':formatPrice(shipping);
}

function openCart(){
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow='hidden';
  updateMiniCart();
}
function closeCart(){
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow='';
}

/* ── Wunschliste ──────────────────────────────────────────────── */
function getWishlist(){return JSON.parse(localStorage.getItem('gw_wishlist')||'[]');}
function saveWishlist(list){localStorage.setItem('gw_wishlist',JSON.stringify(list));updateWishBadge();}
function isWished(id){return getWishlist().includes(id);}

function toggleWishById(id,btn){
  let list=getWishlist();
  if(list.includes(id)){
    list=list.filter(x=>x!==id);
    if(btn){btn.textContent='♡';btn.classList.remove('wished');}
    showToast('Aus der Wunschliste entfernt.','info');
  }else{
    list.push(id);
    if(btn){btn.textContent='❤️';btn.classList.add('wished');}
    showToast('Zur Wunschliste hinzugefügt.','wish');
  }
  saveWishlist(list);
}

function updateWishBadge(){
  const cnt=getWishlist().length;
  document.querySelectorAll('.wish-badge').forEach(b=>{
    b.textContent=cnt;
    b.style.display=cnt>0?'flex':'none';
  });
}

/* ── Auth ─────────────────────────────────────────────────────── */
function getCurrentUser(){
  // Versuche zuerst gwAuth (Supabase), dann Fallback
  if(window.gwAuth && typeof window.gwAuth.getCurrentUser === 'function'){
    return window.gwAuth.getCurrentUser();
  }
  return JSON.parse(localStorage.getItem('gw_current_user')||'null');
}

function updateAuthLinks(){
  const user=getCurrentUser();
  document.querySelectorAll('.hdr-login-link').forEach(l=>l.style.display=user?'none':'');
  document.querySelectorAll('.hdr-account-link').forEach(l=>{
    l.style.display=user?'':'none';
    if(user)l.title=user.name;
  });
}

function logoutUser(){
  if(window.gwAuth && typeof window.gwAuth.logoutUser === 'function'){
    window.gwAuth.logoutUser();
    return;
  }
  localStorage.removeItem('gw_current_user');
  showToast('Erfolgreich abgemeldet.');
  setTimeout(()=>window.location.href='index.html',800);
}

/* ── Drawer ───────────────────────────────────────────────────── */
function initDrawer(){
  const toggle=document.getElementById('menuToggle');
  const overlay=document.getElementById('navOverlay');
  const drawer=document.getElementById('navDrawer');
  const closeB=document.getElementById('drawerClose');
  if(!toggle||!drawer)return;
  function openD(){drawer.classList.add('open');overlay?.classList.add('open');document.body.style.overflow='hidden';}
  function closeD(){drawer.classList.remove('open');overlay?.classList.remove('open');document.body.style.overflow='';}
  toggle.onclick=openD;
  if(closeB)closeB.onclick=closeD;
  if(overlay)overlay.onclick=closeD;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeD();closeCart();}});
}

/* ── Header scroll ────────────────────────────────────────────── */
function initHeader(){
  const hdr=document.getElementById('main-header');
  if(hdr)window.addEventListener('scroll',()=>hdr.classList.toggle('scrolled',scrollY>40),{passive:true});
  const btt=document.getElementById('backToTop');
  if(btt){
    window.addEventListener('scroll',()=>btt.classList.toggle('visible',scrollY>480),{passive:true});
    btt.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
  }
}

/* ── Reveal Observer ──────────────────────────────────────────── */
function initReveal(){
  const els=document.querySelectorAll('.reveal:not(.visible)');
  if(!els.length)return;
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});
  },{threshold:0.06});
  els.forEach(el=>obs.observe(el));
}

/* ── Search ───────────────────────────────────────────────────── */
function setupSearch(inputEl,dropdownEl,formEl,products){
  if(!inputEl||!dropdownEl||!formEl)return;
  let timer;
  function doSearch(q){
    if(!q||q.length<2){dropdownEl.classList.remove('open');return;}
    const ql=q.toLowerCase();
    const results=products.filter(p=>
      p.name.toLowerCase().includes(ql)||
      p.category.toLowerCase().includes(ql)||
      (p.shortName&&p.shortName.toLowerCase().includes(ql))
    ).slice(0,8);
    if(results.length===0){
      dropdownEl.innerHTML='<div class="search-no-results">Keine Produkte gefunden.</div>';
    }else{
      let html=`<div class="search-dropdown-header">Produkte (${results.length})</div>`;
      results.forEach(p=>{
        html+=`<div class="search-result-item" onclick="location.href='produkt.html?slug=${p.slug}'">
          <div class="search-result-img"><img src="${p.image||'snowflake.svg'}" alt="" onerror="this.src='snowflake.svg'" style="width:100%;height:100%;object-fit:cover"></div>
          <div class="search-result-info"><strong>${p.name}</strong><span>${p.category}</span></div>
          <div class="search-result-price">${formatPrice(p.price)}</div>
        </div>`;
      });
      dropdownEl.innerHTML=html;
    }
    dropdownEl.classList.add('open');
  }
  inputEl.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>doSearch(inputEl.value.trim()),160);});
  inputEl.addEventListener('focus',()=>{if(inputEl.value.trim().length>=2)doSearch(inputEl.value.trim());});
  document.addEventListener('click',e=>{if(!formEl.contains(e.target))dropdownEl.classList.remove('open');});
  formEl.addEventListener('submit',e=>{
    const q=inputEl.value.trim();
    if(q){e.preventDefault();window.location='kategorie.html?q='+encodeURIComponent(q);}
  });
}

/* ── Haupt-Init ───────────────────────────────────────────────── */
async function initPage(){
  // Produkte laden
  if(!window._gwProducts){
    try{
      const r=await fetch('products.json');
      window._gwProducts=await r.json();
    }catch(e){window._gwProducts=[];}
  }

  updateCartBadge();
  updateWishBadge();
  updateMiniCart();
  updateAuthLinks();
  initDrawer();
  initHeader();
  initReveal();

  // Cart-Sidebar Events
  document.getElementById('cartBtn')?.addEventListener('click',openCart);
  document.getElementById('cartOverlay')?.addEventListener('click',closeCart);
  document.getElementById('closeSidebar')?.addEventListener('click',closeCart);

  // Suche
  const si=document.getElementById('searchInput');
  const sd=document.getElementById('searchDropdown');
  const sf=document.getElementById('searchForm');
  if(si&&sd&&sf)setupSearch(si,sd,sf,window._gwProducts);

  const msi=document.getElementById('mobileSearchInput');
  const msd=document.getElementById('mobileSearchDropdown');
  const msf=document.getElementById('mobileSearchForm');
  if(msi&&msd&&msf)setupSearch(msi,msd,msf,window._gwProducts);

  // Mobile Search Toggle
  const msToggle=document.getElementById('mobileSearchToggle');
  const msBar=document.getElementById('mobileSearchBar');
  if(msToggle&&msBar){
    msToggle.onclick=()=>{
      const open=msBar.style.display==='block';
      msBar.style.display=open?'none':'block';
      if(!open&&msi)msi.focus();
    };
  }

  // Newsletter-Formular (wenn vorhanden)
  document.getElementById('newsletterForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    showToast('✓ Erfolgreich angemeldet! Willkommen beim gastrowerke-Newsletter.');
    e.target.reset();
  });
}

document.addEventListener('DOMContentLoaded',initPage);
