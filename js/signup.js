// js/signup.js
import { auth, db } from './firebase/firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");

  // Kiểm tra email phải có ký tự '@'
  if (!email.includes('@')) {
    message.textContent = "Email phải chứa ký tự '@'.";
    message.style.color = "red";
    return;
  }

  // Kiểm tra password: ít nhất 6 ký tự, 1 hoa, 1 thường, 1 số
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!passwordRegex.test(password)) {
    message.textContent = "Mật khẩu phải ít nhất 6 ký tự, có chữ hoa, chữ thường và số.";
    message.style.color = "red";
    return;
  }

  try {
    // 1. Tạo tài khoản trên Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Xác định role
    let role = 1; // Mặc định là user
    if (email === "admin@gmail.com") {
      role = 3;
    } else if (email.endsWith("@vipgmail.com")) {
      role = 2;
    }

    // 3. Lưu vào Firestore (collection "user") chỉ lưu email & uid & role
    await addDoc(collection(db, "user"), {
      email: email,
      uid: user.uid,
      role: role,
      createdAt: new Date()
    });

    message.textContent = "Đăng ký thành công! 🎉 Đang chuyển đến trang đăng nhập...";
    message.style.color = "green";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);

} catch (error) {
    message.textContent = `Lỗi: ${error.message}`;
    message.style.color = "red";
    console.error("Signup error:", error);
  }
});
document.getElementById("login-btn").addEventListener("click", () => {
  window.location.href = "login.html";
});