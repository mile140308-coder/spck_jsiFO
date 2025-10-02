// js/sp.js
import { doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { db } from "./firebase/firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

const auth = getAuth();

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
  const reviewsContainer = document.getElementById("reviews");
  const reviewForm = document.getElementById("review-form");
  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) {
    if (mauXe) mauXe.innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
    return;
  }

  try {
    const docRef = doc(db, "product", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      mauXe.innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
      return;
    }

    const data = snap.data();

    // Chuyển type/engine sang tiếng Việt như trangchu.js
    const theLoai = { motor: "Xe máy", bicycle: "Xe đạp" }[data.type] || data.type || "";
    const dongCo = { none: "Không có động cơ", electric: "Động cơ điện", gasoline: "Động cơ ga" }[data.engine] || data.engine || "";

    // Render sản phẩm
    mauXe.innerHTML = `
      <h2>${data.name}</h2>
      <img src="${data.img || 'https://via.placeholder.com/150'}" alt="${data.name}" style="max-width:300px;">
      <p class="product-price">Giá: ${(Number(data.price)||0).toLocaleString("vi-VN")} VND</p>
      <p>Thương hiệu: ${data.brand || ""}</p>
      <p>Loại: ${getProductDisplayName(theLoai, dongCo)}</p>
      <p class="product-desc"><b>Mô tả:</b> ${data.desc || "Chưa có mô tả."}</p>
      <a href="trangchu.html">← Quay về</a>
    `;

    // Hiển thị đánh giá
    renderReviews(data.reviews || []);

    // Kiểm tra đăng nhập để bật form đánh giá
    onAuthStateChanged(auth, (user) => {
      if (user) {
        reviewForm.style.display = "block";
        reviewForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const comment = document.getElementById("review-text").value;
          const score = parseInt(document.getElementById("review-score").value, 10);

          if (!comment || !score) {
            alert("Vui lòng nhập đầy đủ nội dung và điểm.");
            return;
          }

          const newReview = {
            user: user.email || "Người dùng ẩn danh",
            text: comment,
            score: score,
            createdAt: new Date().toISOString()
          };

          await updateDoc(docRef, {
            reviews: arrayUnion(newReview)
          });

          // Hiển thị lại
          renderReviews([...(data.reviews || []), newReview]);
          reviewForm.reset();
        });
      } else {
        reviewForm.style.display = "none";
        reviewsContainer.insertAdjacentHTML("beforeend", "<p>Bạn cần đăng nhập để đánh giá.</p>");
      }
    });

    // Hàm render danh sách đánh giá
    function renderReviews(reviews) {
      reviewsContainer.innerHTML = "<h3>Đánh giá</h3>";
      if (reviews.length === 0) {
        reviewsContainer.innerHTML += "<p>Chưa có đánh giá nào.</p>";
        return;
      }
      reviews.forEach(r => {
        reviewsContainer.innerHTML += `
          <div class="review-item">
            <p><b>${r.user}</b> (${r.score}/10)</p>
            <p>${r.text}</p>
            <hr>
          </div>
        `;
      });
    }

  } catch (e) {
    console.error(e);
    if (mauXe) mauXe.innerHTML = "<p>Lỗi tải sản phẩm.</p>";
  }
});

