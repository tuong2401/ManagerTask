/* Page layout, department tabs, and task detail editor.
 * Add departments by appending { id: "...", label: "..." } to DEPARTMENTS.
 */
const DEPARTMENTS = [
  { id: "electrical", label: "Thiết kế điện" },
  { id: "mechanical", label: "Thiết kế cơ khí" },
  { id: "automation", label: "Tự động hóa" },
];
const DEFAULT_DEPARTMENT = "electrical";
const TASK_TABLE_HEADERS = ["Công việc", "Bộ phận", "Người phụ trách", "Ưu tiên", "Trạng thái", "Hạn hoàn thành", "Ghi chú"];
let activeDepartment = "all";
let selectedTaskId = null;

function taskDepartment(task) {
  return task.department || DEFAULT_DEPARTMENT;
}

function departmentName(id) {
  const department = DEPARTMENTS.find((item) => item.id === id);
  return department ? department.label : "Chưa phân bộ phận";
}

function setDepartment(id) {
  activeDepartment = id;
  render();
}

function openTask(id) {
  selectedTaskId = id;
  render();
}

function closeTaskDetail() {
  selectedTaskId = null;
  render();
}

async function addTask() {
  const title = document.getElementById("f-title").value.trim();
  const assigneeId = document.getElementById("f-assignee").value;
  const error = document.getElementById("f-error");
  if (!title || !assigneeId) {
    error.textContent = "Vui lòng nhập tên công việc và người phụ trách.";
    return;
  }
  const task = {
    id: uid("t"), title, assigneeId,
    department: document.getElementById("f-department").value,
    priority: document.getElementById("f-priority").value,
    status: "todo",
    assignedDate: document.getElementById("f-assigned").value,
    startDate: document.getElementById("f-start").value,
    endDate: document.getElementById("f-end").value,
    notes: document.getElementById("f-notes").value.trim(),
  };
  if (!IS_CONFIGURED) tasks.push(task);
  showTaskForm = false;
  render();
  await saveData((shared) => shared.tasks.push(task));
}

async function saveTaskDetail() {
  const id = document.getElementById("d-id").value;
  const title = document.getElementById("d-title").value.trim();
  const error = document.getElementById("d-error");
  if (!title) {
    error.textContent = "Tên công việc không được để trống.";
    return;
  }
  const changes = {
    title,
    department: document.getElementById("d-department").value,
    assigneeId: document.getElementById("d-assignee").value,
    priority: document.getElementById("d-priority").value,
    status: document.getElementById("d-status").value,
    assignedDate: document.getElementById("d-assigned").value,
    startDate: document.getElementById("d-start").value,
    endDate: document.getElementById("d-end").value,
    notes: document.getElementById("d-notes").value.trim(),
  };
  if (!IS_CONFIGURED) {
    const task = tasks.find((item) => item.id === id);
    if (task) Object.assign(task, changes);
  }
  selectedTaskId = null;
  render();
  await saveData((shared) => {
    const task = shared.tasks.find((item) => item.id === id);
    if (task) Object.assign(task, changes);
  });
}

async function deleteSelectedTask() {
  const task = tasks.find((item) => item.id === selectedTaskId);
  if (!task || !confirm(`Xóa công việc “${task.title}”?`)) return;
  const id = selectedTaskId;
  selectedTaskId = null;
  await deleteTask(id);
}

function taskDetailDialog() {
  const task = tasks.find((item) => item.id === selectedTaskId);
  if (!task) return "";
  return `
    <div class="modal-backdrop" onclick="closeTaskDetail()">
      <section class="task-modal" role="dialog" aria-modal="true" aria-label="Chi tiết công việc" onclick="event.stopPropagation()">
        <div class="modal-head"><div><div class="modal-kicker">CHI TIẾT CÔNG VIỆC</div><h2>Chỉnh sửa task</h2></div><button class="icon-btn" onclick="closeTaskDetail()" aria-label="Đóng">${ic("x")}</button></div>
        <input id="d-id" type="hidden" value="${task.id}">
        <div class="detail-grid">
          <label class="detail-wide">Tên công việc<input id="d-title" value="${escapeAttr(task.title)}"></label>
          <label>Bộ phận<select id="d-department">${DEPARTMENTS.map((item) => `<option value="${item.id}" ${taskDepartment(task) === item.id ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
          <label>Người phụ trách<select id="d-assignee">${employees.map((item) => `<option value="${item.id}" ${task.assigneeId === item.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select></label>
          <label>Ưu tiên<select id="d-priority">${Object.entries(PRIORITY).map(([key, item]) => `<option value="${key}" ${task.priority === key ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
          <label>Trạng thái<select id="d-status">${STATUS_OPTS.map((item) => `<option value="${item.key}" ${task.status === item.key ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
          <label>Ngày giao<input id="d-assigned" type="date" value="${task.assignedDate || ""}"></label>
          <label>Ngày bắt đầu<input id="d-start" type="date" value="${task.startDate || ""}"></label>
          <label>Ngày kết thúc<input id="d-end" type="date" value="${task.endDate || ""}"></label>
          <label class="detail-wide">Ghi chú<textarea id="d-notes" rows="5">${escapeHtml(task.notes || "")}</textarea></label>
        </div>
        <div id="d-error" class="form-error"></div>
        <div class="modal-actions"><button class="icon-btn danger" onclick="deleteSelectedTask()" title="Xóa công việc">${ic("trash")}</button><span></span><button onclick="closeTaskDetail()">Hủy</button><button class="btn-primary" onclick="saveTaskDetail()">Lưu thay đổi</button></div>
      </section>
    </div>`;
}

function renderTaskForm() {
  if (!showTaskForm) return "";
  return `<div class="task-form">
    <div class="task-form-row">
      <div><label class="field-label">Tên công việc</label><input id="f-title" style="width:100%"></div>
      <div><label class="field-label">Bộ phận</label><select id="f-department" style="width:100%">${DEPARTMENTS.map((item) => `<option value="${item.id}" ${activeDepartment === item.id ? "selected" : ""}>${item.label}</option>`).join("")}</select></div>
      <div><label class="field-label">Người phụ trách</label><select id="f-assignee" style="width:100%"><option value="">Chọn...</option>${employees.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("")}</select></div>
      <div><label class="field-label">Ưu tiên</label><select id="f-priority" style="width:100%"><option value="high">Cao</option><option value="medium" selected>Trung bình</option><option value="low">Thấp</option></select></div>
    </div>
    <div class="task-form-row2">
      <div><label class="field-label">Ngày giao</label><input id="f-assigned" type="date" style="width:100%"></div>
      <div><label class="field-label">Ngày bắt đầu</label><input id="f-start" type="date" style="width:100%"></div>
      <div><label class="field-label">Ngày kết thúc</label><input id="f-end" type="date" style="width:100%"></div>
      <div><label class="field-label">Ghi chú</label><textarea id="f-notes"></textarea></div>
    </div>
    <div class="form-actions"><button class="btn-primary" onclick="addTask()">Tạo công việc</button><button onclick="showTaskForm=false;render()">Hủy</button></div><div id="f-error" class="form-error"></div>
  </div>`;
}

function render() {
  if (!loaded) return;
  const filteredTasks = activeDepartment === "all" ? tasks : tasks.filter((task) => taskDepartment(task) === activeDepartment);
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="sync-bar" id="sync-bar"></div>
    <main class="workspace">
      <section class="dashboard-section">${renderDashboard(tasks)}</section>
      <nav class="department-tabs" aria-label="Bộ phận">
        <button class="department-tab ${activeDepartment === "all" ? "active" : ""}" onclick="setDepartment('all')">Tất cả <span>${tasks.length}</span></button>
        ${DEPARTMENTS.map((item) => `<button class="department-tab ${activeDepartment === item.id ? "active" : ""}" onclick="setDepartment('${item.id}')">${item.label} <span>${tasks.filter((task) => taskDepartment(task) === item.id).length}</span></button>`).join("")}
      </nav>
      <section class="task-section">
        <div class="toolbar"><div><div class="section-kicker">CÔNG VIỆC</div><h1>${activeDepartment === "all" ? "Tất cả công việc" : departmentName(activeDepartment)}</h1></div><div class="toolbar-actions"><button class="export-btn" onclick="exportExcel()">${ic("download")} Xuất Excel</button><button class="add-task-btn" onclick="showTaskForm=!showTaskForm;render()">${ic("plus")} Thêm công việc</button></div></div>
        ${renderTaskForm()}
        <div class="table-wrap"><table class="tasks"><thead><tr>${TASK_TABLE_HEADERS.map((label) => `<th>${escapeHtml(label)}</th>`).join("")}</tr></thead><tbody>
          ${filteredTasks.length ? filteredTasks.map((task) => { const emp = employeeById(task.assigneeId); const priority = PRIORITY[task.priority] || PRIORITY.medium; const status = statusInfo(task.status); return `<tr class="task-row" tabindex="0" onclick="openTask('${task.id}')" onkeydown="if(event.key==='Enter')openTask('${task.id}')"><td class="col-title">${escapeHtml(task.title)}</td><td>${departmentName(taskDepartment(task))}</td><td class="col-assignee">${emp ? escapeHtml(emp.name) : "Chưa gán"}</td><td><span class="badge mono" style="color:var(--${priority.color});border-color:var(--${priority.color})">${priority.label}</span></td><td><span class="badge mono" style="color:var(--${status.color});border-color:var(--${status.color})">${status.label}</span></td><td class="col-date">${fmtDate(task.endDate)}</td><td class="col-notes">${escapeHtml(task.notes || "")}</td></tr>`; }).join("") : `<tr><td colspan="7" class="empty-table">Chưa có công việc trong bộ phận này.</td></tr>`}
        </tbody></table></div>
      </section>
    </main>${taskDetailDialog()}`;
  renderSyncBar();
}

// app.js may render once before this UI module loads in demo mode.
if (loaded) render();
