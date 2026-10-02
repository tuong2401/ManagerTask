/* =====================================================================
   20-page-login.js — Trang ĐĂNG NHẬP
   
   ===================================================================== */

/* ===================== LOGIN PAGE ===================== */
function renderLoginPage() {
  return `
    <div class="login-wrap">
      <!-- Đặt Nút đổi ngôn ngữ ở góc trên cùng bên phải -->
      <div style="position: absolute; top: 20px; right: 20px;">
        ${renderLangSwitcher()}
      </div>
      <div class="login-card">
        <div class="title-row" style="justify-content:center;margin-bottom:6px"><span class="led"></span></div>
        <div class="login-title">
          <img src="assets/tazmo-logo.png" alt="${t('app_title')}">
        </div>
        <div class="login-sub">${t('login_sub')}</div>
        <div class="login-field">
          <label>${t('login_emp_code')}</label>
          <input id="f-login-code" placeholder="VD: NV001" onkeydown="loginKeydown(event)" />
        </div>
        <div class="login-field">
          <label>${t('login_password')}</label>
          <input id="f-login-pass" type="password" placeholder="••••••" onkeydown="loginKeydown(event)" />
        </div>
        <button class="login-btn" onclick="doLogin()">${t('login_btn')}</button>
        ${loginError ? `<div class="login-error">${escapeHtml(loginError)}</div>` : ""}
        <!--
        <div class="login-hint" style="margin-top:14px">
          <div><b>Quản lý:</b> 1111 / 111111</div>
          <div><b>Nhân viên:</b> NV001 / 123456, NV003 / 123456, NV004 / 123456</div>
        </div>
        <div style="text-align:center;margin-top:16px;border-top:1px dashed var(--border);padding-top:12px">
          <button type="button" style="background:none;border:none;color:var(--text-faint);font-size:11.5px;cursor:pointer;text-decoration:underline" onclick="if(confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu (bao gồm tài khoản Quản lý)?')){departments=seedDepartments.slice();employees=seedEmployees.slice();tasks=seedTasks.slice();leaveRequests=seedLeaves.slice();machines=seedMachines.slice();saveData();render();alert('Đã khôi phục thành công!');}">
            ⚡ Khôi phục lại dữ liệu mẫu ban đầu (Reset DB)
          </button>
        </div>
        -->
      </div>
    </div>
  `;
}
