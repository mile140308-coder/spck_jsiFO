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
  const relatedDiv = document.getElementById("related-products");
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
      <div id="add-to-cart-m">
        <button id="add-to-cart-main" class="product-btn" data-id="${id}">➕ Thêm vào giỏ hàng</button>
        <div id="msg-main-${id}" class="cart-msg" style="margin-left:12px;min-width:160px;"></div>
      </div>
      <a href="trangchu.html" style="display:block;margin-top:12px;">← Quay về</a>
    `;

    // Thêm hàm tiện ích addToCart (localStorage) và gán sự kiện cho nút chi tiết
    function addToCartLocal(prodId, qty = 1) {
      try {
        const raw = localStorage.getItem("cart") || "[]";
        const cart = JSON.parse(raw);
        const exist = cart.find(item => item.id === prodId);
        if (exist) exist.quantity = (exist.quantity || 0) + qty;
        else cart.push({ id: prodId, quantity: qty });
        localStorage.setItem("cart", JSON.stringify(cart));
        return true;
      } catch (err) {
        console.error("addToCartLocal error:", err);
        return false;
      }
    }

    // Gắn sự kiện cho nút chi tiết (không chuyển trang, chỉ hiện thông báo)
    const addMainBtn = document.getElementById("add-to-cart-main");
    if (addMainBtn) {
      addMainBtn.addEventListener("click", () => {
        const prodId = addMainBtn.dataset.id;
        const ok = addToCartLocal(prodId, 1);
        const msg = document.getElementById(`msg-main-${prodId}`);
        if (msg) {
          if (ok) {
            msg.style.color = "#4caf50";
            msg.textContent = "✅ Đã thêm vào giỏ hàng";
            setTimeout(()=>{ msg.textContent = ""; }, 2000);
          } else {
            msg.style.color = "orange";
            msg.textContent = "❌ Lỗi khi thêm vào giỏ";
            setTimeout(()=>{ msg.textContent = ""; }, 2500);
          }
        }
      });
    }

    // Hiển thị đánh giá
    renderReviews(data.reviews || []);

    // Hiển thị sản phẩm liên quan
    showRelatedProducts(data.brand, theLoai, id);

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

    // Hàm hiển thị sản phẩm liên quan
    async function showRelatedProducts(brand, type, currentId) {
      const relatedDiv = document.getElementById("related-products");
      if (!relatedDiv) return;
      relatedDiv.innerHTML = "<h3 style='margin-top:32px;'>Sản phẩm liên quan</h3>";

      // Lấy tất cả sản phẩm
      const { getDocs, collection } = await import("https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js");
      const snap = await getDocs(collection(db, "product"));
      const allProducts = snap.docs.map(d => {
        const v = d.data();
        return {
          id: d.id,
          name: v.name || "",
          img: v.img || "",
          price: v.price || 0,
          brand: v.brand || "",
          type: { motor: "Xe máy", bicycle: "Xe đạp" }[v.type] || v.type || "",
        };
      });

      // Lọc sản phẩm liên quan (cùng hãng hoặc cùng loại, khác id hiện tại)
      const related = allProducts.filter(
        p => p.id !== currentId && (p.brand === brand || p.type === type)
      );

      // Phân trang: mỗi trang 4 sản phẩm
      let page = 1;
      const perPage = 4;
      const totalPage = Math.ceil(related.length / perPage) || 1;

      function renderRelated(pageNum) {
        const start = (pageNum - 1) * perPage;
        const end = start + perPage;
        const pageArr = related.slice(start, end);

        relatedDiv.innerHTML = "<h3 style='margin-top:32px;'>Sản phẩm liên quan</h3>";
        if (!pageArr.length) {
          relatedDiv.innerHTML += "<p>Không có sản phẩm liên quan.</p>";
          return;
        }

        relatedDiv.innerHTML += `
          <div class="related-grid">
            ${pageArr.map(p => `
              <div class="cac-the-lq">
                <a href="sp.html?id=${p.id}" class="related-link">
                  <img src="${p.img || 'https://via.placeholder.com/120'}" alt="${p.name}" class="related-img">
                  <h4 class="related-name">${p.name}</h4>
                  <p class="related-price">Giá: ${(Number(p.price)||0).toLocaleString("vi-VN")} VND</p>
                  <p class="related-brand">Thương hiệu: ${p.brand}</p>
                  <p class="related-type">Loại: ${p.type}</p>
                </a>
                <button class="add-related-cart product-btn" data-id="${p.id}" style="margin-top:10px;">➕ Thêm vào giỏ hàng</button>
                <div class="cart-msg-related" id="msg-related-${p.id}" style="min-height:18px;margin-top:4px;font-size:0.97rem;text-align:center;"></div>
              </div>
            `).join("")}
          </div>
          <div style="text-align:center;margin-top:16px;">
            <button id="prev-related" class="product-btn" ${pageNum <= 1 ? "disabled" : ""} style="margin-right:10px;">← Trang trước</button>
            <span style="font-size:1.05rem;">Trang ${pageNum}/${totalPage}</span>
            <button id="next-related" class="product-btn" ${pageNum >= totalPage ? "disabled" : ""} style="margin-left:10px;">Trang sau →</button>
          </div>
        `;

        // Sự kiện chuyển trang
        document.getElementById("prev-related").onclick = () => {
          if (pageNum > 1) renderRelated(pageNum - 1);
        };
        document.getElementById("next-related").onclick = () => {
          if (pageNum < totalPage) renderRelated(pageNum + 1);
        };

        // Sự kiện thêm vào giỏ hàng
        relatedDiv.querySelectorAll(".add-related-cart").forEach(btn => {
          btn.onclick = () => {
            let cart = JSON.parse(localStorage.getItem("cart") || "[]");
            const prodId = btn.dataset.id;
            const exist = cart.find(item => item.id === prodId);
            if (exist) {
              exist.quantity += 1;
            } else {
              cart.push({ id: prodId, quantity: 1 });
            }
            localStorage.setItem("cart", JSON.stringify(cart));
            // Hiện thông báo thay vì chuyển trang
            const msg = document.getElementById(`msg-related-${prodId}`);
            if (msg) {
              msg.style.color = "#4caf50";
              msg.textContent = "✅ Đã thêm vào giỏ hàng";
              setTimeout(() => { msg.textContent = ""; }, 2000);
            }
          };
        });
      }

      renderRelated(page);
    }

  } catch (e) {
    console.error(e);
    if (mauXe) mauXe.innerHTML = "<p>Lỗi tải sản phẩm.</p>";
  }
});