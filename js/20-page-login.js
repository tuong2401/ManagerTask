/* =====================================================================
   20-page-login.js — Trang ĐĂNG NHẬP
   
   ===================================================================== */

/* ===================== LOGIN PAGE ===================== */
function renderLoginPage() {
  return `
    <div class="login-wrap">
      <div class="login-card">
        <div class="title-row" style="justify-content:center;margin-bottom:6px"><span class="led"></span></div>
        <div class="login-title">TASK WORKING TAZMO VIỆT NAM</div>
        <div class="login-sub">Đăng nhập để vào hệ thống quản lý công việc</div>
        <div class="login-field">
          <label>Mã Nhân Viên</label>
          <input id="f-login-code" placeholder="VD: NV001" onkeydown="loginKeydown(event)" />
        </div>
        <div class="login-field">
          <label>Password</label>
          <input id="f-login-pass" type="password" placeholder="••••••" onkeydown="loginKeydown(event)" />
        </div>
        <button class="login-btn" onclick="doLogin()">Đăng nhập</button>
        ${loginError ? `<div class="login-error">${escapeHtml(loginError)}</div>` : ""}
        <div class="login-hint">Tài khoản demo: NV001 / 123456 (Thiết Kế Điện), NV003 / 123456 (Thiết Kế Cơ Khí), NV004 / 123456 (Kế Toán).</div>
      </div>
    </div>
  `;
}
