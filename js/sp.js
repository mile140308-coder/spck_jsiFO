// js/sp.js
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { db } from "./firebase/firebase-config.js";

// Hàm hiển thị loại sản phẩm như trangchu.js
function getProductDisplayName(type, engine) {
  if (type === "Xe đạp") {
    if (engine === "Không có động cơ") return "Xe đạp";
    if (engine === "Động cơ điện") return "Xe đạp điện";
    if (engine === "Động cơ ga") return "Xe đạp ga";
  }
  if (type === "Xe máy") {
    if (engine === "Động cơ ga") return "Xe máy ga";
    if (engine === "Động cơ điện") return "Xe máy điện";
    if (engine === "Không có động cơ") return "Xe máy";
  }
  return `${type} ${engine}`.trim();
}

document.addEventListener("DOMContentLoaded", async () => {
  const mauXe = document.getElementById("mau-xe");
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) { if (mauXe) mauXe.innerHTML = "<p>Không tìm thấy sản phẩm.</p>"; return; }

  try {
    const docRef = doc(db, "product", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) { mauXe.innerHTML = "<p>Không tìm thấy sản phẩm.</p>"; return; }
    const data = snap.data();

    // Chuyển type/engine sang tiếng Việt như trangchu.js
    const theLoai = { motor: "Xe máy", bicycle: "Xe đạp" }[data.type] || data.type || "";
    const dongCo = { none: "Không có động cơ", electric: "Động cơ điện", gasoline: "Động cơ ga" }[data.engine] || data.engine || "";

    mauXe.innerHTML = `
      <h2>${data.name}</h2>
      <img src="${data.img || 'https://via.placeholder.com/150'}" alt="${data.name}" style="max-width:300px;">
      <p class="product-price">Giá: ${(Number(data.price)||0).toLocaleString("vi-VN")} VND</p>
      <p>Thương hiệu: ${data.brand || ""}</p>
      <p>Loại: ${getProductDisplayName(theLoai, dongCo)}</p>
      <a href="trangchu.html">← Quay về</a>
    `;
  } catch (e) {
    console.error(e);
    if (mauXe) mauXe.innerHTML = "<p>Lỗi tải sản phẩm.</p>";
  }
});
