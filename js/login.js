// js/login.js
import { auth } from "./firebase/firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

// 1️⃣ Kiểm tra nếu đã đăng nhập thì chuyển hướng luôn
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "trangchu.html";
  }
});

// 2️⃣ Lắng nghe sự kiện submit form
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    message.textContent = "Đăng nhập thành công! ✅ Đang chuyển hướng...";
    message.style.color = "green";
    console.log("User logged in:", user);

    setTimeout(() => {
      window.location.href = "trangchu.html";
    }, 1500);
  } catch (error) {
    // 3️⃣ Xử lý lỗi thân thiện
    const errorCode = error.code;
    let errorMsg = "Đăng nhập thất bại!";
    if (errorCode === "auth/user-not-found")
      errorMsg = "Email chưa được đăng ký!";
    if (errorCode === "auth/wrong-password") errorMsg = "Sai mật khẩu!";
    if (errorCode === "auth/invalid-email") errorMsg = "Email không hợp lệ!";
    if (errorCode === "auth/too-many-requests")
      errorMsg = "Đăng nhập thất bại nhiều lần, thử lại sau!";

    message.textContent = `Lỗi: ${errorMsg}`;
    message.style.color = "red";
    console.error("Login error:", error);
  }
});
document
  .getElementById("google-login-btn")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const message = document.getElementById("message");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      message.textContent =
        "Đăng nhập Google thành công! ✅ Đang chuyển hướng...";
      message.style.color = "green";
      setTimeout(() => {
        window.location.href = "trangchu.html";
      }, 1500);
    } catch (error) {
      message.textContent = "Đăng nhập Google thất bại!";
      message.style.color = "red";
      console.error("Google login error:", error);
    }
  });
document.getElementById("signup-btn").addEventListener("click", () => {
  window.location.href = "signup.html";
});
// qqqAAAasdfg123VVVooo
