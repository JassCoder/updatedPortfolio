export const TAX_RATE = 0.1;

export const products = [
  {
    id: "p1",
    name: "Nebula Hoodie",
    price: 59.99,
    category: "Apparel",
    emoji: "🪐",
    description: "Soft, warm, and scientifically proven to make you look busy.",
  },
  {
    id: "p2",
    name: "Quantum Sneakers",
    price: 89.0,
    category: "Footwear",
    emoji: "👟",
    description: "They may or may not be on your feet until observed.",
  },
  {
    id: "p3",
    name: "Minimal Backpack",
    price: 42.5,
    category: "Bags",
    emoji: "🎒",
    description: "Carries your laptop, charger, and emotional baggage.",
  },
  {
    id: "p4",
    name: "Ceramic Mug",
    price: 14.25,
    category: "Home",
    emoji: "☕",
    description: "Holds coffee. Also holds your life together.",
  },
  {
    id: "p5",
    name: "Desk Plant",
    price: 18.0,
    category: "Home",
    emoji: "🪴",
    description: "Low-maintenance, unlike most things.",
  },
  {
    id: "p6",
    name: "Noise Cancelling",
    price: 129.99,
    category: "Electronics",
    emoji: "🎧",
    description: "Turns the world off. Highly recommended.",
  },
  {
    id: "p7",
    name: "Mechanical Keyboard",
    price: 99.95,
    category: "Electronics",
    emoji: "⌨️",
    description: "Clicky keys for clicky thoughts.",
  },
  {
    id: "p8",
    name: "Water Bottle",
    price: 22.0,
    category: "Fitness",
    emoji: "🚰",
    description: "Hydration, now in portable form.",
  },
];

export function getProductById(id) {
  return products.find((p) => p.id === id) || null;
}
