import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { db } from "./firebase/firebase-config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const mauXe = document.getElementById("mau-xe");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

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

  if (!id) {
    mauXe.innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
    return;
  }

  try {
    const docRef = doc(db, "product", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const typeName = typeMap[data.type] || data.type;
      const engineName = engineMap[data.engine] || data.engine;
      mauXe.innerHTML = `
        <h2>${data.name}</h2>
        <img src="${
          data.img ? data.img : "https://via.placeholder.com/150"
        }" alt="${data.name}" style="max-width:300px; height:auto;">
        <p>Loại: ${typeName}</p>
        <p>Động cơ: ${engineName}</p>
        <p>Giá: ${data.price.toLocaleString()} VND</p>
      `;
    } else {
      mauXe.innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
    }
  } catch (err) {
    mauXe.innerHTML = "<p>Lỗi tải sản phẩm.</p>";
    console.error(err);
  }
});
