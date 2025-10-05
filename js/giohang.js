// js/giohang.js
import { db } from "./firebase/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { getCart, removeFromCart, clearCart } from "./cartUtils.js";

console.log("✅ giohang.js loaded");

export async function loadCart() {
  const container = document.getElementById("cartList");
  const totalContainer = document.getElementById("cartTotal");
  if (!container || !totalContainer) return;

  container.innerHTML = "";
  totalContainer.innerHTML = "";

  const cart = getCart();
  if (!cart.length) {
    container.innerHTML = "<p class='empty-cart'>🛒 Giỏ hàng trống.</p>";
    totalContainer.innerHTML = "";
    return;
  }

  let total = 0;
  for (const item of cart) {
    try {
      const prodRef = doc(db, "product", item.id);
      const prodSnap = await getDoc(prodRef);
      if (!prodSnap.exists()) {
        console.warn("Không tìm thấy product id:", item.id);
        continue;
      }

      const p = prodSnap.data();
      const itemTotal = (Number(p.price) || 0) * item.quantity;
      total += itemTotal;

      const card = document.createElement("div");
      card.className = "cart-item";
      card.innerHTML = `
        <img src="${p.img || "https://via.placeholder.com/150"}" alt="${p.name || ""}">
        <div class="item-info">
          <h3>${p.name || ""}</h3>
          <p>Giá: ${(Number(p.price) || 0).toLocaleString("vi-VN")} VND</p>
          <p>Số lượng: x${item.quantity}</p>
          <p>Tổng: ${itemTotal.toLocaleString("vi-VN")} VND</p>
        </div>
        <button class="remove-item" data-id="${item.id}">🗑️ Xóa</button>
      `;
      container.appendChild(card);

      card.querySelector(".remove-item").addEventListener("click", () => {
        removeFromCart(item.id);
        loadCart();
      });
    } catch (e) {
      console.error("Lỗi khi load item", item.id, e);
    }
  }

  // === Thanh tổng tiền cố định ===
  const totalDiv = document.createElement("div");
  totalDiv.className = "cart-total-fixed";
  totalDiv.innerHTML = `
    <div class="cart-total-content">
      <h3>Tổng cộng: ${(total || 0).toLocaleString("vi-VN")} VND</h3>
      <div class="cart-buttons">
        <button id="checkoutBtn" class="btn-pay">💳 Thanh toán</button>
        <button id="clearCartBtn" class="btn-clear">🧹 Xóa toàn bộ</button>
      </div>
    </div>
  `;
  totalContainer.appendChild(totalDiv);

  // 🧹 Sự kiện nút “Xóa toàn bộ”
  document.getElementById("clearCartBtn").addEventListener("click", () => {
    if (confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      clearCart();
      loadCart();
    }
  });

  // 💳 Sự kiện nút “Thanh toán” → chuyển hướng sang thanhtoan.html
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    window.location.href = "thanhtoan.html";
  });
}

// Tự động load khi có #cartList
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cartList")) {
    loadCart();
  }
});
