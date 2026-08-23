/* =====================================================================
   16-dashboard.js — Khối Dashboard dùng chung (trang Tổng quan & trang Bộ phận)
   
   ===================================================================== */

/* ===================== SHARED DASHBOARD BLOCK ===================== */
function renderDashboardBlock(tasksForDash, empList) {
  const total = tasksForDash.length;
  const todoCount = tasksForDash.filter((t) => t.status === "todo").length;
  const pendingCount = tasksForDash.filter((t) => t.status === "pending").length;
  const doingCount = tasksForDash.filter((t) => t.status === "doing").length;
  const doneCount = tasksForDash.filter((t) => t.status === "done").length;
  const overdueCount = tasksForDash.filter((t) => isOverdue(t)).length;
  const completionRate = total ? Math.round((doneCount / total) * 100) : 0;

  const statusDonut = buildDonut(
    [
      { value: todoCount, color: "border-strong" },
      { value: pendingCount, color: "amber" },
      { value: doingCount, color: "teal" },
      { value: doneCount, color: "green" },
    ],
    { centerLabel: completionRate + "%", centerSub: "hoàn thành" }
  );

  const empCounts = empList.map((e) => tasksForDash.filter((t) => t.assigneeId === e.id).length);
  const maxEmpCount = Math.max(1, ...empCounts, 0);
  const empBars = empList.length
    ? empList.map((e) => {
        const empTasks = tasksForDash.filter((t) => t.assigneeId === e.id);
        const cnt = empTasks.length;
        const done = empTasks.filter((t) => t.status === "done").length;
        const pct = maxEmpCount ? (cnt / maxEmpCount) * 100 : 0;
        const donePct = cnt ? (done / cnt) * 100 : 0;
        return `
          <div class="emp-bar-row">
            <div class="emp-bar-top">
              <span class="emp-bar-name"><span class="dot" style="background:var(--${e.color})"></span><span>${escapeHtml(e.name)}</span></span>
              <span class="emp-bar-count">${done}/${cnt} hoàn thành</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${pct}%;background:var(--${e.color}-soft)">
                <div class="bar-fill-done" style="width:${donePct}%;background:var(--${e.color})"></div>
              </div>
            </div>
          </div>
        `;
      }).join("")
    : `<div class="empty-dash">Chưa có nhân sự nào.</div>`;

  const overdueTasks = tasksForDash.filter((t) => isOverdue(t)).slice().sort((a, b) => (taskDueDate(a) || "").localeCompare(taskDueDate(b) || ""));
  const overdueHtml = overdueTasks.length
    ? overdueTasks.slice(0, 8).map((t) => {
        const emp = employeeById(t.assigneeId);
        return `
          <div class="alert-item" onclick="jumpToTask('${t.id}')">
            ${ic("alert")}
            <div class="item-info">
              <div class="item-title">${escapeHtml(t.title)}</div>
              <div class="item-sub">${emp ? escapeHtml(emp.name) : "Chưa gán"}</div>
            </div>
            <div class="item-date" style="color:var(--red)">${fmtDate(taskDueDate(t))}</div>
          </div>
        `;
      }).join("")
    : `<div class="empty-dash">Không có công việc quá hạn 🎉</div>`;

  const recentDone = tasksForDash.filter((t) => t.status === "done").slice()
    .sort((a, b) => (b.endDate || "").localeCompare(a.endDate || ""));
  const recentHtml = recentDone.length
    ? recentDone.slice(0, 8).map((t) => {
        const emp = employeeById(t.assigneeId);
        return `
          <div class="recent-item" onclick="jumpToTask('${t.id}')">
            ${ic("check")}
            <div class="item-info">
              <div class="item-title">${escapeHtml(t.title)}</div>
              <div class="item-sub">${emp ? escapeHtml(emp.name) : "Chưa gán"}</div>
            </div>
            <div class="item-date" style="color:var(--green)">${fmtDate(t.endDate)}</div>
          </div>
        `;
      }).join("")
    : `<div class="empty-dash">Chưa có công việc nào hoàn thành.</div>`;

  return `
    <div class="dash-grid">
      <div class="dash-card">
        <div class="dash-card-head">${ic("grid")} Trạng thái công việc</div>
        <div class="donut-row">
          ${statusDonut}
          <div class="donut-legend">
            <div class="legend-item"><span class="dot" style="background:var(--border-strong)"></span><span class="legend-label">Chưa làm</span><span class="legend-value mono">${todoCount}</span></div>
            <div class="legend-item"><span class="dot" style="background:var(--amber)"></span><span class="legend-label">Đang chờ</span><span class="legend-value mono">${pendingCount}</span></div>
            <div class="legend-item"><span class="dot" style="background:var(--teal)"></span><span class="legend-label">Đang làm</span><span class="legend-value mono">${doingCount}</span></div>
            <div class="legend-item"><span class="dot" style="background:var(--green)"></span><span class="legend-label">Hoàn thành</span><span class="legend-value mono">${doneCount}</span></div>
            <div class="legend-item"><span class="dot" style="background:var(--red)"></span><span class="legend-label">Quá hạn</span><span class="legend-value mono">${overdueCount}</span></div>
          </div>
        </div>
      </div>
      <div class="dash-card">
        <div class="dash-card-head">${ic("users")} Công việc theo nhân viên</div>
        ${empBars}
      </div>
      <div class="dash-card">
        <div class="dash-card-head">${ic("alert")} Cần chú ý (quá hạn)</div>
        <div class="alert-list">${overdueHtml}</div>
      </div>
      <div class="dash-card">
        <div class="dash-card-head">${ic("check")} Hoàn thành gần đây</div>
        <div class="recent-list">${recentHtml}</div>
      </div>
    </div>
  `;
}
function jumpToTask(taskId) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t) return;
  activeDeptId = t.departmentId;
  deptTab = "tasks";
  view = "department";
  taskModalId = taskId;
  render();
}
