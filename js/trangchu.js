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

const navbar = document.getElementById("navbar");

// Navbar mặc định khi đang tải

navbar.innerHTML = `
  <div class="logo">🏠 Trang Chủ</div>
  <div class="menu">
    <input type="text" id="navbar-search" placeholder="Tìm kiếm..." style="padding:4px 8px; border-radius:4px; border:1px solid #ccc; margin-right:10px;">
    <span>Đang tải...</span>
  </div>
`;
onAuthStateChanged(auth, async (user) => {
  if (user) {
    let role = 0; // Mặc định User
    try {
      const docRef = doc(db, "user", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        // Lấy role từ Firestore (nếu không có thì mặc định = 0)
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
          <input type="text" id="navbar-search" placeholder="Tìm kiếm..." style="padding:4px 8px; border-radius:4px; border:1px solid #ccc; margin-right:10px;">
        <span>${user.email}</span>
        <span style="margin-left:10px;">Role: ${
          role_id === 3 ? "Admin" : "User"
        }</span>
        ${
          role_id === 3
            ? `<a href="index.html" style="margin-left:10px;">Quản lý</a>`
            : ""
        }
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
          <input type="text" id="navbar-search" placeholder="Tìm kiếm..." style="padding:4px 8px; border-radius:4px; border:1px solid #ccc; margin-right:10px;">
        <a href="login.html">Đăng nhập</a>
        <a href="signup.html">Đăng ký</a>
      </div>
    `;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = `
    <h1>Chào mừng bạn đến với LMI</h1>
    <p>
      Đây là cửa hàng xe máy/xe đạp/xe điện.
    </p>
  `;
});
document.addEventListener("DOMContentLoaded", async () => {
  const theDiv = document.getElementById("the");
  // Map type sang tên tiếng Việt
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
    let html = "";
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const typeName = typeMap[data.type] || data.type;
      const engineName = engineMap[data.engine] || data.engine;
      html += `
        <a href="sp.html?id=${
          doc.id
        }" class="product-item" style="border:1px solid #ccc; border-radius:8px; padding:16px; margin-bottom:16px;text-decoration:none;">
          <h2>${data.name}</h2>
          <img src="${
            data.img ? data.img : "https://via.placeholder.com/150"
          }" alt="${data.name}" style="max-width:auto; height:auto;">
          <p>Loại: ${typeName}</p>
          <p>Động cơ: ${engineName}</p>
          <p>Giá: ${data.price.toLocaleString()} VND</p>
        </a>
      `;
    });
    theDiv.innerHTML = html || "<p>Không có sản phẩm nào.</p>";
  } catch (err) {
    theDiv.innerHTML = "<p>Lỗi tải sản phẩm.</p>";
    console.error(err);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("footer");
  footer.innerHTML = ` <p>© 2023 Công ty TNHH ABC. Bảo lưu mọi quyền.</p>`;
});
document.addEventListener("DOMContentLoaded", async () => {
  const mauXe = document.getElementById("mau-xe");
  mauXe.innerHTML = `<h2>${data.name}</h2>
          <img src="${
            data.img ? data.img : "https://via.placeholder.com/150"
          }" alt="${data.name}" style="max-width:auto; height:auto;">
          <p>Loại: ${typeName}</p>
          <p>Động cơ: ${engineName}</p>
          <p>Giá: ${data.price.toLocaleString()} VND</p>`;
});
