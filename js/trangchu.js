// js/trangchu.js
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { auth, db } from "./firebase/firebase-config.js";
import { addToCart } from "./cartUtils.js";
import { userSession } from "./userSession.js";
console.log("✅ trangchu.js loaded");

const navbar = document.getElementById("navbar");
const footer = document.getElementById("footer");
let currentUser = null;

function renderNavbarLoggedOut() {
  if (!navbar) return;
  navbar.className = "navbar";
  navbar.innerHTML = `
    <div class="logo">🏠 Trang Chủ</div>
    <div class="menu">
      <input type="text" id="navbar-search" class="navbar-search" placeholder="Tìm kiếm sản phẩm..." />
      <a href="login.html" class="navbar-link">Đăng nhập</a>
      <a href="signup.html" class="navbar-link">Đăng ký</a>
    </div>
  `;
}

async function renderNavbarLoggedIn(email, role) {
  if (!navbar) return;
  navbar.className = "navbar";
  navbar.innerHTML = `
    <div class="logo">🏠 Trang Chủ</div>
    <div class="menu">
      <input type="text" id="navbar-search" class="navbar-search" placeholder="Tìm kiếm sản phẩm..." />
      <span class="navbar-user">${email}</span>
      ${
        role === 3
          ? `<a href="../index.html" class="navbar-link" style="margin-left:10px;">Quản lý</a>`
          : ""
      }
      <button id="logoutBtn" class="navbar-btn">Đăng xuất</button>
    </div>
  `;
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await signOut(auth);
      location.reload();
    };
  }
}

renderNavbarLoggedOut();
onAuthStateChanged(auth, async (user) => {
  currentUser = user || null;
  if (user) {
    // Lấy role từ Firestore
    let role = 0;
    try {
      const docRef = doc(db, "user", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        role = Number(userData.role) || 0;
      }
    } catch (err) {
      console.error("Không lấy được role:", err);
    }
    renderNavbarLoggedIn(user.email, role);
  } else {
    renderNavbarLoggedOut();
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  if (footer) footer.classList.add("footer");
  if (footer) footer.innerHTML = `<p>© 2025 Cửa Hàng Xe</p>`;

  const productList = document.getElementById("the");
  if (!productList) {
    console.error("Không tìm thấy #the");
    return;
  }
  productList.classList.add("product-list");
  productList.innerHTML = `<p>⏳ Đang tải...</p>`;

  try {
    const snap = await getDocs(collection(db, "product"));
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
      <div class="product-item" id="product-${p.id}">
        <a href="sp.html?id=${p.id}" class="product-link">
          <h3 class="product-name">${p.name}</h3>
        </a>
        <img src="${p.img || 'https://via.placeholder.com/150'}" alt="${p.name}" class="product-img" />
        <p class="product-price">Giá: ${(Number(p.price)||0).toLocaleString("vi-VN")} VND</p>
        <button class="add-to-cart product-btn" data-id="${p.id}">➕ Thêm vào giỏ hàng</button>
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
