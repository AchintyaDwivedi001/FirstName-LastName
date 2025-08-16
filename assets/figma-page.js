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