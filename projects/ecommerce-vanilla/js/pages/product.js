import { getProductById } from "../data.js";
import { addToCart, getQty, setQty, subscribe } from "../store.js";
import { formatMoney, getParam, escapeHtml } from "../utils.js";
import { mountCartBadge } from "../ui.js";

mountCartBadge();

const wrap = document.querySelector("#productView");
const id = getParam("id");
const product = getProductById(id);

if (!product) {
  wrap.innerHTML = `<div class="empty">Product not found. <a class="link" href="./index.html">Go back</a>.</div>`;
} else {
  const render = () => {
    const qty = getQty(product.id);

    wrap.innerHTML = `
      <div class="pv-img">${escapeHtml(product.emoji)}</div>

      <div>
        <div class="pv-tag">${escapeHtml(product.category)}</div>
        <h1 class="pv-title">${escapeHtml(product.name)}</h1>
        <p class="pv-desc">${escapeHtml(product.description)}</p>

        <p style="font-size:22px; font-weight:900; margin:14px 0 10px">
          ${formatMoney(product.price)}
        </p>

        <div class="btn-row">
          <button class="btn" id="addBtn">Add to cart</button>
          <button class="btn btn--ghost" id="goCartBtn">Go to cart</button>
        </div>

        <div style="margin-top:14px; display:flex; gap:10px; align-items:center">
          <div class="qty" aria-label="Quantity controls">
            <button id="decBtn" aria-label="Decrease quantity">−</button>
            <span id="qtyText">${qty}</span>
            <button id="incBtn" aria-label="Increase quantity">+</button>
          </div>
          <span style="color:var(--muted)">Set quantity directly on product page.</span>
        </div>
      </div>
    `;

    wrap.querySelector("#addBtn").addEventListener("click", () => addToCart(product.id, 1));
    wrap.querySelector("#goCartBtn").addEventListener("click", () => (window.location.href = "./cart.html"));

    wrap.querySelector("#incBtn").addEventListener("click", () => setQty(product.id, qty + 1));
    wrap.querySelector("#decBtn").addEventListener("click", () => setQty(product.id, qty - 1));
  };

  render();
  subscribe(render);
}
