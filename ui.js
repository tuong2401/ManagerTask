/* Page layout, department tabs, and task detail editor.
 * Add departments by appending { id: "...", label: "..." } to DEPARTMENTS.
 */
// `labelKey` looks up the department name in the current UI language via t().
const DEPARTMENTS = [
  { id: "electrical", labelKey: "deptElectrical" },
  { id: "mechanical", labelKey: "deptMechanical" },
  { id: "automation", labelKey: "deptAutomation" },
];
const DEFAULT_DEPARTMENT = "electrical";
function taskTableHeaders() {
  return [t("thTask"), t("thDepartment"), t("thAssignee"), t("thPriority"), t("thStatus"), t("thDue"), t("thNotes")];
}
let activeDepartment = "all";
let selectedTaskId = null;
let taskSort = "default";

function taskDepartment(task) {
  return task.department || DEFAULT_DEPARTMENT;
}

function departmentName(id) {
  const department = DEPARTMENTS.find((item) => item.id === id);
  return department ? t(department.labelKey) : t("noDepartment");
}

function setDepartment(id) {
  activeDepartment = id;
  render();
}

function setTaskSort(value) {
  taskSort = value;
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

async function reopenTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  if (!IS_CONFIGURED) task.status = "reopen";
  render();
  await saveData((shared) => {
    const sharedTask = shared.tasks.find((item) => item.id === id);
    if (sharedTask) sharedTask.status = "reopen";
  });
  await queueTaskNotification("updated", { ...task, status: "reopen" });
}

async function addTask() {
  const title = document.getElementById("f-title").value.trim();
  const assigneeId = document.getElementById("f-assignee").value;
  const error = document.getElementById("f-error");
  if (!title || !assigneeId) {
    error.textContent = t("formErrorRequired");
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
  await queueTaskNotification("created", task);
}

async function saveTaskDetail() {
  const id = document.getElementById("d-id").value;
  const title = document.getElementById("d-title").value.trim();
  const error = document.getElementById("d-error");
  if (!title) {
    error.textContent = t("detailFormErrorRequired");
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
  await queueTaskNotification("updated", { id, ...changes });
}

async function deleteSelectedTask() {
  const task = tasks.find((item) => item.id === selectedTaskId);
  if (!task || !confirm(t("deleteConfirm", task.title))) return;
  const id = selectedTaskId;
  selectedTaskId = null;
  await deleteTask(id);
  await queueTaskNotification("deleted", task);
}

function taskDetailDialog() {
  const task = tasks.find((item) => item.id === selectedTaskId);
  if (!task) return "";
  return `
    <div class="modal-backdrop" onclick="closeTaskDetail()">
      <section class="task-modal" role="dialog" aria-modal="true" aria-label="${t("detailKicker")}" onclick="event.stopPropagation()">
        <div class="modal-head"><div><div class="modal-kicker">${t("detailKicker")}</div><h2>${t("detailTitle")}</h2></div><button class="icon-btn" onclick="closeTaskDetail()" aria-label="${t("closeLabel")}">${ic("x")}</button></div>
        <input id="d-id" type="hidden" value="${task.id}">
        <div class="detail-grid">
          <label class="detail-wide">${t("fTitle")}<input id="d-title" value="${escapeAttr(task.title)}"></label>
          <label>${t("fDepartment")}<select id="d-department">${DEPARTMENTS.map((item) => `<option value="${item.id}" ${taskDepartment(task) === item.id ? "selected" : ""}>${t(item.labelKey)}</option>`).join("")}</select></label>
          <label>${t("fAssignee")}<select id="d-assignee">${employees.map((item) => `<option value="${item.id}" ${task.assigneeId === item.id ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select></label>
          <label>${t("fPriority")}<select id="d-priority">${Object.entries(PRIORITY).map(([key, item]) => `<option value="${key}" ${task.priority === key ? "selected" : ""}>${t(item.labelKey)}</option>`).join("")}</select></label>
          <label>${t("fStatus")}<select id="d-status">${STATUS_OPTS.map((item) => `<option value="${item.key}" ${task.status === item.key ? "selected" : ""}>${t(item.labelKey)}</option>`).join("")}</select></label>
          <label>${t("fAssigned")}<input id="d-assigned" type="date" value="${task.assignedDate || ""}"></label>
          <label>${t("fStart")}<input id="d-start" type="date" value="${task.startDate || ""}"></label>
          <label>${t("fEnd")}<input id="d-end" type="date" value="${task.endDate || ""}"></label>
          <label class="detail-wide">${t("fNotes")}<textarea id="d-notes" rows="5">${escapeHtml(task.notes || "")}</textarea></label>
        </div>
        <div id="d-error" class="form-error"></div>
        <div class="modal-actions"><button class="icon-btn danger" onclick="deleteSelectedTask()" title="${t("deleteTaskLabel")}">${ic("trash")}</button><span></span><button onclick="closeTaskDetail()">${t("cancel")}</button><button class="btn-primary" onclick="saveTaskDetail()">${t("saveChanges")}</button></div>
      </section>
    </div>`;
}

function renderTaskForm() {
  if (!showTaskForm) return "";
  return `<div class="task-form">
    <div class="task-form-row">
      <div><label class="field-label">${t("fTitle")}</label><input id="f-title" style="width:100%"></div>
      <div><label class="field-label">${t("fDepartment")}</label><select id="f-department" style="width:100%">${DEPARTMENTS.map((item) => `<option value="${item.id}" ${activeDepartment === item.id ? "selected" : ""}>${t(item.labelKey)}</option>`).join("")}</select></div>
      <div><label class="field-label">${t("fAssignee")}</label><select id="f-assignee" style="width:100%"><option value="">${t("chooseAssignee")}</option>${employees.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("")}</select></div>
      <div><label class="field-label">${t("fPriority")}</label><select id="f-priority" style="width:100%"><option value="high">${t("priorityHigh")}</option><option value="medium" selected>${t("priorityMedium")}</option><option value="low">${t("priorityLow")}</option></select></div>
    </div>
    <div class="task-form-row2">
      <div><label class="field-label">${t("fAssigned")}</label><input id="f-assigned" type="date" style="width:100%"></div>
      <div><label class="field-label">${t("fStart")}</label><input id="f-start" type="date" style="width:100%"></div>
      <div><label class="field-label">${t("fEnd")}</label><input id="f-end" type="date" style="width:100%"></div>
      <div><label class="field-label">${t("fNotes")}</label><textarea id="f-notes"></textarea></div>
    </div>
    <div class="form-actions"><button class="btn-primary" onclick="addTask()">${t("createTask")}</button><button onclick="showTaskForm=false;render()">${t("cancel")}</button></div><div id="f-error" class="form-error"></div>
  </div>`;
}

function render() {
  if (!loaded) return;
  const dashboardTasks = activeDepartment === "all" ? tasks : tasks.filter((task) => taskDepartment(task) === activeDepartment);
  const filteredTasks = dashboardTasks
    // Close tasks are intentionally shown only in the completed dashboard card.
    .filter((task) => task.status !== "close")
    .slice()
    .sort((a, b) => {
      if (taskSort === "employee-asc") return (employeeById(a.assigneeId)?.name || "").localeCompare(employeeById(b.assigneeId)?.name || "", "vi");
      if (taskSort === "employee-desc") return (employeeById(b.assigneeId)?.name || "").localeCompare(employeeById(a.assigneeId)?.name || "", "vi");
      return 0;
    });
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="sync-bar" id="sync-bar"></div>
    <main class="workspace">
      <section class="dashboard-section"><div class="dashboard-label">${t("dashboardWord")} · ${activeDepartment === "all" ? t("allDepartmentsLong") : departmentName(activeDepartment)}</div>${renderDashboard(dashboardTasks)}</section>
      <nav class="department-tabs" aria-label="${t("thDepartment")}">
        <button class="department-tab ${activeDepartment === "all" ? "active" : ""}" onclick="setDepartment('all')">${t("allDepartmentsShort")} <span>${tasks.length}</span></button>
        ${DEPARTMENTS.map((item) => `<button class="department-tab ${activeDepartment === item.id ? "active" : ""}" onclick="setDepartment('${item.id}')">${t(item.labelKey)} <span>${tasks.filter((task) => taskDepartment(task) === item.id).length}</span></button>`).join("")}
      </nav>
      <section class="task-section">
        <div class="toolbar"><div><div class="section-kicker">${t("taskSectionKicker")}</div><h1>${activeDepartment === "all" ? t("allTasks") : departmentName(activeDepartment)}</h1></div><div class="toolbar-actions"><label class="task-sort">${t("sortLabel")} <select onchange="setTaskSort(this.value)"><option value="default" ${taskSort === "default" ? "selected" : ""}>${t("sortDefault")}</option><option value="employee-asc" ${taskSort === "employee-asc" ? "selected" : ""}>${t("sortEmpAsc")}</option><option value="employee-desc" ${taskSort === "employee-desc" ? "selected" : ""}>${t("sortEmpDesc")}</option></select></label><button class="export-btn" onclick="exportExcel()">${ic("download")} ${t("exportBtn")}</button><button class="add-task-btn" onclick="showTaskForm=!showTaskForm;render()">${ic("plus")} ${t("addTaskBtn")}</button></div></div>
        ${renderTaskForm()}
        <div class="table-wrap"><table class="tasks"><thead><tr>${taskTableHeaders().map((label) => `<th>${escapeHtml(label)}</th>`).join("")}</tr></thead><tbody>
          ${filteredTasks.length ? filteredTasks.map((task) => { const emp = employeeById(task.assigneeId); const priority = PRIORITY[task.priority] || PRIORITY.medium; const status = statusInfo(task.status); return `<tr class="task-row" tabindex="0" onclick="openTask('${task.id}')" onkeydown="if(event.key==='Enter')openTask('${task.id}')"><td class="col-title">${escapeHtml(task.title)}</td><td>${departmentName(taskDepartment(task))}</td><td class="col-assignee">${emp ? escapeHtml(emp.name) : t("unassigned")}</td><td><span class="badge mono" style="color:var(--${priority.color});border-color:var(--${priority.color})">${t(priority.labelKey)}</span></td><td><span class="badge mono" style="color:var(--${status.color});border-color:var(--${status.color})">${t(status.labelKey)}</span></td><td class="col-date">${fmtDate(task.endDate)}</td><td class="col-notes">${escapeHtml(task.notes || "")}</td></tr>`; }).join("") : `<tr><td colspan="7" class="empty-table">${t("emptyDeptTable")}</td></tr>`}
        </tbody></table></div>
      </section>
    </main>${taskDetailDialog()}`;
  renderSyncBar();
}

// app.js may render once before this UI module loads in demo mode.
if (loaded) render();
