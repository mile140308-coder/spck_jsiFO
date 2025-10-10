// js/theme.js
// 🌗 Quản lý & đồng bộ DARK MODE / LIGHT MODE trên toàn website

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const isDark = localStorage.getItem("darkMode") === "true";

  // Áp dụng chế độ đã lưu
  if (isDark) body.classList.add("dark-mode");
  else body.classList.remove("dark-mode");

  const navbar = document.getElementById("navbar");

  // ==============================
  // 🔹 TRANG CHỦ (có navbar động)
  // ==============================
  if (navbar) {
    const toggle = document.createElement("button");
    toggle.id = "darkModeToggle";
    toggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    toggle.className = "navbar-btn";
    toggle.style.background = "#ff9800";
    toggle.style.color = "#000";
    toggle.style.border = "none";
    toggle.style.borderRadius = "6px";
    toggle.style.padding = "6px 12px";
    toggle.style.cursor = "pointer";
    toggle.style.fontWeight = "bold";
    toggle.style.transition = "0.3s";
    toggle.style.marginLeft = "10px";

    // Dùng MutationObserver để chờ navbar render xong (do trangchu.js tạo)
    const observer = new MutationObserver(() => {
      const menu = navbar.querySelector(".menu");
      const logoutBtn = menu ? menu.querySelector("#logoutBtn") : null;

      // Khi user đã đăng nhập (có logoutBtn)
      if (menu && logoutBtn && !menu.querySelector("#darkModeToggle")) {
        menu.insertBefore(toggle, logoutBtn); // 👉 Đặt bên trái nút Đăng xuất
        observer.disconnect();
      }
    });

    observer.observe(navbar, { childList: true, subtree: true });

    // Xử lý khi click
    toggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      const darkActive = body.classList.contains("dark-mode");
      localStorage.setItem("darkMode", darkActive);
      toggle.textContent = darkActive ? "☀️ Light Mode" : "🌙 Dark Mode";
    });
  }

  // ==============================
  // 🔹 CÁC TRANG KHÁC (sp.html, giohang.html, add.html, v.v.)
  // ==============================
  else {
    const toggle = document.createElement("button");
    toggle.id = "darkModeToggle";
    toggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    toggle.style.position = "fixed";
    toggle.style.top = "12px";
    toggle.style.right = "12px";
    toggle.style.padding = "8px 14px";
    toggle.style.borderRadius = "8px";
    toggle.style.border = "none";
    toggle.style.cursor = "pointer";
    toggle.style.fontWeight = "bold";
    toggle.style.background = "#ff9800";
    toggle.style.color = "#000";
    toggle.style.zIndex = "9999";
    toggle.style.transition = "0.3s";
    document.body.appendChild(toggle);

    toggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");
      const darkActive = body.classList.contains("dark-mode");
      localStorage.setItem("darkMode", darkActive);
      toggle.textContent = darkActive ? "☀️ Light Mode" : "🌙 Dark Mode";
    });
  }
});
