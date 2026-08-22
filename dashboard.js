/* Dashboard presentation module. Depends on helpers defined in app.js. */
/* ===================== DASHBOARD ===================== */
function buildDonut(segments, opts) {
  opts = opts || {};
  const size = opts.size || 148;
  const thickness = opts.thickness || 20;
  const centerLabel = opts.centerLabel || "";
  const centerSub = opts.centerSub || "";
  const total = segments.reduce((a, s) => a + s.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  let circles = "";
  if (total <= 0) {
    circles = `<circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="var(--border)" stroke-width="${thickness}"/>`;
  } else {
    segments.forEach((seg) => {
      if (seg.value <= 0) return;
      const frac = seg.value / total;
      const dash = frac * circumference;
      circles += `<circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="var(--${seg.color})" stroke-width="${thickness}" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`;
      offset += dash;
    });
  }
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0">
      ${circles}
      <text x="50%" y="46%" text-anchor="middle" class="mono" style="font-size:22px;font-weight:700;fill:var(--text)">${escapeHtml(centerLabel)}</text>
      <text x="50%" y="63%" text-anchor="middle" style="font-size:9.5px;fill:var(--text-faint)">${escapeHtml(centerSub)}</text>
    </svg>
  `;
}

function renderDashboard(tasksForDash) {
  const total = tasksForDash.length;
  const todoCount = tasksForDash.filter((t) => t.status === "todo").length;
  const doingCount = tasksForDash.filter((t) => t.status === "doing").length;
  const doneCount = tasksForDash.filter((t) => t.status === "done").length;
  const overdueCount = tasksForDash.filter((t) => isOverdue(t.endDate, t.status)).length;
  const completionRate = total ? Math.round((doneCount / total) * 100) : 0;

  const statusDonut = buildDonut(
    [
      { value: todoCount, color: "amber" },
      { value: doingCount, color: "teal" },
      { value: doneCount, color: "green" },
    ],
    { centerLabel: completionRate + "%", centerSub: t("donutDoneSub") }
  );

  const overdueTasks = tasksForDash
    .filter((t) => isOverdue(t.endDate, t.status))
    .slice()
    .sort((a, b) => (a.endDate || "").localeCompare(b.endDate || ""));
  const overdueHtml = overdueTasks.length
    ? overdueTasks.slice(0, 8).map((task) => {
        const emp = employeeById(task.assigneeId);
        return `
          <div class="alert-item">
            ${ic("alert")}
            <div class="item-info">
              <div class="item-title">${escapeHtml(task.title)}</div>
              <div class="item-sub">${emp ? escapeHtml(emp.name) : t("unassigned")}</div>
            </div>
            <div class="item-date" style="color:var(--red)">${fmtDate(task.endDate)}</div>
          </div>
        `;
      }).join("")
    : `<div class="empty-dash">${t("noOverdue")}</div>`;

  const closedTasks = tasksForDash
    .filter((t) => t.status === "close")
    .slice()
    .sort((a, b) => (b.endDate || b.assignedDate || "").localeCompare(a.endDate || a.assignedDate || ""));
  const closedHtml = closedTasks.length
    ? closedTasks.slice(0, 8).map((task) => {
        const emp = employeeById(task.assigneeId);
        return `
          <div class="recent-item closed-item">
            ${ic("check")}
            <div class="item-info">
              <div class="item-title">${escapeHtml(task.title)}</div>
              <div class="item-sub">${emp ? escapeHtml(emp.name) : t("unassigned")}</div>
            </div>
            <button class="reopen-btn" onclick="reopenTask('${task.id}')">${t("statusReopen")}</button>
          </div>
        `;
      }).join("")
    : `<div class="empty-dash">${t("noClosed")}</div>`;

  return `
    <div class="dash-grid">
      <div class="dash-card">
        <div class="dash-card-head">${ic("grid")} ${t("dashStatusCard")}</div>
        <div class="donut-row">
          ${statusDonut}
          <div class="donut-legend">
            <div class="legend-item"><span class="dot" style="background:var(--amber)"></span><span class="legend-label">${t("statusTodo")}</span><span class="legend-value mono">${todoCount}</span></div>
            <div class="legend-item"><span class="dot" style="background:var(--teal)"></span><span class="legend-label">${t("statusDoing")}</span><span class="legend-value mono">${doingCount}</span></div>
            <div class="legend-item"><span class="dot" style="background:var(--green)"></span><span class="legend-label">${t("statusDone")}</span><span class="legend-value mono">${doneCount}</span></div>
            <div class="legend-item"><span class="dot" style="background:var(--red)"></span><span class="legend-label">${t("statOverdue")}</span><span class="legend-value mono">${overdueCount}</span></div>
          </div>
        </div>
      </div>
      <div class="dash-card">
        <div class="dash-card-head">${ic("alert")} ${t("dashAttentionCard")}</div>
        <div class="alert-list">${overdueHtml}</div>
      </div>
      <div class="dash-card">
        <div class="dash-card-head">${ic("check")} ${t("dashClosedCard")}</div>
        <div class="recent-list">${closedHtml}</div>
      </div>
    </div>
  `;
}
