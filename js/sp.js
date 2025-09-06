// js/sp.js
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { db } from "./firebase/firebase-config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const mauXe = document.getElementById("mau-xe");
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) { if (mauXe) mauXe.innerHTML = "<p>Không tìm thấy sản phẩm.</p>"; return; }

  try {
    const docRef = doc(db, "product", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) { mauXe.innerHTML = "<p>Không tìm thấy sản phẩm.</p>"; return; }
    const data = snap.data();
    mauXe.innerHTML = `
      <h2>${data.name}</h2>
      <img src="${data.img || 'https://via.placeholder.com/150'}" alt="${data.name}" style="max-width:300px;">
      <p>Giá: ${(Number(data.price)||0).toLocaleString("vi-VN")} VND</p>
      <a href="trangchu.html">← Quay về</a>
    `;
  } catch (e) {
    console.error(e);
    if (mauXe) mauXe.innerHTML = "<p>Lỗi tải sản phẩm.</p>";
  }
});
