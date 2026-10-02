/* =====================================================================
   12-actions-task.js — Thao tác CRUD công việc (task) + modal chi tiết
   
   ===================================================================== */

/* ===================== TASK ACTIONS ===================== */
async function addTask() {
  if (!hasPermission('task:create')) {
    alert(t("err_perm_add_task"));
    return;
  }
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
  const target = tasks.find((t) => t.id === id);
  if (!canDeleteTask(target)) {
    alert(t("err_perm_del_task"));
    return;
  }
  if (!confirm("Xoá công việc này?")) return;
  tasks = tasks.filter((t) => t.id !== id);
  if (taskModalId === id) taskModalId = null;
  render();
  await saveData();
}
async function setStatus(id, newStatus) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  if (!canChangeTaskStatus(t, newStatus)) {
    if (isOverdue(t) && !hasPermission('task:edit')) {
      alert(t("err_task_overdue_locked"));
    } else if (newStatus === 'closed' || t.status === 'closed') {
      alert(t("err_perm_status_close"));
    } else {
      alert(t("err_perm_only_pic_status"));
    }
    render();
    return;
  }
  t.status = newStatus;
  render();
  await saveData();
}
async function closeTask(id) {
  if (!hasPermission('task:status_close')) {
    alert(t("err_perm_status_close"));
    return;
  }
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.status = "closed";
  render();
  await saveData();
}
async function reopenTask(id) {
  if (!hasPermission('task:status_close')) {
    alert(t("err_perm_status_close"));
    return;
  }
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.status = "todo";
  render();
  await saveData();
}
async function updateField(id, field, value) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  if (field === 'status') {
    if (!canChangeTaskStatus(t, value)) {
      if (isOverdue(t) && !hasPermission('task:edit')) alert(t("err_task_overdue_locked"));
      else if (value === 'closed' || t.status === 'closed') alert(t("err_perm_status_close"));
      else alert(t("err_perm_only_pic_status"));
      render();
      return;
    }
  } else {
    if (!canEditTask(t)) {
      if (isOverdue(t) && !hasPermission('task:edit')) alert(t("err_task_overdue_locked"));
      else alert(t("err_perm_edit_task"));
      render();
      return;
    }
  }
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
  const statusEl = document.getElementById("m-status");
  if (statusEl) {
    const newStatus = statusEl.value;
    if (newStatus && newStatus !== t.status) {
      if (canChangeTaskStatus(t, newStatus)) {
        t.status = newStatus;
      }
    }
  }
  if (canEditTask(t)) {
    if (hasPermission('task:edit')) {
      t.title = document.getElementById("m-title").value.trim() || t.title;
      t.assigneeId = document.getElementById("m-assignee").value;
      t.machineId = document.getElementById("m-machine").value;
      t.priority = document.getElementById("m-priority").value;
      t.startDate = document.getElementById("m-start").value;
      t.endDate = document.getElementById("m-end").value;
      t.deadline = document.getElementById("m-deadline").value;
    }
    const notesEl = document.getElementById("m-notes");
    if (notesEl) t.notes = notesEl.value;
  }
  taskModalId = null;
  render();
  await saveData();
}
