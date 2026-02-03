import { cartCount, subscribe } from "./store.js";

export function mountCartBadge() {
  const el = document.querySelector("#cartCount");
  if (!el) return;

  const render = () => {
    el.textContent = String(cartCount());
  };

  render();
  subscribe(render);
}
