import { products, TAX_RATE } from "../data.js";
import { getState, setQty, removeFromCart, clearCart, subscribe } from "../store.js";
import { formatMoney, escapeHtml } from "../utils.js";
import { mountCartBadge } from "../ui.js";

mountCartBadge();

const itemsEl = document.querySelector("#cartItems");
const emptyEl = document.querySelector("#emptyCart");
const subtotalEl = document.querySelector("#subtotal");
const taxEl = document.querySelector("#tax");
const totalEl = document.querySelector("#total");
const clearBtn = document.querySelector("#clearCartBtn");
const checkoutBtn = document.querySelector("#checkoutBtn");

function getProductMap() {
  const map = new Map();
  for (const p of products) map.set(p.id, p);
  return map;
}
const productMap = getProductMap();

function computeTotals(cartItems) {
  let subtotal = 0;
  for (const it of cartItems) {
    subtotal += it.price * it.qty;
  }
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

function render() {
  const { items } = getState();
  const ids = Object.keys(items);

  if (ids.length === 0) {
    itemsEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    subtotalEl.textContent = formatMoney(0);
    taxEl.textContent = formatMoney(0);
    totalEl.textContent = formatMoney(0);
    return;
  }

  emptyEl.classList.add("hidden");

  const cartItems = ids
    .map(id => {
      const p = productMap.get(id);
      if (!p) return null;
      return { ...p, qty: items[id].qty };
    })
    .filter(Boolean);

  const totals = computeTotals(cartItems);

  itemsEl.innerHTML = cartItems
    .map(
      p => `
      <div class="cart-item">
        <div class="ci-img">${escapeHtml(p.emoji)}</div>

        <div>
          <p class="ci-title">${escapeHtml(p.name)}</p>
          <div class="ci-meta">
            ${escapeHtml(p.category)} · ${formatMoney(p.price)} each
          </div>
          <div class="ci-meta" style="margin-top:6px">
            Line total: <strong>${formatMoney(p.price * p.qty)}</strong>
          </div>
        </div>

        <div class="ci-actions">
          <div class="qty">
            <button data-dec="${escapeHtml(p.id)}" aria-label="Decrease">−</button>
            <span>${p.qty}</span>
            <button data-inc="${escapeHtml(p.id)}" aria-label="Increase">+</button>
          </div>
          <button class="btn btn--ghost" data-remove="${escapeHtml(p.id)}">Remove</button>
        </div>
      </div>
    `
    )
    .join("");

  itemsEl.querySelectorAll("[data-inc]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.inc;
      const current = items[id]?.qty ?? 0;
      setQty(id, current + 1);
    });
  });

  itemsEl.querySelectorAll("[data-dec]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.dec;
      const current = items[id]?.qty ?? 0;
      setQty(id, current - 1);
    });
  });

  itemsEl.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.remove));
  });

  subtotalEl.textContent = formatMoney(totals.subtotal);
  taxEl.textContent = formatMoney(totals.tax);
  totalEl.textContent = formatMoney(totals.total);
}

clearBtn.addEventListener("click", clearCart);

checkoutBtn.addEventListener("click", () => {
  alert("Checkout complete. Your bank account feels lighter already.");
  clearCart();
});

render();
subscribe(render);
