/* =====================================================================
   06-auth.js — Đăng nhập / đăng xuất
   
   ===================================================================== */

/* ===================== AUTH ===================== */
function doLogin() {
  const code = (document.getElementById("f-login-code").value || "").trim();
  const pass = (document.getElementById("f-login-pass").value || "").trim();
  if (!code || !pass) { loginError = "Vui lòng nhập đầy đủ Mã nhân viên và Mật khẩu."; render(); return; }
  let emp = employees.find((e) => e.code.toLowerCase() === code.toLowerCase());
  // if (!emp && code === "1111" && pass === "111111") {
  //   emp = { id: "e5", code: "1111", name: "Hoài Nam", role: "Quản lý", password: "111111", departmentId: "d1", color: "amber", accessLevel: "manager" };
  //   employees.unshift(emp);
  //   saveData();
  // }
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
