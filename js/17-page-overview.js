/* =====================================================================
   17-page-overview.js — Trang TỔNG QUAN (danh sách dashboard các bộ phận)
   
   ===================================================================== */

/* ===================== OVERVIEW PAGE ===================== */
function renderOverviewPage() {
  const stats = {
    total: tasks.length,
    doing: tasks.filter((t) => t.status === "doing").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
  };
  const deptCards = departments.map((d) => {
    const dTasks = deptTasks(d.id);
    const dEmps = deptEmployees(d.id);
    const todoCount = dTasks.filter((t) => t.status === "todo").length;
    const pendingCount = dTasks.filter((t) => t.status === "pending").length;
    const doingCount = dTasks.filter((t) => t.status === "doing").length;
    const done = dTasks.filter((t) => t.status === "done").length;
    const closed = dTasks.filter((t) => t.status === "closed").length;
    const overdue = dTasks.filter((t) => isOverdue(t)).length;
    const pct = dTasks.length ? Math.round(((done + closed) / dTasks.length) * 100) : 0;
    const miniDonut = buildDonut(
      [
        { value: todoCount, color: "border-strong" },
        { value: pendingCount, color: "amber" },
        { value: doingCount, color: "teal" },
        { value: done, color: "green" },
        { value: closed, color: "purple" },
      ],
      { size: 82, thickness: 12, centerLabel: pct + "%", centerSub: "", overdueCount: overdue, total: dTasks.length }
    );
    return `
      <button class="dept-card" onclick="openDepartment('${d.id}')">
        <div class="dept-card-top">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="dept-badge" style="background:var(--${d.color}-soft);color:var(--${d.color})">${escapeHtml(d.name.slice(0, 2).toUpperCase())}</div>
            <div>
              <div class="dept-name">${escapeHtml(d.name)}</div>
              <div class="dept-sub">${t('num_employees', { count: dEmps.length })}</div>
            </div>
          </div>
          ${miniDonut}
        </div>
        <div class="dept-stats-row">
          <div class="dept-stat"><b>${dTasks.length}</b>${t('total_tasks')}</div>
          <div class="dept-stat"><b style="${overdue > 0 ? 'color:var(--red)' : ''}">${overdue}</b>${t('overdue')}</div>
          <div class="dept-stat"><b>${pct}%</b>${t('completed')}</div>
        </div>
      </button>
    `;
  }).join("");

  return `
    <div class="header">
      <div>
        <div class="title-row"><span class="title">TAZMO VIỆT NAM</span></div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        ${renderLangSwitcher()}
        <div class="user-chip">${ic("users")}<span class="who">${t("hello", { name: escapeHtml(currentUser.name) })}</span><button class="logout-btn" onclick="logout()">${ic("logout")} ${t("logout")}</button></div>
      </div>
    </div>
    <div class="toolbar">
      <div class="toolbar-left"><span class="section-title" style="margin:0">${ic("grid")} ${t("dashboard_overview")}</span></div>
      ${hasPermission('data:export') ? `<div class="toolbar-actions"><button class="export-btn" onclick="exportExcel()">${ic("download")} ${t("export_excel")}</button></div>` : ""}
    </div>
    <div class="dept-grid">
      ${deptCards}
      ${hasPermission('department:add') ? (
        !showDeptForm
          ? `<button class="dept-card" style="align-items:center;justify-content:center;color:var(--text-faint)" onclick="showDeptForm=true;render()">${ic("plus", "ic-lg")}<span style="margin-top:6px;font-size:12.5px">Thêm bộ phận</span></button>`
          : `<div class="dept-card" style="cursor:default">
               <div class="field-label">Tên bộ phận mới</div>
               <input id="f-dname" placeholder="VD: Kỹ thuật QC" style="margin-bottom:8px" />
               <div class="field-label">Loại phòng ban</div>
               <select id="f-dtype" style="width:100%;margin-bottom:8px">
                 <option value="tech">Phòng Kỹ thuật / Sản xuất (dùng Thiết bị & Máy)</option>
                 <option value="office">Phòng Văn phòng / Kế toán (dùng Hạng mục & Dự án)</option>
               </select>
               <div id="f-dept-error" class="form-error"></div>
               <div class="form-actions">
                 <button class="btn-primary" onclick="addDepartment()">Thêm</button>
                 <button onclick="showDeptForm=false;render()">Huỷ</button>
               </div>
             </div>`
      ) : ""}
    </div>
    ${hasPermission('system:reset') ? `<button class="reset-link" style="margin-top:22px" onclick="resetData()">Khôi phục dữ liệu mẫu</button>` : ""}
  `;
}
