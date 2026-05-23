/**
 * gastrowerke – wishlist-page.js
 * Wunschliste: Seite rendern, Produkte hinzufügen/entfernen
 */

'use strict';

function renderWishlistPage(){
  const container=document.getElementById('wishlist-container');
  const emptyState=document.getElementById('wishlist-empty');
  const titleCount=document.getElementById('wishlist-count');
  if(!container)return;

  const list=JSON.parse(localStorage.getItem('gw_wishlist')||'[]');
  const products=window._gwProducts||[];
  const items=products.filter(p=>list.includes(p.id));

  if(titleCount)titleCount.textContent=items.length>0?`(${items.length} Artikel)`:'';

  if(items.length===0){
    container.innerHTML='';
    if(emptyState)emptyState.style.display='block';
    return;
  }
  if(emptyState)emptyState.style.display='none';

  const fmt=p=>p.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
  const stars=r=>{let s='';const f=Math.floor(r);for(let i=0;i<f;i++)s+='★';if(r-f>=.5)s+='½';while((s.replace(/½/g,'').length+(s.includes('½')?1:0))<5)s+='☆';return s;};

  container.innerHTML=`<div class="product-grid">${items.map(p=>{
    const bCls={sale:'badge-sale',new:'badge-new',hot:'badge-hot',top:'badge-top'}[p.badge]||'';
    const bHtml=p.badge?`<div class="product-badges"><span class="badge ${bCls}">${p.badgeLabel}</span></div>`:'';
    const pHtml=p.oldPrice
      ?`<div><span class="product-price">${fmt(p.price)}</span><span class="product-price-old">${fmt(p.oldPrice)}</span></div>`
      :`<span class="product-price">${fmt(p.price)}</span>`;
    return `<article class="product-card">
      <a href="produkt.html?slug=${p.slug}">
        <div class="product-img-wrap">
          <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='snowflake.svg'">${bHtml}
          <button class="product-wishlist wished" onclick="event.preventDefault();wishPageRemove(${p.id})" title="Von Wunschliste entfernen">❤️</button>
        </div>
      </a>
      <div class="product-body">
        <div class="product-category">${p.category}</div>
        <a href="produkt.html?slug=${p.slug}" class="product-name">${p.name}</a>
        <div class="product-stars">${stars(p.rating)} <span class="product-review-count">(${p.reviews})</span></div>
        <div class="product-meta">
          ${pHtml}
          <button class="btn-add-cart" onclick="addToCartById(${p.id},this)">🛒 In den Korb</button>
        </div>
      </div>
    </article>`;
  }).join('')}</div>`;
}

function wishPageRemove(id){
  let list=JSON.parse(localStorage.getItem('gw_wishlist')||'[]');
  list=list.filter(x=>x!==id);
  localStorage.setItem('gw_wishlist',JSON.stringify(list));
  updateWishBadge();
  renderWishlistPage();
  showToast('Aus der Wunschliste entfernt.');
}

window.wishPageRemove=wishPageRemove;

document.addEventListener('DOMContentLoaded',async()=>{
  if(!window._gwProducts){
    try{const r=await fetch('products.json');window._gwProducts=await r.json();}
    catch{window._gwProducts=[];}
  }
  renderWishlistPage();

  // Alle in Warenkorb legen Button
  document.getElementById('addAllToCart')?.addEventListener('click',()=>{
    const list=JSON.parse(localStorage.getItem('gw_wishlist')||'[]');
    const products=window._gwProducts||[];
    let count=0;
    list.forEach(id=>{
      const p=products.find(x=>x.id===id);
      if(!p)return;
      const cart=JSON.parse(localStorage.getItem('gw_cart')||'[]');
      const ex=cart.find(i=>i.id===p.id);
      if(ex)ex.qty=(ex.qty||1)+1;
      else cart.push({id:p.id,name:p.name,shortName:p.shortName,price:p.price,image:p.image,slug:p.slug,sku:p.sku,qty:1});
      localStorage.setItem('gw_cart',JSON.stringify(cart));
      count++;
    });
    updateCartBadge();
    updateMiniCart();
    showToast(`${count} Artikel in den Warenkorb gelegt.`);
  });
});
