/* Application state, Firebase synchronization, and task actions. */
/* =====================================================================
   CẤU HÌNH FIREBASE - THAY 6 GIÁ TRỊ NÀY BẰNG CONFIG CỦA BẠN
   (Lấy tại: Firebase Console -> Project settings -> tạo Web App)
   Nếu để nguyên như mặc định, app sẽ chạy "chế độ xem thử" (không lưu
   thật, mất dữ liệu khi tải lại trang) để bạn preview UI trước.
   ===================================================================== */
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
// firebase-config.js defines window.FIREBASE_CONFIG when the app is deployed.
const FIREBASE_CONFIG = window.FIREBASE_CONFIG || DEFAULT_FIREBASE_CONFIG;
const IS_CONFIGURED = ["apiKey", "authDomain", "projectId", "appId"]
  .every((key) => FIREBASE_CONFIG[key] && !FIREBASE_CONFIG[key].startsWith("YOUR_"));
let db = null;
if (IS_CONFIGURED) {
  firebase.initializeApp(FIREBASE_CONFIG);
  db = firebase.firestore();
}

/* ===================== ICONS ===================== */
const ICONS = {
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  grip: '<circle cx="7" cy="7" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="17" cy="7" r="1"/><circle cx="7" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="17" cy="12" r="1"/><circle cx="7" cy="17" r="1"/><circle cx="12" cy="17" r="1"/><circle cx="17" cy="17" r="1"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  alert: '<path d="M12 3l9.5 17H2.5L12 3z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="16.3" r="0.3" fill="currentColor"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  download: '<path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><path d="M5 21h14"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
};
function ic(name) { return '<svg class="ic" viewBox="0 0 24 24">' + ICONS[name] + '</svg>'; }

/* ===================== DATA ===================== */
const PALETTE = ["blue", "teal", "green", "amber", "red"];
// `label` stays Vietnamese (used for email notifications and Excel export);
// `labelKey` looks up the current UI language via t() for on-screen display.
const STATUS_OPTS = [
  { key: "todo", label: "Chờ xử lý", labelKey: "statusTodo", color: "amber" },
  { key: "doing", label: "Đang thực hiện", labelKey: "statusDoing", color: "teal" },
  { key: "done", label: "Hoàn thành", labelKey: "statusDone", color: "green" },
  { key: "close", label: "Close", labelKey: "statusClose", color: "border-strong" },
  { key: "reopen", label: "Reopen", labelKey: "statusReopen", color: "blue" },
];
const PRIORITY = {
  high: { label: "Cao", labelKey: "priorityHigh", color: "red" },
  medium: { label: "Trung bình", labelKey: "priorityMedium", color: "amber" },
  low: { label: "Thấp", labelKey: "priorityLow", color: "border-strong" },
};

const seedEmployees = [
  { id: "e1", name: "Minh Tuấn", role: "Kỹ sư điều khiển", color: "blue" },
  { id: "e2", name: "Thu Hà", role: "Kỹ sư cơ khí", color: "teal" },
  { id: "e3", name: "Quốc Bảo", role: "Kỹ thuật viên bảo trì", color: "green" },
];
const seedTasks = [
  { id: "t1", title: "Kiểm tra động cơ trục Y trạm BP", assigneeId: "e1", priority: "high", status: "doing",
    assignedDate: "2026-08-18", startDate: "2026-08-19", endDate: "2026-08-22", notes: "Cần tắt nguồn trước khi kiểm tra" },
  { id: "t2", title: "Cập nhật tài liệu vận hành EFEM", assigneeId: "e2", priority: "medium", status: "todo",
    assignedDate: "2026-08-19", startDate: "", endDate: "2026-08-25", notes: "" },
  { id: "t3", title: "Hiệu chỉnh cảm biến Load Port", assigneeId: "e3", priority: "high", status: "todo",
    assignedDate: "2026-08-15", startDate: "2026-08-16", endDate: "2026-08-20", notes: "Chờ linh kiện thay thế" },
  { id: "t4", title: "Test chương trình PLC trạm nạp", assigneeId: "e1", priority: "low", status: "done",
    assignedDate: "2026-08-10", startDate: "2026-08-11", endDate: "2026-08-18", notes: "Đã bàn giao" },
  { id: "t5", title: "Bảo trì định kỳ băng tải", assigneeId: "e3", priority: "medium", status: "doing",
    assignedDate: "2026-08-20", startDate: "2026-08-21", endDate: "2026-08-23", notes: "" },
];

let employees = [];
let tasks = [];
let filterId = null;
let showTaskForm = false;
let showEmpForm = false;
let loaded = false;
let viewMode = "dashboard"; // "dashboard" | "table"

function setViewMode(mode) {
  viewMode = mode;
  render();
}

// Kich thuoc cot/hang do nguoi dung keo gian - luu lai qua cac lan render()
// vi render() ve lai toan bo bang tu dau (innerHTML), khong tu giu state DOM.
const COL_LABELS = ["Công việc","Người phụ trách","Ưu tiên","Trạng thái","Ngày giao","Ngày bắt đầu","Ngày kết thúc","Ghi chú",""];
let colWidths = [220, 150, 100, 150, 115, 125, 125, 220, 90];
let rowHeights = {}; // taskId -> px

function startColResize(e, idx) {
  e.preventDefault();
  const table = document.querySelector("table.tasks");
  const startX = e.clientX;
  const startWidth = colWidths[idx];
  const col = table.querySelectorAll("colgroup col")[idx];
  document.body.style.userSelect = "none";
  function onMove(ev) {
    const w = Math.max(50, startWidth + (ev.clientX - startX));
    col.style.width = w + "px";
  }
  function onUp(ev) {
    const w = Math.max(50, startWidth + (ev.clientX - startX));
    colWidths[idx] = w;
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  }
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}

function startRowResize(e, grip) {
  e.preventDefault();
  e.stopPropagation();
  const tr = grip.closest("tr");
  const taskId = tr.getAttribute("data-task-id");
  const startY = e.clientY;
  const startHeight = tr.offsetHeight;
  document.body.style.userSelect = "none";
  function onMove(ev) {
    const h = Math.max(30, startHeight + (ev.clientY - startY));
    tr.style.height = h + "px";
  }
  function onUp(ev) {
    const h = Math.max(30, startHeight + (ev.clientY - startY));
    if (taskId) rowHeights[taskId] = h;
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  }
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}
let syncing = false;
let syncError = "";
let lastSync = null;

function uid(prefix) { return prefix + Math.random().toString(36).slice(2, 9); }
function isOverdue(endDate, status) {
  if (!endDate || status === "done" || status === "close") return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(endDate + "T00:00:00") < today;
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString(dateLocale(), { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtTime(d) {
  if (!d) return "";
  return d.toLocaleTimeString(dateLocale(), { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function employeeById(id) { return employees.find((e) => e.id === id); }
function taskCountFor(empId) { return tasks.filter((t) => t.assigneeId === empId).length; }
function statusInfo(key) { return STATUS_OPTS.find((s) => s.key === key) || STATUS_OPTS[0]; }

/* ===================== STORAGE (Firebase Firestore) ===================== */
function initStorage() {
  if (!IS_CONFIGURED) {
    employees = seedEmployees.slice();
    tasks = seedTasks.slice();
    loaded = true;
    render();
    return;
  }
  const docRef = db.collection("tcc").doc("data");
  docRef.onSnapshot(
    (snap) => {
      if (snap.exists) {
        const data = snap.data();
        employees = data.employees || [];
        tasks = data.tasks || [];
      } else {
        employees = seedEmployees.slice();
        tasks = seedTasks.slice();
        // Only seed on the first visit. Later changes use a transaction.
        db.runTransaction((transaction) => transaction.get(docRef).then((current) => {
          if (!current.exists) transaction.set(docRef, { employees, tasks });
        })).catch(() => {});
      }
      loaded = true; syncing = false; syncError = ""; lastSync = new Date();
      render();
    },
    (err) => {
      syncError = err.code === "permission-denied"
        ? t("syncPermissionRead")
        : t("syncConnectionLost");
      loaded = true; syncing = false; render();
    }
  );
}

async function saveData(change) {
  if (!IS_CONFIGURED) return;
  syncing = true; syncError = "";
  renderSyncBar();
  try {
    const docRef = db.collection("tcc").doc("data");
    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(docRef);
      const serverData = snap.exists ? snap.data() : {};
      const shared = {
        employees: Array.isArray(serverData.employees) ? serverData.employees : [],
        tasks: Array.isArray(serverData.tasks) ? serverData.tasks : [],
      };
      // Firestore retries this if another user saves concurrently.
      change(shared);
      transaction.set(docRef, shared);
    });
    lastSync = new Date();
  } catch (e) {
    syncError = e.code === "permission-denied"
      ? t("syncPermissionWrite")
      : t("syncSaveFailed");
  }
  syncing = false;
  renderSyncBar();
}

/* ===================== ACTIONS ===================== */
async function addTask() {
  const title = document.getElementById("f-title").value.trim();
  const assignee = document.getElementById("f-assignee").value;
  const priority = document.getElementById("f-priority").value;
  const assignedDate = document.getElementById("f-assigned").value;
  const startDate = document.getElementById("f-start").value;
  const endDate = document.getElementById("f-end").value;
  const notes = document.getElementById("f-notes").value.trim();
  const errEl = document.getElementById("f-error");
  if (!title || !assignee) {
    if (errEl) errEl.textContent = "Vui lòng nhập tên công việc và chọn người phụ trách.";
    return;
  }
  const task = { id: uid("t"), title, assigneeId: assignee, priority, status: "todo", assignedDate, startDate, endDate, notes };
  if (!IS_CONFIGURED) tasks.push(task);
  showTaskForm = false;
  render();
  await saveData((shared) => shared.tasks.push(task));
}

async function addEmployee() {
  const name = document.getElementById("f-ename").value.trim();
  const role = document.getElementById("f-erole").value.trim();
  const errEl = document.getElementById("f-emp-error");
  if (!name) {
    if (errEl) errEl.textContent = "Vui lòng nhập tên nhân viên.";
    return;
  }
  const employee = { id: uid("e"), name, role: role || "Nhân viên", color: "blue" };
  if (!IS_CONFIGURED) {
    employee.color = PALETTE[employees.length % PALETTE.length];
    employees.push(employee);
  }
  showEmpForm = false;
  render();
  await saveData((shared) => {
    employee.color = PALETTE[shared.employees.length % PALETTE.length];
    shared.employees.push(employee);
  });
}

async function deleteTask(id) {
  if (!IS_CONFIGURED) tasks = tasks.filter((t) => t.id !== id);
  render();
  await saveData((shared) => { shared.tasks = shared.tasks.filter((t) => t.id !== id); });
}

async function setStatus(id, newStatus) {
  if (!IS_CONFIGURED) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    t.status = newStatus;
  }
  render();
  await saveData((shared) => {
    const t = shared.tasks.find((x) => x.id === id);
    if (t) t.status = newStatus;
  });
}

async function updateField(id, field, value) {
  if (!IS_CONFIGURED) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    t[field] = value;
  }
  render();
  await saveData((shared) => {
    const t = shared.tasks.find((x) => x.id === id);
    if (t) t[field] = value;
  });
}

function toggleFilter(id) {
  filterId = filterId === id ? null : id;
  render();
}

async function resetData() {
  if (!confirm("Xoá toàn bộ dữ liệu hiện tại và khôi phục dữ liệu mẫu? Hành động này ảnh hưởng đến tất cả mọi người đang dùng chung.")) return;
  if (!IS_CONFIGURED) {
    employees = seedEmployees.slice();
    tasks = seedTasks.slice();
  }
  render();
  await saveData((shared) => {
    shared.employees = seedEmployees.slice();
    shared.tasks = seedTasks.slice();
  });
}

function exportExcel() {
  const taskRows = tasks.map((task) => {
    const emp = employeeById(task.assigneeId);
    return {
      [t("expTaskName")]: task.title,
      [t("expAssignee")]: emp ? emp.name : t("unassigned"),
      [t("expPriority")]: PRIORITY[task.priority] ? t(PRIORITY[task.priority].labelKey) : task.priority,
      [t("expStatus")]: t(statusInfo(task.status).labelKey),
      [t("expAssignedDate")]: task.assignedDate ? fmtDate(task.assignedDate) : "",
      [t("expStartDate")]: task.startDate ? fmtDate(task.startDate) : "",
      [t("expEndDate")]: task.endDate ? fmtDate(task.endDate) : "",
      [t("expOverdue")]: isOverdue(task.endDate, task.status) ? t("expYes") : t("expNo"),
      [t("expNotes")]: task.notes || "",
    };
  });
  const empRows = employees.map((e) => ({
    [t("expEmpName")]: e.name, [t("expEmpRole")]: e.role, [t("expEmpTaskCount")]: taskCountFor(e.id),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(taskRows), t("expSheetTasks"));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(empRows), t("expSheetEmployees"));
  XLSX.writeFile(wb, t("expFilePrefix") + new Date().toISOString().slice(0, 10) + ".xlsx");
}

/* ===================== RENDER ===================== */
function langSwitchHtml() {
  return `
    <div class="lang-switch">
      <button type="button" class="lang-btn ${currentLang === "vi" ? "active" : ""}" onclick="setLang('vi')">VI</button>
      <button type="button" class="lang-btn ${currentLang === "en" ? "active" : ""}" onclick="setLang('en')">EN</button>
    </div>
  `;
}

function renderSyncBar() {
  const el = document.getElementById("sync-bar");
  if (!el) return;
  if (!IS_CONFIGURED) {
    el.innerHTML = `<div class="demo-banner">${ic("alert")} ${t("syncDemoBanner")}</div>${langSwitchHtml()}`;
    return;
  }
  el.innerHTML = `<span class="shared-note">${ic("users")} ${t("syncSharedNote")} ${syncing ? t("syncSaving") : lastSync ? t("syncUpdatedAt", fmtTime(lastSync)) : ""}${syncError ? `<span class="sync-error"> · ${syncError}</span>` : ""}</span>${langSwitchHtml()}`;
}

function render() {
  if (!loaded) return;
  const stats = {
    total: tasks.length,
    doing: tasks.filter((t) => t.status === "doing").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter((t) => isOverdue(t.endDate, t.status)).length,
  };
  const visibleTasks = filterId ? tasks.filter((t) => t.assigneeId === filterId) : tasks;
  const filterEmp = filterId ? employeeById(filterId) : null;

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="header">
      <div>
        <div class="title-row"><span class="led"></span><span class="title">TRUNG TÂM ĐIỀU PHỐI CÔNG VIỆC</span></div>
        <div class="subtitle">Theo dõi tiến độ công việc theo từng nhân viên.</div>
      </div>
      <div class="stats">
        <div class="stat"><div class="stat-label">Tổng công việc</div><div class="stat-value mono">${stats.total}</div></div>
        <div class="stat"><div class="stat-label">Đang thực hiện</div><div class="stat-value mono">${stats.doing}</div></div>
        <div class="stat"><div class="stat-label">Hoàn thành</div><div class="stat-value mono">${stats.done}</div></div>
        <div class="stat"><div class="stat-label">Quá hạn</div><div class="stat-value mono ${stats.overdue > 0 ? "warn" : ""}">${stats.overdue}</div></div>
      </div>
    </div>

    <div class="sync-bar" id="sync-bar"></div>

    <div class="layout">
      <div class="panel">
        <div class="panel-head">${ic("users")} Nhân sự</div>
        ${employees.length === 0 ? `<div class="empty-table">Chưa có nhân sự nào.</div>` : ""}
        ${employees.map((emp) => `
          <div class="emp-row ${filterId === emp.id ? "active" : ""}" onclick="toggleFilter('${emp.id}')">
            <span class="dot" style="background:var(--${emp.color})"></span>
            <div class="emp-info"><div class="emp-name">${escapeHtml(emp.name)}</div><div class="emp-role">${escapeHtml(emp.role)}</div></div>
            <span class="emp-count mono">${taskCountFor(emp.id)}</span>
          </div>
        `).join("")}
        ${!showEmpForm ? `
          <button class="small-btn" onclick="showEmpForm=true;render()">${ic("plus")} Thêm nhân viên</button>
        ` : `
          <div class="form">
            <input id="f-ename" placeholder="Tên nhân viên" />
            <input id="f-erole" placeholder="Chức vụ" />
            <div id="f-emp-error" class="form-error"></div>
            <div class="form-actions">
              <button class="btn-primary" onclick="addEmployee()">Thêm</button>
              <button onclick="showEmpForm=false;render()">Huỷ</button>
            </div>
          </div>
        `}
        <button class="reset-link" onclick="resetData()">Khôi phục dữ liệu mẫu</button>
      </div>

      <div>
        <div class="toolbar">
          <div class="toolbar-left">
            <div class="view-tabs">
              <button class="view-tab ${viewMode === "dashboard" ? "active" : ""}" onclick="setViewMode('dashboard')">${ic("grid")} Tổng quan</button>
              <button class="view-tab ${viewMode === "table" ? "active" : ""}" onclick="setViewMode('table')">${ic("list")} Bảng công việc</button>
            </div>
            ${filterEmp ? `<span class="filter-chip" onclick="toggleFilter('${filterEmp.id}')">Đang lọc: ${escapeHtml(filterEmp.name)} ${ic("x")}</span>` : ""}
          </div>
          <div class="toolbar-actions">
            <button class="export-btn" onclick="exportExcel()">${ic("download")} Xuất Excel</button>
            ${viewMode === "table" ? `<button class="add-task-btn" onclick="showTaskForm=!showTaskForm;render()">${ic("plus")} Thêm công việc</button>` : ""}
          </div>
        </div>

        ${viewMode === "dashboard" ? renderDashboard(visibleTasks) : `

        ${showTaskForm ? `
          <div class="task-form">
            <div class="task-form-row">
              <div><label class="field-label">Tên công việc</label><input id="f-title" placeholder="VD: Hiệu chỉnh cảm biến trạm AL" style="width:100%" /></div>
              <div><label class="field-label">Người phụ trách</label>
                <select id="f-assignee" style="width:100%"><option value="">Chọn...</option>
                  ${employees.map((e) => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join("")}
                </select>
              </div>
              <div><label class="field-label">Độ ưu tiên</label>
                <select id="f-priority" style="width:100%">
                  <option value="high">Cao</option><option value="medium" selected>Trung bình</option><option value="low">Thấp</option>
                </select>
              </div>
            </div>
            <div class="task-form-row2">
              <div><label class="field-label">Ngày giao</label><input id="f-assigned" type="date" style="width:100%" /></div>
              <div><label class="field-label">Ngày bắt đầu</label><input id="f-start" type="date" style="width:100%" /></div>
              <div><label class="field-label">Ngày kết thúc</label><input id="f-end" type="date" style="width:100%" /></div>
              <div><label class="field-label">Ghi chú</label><textarea id="f-notes" placeholder="Ghi chú thêm (không bắt buộc)"></textarea></div>
            </div>
            <div class="form-actions" style="max-width:260px">
              <button class="btn-primary" onclick="addTask()">Tạo công việc</button>
              <button onclick="showTaskForm=false;render()">Huỷ</button>
            </div>
            <div id="f-error" class="form-error"></div>
          </div>
        ` : ""}

        <div class="table-wrap">
          <table class="tasks">
            <colgroup>${colWidths.map((w) => `<col style="width:${w}px">`).join("")}</colgroup>
            <thead>
              <tr>
                ${COL_LABELS.map((label, i) => `
                  <th>${escapeHtml(label)}${i < COL_LABELS.length - 1 ? `<span class="col-resizer" onmousedown="startColResize(event,${i})"></span>` : ""}</th>
                `).join("")}
              </tr>
            </thead>
            <tbody>
              ${visibleTasks.length === 0 ? `<tr><td colspan="9" class="empty-table">Không có công việc nào.</td></tr>` : ""}
              ${visibleTasks.map((task) => {
                const emp = employeeById(task.assigneeId);
                const overdue = isOverdue(task.endDate, task.status);
                const prio = PRIORITY[task.priority] || PRIORITY.medium;
                const st = statusInfo(task.status);
                return `
                  <tr data-task-id="${task.id}" style="${rowHeights[task.id] ? "height:" + rowHeights[task.id] + "px" : ""}">
                    <td class="col-title">${escapeHtml(task.title)}</td>
                    <td class="col-assignee"><span class="assignee-cell">${emp ? `<span class="dot" style="background:var(--${emp.color})"></span>${escapeHtml(emp.name)}` : "Chưa gán"}</span></td>
                    <td><span class="badge mono" style="color:var(--${prio.color});border-color:var(--${prio.color})">${prio.label}</span></td>
                    <td>
                      <select class="status-select" style="color:var(--${st.color});border-color:var(--${st.color})" onchange="setStatus('${task.id}',this.value)">
                        ${STATUS_OPTS.map((s) => `<option value="${s.key}" ${s.key === task.status ? "selected" : ""}>${s.label}</option>`).join("")}
                      </select>
                    </td>
                    <td class="col-date">${fmtDate(task.assignedDate)}</td>
                    <td class="col-date"><input type="date" class="date-edit" value="${task.startDate || ""}" onchange="updateField('${task.id}','startDate',this.value)" /></td>
                    <td class="col-date ${overdue ? "overdue" : ""}"><input type="date" class="date-edit ${overdue ? "overdue" : ""}" value="${task.endDate || ""}" onchange="updateField('${task.id}','endDate',this.value)" />${overdue ? " ⚠" : ""}</td>
                    <td class="col-notes"><textarea class="notes-edit" rows="1" placeholder="Ghi chú..." title="${escapeAttr(task.notes || "")}" onchange="updateField('${task.id}','notes',this.value)">${escapeHtml(task.notes || "")}</textarea></td>
                    <td><div class="actions-cell">
                      <span class="row-resizer" title="Kéo để chỉnh chiều cao hàng" onmousedown="startRowResize(event,this)">${ic("grip")}</span>
                      <button class="icon-btn danger" onclick="deleteTask('${task.id}')" aria-label="Xoá công việc">${ic("trash")}</button>
                    </div></td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
        `}
      </div>
    </div>
  `;
  renderSyncBar();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(s) {
  return escapeHtml(s);
}

/* ===================== INIT ===================== */
initStorage();
