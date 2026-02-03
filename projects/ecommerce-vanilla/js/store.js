const STORAGE_KEY = "vanilla_shop_cart_v1";

/**
 * Cart shape:
 * {
 *   items: { [productId]: { id, qty } }
 * }
 */
let state = loadCart();

const listeners = new Set();

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { items: {} };
    if (!parsed.items || typeof parsed.items !== "object") return { items: {} };
    return parsed;
  } catch {
    return { items: {} };
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function notify() {
  for (const fn of listeners) fn(getState());
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  // return safe clone
  return JSON.parse(JSON.stringify(state));
}

export function cartCount() {
  return Object.values(state.items).reduce((sum, it) => sum + it.qty, 0);
}

export function getQty(productId) {
  return state.items[productId]?.qty ?? 0;
}

export function addToCart(productId, qty = 1) {
  const current = state.items[productId]?.qty ?? 0;
  const nextQty = Math.max(0, current + qty);

  if (nextQty === 0) delete state.items[productId];
  else state.items[productId] = { id: productId, qty: nextQty };

  saveCart();
  notify();
}

export function setQty(productId, qty) {
  const nextQty = Math.floor(Number(qty));
  if (!Number.isFinite(nextQty) || nextQty <= 0) {
    delete state.items[productId];
  } else {
    state.items[productId] = { id: productId, qty: nextQty };
  }
  saveCart();
  notify();
}

export function removeFromCart(productId) {
  delete state.items[productId];
  saveCart();
  notify();
}

export function clearCart() {
  state = { items: {} };
  saveCart();
  notify();
}
