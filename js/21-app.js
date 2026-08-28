/* =====================================================================
   21-app.js — Điểm khởi động app (render root + gọi initStorage())
   File này PHẢI được nạp SAU CÙNG vì nó gọi initStorage() để khởi động toàn bộ app.
   ===================================================================== */

/* ===================== RENDER ROOT ===================== */
function renderSyncBar() {
  const el = document.getElementById("sync-bar");
  if (!el) return;
  if (!IS_CONFIGURED) {
    el.innerHTML = `<div class="demo-banner">${ic("alert")} Chế độ xem thử: chưa cấu hình Firebase, dữ liệu chỉ tồn tại trong phiên này và <b>không dùng chung được với người khác</b>.</div>`;
    return;
  }
  el.innerHTML = `<span class="shared-note">${ic("users")} Dữ liệu dùng chung cho cả nhóm, đồng bộ tức thời ${syncing ? "· đang lưu..." : lastSync ? "· cập nhật lúc " + fmtTime(lastSync) : ""}${syncError ? `<span class="sync-error"> · ${syncError}</span>` : ""}</span>`;
}

function render() {
  if (!loaded) return;
  const app = document.getElementById("app");
  let html = "";
  if (!currentUser) {
    view = "login";
    html = renderLoginPage();
  } else if (view === "department" && activeDeptId) {
    html = renderDepartment();
  } else {
    view = "overview";
    html = renderOverviewPage();
  }
  if (taskModalId) html += renderTaskModal();
  app.innerHTML = html;
  renderSyncBar();
}

/* ===================== INIT ===================== */
initStorage();
