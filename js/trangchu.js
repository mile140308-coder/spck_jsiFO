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
    <a href="giohang.html" class="navbar-link">🛒 Giỏ hàng</a>
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

  let products = [];
  try {
    const snap = await getDocs(collection(db, "product"));
    if (snap.empty) {
      productList.innerHTML = "<p>⚠ Không có sản phẩm trong Firestore.</p>";
      return;
    }

    products = snap.docs.map((d) => {
      const v = d.data();
      return {
        id: d.id,
        name: v.name || "Sản phẩm",
        img: v.img || "",
        price: v.price || 0,
        type: v.type || "",
        engine: v.engine || "",
        brand: v.brand || "",
      };
    });

    // Khi vào trang, chỉ hiển thị tất cả sản phẩm
    renderProducts(products);

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

  // Tìm kiếm nâng cao
  const searchInput = document.getElementById("navbar-search");
  const searchBtn = document.getElementById("search-btn");

  function doSearch() {
    const keyword = searchInput.value.trim().toLowerCase();

    // Chỉ hiện sản phẩm khi nhấn Enter hoặc nút tìm kiếm
    if (!keyword) {
      productList.innerHTML = "<p>⚠ Vui lòng nhập từ khóa tìm kiếm và nhấn Enter hoặc nút tìm kiếm!</p>";
      return;
    }

    // Xử lý từ khóa đặc biệt cho loại/type
    let typeFilter = "";
    if (keyword.includes("xe đạp")) typeFilter = "bicycle";
    if (keyword.includes("xe điện") || keyword.includes("xe máy")) typeFilter = "motor";

    // Xử lý từ khóa đặc biệt cho engine
    let engineFilter = "";
    if (
      keyword.includes("không có động cơ") ||
      keyword.includes("không có")
    )
      engineFilter = "none";
    if (
      keyword.includes("động cơ điện")
    )
      engineFilter = "electric";
    if (
      keyword.includes("động cơ ga") ||
      keyword.includes("ga")
    )
      engineFilter = "gasoline";

    // Lọc dữ liệu
    const filtered = products.filter((p) => {
      // Tìm theo brand
      if (p.brand && p.brand.toLowerCase().includes(keyword)) return true;
      // Tìm theo type đặc biệt
      if (typeFilter && p.type === typeFilter) return true;
      // Tìm theo engine đặc biệt
      if (engineFilter && p.engine === engineFilter) return true;
      // Tìm theo tên sản phẩm
      if (p.name && p.name.toLowerCase().includes(keyword)) return true;
      // Tìm theo loại/type thông thường
      if (p.type && p.type.toLowerCase().includes(keyword)) return true;
      // Tìm theo engine thông thường
      if (p.engine && p.engine.toLowerCase().includes(keyword)) return true;
      return false;
    });

    renderProducts(filtered);
  }

  if (searchInput) {
    // Không render khi gõ, chỉ khi Enter hoặc nút
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        doSearch();
        searchInput.blur();
      }
    });

    // Nút "/" để trỏ nhanh vào thanh tìm kiếm
    document.addEventListener("keydown", (e) => {
      if (e.key === "/") {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // Thêm nút tìm kiếm (có chức năng tương tự Enter)
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      doSearch();
      searchInput.blur();
    });
  }

  // Hàm render sản phẩm
  function renderProducts(arr) {
    if (!arr.length) {
      productList.innerHTML = "<p>⚠ Không tìm thấy sản phẩm phù hợp.</p>";
      return;
    }
    productList.innerHTML = arr
      .map(
        (p) => `
      <div class="product-item" id="product-${p.id}">
        <a href="sp.html?id=${p.id}" class="product-link">
          <h3 class="product-name">${p.name}</h3>
        </a>
        <img src="${p.img || 'https://via.placeholder.com/150'}" alt="${p.name}" class="product-img" />
        <p class="product-price">Giá: ${(Number(p.price)||0).toLocaleString("vi-VN")} VND</p>
        <p>Thương hiệu: ${p.brand}</p>
        <p>Loại: ${p.type} | Engine: ${p.engine}</p>
        <button class="add-to-cart product-btn" data-id="${p.id}">➕ Thêm vào giỏ hàng</button>
        <div id="msg-${p.id}" class="cart-msg"></div>
      </div>
    `
      )
      .join("");
  }
});
