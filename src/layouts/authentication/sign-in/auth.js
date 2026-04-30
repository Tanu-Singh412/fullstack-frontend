// ==========================
// CONFIG
// ==========================
const USER = "admin";
const PASS = "123456";
const SESSION_TIME = 60 * 60 * 1000; // 1 hour

// ==========================
// PASSWORD STRENGTH CHECK
// ==========================
export const checkPasswordStrength = (password) => {
  if (!password) return "";

  let strength = "Weak";

  if (password.length >= 6) strength = "Medium";

  if (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password)
  ) {
    strength = "Strong";
  }

  return strength;
};

// ==========================
// LOGIN
// ==========================
export const login = (username, password) => {
  // basic validation
  if (!username || !password) {
    alert("Please enter username and password");
    return false;
  }

  // check credentials
  if (username === USER && password === PASS) {
    const token = "fake-jwt-token-" + Date.now(); // simulate token
    const expiry = new Date().getTime() + SESSION_TIME;

    localStorage.setItem("auth", "true");
    localStorage.setItem("token", token);
    localStorage.setItem("expiry", expiry);

    return true;
  }

  return false;
};

// ==========================
// LOGOUT
// ==========================
export const logout = () => {
  localStorage.removeItem("auth");
  localStorage.removeItem("token");
  localStorage.removeItem("expiry");
};

// ==========================
// CHECK AUTH
// ==========================
export const isAuthenticated = () => {
  const auth = localStorage.getItem("auth");
  const expiry = localStorage.getItem("expiry");

  if (!auth || !expiry) return false;

  // check expiry
  if (new Date().getTime() > Number(expiry)) {
    logout();
    return false;
  }

  return true;
};

// ==========================
// GET TOKEN (optional)
// ==========================
export const getToken = () => {
  return localStorage.getItem("token");
};
