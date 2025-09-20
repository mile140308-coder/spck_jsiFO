import { db } from "./firebase/firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { userSession } from "./userSession.js";
console.log("✅ admin.js loaded");

//=== Thêm dữ liệu sản phẩm vào Firestore ===
window.addProduct = async function ({ engine, img, name, price, type, brand }) {
  try {
    const docRef = await addDoc(collection(db, "product"), {
      engine,
      img,
      name,
      price,
      type,
      brand, // thêm trường thương hiệu
    });
    console.log("Đã thêm sản phẩm với ID:", docRef.id);
    alert("✅ Sản phẩm đã được thêm vào Firestore!");
    window.renderProductList();
  } catch (e) {
    console.error("Lỗi khi thêm document:", e);
    alert("❌ Lỗi khi thêm sản phẩm!");
  }
};

// Gửi ảnh lên Cloudinary (hỗ trợ cả kéo/thả và chọn file)
window.uploadToCloudinary = async function (file) {
  if (!file || !(file instanceof File)) {
    alert("File không hợp lệ!");
    return "";
  }
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "SPLMIAU");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/da1idy1xu/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Không thể upload lên Cloudinary!");
    }

    const result = await response.json();

    if (result.secure_url) {
      console.log("Cloudinary URL:", result.secure_url);
      return result.secure_url;
    } else {
      throw new Error(
        `Upload thất bại: ${result.error?.message || "Không rõ lỗi"}`
      );
    }
  } catch (error) {
    alert("Lỗi upload ảnh lên Cloudinary!");
    console.error(error);
    return "";
  }
};

// Hiển thị danh sách sản phẩm Firestore, có nút sửa/xóa
window.renderProductList = async function () {
  const listDiv = document.getElementById("product-list");
  if (!listDiv) return;
  listDiv.innerHTML = `<h3>Danh sách sản phẩm</h3>`;

  const querySnapshot = await getDocs(collection(db, "product"));
  if (querySnapshot.empty) {
    listDiv.innerHTML += "<p>Không có sản phẩm nào.</p>";
    return;
  }

  const products = querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name || "Sản phẩm",
      img: data.img || "",
      price: data.price || 0,
      type: data.type || "",
      engine: data.engine || "",
      brand: data.brand || "", // lấy trường thương hiệu
    };
  });

  listDiv.innerHTML += products
    .map(
      (p) => `
      <div class="product-item" id="product-${p.id}">
        <a href="sp.html?id=${p.id}" class="product-link">
          <h3 class="product-name">${p.name}</h3>
        </a>
        <img src="${p.img || "https://via.placeholder.com/150"}" alt="${p.name}" class="product-img" />
        <p class="product-price">Giá: ${(Number(p.price) || 0).toLocaleString("vi-VN")} VND</p>
        <p>Loại: ${p.type} | Engine: ${p.engine}</p>
        <p>Thương hiệu: ${p.brand}</p>
        <button class="edit-btn product-btn" data-id="${p.id}">✏️ Sửa</button>
        <button class="delete-btn product-btn" data-id="${p.id}">🗑️ Xóa</button>
        <div id="msg-${p.id}" class="edit-msg"></div>
        <div id="edit-form-${p.id}" style="margin-top:10px;"></div>
        <hr>
      </div>
    `
    )
    .join("");

  // Gán sự kiện xóa
  listDiv.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = async () => {
      if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        await deleteDoc(doc(db, "product", btn.dataset.id));
        alert("Đã xóa!");
        window.renderProductList();
      }
    };
  });

  // Gán sự kiện sửa
  listDiv.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.onclick = async () => {
      const docRef = doc(db, "product", btn.dataset.id);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      showEditForm(btn.dataset.id, data);
    };
  });
};

// Hiển thị form sửa sản phẩm (form nằm ngay dưới sản phẩm đang sửa)
function showEditForm(id, data) {
  const formDiv = document.getElementById(`edit-form-${id}`);
  if (!formDiv) return;
  formDiv.innerHTML = `
    <div class="edit-form-box" style="background:#f9f9f9;padding:10px;border:1px solid #ccc;">
      <h4>Chỉnh sửa sản phẩm</h4>
      <label>Tên: <input id="edit-name-${id}" value="${data.name}" /></label><br>
      <label>Giá: <input id="edit-price-${id}" value="${data.price}" type="number" /></label><br>
      <label>Loại: <input id="edit-type-${id}" value="${data.type}" /></label><br>
      <label>Engine: <input id="edit-engine-${id}" value="${data.engine}" /></label><br>
      <label>Thương hiệu: <input id="edit-brand-${id}" value="${data.brand || ""}" /></label><br>
      <label>Ảnh: <input id="edit-img-${id}" value="${data.img}" /></label><br>
      <button id="save-edit-${id}" class="product-btn">💾 Lưu</button>
      <button id="cancel-edit-${id}" class="product-btn">❌ Hủy</button>
    </div>
  `;
  document.getElementById(`save-edit-${id}`).onclick = async () => {
    await updateDoc(doc(db, "product", id), {
      name: document.getElementById(`edit-name-${id}`).value,
      price: Number(document.getElementById(`edit-price-${id}`).value),
      type: document.getElementById(`edit-type-${id}`).value,
      engine: document.getElementById(`edit-engine-${id}`).value,
      brand: document.getElementById(`edit-brand-${id}`).value,
      img: document.getElementById(`edit-img-${id}`).value,
    });
    alert("Đã cập nhật!");
    formDiv.innerHTML = "";
    window.renderProductList();
  };
  document.getElementById(`cancel-edit-${id}`).onclick = () => {
    formDiv.innerHTML = "";
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("file-input");
  const uploadBtn = document.getElementById("upload-btn");
  const imagePreview = document.getElementById("image-preview");
  const uploadArea = document.getElementById("upload-area");
  const statusDiv = document.getElementById("upload-status");

  let chooseBtn = document.getElementById("choose-btn");
  if (!chooseBtn && uploadArea) {
    chooseBtn = document.createElement("button");
    chooseBtn.id = "choose-btn";
    chooseBtn.className = "upload-btn";
    chooseBtn.type = "button";
    chooseBtn.textContent = "📁 Chọn File";
    uploadArea.appendChild(chooseBtn);
  }

  if (chooseBtn) {
    chooseBtn.addEventListener("click", () => fileInput.click());
  }

  if (uploadArea) {
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.style.background = "#444";
    });
    uploadArea.addEventListener("dragleave", (e) => {
      e.preventDefault();
      uploadArea.style.background = "";
    });
    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.style.background = "";
      const file = e.dataTransfer.files[0];
      if (file) {
        fileInput.files = e.dataTransfer.files;
        previewAndEnableUpload(file);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) previewAndEnableUpload(file);
    });
  }

  function previewAndEnableUpload(file) {
    if (!file.type.startsWith("image/")) {
      showStatus("Vui lòng chọn file ảnh!", "error");
      fileInput.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showStatus("File quá lớn! Vui lòng chọn file nhỏ hơn 10MB.", "error");
      fileInput.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
      uploadBtn.style.display = "inline-block";
      chooseBtn.textContent = "📁 Chọn File Khác";
    };
    reader.readAsDataURL(file);
  }

  if (uploadBtn) {
    uploadBtn.addEventListener("click", async () => {
      const file = fileInput.files[0];
      if (!file) {
        showStatus("Vui lòng chọn file ảnh trước!", "error");
        return;
      }

      uploadBtn.disabled = true;
      uploadBtn.textContent = "🔄 Đang upload...";
      showStatus("Đang upload ảnh lên Cloudinary...", "loading");

      try {
        const imageUrl = await window.uploadToCloudinary(file);

        showStatus(
          `
            <div class="status-success">
              <h4>✅ Upload thành công!</h4>
              <div class="url-display">
                <strong>URL:</strong><br>
                <a href="${imageUrl}" target="_blank" style="color: #4caf50;">${imageUrl}</a>
              </div>
              <button onclick="copyToClipboard('${imageUrl}')" class="upload-btn" style="margin-top: 10px;">
                📋 Copy URL
              </button>
            </div>
          `,
          "success"
        );

        document.getElementById("product-img").value = imageUrl;
        console.log("Image URL for database:", imageUrl);
      } catch (error) {
        showStatus(`❌ Lỗi upload: ${error.message}`, "error");
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = "☁️ Upload lên Cloudinary";
      }
    });
  }

  window.renderProductList();
});

function showStatus(message, type = "info") {
  const statusDiv = document.getElementById("upload-status");
  if (type === "success") {
    statusDiv.innerHTML = message;
  } else {
    statusDiv.innerHTML = `<div class="status-${type}">${message}</div>`;
  }
}

window.copyToClipboard = function (text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("Đã copy URL vào clipboard!");
    })
    .catch((err) => {
      console.error("Lỗi copy:", err);
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Đã copy URL vào clipboard!");
    });
};
