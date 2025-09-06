// js/cartUtils.js
// Nhẹ: lưu giỏ trong localStorage (id, quantity)
export function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find((it) => it.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart(cart);
  console.log("cartUtils: added", productId, getCart());
  return getCart();
}

export function removeFromCart(productId) {
  const cart = getCart().filter((it) => it.id !== productId);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  localStorage.removeItem("cart");
}
