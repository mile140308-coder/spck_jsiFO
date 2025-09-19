// js/trangchu.js
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { auth, db } from "./firebase/firebase-config.js";
import { addToCart } from "./cartUtils.js"; // <-- đúng: từ cartUtils

console.log("✅ trangchu.js loaded");

const navbar = document.getElementById("navbar");
const footer = document.getElementById("footer");
let currentUser = null;

function renderNavbarLoggedOut() {
  if (!navbar) return;
  navbar.innerHTML = `
    <div class="navbar-container">
      <a href="trangchu.html" class="navbar-logo">🏠 Trang Chủ</a>
      <div class="navbar-menu">
        <input type="text" id="navbar-search" placeholder="Tìm kiếm sản phẩm..." style="padding:4px 8px; border-radius:4px; border:1px solid #ccc; margin-right:10px;">
        <a href="login.html">Đăng nhập</a>
        <a href="signup.html" style="margin-left:10px;">Đăng ký</a>
      </div>
    </div>
  `;
}

function renderNavbarLoggedIn(email) {
  if (!navbar) return;
  navbar.innerHTML = `
    <div class="navbar-container">
      <a href="trangchu.html" class="navbar-logo">🏠 Trang Chủ</a>
      <div class="navbar-menu">
        <input type="text" id="navbar-search" placeholder="Tìm kiếm sản phẩm..." style="padding:4px 8px; border-radius:4px; border:1px solid #ccc; margin-right:10px;">
        <span style="margin-right:10px;">${email}</span>
        <button id="logoutBtn" style="margin-left:10px;">Đăng xuất</button>
      </div>
    </div>
  `;
  // Thêm sự kiện logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await signOut(auth);
      location.reload();
    };
  }
}

renderNavbarLoggedOut();
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  if (user) renderNavbarLoggedIn(user.email);
  else renderNavbarLoggedOut();
});

document.addEventListener("DOMContentLoaded", async () => {
  if (footer) footer.innerHTML = `<p>© 2025 Cửa Hàng Xe</p>`;

  const productList = document.getElementById("the");
  if (!productList) {
    console.error("Không tìm thấy #the");
    return;
  }
  productList.innerHTML = `<p>⏳ Đang tải...</p>`;

  try {
    const snap = await getDocs(collection(db, "product")); // đúng collection 'product'
    if (snap.empty) {
      productList.innerHTML = "<p>⚠ Không có sản phẩm trong Firestore.</p>";
      return;
    }

    const products = snap.docs.map((d) => {
      const v = d.data();
      return {
        id: d.id,
        name: v.name || "Sản phẩm",
        img: v.img || "",
        price: v.price || 0,
        type: v.type || "",
        engine: v.engine || "",
      };
    });

    productList.innerHTML = products
      .map(
        (p) => `
      <div class="product-item">
        <a href="sp.html?id=${p.id}">
          <h3>${p.name}</h3>
        </a>
        <img src="${p.img || 'https://via.placeholder.com/150'}" alt="${p.name}" style="max-width:200px;">
        <p>Giá: ${(Number(p.price)||0).toLocaleString("vi-VN")} VND</p>
        <button class="add-to-cart" data-id="${p.id}">➕ Thêm vào giỏ hàng</button>
        <div id="msg-${p.id}" class="cart-msg"></div>
      </div>
    `
      )
      .join("");

    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const msg = document.getElementById(`msg-${id}`);
        if (!currentUser) {
          if (msg) { msg.style.color = "orange"; msg.textContent = "⚠ Vui lòng đăng nhập."; setTimeout(()=>msg.textContent='',2500); }
          else alert("Vui lòng đăng nhập.");
          return;
        }
        addToCart(id);
        if (msg) { msg.style.color = "#4caf50"; msg.textContent = "✅ Đã thêm vào giỏ hàng"; setTimeout(()=>msg.textContent='',2000); }
      });
    });
  } catch (e) {
    console.error("Lỗi khi lấy products:", e);
    productList.innerHTML = "<p>❌ Lỗi tải sản phẩm.</p>";
  }
});
