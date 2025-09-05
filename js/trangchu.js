import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { auth, db } from "./firebase/firebase-config.js";
import { userSession } from "../js/userSession.js";
import { addToCart, updateCartBadge } from "./giohang.js";

const navbar = document.getElementById("navbar");

// Navbar mặc định khi đang tải
navbar.innerHTML = `
  <div class="logo">🏠 Trang Chủ</div>
  <div class="menu">
    <input type="text" id="navbar-search" placeholder="Tìm kiếm..." style="padding:4px 8px; border-radius:4px; border:1px solid #ccc; margin-right:6px;">
    <button id="navbar-search-btn" style="padding:4px 10px; border:1px solid #ccc; border-radius:4px; cursor:pointer;">🔍</button>
    <span>Đang tải...</span>
  </div>
`;

let allProducts = []; // Dùng toàn cục cho tìm kiếm

onAuthStateChanged(auth, async (user) => {
  if (user) {
    let role = 0; // Mặc định User
    try {
      const docRef = doc(db, "user", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        role = Number(userData.role) || 0;
      } else {
        console.warn("Không tìm thấy thông tin user trong Firestore");
      }
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu Firestore:", err);
    }

    renderNavbar(user, role);
  } else {
    renderNavbar(null, 0);
  }
});

function renderNavbar(user, role_id) {
  if (user) {
    navbar.innerHTML = `
      <div class="logo">🏠 Trang Chủ</div>
      <div class="menu">
          <input type="text" id="navbar-search" placeholder="Tìm kiếm..." style="padding:4px 8px; border-radius:4px; border:1px solid #ccc; margin-right:6px;">
          <button id="navbar-search-btn" style="padding:4px 10px; border:1px solid #ccc; border-radius:4px; cursor:pointer;">🔍</button>
        <a href="giohang.html" id="cart-link">🛒 Giỏ hàng <span id="cart-count">0</span></a>
        <span>${user.email}</span>
        <span style="margin-left:10px;">Role: ${role_id === 3 ? "Admin" : "User"}</span>
        ${role_id === 3 ? `<a href="../index.html" style="margin-left:10px;">Quản lý</a>` : ""}
        <button id="logoutBtn" style="margin-left:10px;">Đăng xuất</button>
      </div>
    `;
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await signOut(auth);
      location.reload();
    });
  } else {
    navbar.innerHTML = `
      <div class="logo">🏠 Trang Chủ</div>
      <div class="menu">
          <input type="text" id="navbar-search" placeholder="Tìm kiếm..." style="padding:4px 8px; border-radius:4px; border:1px solid #ccc; margin-right:6px;">
          <button id="navbar-search-btn" style="padding:4px 10px; border:1px solid #ccc; border-radius:4px; cursor:pointer;">🔍</button>
        <a href="giohang.html" id="cart-link">🛒 Giỏ hàng <span id="cart-count">0</span></a>
        <a href="login.html">Đăng nhập</a>
        <a href="signup.html">Đăng ký</a>
      </div>
    `;
  }

  // 👉 Cập nhật số lượng giỏ hàng khi render navbar
  updateCartBadge();

  // Gán lại sự kiện tìm kiếm cho input, nút và phím tắt "/"
  setTimeout(() => {
    const searchInput = document.getElementById("navbar-search");
    const searchBtn = document.getElementById("navbar-search-btn");

    function doSearch() {
      const keyword = searchInput.value.trim().toLowerCase();
      const filtered = allProducts.filter((sp) => {
        const nameLower = sp.name ? sp.name.toLowerCase() : "";
        const typeNameLower = sp.typeName ? sp.typeName.toLowerCase() : "";
        return nameLower.includes(keyword) || typeNameLower.includes(keyword);
      });
      renderProducts(filtered);
    }

    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          doSearch();
        }
      });
    }
    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        doSearch();
      });
    }

    // ⌨️ Phím tắt "/" để focus vào ô tìm kiếm
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== searchInput) {
        e.preventDefault(); // chặn ký tự "/" xuất hiện
        searchInput.focus();
      }
    });
  }, 0);
}

// Nội dung chính trang
document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = `
    <h1>Chào mừng bạn đến với LMI</h1>
    <p>
      Đây là cửa hàng xe máy/xe đạp/xe điện.
    </p>
  `;
});

// Lấy danh sách sản phẩm từ Firestore
document.addEventListener("DOMContentLoaded", async () => {
  const theDiv = document.getElementById("the");

  const typeMap = {
    motor: "Xe máy",
    bicycle: "Xe đạp",
  };
  const engineMap = {
    none: "Không có động cơ",
    electric: "điện",
    gasoline: "xăng",
  };

  try {
    const querySnapshot = await getDocs(collection(db, "product"));
    allProducts = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      allProducts.push({
        id: docSnap.id,
        ...data,
        typeName: typeMap[data.type] || data.type,
        engineName: engineMap[data.engine] || data.engine,
      });
    });

    renderProducts(allProducts);
  } catch (err) {
    theDiv.innerHTML = "<p>Lỗi tải sản phẩm.</p>";
    console.error(err);
  }

  function renderProducts(products) {
    if (!products.length) {
      theDiv.innerHTML = "<p>Không có sản phẩm nào.</p>";
      return;
    }
    let html = "";
    products.forEach((data) => {
      html += `
        <div class="product-item" 
             style="border:1px solid #ccc; border-radius:8px; padding:16px; margin-bottom:16px;">
          <a href="sp.html?id=${data.id}" style="text-decoration:none; color:inherit;">
            <h2>${data.name}</h2>
            <img src="${data.img ? data.img : "https://via.placeholder.com/150"}" 
                 alt="${data.name}" style="max-width:auto; height:auto;">
            <p>Loại: ${data.typeName}</p>
            <p>Động cơ: ${data.engineName}</p>
            <p>Giá: ${data.price.toLocaleString()} VND</p>
          </a>
          <button class="add-to-cart" data-id="${data.id}" 
                  style="margin-top:10px; padding:6px 12px; border:none; border-radius:4px; background:#28a745; color:white; cursor:pointer;">
            🛒 Thêm vào giỏ
          </button>
        </div>
      `;
    });
    theDiv.innerHTML = html || "<p>Không có sản phẩm nào.</p>";

    // 👉 Gắn sự kiện cho nút "Thêm vào giỏ"
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        addToCart(id); // gọi từ giohang.js
        updateCartBadge(); // cập nhật badge số lượng
      });
    });
  }

  window.renderProducts = renderProducts;
});

// Footer
document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("footer");
  footer.innerHTML = ` <p>© 2023 Công ty TNHH ABC. Bảo lưu mọi quyền.</p>`;
});
