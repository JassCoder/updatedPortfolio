import { products } from "../data.js";
import { addToCart } from "../store.js";
import { formatMoney, escapeHtml } from "../utils.js";
import { mountCartBadge } from "../ui.js";

mountCartBadge();

const grid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");

function sortProducts(list, mode) {
  const arr = [...list];
  switch (mode) {
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "name-asc":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return arr; // featured = original order
  }
}

function filterProducts(list, q) {
  const query = q.trim().toLowerCase();
  if (!query) return list;
  return list.filter(p =>
    `${p.name} ${p.category}`.toLowerCase().includes(query)
  );
}

function render(list) {
  grid.innerHTML = list
    .map(
      p => `
      <article class="card">
        <a href="./product.html?id=${encodeURIComponent(p.id)}" class="card__img" aria-label="${escapeHtml(p.name)}">
          ${escapeHtml(p.emoji)}
        </a>
        <div class="card__body">
          <h3 class="card__title">${escapeHtml(p.name)}</h3>
          <div class="card__meta">
            <span>${escapeHtml(p.category)}</span>
            <span class="price">${formatMoney(p.price)}</span>
          </div>
          <div style="margin-top:10px">
            <button class="btn" data-add="${escapeHtml(p.id)}">Add to cart</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add, 1));
  });
}

function update() {
  const filtered = filterProducts(products, searchInput.value);
  const sorted = sortProducts(filtered, sortSelect.value);
  render(sorted);
}

searchInput.addEventListener("input", update);
sortSelect.addEventListener("change", update);

update();
