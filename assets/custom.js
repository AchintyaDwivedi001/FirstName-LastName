// ---------- Utilities ----------
const money = (cents) => {
  // Formats cents using shop currency if available; fallback to simple format
  const cur = window?.Shopify?.currency?.active || "";
  return ${(cents/100).toFixed(2)} ${cur}.trim();
};
const byId = (id) => document.getElementById(id);

// Fetch product JSON from handle
async function getProduct(handle){
  const res = await fetch(/products/${handle}.js);
  if(!res.ok) throw new Error("Product fetch failed");
  return res.json();
}

// Add any variant to cart
async function addVariantToCart(variantId, qty=1){
  const res = await fetch(/cart/add.js, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ id: variantId, quantity: qty })
  });
  if(!res.ok) throw new Error("Add to cart failed");
  return res.json();
}

// ---------- Quick View controller ----------
const QV = (() => {
  let product = null;
  let selectedVariant = null;
  let triggers = { color:"black", size:"medium" };
  let bonusHandle = null;

  const els = {};
  function cacheDom(){
    els.root = document.querySelector(".qv");
    els.media = els.root.querySelector(".qv__media img");
    els.title = els.root.querySelector(".qv__title");
    els.price = els.root.querySelector(".qv__price");
    els.desc  = els.root.querySelector(".qv__desc");
    els.opts  = els.root.querySelector(".qv__options");
    els.add   = els.root.querySelector(".js-qv-add");
    els.close = els.root.querySelector(".qv__close");
  }

  // Build <select> for each option set
  function buildOptions(p){
    els.opts.innerHTML = "";
    p.options.forEach((opt, idx) => {
      const row = document.createElement("div");
      row.className = "qv__row";
      row.innerHTML = `
        <label>${opt.name}</label>
        <select data-opt-index="${idx}">
          ${opt.values.map(v => <option value="${v}">${v}</option>).join("")}
        </select>`;
      els.opts.appendChild(row);
    });

    // preselect first available variant
    selectedVariant = p.variants.find(v => v.available) || p.variants[0];

    // set selects to selectedVariant's options
    Array.from(els.opts.querySelectorAll("select")).forEach((sel, idx) => {
      sel.value = selectedVariant.options[idx];
      sel.addEventListener("change", onOptionChange);
    });
  }

  function onOptionChange(){
    const chosen = Array.from(els.opts.querySelectorAll("select")).map(s => s.value);
    const variant = product.variants.find(v => {
      return v.options.every((val, i) => val === chosen[i]);
    });
    if(variant){
      selectedVariant = variant;
      els.price.textContent = money(Number(variant.price) * 100 || variant.price); // JSON price can be "19.99"
    }
  }

  async function open(handle, { triggerColor, triggerSize, bonusProductHandle }){
    if(!els.root) cacheDom();
    triggers = { color: (triggerColor||"").toLowerCase(), size: (triggerSize||"").toLowerCase() };
    bonusHandle = bonusProductHandle || null;

    product = await getProduct(handle);

    els.media.src = product?.images?.[0] || product?.featured_image || "";
    els.title.textContent = product.title;

    // pick an initial price from first available variant
    const initial = product.variants.find(v => v.available) || product.variants[0];
    els.price.textContent = money(Math.round(parseFloat(initial.price) * 100));
    els.desc.innerHTML = product.description || "";

    buildOptions(product);

    els.add.onclick = onAddToCart;
    els.close.onclick = close;
    els.root.classList.add("is-open");
    document.addEventListener("keydown", escClose);
    els.root.addEventListener("click", (e) => { if(e.target === els.root) close(); });
  }

  function escClose(e){ if(e.key === "Escape") close(); }

  function close(){
    els.root.classList.remove("is-open");
    document.removeEventListener("keydown", escClose);
  }

  async function onAddToCart(){
    try{
      await addVariantToCart(selectedVariant.id, 1);

      // Auto-add rule: if variant includes Black AND Medium, add bonus product
      const hasColor = selectedVariant.options.some(o => o.toLowerCase() === triggers.color);
      const hasSize  = selectedVariant.options.some(o => o.toLowerCase() === triggers.size);
      if(hasColor && hasSize && bonusHandle){
        const bonus = await getProduct(bonusHandle);
        const bonusVar = bonus.variants.find(v => v.available) || bonus.variants[0];
        if(bonusVar) { await addVariantToCart(bonusVar.id, 1); }
      }

      // Optional UX: show a basic confirmation
      alert("Added to cart!");
      close();
    }catch(err){
      console.error(err);
      alert("Sorry, could not add to cart.");
    }
  }

  return { open };
})();

// ---------- Wire product cards to Quick View ----------
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".js-qv-open");
  if(!btn) return;

  const handle = btn.dataset.handle;
  const gridEl = btn.closest("[data-bonus-handle]");
  await QV.open(handle, {
    triggerColor: gridEl?.dataset?.triggerColor,
    triggerSize:  gridEl?.dataset?.triggerSize,
    bonusProductHandle: gridEl?.dataset?.bonusHandle
  });
});