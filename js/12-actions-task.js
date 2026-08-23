/* =====================================================================
   12-actions-task.js — Thao tác CRUD công việc (task) + modal chi tiết
   
   ===================================================================== */

/* ===================== TASK ACTIONS ===================== */
async function addTask() {
  const title = document.getElementById("f-title").value.trim();
  const assignee = document.getElementById("f-assignee").value;
  const priority = document.getElementById("f-priority").value;
  const machineId = document.getElementById("f-machine").value;
  const startDate = document.getElementById("f-start").value;
  const endDate = document.getElementById("f-end").value;
  const deadline = document.getElementById("f-deadline").value;
  const notes = document.getElementById("f-notes").value.trim();
  const errEl = document.getElementById("f-error");
  if (!title || !assignee) { if (errEl) errEl.textContent = "Vui lòng nhập tên công việc và chọn người phụ trách."; return; }
  tasks.push({ id: uid("t"), title, assigneeId: assignee, departmentId: activeDeptId, machineId: machineId || "", priority, status: "todo", startDate, endDate, deadline, notes });
  showTaskForm = false;
  render();
  await saveData();
}
async function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  if (taskModalId === id) taskModalId = null;
  render();
  await saveData();
}
async function setStatus(id, newStatus) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.status = newStatus;
  render();
  await saveData();
}
async function updateField(id, field, value) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t[field] = value;
  render();
  await saveData();
}
function toggleFilter(id) { filterId = filterId === id ? null : id; render(); }

function openTaskModal(id) { taskModalId = id; render(); }
function closeTaskModal() { taskModalId = null; render(); }
async function saveTaskModal(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.title = document.getElementById("m-title").value.trim() || t.title;
  t.assigneeId = document.getElementById("m-assignee").value;
  t.machineId = document.getElementById("m-machine").value;
  t.priority = document.getElementById("m-priority").value;
  t.status = document.getElementById("m-status").value;
  t.startDate = document.getElementById("m-start").value;
  t.endDate = document.getElementById("m-end").value;
  t.deadline = document.getElementById("m-deadline").value;
  t.notes = document.getElementById("m-notes").value;
  taskModalId = null;
  render();
  await saveData();
}
