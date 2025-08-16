(function(){

const modal document.getElementById('figmaModal');

const modalContent document.getElementById('figmaModalContent');

const grid document.querySelector('.figma-grid');

if(!grid) return;

// Open modal with product data

if(!trigger) return;

const card trigger.closest('.figma-card');

const handle card?.dataset?.handle;

grid.addEventListener('click', async (e) => { const triggere.target.closest('[data-quick-view]'); const product await fetch(/products/${handle}.js').then(r=>r.json()); });

if(!handle) return;

renderModal(product);

modal.showModal();
modal?.addEventListener('close', ()=>{ modalContent.innerHTML = ; });

function renderModal (product) {

const price (p) => new Intl. NumberFormat(undefined,

{style: 'currency', currency: Shopify.currency.active|| 'USD'}).format(p/100);

const optionsHtml = product.options.map((opt, idx)=>{

1))]; const values [...new Set(product.variants.map(v=> v['options(idx+1)

return

<label>${opt></label>

<div class="variant-row" data-option-index="${idx)">

<select aria-label="${opt}">



$(values.map(v=> <option value="${v}">${v}</option>').join(''))

</select>

</div>

}).join('');

modalContent.innerHTML =

<div class="modal-grid" style="display:grid; grid-template-columns:1fr

1fr:gap:20px;align-items:start">

<div>

${product.images?. [0] ? <img alt="${product.title)" src="$

(product.images[0]}" style="width: 100%; border-radius: 16px">"}

</div>

<div>

<h2 style="margin:0 0 4px">${product.title}</h2>

<div style="opacity:.75; margin:0 0 12px">${price(product.price)}</

div> <div style="max-height:140px; overflow:auto;margin-bottom: 12px">$

(product.description?.substring(0,300) || ''}</div>

${optionsHtml)

<div style="margin-top: 16px; display: flex; gap: 10px;align-

items:center">

<button class="figma-atc" data-atc>Add to cart</button>

</div>

</div>

</div>

const selects [...modalContent.querySelectorAll('select'));

const atcBtn modalContent.querySelector('[data-atc]');

function getSelectedVariant(){

// Map selections to find a matching variant

const sel selects.map(s => s.value);

const match product.variants.find(v => {

return sel[0] === v.option1 && (sel [1] ? sel [1] v.option2:

true) && (sel[2] ? sel[2] v.option3 true);

}

});

return match && !match.available? null match;

atcBtn?.addEventListener('click', async ()=>{

const variant getSelectedVariant();

if(Ivariant) { alert('Selected variant is unavailable.'); return; }

// Add selected variant

const addRes await fetch('/cart/add.js', {

headers: { 'Content-Type': 'application/json', 'Accept':

method: 'POST',

'application/json' },

body: JSON.stringify({ id: variant.id, quantity: 1))
    }).then(r=>r.json());

// Special rule: if variant options include Black Medium, auto-add

jacket

const hasBlack [variant.option1, variant.option2,

variant.option3].includes ('Black');

const hasMedium [variant.option1, variant.option2,

variant.option3].includes('Medium');

const jacketHandle grid.getAttribute('data-auto-add-jacket-handle');

if (hasBlack && hasMedium && jacketHandle) {

try {

const jacket await fetch("/products/$

(jacketHandle).js').then(r=>r.json());

const firstAvail jacket.variants.find(v => v.available) ||

jacket.variants[0];

if (firstAvail) {

await fetch('/cart/add.js', {

method: 'POST',

headers: { 'Content-Type': 'application/json', 'Accept':

'application/json' },

body: JSON.stringify({ id: firstAvail.id, quantity: 1,

properties: { _auto_add: 'true' } })

}

});

}

} catch(err) { console.warn('Auto-add jacket failed', err); }

// Optional: open cart drawer if theme provides it

// Otherwise, simple feedback:

alert('Added to cart');

modal.close();

});

}

})();