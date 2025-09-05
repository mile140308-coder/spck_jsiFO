// === Import Firestore từ file config ===
import { db } from "./js/firebase/firebase-config.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { userSession } from "./userSession.js";
// === Map giống trangchu.js ===
const typeMap = {
  motor: "Xe máy",
  bicycle: "Xe đạp",
};
const engineMap = {
  none: "Không có động cơ",
  electric: "điện",
  gasoline: "xăng",
};

// === Hàm định dạng VND ===
function formatCurrency(price) {
  return Number(price).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

// === Thêm vào giỏ hàng (localStorage) ===
function addToCart(productId) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("✅ Đã thêm vào giỏ hàng!");
}

// === Xóa sản phẩm khỏi giỏ ===
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// === Xóa toàn bộ giỏ ===
function clearCart() {
  localStorage.removeItem("cart");
  loadCart();
}

// === Lấy toàn bộ dữ liệu từ Firestore (collection: data) ===
async function fetchAllData() {
  const querySnapshot = await getDocs(collection(db, "data"));
  let products = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    products.push({
      id: docSnap.id,
      ...data,
      typeName: typeMap[data.type] || data.type,
      engineName: engineMap[data.engine] || data.engine,
    });
  });
  return products;
}

// === Hiển thị giỏ hàng ===
async function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cartList");
  const totalContainer = document.getElementById("cartTotal");
  if (!container || !totalContainer) return;

  container.innerHTML = "";
  totalContainer.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>🛒 Giỏ hàng trống.</p>";
    return;
  }

  try {
    const products = await fetchAllData();
    let total = 0;

    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return;

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      const card = document.createElement("div");
      card.className = "product-card";
      card.style = "border:1px solid #ccc; padding:12px; margin:8px; border-radius:8px;";
      card.innerHTML = `
        <img src="${product.img || "https://via.placeholder.com/150"}" 
             alt="${product.name}" 
             class="product-img" 
             style="max-width:150px; height:auto;">
        <h3>${product.name}</h3>
        <p>Loại: ${product.typeName}</p>
        <p>Động cơ: ${product.engineName}</p>
        <p>Giá: ${formatCurrency(product.price)}</p>
        <p>Số lượng: x${item.quantity}</p>
        <p>Tổng: ${formatCurrency(itemTotal)}</p>
        <button class="btn remove-item" data-id="${item.id}">🗑️ Xóa</button>
      `;
      container.appendChild(card);

      card.querySelector(".remove-item").addEventListener("click", () => {
        removeFromCart(item.id);
      });
    });

    const totalDiv = document.createElement("div");
    totalDiv.className = "cart-summary";
    totalDiv.innerHTML = `
      <hr>
      <h3>Tổng cộng: ${formatCurrency(total)}</h3>
      <button class="btn btn-buy" id="buyBtn">🛒 Mua hàng</button>
      <button class="btn" id="clearCartBtn">🧹 Xóa toàn bộ giỏ hàng</button>
    `;
    totalContainer.appendChild(totalDiv);

    document.getElementById("clearCartBtn").addEventListener("click", () => {
      if (confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
        clearCart();
      }
    });

    document.getElementById("buyBtn").addEventListener("click", () => {
      if (confirm(`Xác nhận mua hàng với tổng ${formatCurrency(total)}?`)) {
        alert("🎉 Cảm ơn bạn đã mua hàng!");
        clearCart();
      }
    });
  } catch (error) {
    console.error("Lỗi tải giỏ hàng:", error);
    container.innerHTML = "<p>❌ Lỗi tải dữ liệu sản phẩm.</p>";
  }
}

// === Khi DOM sẵn sàng thì load giỏ ===
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cartList")) {
    loadCart();
  }
});

export { addToCart, removeFromCart, clearCart, loadCart };