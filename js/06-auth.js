/* =====================================================================
   06-auth.js — Đăng nhập / đăng xuất
   
   ===================================================================== */

/* ===================== AUTH ===================== */
function doLogin() {
  const code = (document.getElementById("f-login-code").value || "").trim();
  const pass = (document.getElementById("f-login-pass").value || "").trim();
  if (!code || !pass) { loginError = "Vui lòng nhập đầy đủ Mã nhân viên và Mật khẩu."; render(); return; }
  const emp = employees.find((e) => e.code.toLowerCase() === code.toLowerCase());
  if (!emp || (emp.password || "") !== pass) {
    loginError = "Sai mã nhân viên hoặc mật khẩu.";
    render();
    return;
  }
  currentUser = emp;
  loginError = "";
  view = "overview";
  render();
}
function loginKeydown(e) { if (e.key === "Enter") doLogin(); }
function logout() {
  currentUser = null;
  view = "login";
  activeDeptId = null;
  render();
}
