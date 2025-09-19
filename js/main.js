import { db } from "./js/firebase/firebase-config.js";
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

//=== Thêm dữ liệu sản phẩm vào Firestore ===
async function addProduct({ engine, img, name, price, type }) {
  try {
    const docRef = await addDoc(collection(db, "product"), {
      engine,
      img,
      name,
      price,
      type,
    });
    console.log("Đã thêm sản phẩm với ID:", docRef.id);
    alert("✅ Sản phẩm đã được thêm vào Firestore!");
    renderProductList(); // Tự động reload danh sách sau khi thêm
  } catch (e) {
    console.error("Lỗi khi thêm document:", e);
    alert("❌ Lỗi khi thêm sản phẩm!");
  }
}

async function uploadToCloudinary(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "SPLMIAU"); // Thay bằng upload preset của bạn

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/da1idy1xu/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (result.secure_url) {
      console.log(result.secure_url);
      return result.secure_url;
    } else {
      throw new Error(
        `Upload thất bại: ${result.error?.message || "Không rõ lỗi"}`
      );
    }
  } catch (error) {
    throw error;
  }
}

// Hiển thị danh sách sản phẩm với nút sửa/xóa
async function renderProductList() {
  const listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "<h3>Danh sách sản phẩm</h3>";
  const querySnapshot = await getDocs(collection(db, "product"));
  if (querySnapshot.empty) {
    listDiv.innerHTML += "<p>Không có sản phẩm nào.</p>";
    return;
  }
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const itemDiv = document.createElement("div");
    itemDiv.className = "product-item";
    itemDiv.innerHTML = `
      <strong>${data.name}</strong> - ${data.price} VND<br>
      <img src="${data.img || 'https://via.placeholder.com/100'}" alt="${data.name}" style="max-width:100px;max-height:100px;"><br>
      <span>Loại: ${data.type}</span> | <span>Engine: ${data.engine}</span>
      <br>
      <button class="edit-btn" data-id="${docSnap.id}">✏️ Sửa</button>
      <button class="delete-btn" data-id="${docSnap.id}">🗑️ Xóa</button>
      <hr>
    `;
    listDiv.appendChild(itemDiv);
  });

  // Gán sự kiện xóa
  listDiv.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = async () => {
      if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        await deleteDoc(doc(db, "product", btn.dataset.id));
        alert("Đã xóa!");
        renderProductList();
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
}

// Hiển thị form sửa sản phẩm
function showEditForm(id, data) {
  const formDiv = document.getElementById("edit-form");
  formDiv.innerHTML = `
    <h3>Chỉnh sửa sản phẩm</h3>
    <label>Tên: <input id="edit-name" value="${data.name}" /></label><br>
    <label>Giá: <input id="edit-price" value="${data.price}" type="number" /></label><br>
    <label>Loại: <input id="edit-type" value="${data.type}" /></label><br>
    <label>Engine: <input id="edit-engine" value="${data.engine}" /></label><br>
    <label>Ảnh: <input id="edit-img" value="${data.img}" /></label><br>
    <button id="save-edit">💾 Lưu</button>
    <button id="cancel-edit">❌ Hủy</button>
    <hr>
  `;
  document.getElementById("save-edit").onclick = async () => {
    await updateDoc(doc(db, "product", id), {
      name: document.getElementById("edit-name").value,
      price: Number(document.getElementById("edit-price").value),
      type: document.getElementById("edit-type").value,
      engine: document.getElementById("edit-engine").value,
      img: document.getElementById("edit-img").value,
    });
    alert("Đã cập nhật!");
    formDiv.innerHTML = "";
    renderProductList();
  };
  document.getElementById("cancel-edit").onclick = () => {
    formDiv.innerHTML = "";
  };
}

document.addEventListener("DOMContentLoaded", () => {
  // Lấy các phần tử DOM cho upload ảnh
  const fileInput = document.getElementById("file-input");
  const uploadBtn = document.getElementById("upload-btn");
  const imagePreview = document.getElementById("image-preview");
  const uploadArea = document.getElementById("upload-area");
  const statusDiv = document.getElementById("upload-status");

  // Thêm nút chọn file nếu chưa có
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

  // Drag & drop
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
        const event = new Event("change");
        fileInput.dispatchEvent(event);
      }
    });
  }

  // Preview ảnh khi chọn file
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
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
    });
  }

  // Upload khi bấm nút
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
        const imageUrl = await uploadToCloudinary(file);

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

        console.log("Image URL for database:", imageUrl);
      } catch (error) {
        showStatus(`❌ Lỗi upload: ${error.message}`, "error");
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = "☁️ Upload lên Cloudinary";
      }
    });
  }

  // Tạo div hiển thị danh sách sản phẩm và form sửa nếu chưa có
  if (!document.getElementById("product-list")) {
    const div = document.createElement("div");
    div.id = "product-list";
    document.body.appendChild(div);
  }
  if (!document.getElementById("edit-form")) {
    const div = document.createElement("div");
    div.id = "edit-form";
    document.body.appendChild(div);
  }
  renderProductList();
});

// Function hiển thị status
function showStatus(message, type = "info") {
  const statusDiv = document.getElementById("upload-status");
  if (type === "success") {
    statusDiv.innerHTML = message;
  } else {
    statusDiv.innerHTML = `<div class="status-${type}">${message}</div>`;
  }
}

// Function copy URL to clipboard
window.copyToClipboard = function (text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("Đã copy URL vào clipboard!");
    })
    .catch((err) => {
      console.error("Lỗi copy:", err);
      // Fallback cho trình duyệt cũ
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Đã copy URL vào clipboard!");
    });
};
