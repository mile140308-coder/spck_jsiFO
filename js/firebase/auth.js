// js/firebase/auth.js
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
import { userSession } from "../userSession.js";

// ==================== Đăng ký ====================
export async function signUp(email, password, role_id) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const userData = {
      email,
      role_id, // role_id rõ ràng
      role: role_id, // lưu cả 2 nếu cần tương thích
      balance: 0,
      createdAt: new Date(),
      uid: userCredential.user.uid,
    };

    // ⚠ Không lưu password vào Firestore để bảo mật
    await addDoc(collection(db, "user"), userData);

    return userCredential.user;
  } catch (error) {
    console.error("Lỗi đăng ký:", error.message);
    throw error;
  }
}

// ==================== Lấy thông tin User từ Firestore ====================
async function getUserInfoFromFirestore(email) {
  try {
    const q = query(collection(db, "user"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error("Lỗi lấy thông tin user:", error.message);
    return null;
  }
}

// ==================== Đăng nhập ====================
export async function signIn(email, password) {
  try {
    // Đăng nhập Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Ưu tiên lấy thông tin từ session để tránh query Firestore nhiều lần
    let userInfo = userSession.getUserInfo?.();
    if (!userInfo) {
      userInfo = await getUserInfoFromFirestore(email);
      if (userInfo) {
        userSession.saveUserInfo(userInfo);
      }
    }

    const additionalInfo = {
      role_id: userInfo?.role_id ?? userInfo?.role ?? 2,
      balance: userInfo?.balance ?? 0,
    };

    // Lưu phiên
    userSession.saveSession(userCredential.user, additionalInfo);

    return userCredential.user;
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    throw error;
  }
}

// ==================== Đăng xuất ====================
export async function signOutUser() {
  try {
    await signOut(auth);
    userSession.clearSession();
    console.log("Đăng xuất thành công!");
    return true;
  } catch (error) {
    console.error("Lỗi đăng xuất:", error.message);
    throw error;
  }
}
