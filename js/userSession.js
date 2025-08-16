// js/userSession.js
export const userSession = {
  saveSession(user, data) {
    localStorage.setItem("session", JSON.stringify({
      uid: user.uid,
      email: user.email,
      ...data
    }));
  },
  getSession() {
    const data = localStorage.getItem("session");
    return data ? JSON.parse(data) : null;
  },
  clearSession() {
    localStorage.removeItem("session");
  },
  saveUserInfo(userInfo) {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  },
  getUserInfo() {
    const data = localStorage.getItem("userInfo");
    return data ? JSON.parse(data) : null;
  }
};
