// helpers
const money = (cents) => {
  const cur = window?.Shopify?.currency?.active || "";
  return ${(cents/100).toFixed(2)} ${cur}.trim();
};
async function getProduct(handle){ const r = await fetch(/products/${handle}.js); return r.json(); }
async function addVariantToCart(id, q=1){
  return fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,quantity:q})});
}

// quick view
(function(){
  const gridRoot = document.querySelector('.product-grid .container');
  if(!gridRoot) return;

  const qv = document.querySelector('.qv');
  const img = qv.querySelector('.qv__media img');
  const title = qv.querySelector('.qv__title');
  const price = qv.querySelector('.qv__price');
  const desc  = qv.querySelector('.qv__desc');
  const opts  = qv.querySelector('.qv__options');
  const addBtn= qv.querySelector('.js-qv-add');

  let product = null, selectedVariant = null;

  document.addEventListener('click', async (e)=>{
    const btn = e.target.closest('.js-qv-open');
    if(!btn) return;
    const handle = btn.dataset.handle;

    product = await getProduct(handle);
    img.src = product.images?.[0] || product.featured_image || '';
    title.textContent = product.title;
    desc.innerHTML = product.description || '';

    // set variant + price
    selectedVariant = product.variants.find(v=>v.available) || product.variants[0];
    price.textContent = money(Math.round(parseFloat(selectedVariant.price) * 100));

    // build option selects
    opts.innerHTML = '';
    product.options.forEach((opt, idx)=>{
      const row = document.createElement('div');
      row.className = 'qv__row';
      row.innerHTML = `
        <label>${opt.name}</label>
        <select data-idx="${idx}">
          ${opt.values.map(v=><option value="${v}">${v}</option>).join('')}
        </select>`;
      opts.appendChild(row);
    });
    Array.from(opts.querySelectorAll('select')).forEach((s,i)=>{
      s.value = selectedVariant.options[i];
      s.addEventListener('change', ()=>{
        const chosen = Array.from(opts.querySelectorAll('select')).map(x=>x.value);
        const match = product.variants.find(v=>v.options.every((vopt,ix)=>vopt===chosen[ix]));
        if(match){ selectedVariant = match; price.textContent = money(Math.round(parseFloat(match.price) * 100)); }
      });
    });

    qv.classList.add('is-open');
  });

  qv.addEventListener('click', (e)=>{ if(e.target===qv || e.target.classList.contains('qv__close')) qv.classList.remove('is-open'); });

  addBtn?.addEventListener('click', async ()=>{
    if(!selectedVariant) return;

    await addVariantToCart(selectedVariant.id, 1);

    // auto-add bonus if Black + Medium
    const trigColor = (gridRoot.dataset.triggerColor || 'black').toLowerCase();
    const trigSize  = (gridRoot.dataset.triggerSize  || 'medium').toLowerCase();
    const hasColor = selectedVariant.options.some(o => o.toLowerCase() === trigColor);
    const hasSize  = selectedVariant.options.some(o => o.toLowerCase() === trigSize);
    const bonusHandle = gridRoot.dataset.bonusHandle;

    if(hasColor && hasSize && bonusHandle){
      const bonus = await getProduct(bonusHandle);
      const bonusVar = bonus.variants.find(v=>v.available) || bonus.variants[0];
      if(bonusVar) await addVariantToCart(bonusVar.id, 1);
    }

    alert('Added to cart!');
    qv.classList.remove('is-open');
  });
})();