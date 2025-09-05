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
import { userSession } from "./userSession.js";

console.log("✅ trangchu.js đã load");

// Lấy phần tử Navbar
const navbar = document.getElementById("navbar");

// Navbar mặc định khi đang tải
if (navbar) {
  navbar.innerHTML = `
    <div class="logo">🏠 Trang Chủ</div>
    <div class="menu">
      <input type="text" id="navbar-search" placeholder="Tìm kiếm..." style="padding:4px 8px; border-radius:4px; border:1px solid #ccc; margin-right:6px;">
      <button id="navbar-search-btn" style="padding:4px 10px; border:1px solid #ccc; border-radius:4px; cursor:pointer;">🔍</button>
      <span>Đang tải...</span>
    </div>
  `;
} else {
  console.error("❌ Không tìm thấy phần tử #navbar trong HTML");
}

let allProducts = []; // Dùng toàn cục cho tìm kiếm

// Lắng nghe trạng thái đăng nhập
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
        console.warn("⚠ Không tìm thấy thông tin user trong Firestore");
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy dữ liệu Firestore:", err);
    }

    renderNavbar(user, role);
  } else {
    renderNavbar(null, 0);
  }
});

function renderNavbar(user, role_id) {
  if (!navbar) return;
  if (user) {
    navbar.innerHTML = `
      <div class="logo">🏠 Trang Chủ</div>
      <div class="menu">
          <input type="text" id="navbar-search" placeholder="Tìm kiếm..." style="padding:4px 8px; border-radius:4px; border:1px solid #ccc; margin-right:6px;">
          <button id="navbar-search-btn" style="padding:4px 10px; border:1px solid #ccc; border-radius:4px; cursor:pointer;">🔍</button>
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
        <a href="login.html">Đăng nhập</a>
        <a href="signup.html">Đăng ký</a>
      </div>
    `;
  }
}

// Nội dung chính trang
document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.innerHTML = `
      <h1>Danh sách sản phẩm</h1>
      <p>Khám phá các sản phẩm xe máy, xe đạp, xe điện mới nhất!</p>
      <div id="product-list"></div>
    `;
  } else {
    console.error("❌ Không tìm thấy #main-content trong HTML");
  }
});

// Lấy danh sách sản phẩm từ Firestore
document.addEventListener("DOMContentLoaded", async () => {
  const productList = document.getElementById("product-list");
  if (!productList) {
    console.error("❌ Không tìm thấy #product-list trong HTML");
    return;
  }

  const typeMap = {
    motor: "Xe máy",
    bicycle: "Xe đạp",
  };
  const engineMap = {
    none: "Không có động cơ",
    electric: "Điện",
    gasoline: "Xăng",
  };

  try {
    const querySnapshot = await getDocs(collection(db, "product"));
    allProducts = [];
    console.log("📦 Số sản phẩm lấy được:", querySnapshot.size);

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      console.log("➡ Sản phẩm:", data);
      allProducts.push({
        id: docSnap.id,
        ...data,
        typeName: typeMap[data.type] || data.type,
        engineName: engineMap[data.engine] || data.engine,
      });
    });

    renderProducts(allProducts);
  } catch (err) {
    productList.innerHTML = "<p>❌ Lỗi tải sản phẩm.</p>";
    console.error(err);
  }

  function renderProducts(products) {
    if (!products.length) {
      productList.innerHTML = "<p>⚠ Không có sản phẩm nào.</p>";
      return;
    }
    let html = "";
    products.forEach((data) => {
      html += `
        <a href="sp.html?id=${
          data.id
        }" class="product-item" style="border:1px solid #ccc; border-radius:8px; padding:16px; margin-bottom:16px;text-decoration:none; display:block;">
          <h2>${data.name}</h2>
          <img src="${
            data.img ? data.img : "https://via.placeholder.com/150"
          }" alt="${data.name}" style="max-width:200px; height:auto;">
          <p>Loại: ${data.typeName}</p>
          <p>Động cơ: ${data.engineName}</p>
          <p>Giá: ${data.price ? data.price.toLocaleString() : 0} VND</p>
        </a>
      `;
    });
    productList.innerHTML = html;
  }

  window.renderProducts = renderProducts;
});

// Footer
document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("footer");
  if (footer) {
    footer.innerHTML = `<p>© 2023 Công ty TNHH ABC. Bảo lưu mọi quyền.</p>`;
  }
});
