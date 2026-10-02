/* =====================================================================
   19-modal-task.js — Modal xem/sửa chi tiết 1 công việc
   
   ===================================================================== */

/* ===================== TASK DETAIL MODAL ===================== */
function renderTaskModal() {
  const currentTask = taskById(taskModalId);
  if (!currentTask) return "";
  const dept = departmentById(currentTask.departmentId);
  const emps = deptEmployees(currentTask.departmentId);
  const machs = deptMachines(currentTask.departmentId);

  const canEdit = canEditTask(currentTask);
  const canDelete = canDeleteTask(currentTask);
  const isManager = hasPermission('task:edit');
  const overdue = isOverdue(currentTask);
  const isPic = currentUser && currentTask.assigneeId === currentUser.id;
  const canChangeStatus = canChangeTaskStatus(currentTask, currentTask.status);
  const canClose = hasPermission('task:status_close');
  const progressOpts = STATUS_OPTS.filter((s) => s.key !== 'closed');
  const st = statusInfo(currentTask.status);

  return `
    <div class="modal-overlay" onclick="if(event.target===this) closeTaskModal()">
      <div class="modal">
        <div class="modal-head">
          <h3>${t("modal_task_detail")}</h3>
          <button class="modal-close" onclick="closeTaskModal()">${ic("x")}</button>
        </div>
        ${
          overdue && !isManager
            ? `<div style="background:var(--red-soft);border:1px solid var(--red);color:var(--red);border-radius:8px;padding:9px 12px;font-size:12.5px;margin-bottom:14px;display:flex;align-items:center;gap:8px;font-weight:500;">
                ${ic("alert")} ${t("task_overdue_banner")}
               </div>`
            : ""
        }
        <div class="modal-grid full modal-field">
          <div><label class="field-label">${t("form_task_name")}</label><input id="m-title" ${!isManager ? "disabled" : ""} value="${escapeAttr(currentTask.title)}" /></div>
        </div>
        <div class="modal-grid">
          <div class="modal-field"><label class="field-label">${t("form_pic")}</label>
            <select id="m-assignee" ${!isManager ? "disabled" : ""}>${emps.map((e) => `<option value="${e.id}" ${e.id === currentTask.assigneeId ? "selected" : ""}>${escapeHtml(e.name)}</option>`).join("")}</select>
          </div>
          <div class="modal-field"><label class="field-label">${isOfficeDept(dept) ? t("form_project_attach") : t("form_machine_attach")}</label>
            <select id="m-machine" ${!isManager ? "disabled" : ""}><option value="">${isOfficeDept(dept) ? t("form_no_project") : t("form_no_machine")}</option>${machs.map((m) => `<option value="${m.id}" ${m.id === currentTask.machineId ? "selected" : ""}>${escapeHtml(m.name)}</option>`).join("")}</select>
          </div>
          <div class="modal-field"><label class="field-label">${t("form_priority")}</label>
            <select id="m-priority" ${!isManager ? "disabled" : ""}>
              <option value="high" ${currentTask.priority === "high" ? "selected" : ""}>${t("pri_high")}</option>
              <option value="medium" ${currentTask.priority === "medium" ? "selected" : ""}>${t("pri_medium")}</option>
              <option value="low" ${currentTask.priority === "low" ? "selected" : ""}>${t("pri_low")}</option>
            </select>
          </div>
          <div class="modal-field"><label class="field-label">${t("modal_status")}</label>
            ${
              isPic && currentTask.status !== 'closed' && (!overdue || isManager)
                ? `<select id="m-status">${progressOpts.map((s) => `<option value="${s.key}" ${s.key === currentTask.status ? "selected" : ""}>${s.label}</option>`).join("")}</select>`
                : `<input value="${escapeAttr(st.label)}" disabled style="color:var(--${st.color});font-weight:600;border-color:var(--${st.color})" />`
            }
          </div>
          <div class="modal-field"><label class="field-label">${t("form_start_date")}</label><input id="m-start" type="date" ${!isManager ? "disabled" : ""} value="${currentTask.startDate || ""}" /></div>
          <div class="modal-field"><label class="field-label">${t("form_end_date")}</label><input id="m-end" type="date" ${!isManager ? "disabled" : ""} value="${currentTask.endDate || ""}" /></div>
          <div class="modal-field"><label class="field-label">${t("form_deadline")}</label><input id="m-deadline" type="date" ${!isManager ? "disabled" : ""} value="${currentTask.deadline || ""}" /></div>
          <div class="modal-field"><label class="field-label">Bộ phận</label><input value="${escapeAttr(dept ? dept.name : "")}" disabled /></div>
        </div>
        <div class="modal-grid full modal-field">
          <div><label class="field-label">${t("form_notes")}</label><textarea id="m-notes" rows="3" ${!canEdit ? "disabled" : ""}>${escapeHtml(currentTask.notes || "")}</textarea></div>
        </div>
        <div class="modal-actions">
          <div style="display:flex;align-items:center;gap:8px">
            ${canDelete ? `<button class="icon-btn danger" onclick="deleteTask('${currentTask.id}')" aria-label="Xoá công việc">${ic("trash")}</button>` : ""}
            ${
              canClose
                ? (currentTask.status !== 'closed'
                    ? `<button class="btn" style="border-color:var(--purple);color:var(--purple);display:flex;align-items:center;gap:6px" onclick="closeTask('${currentTask.id}');closeTaskModal()">${ic("lock")} ${t("btn_close_task")}</button>`
                    : `<button class="btn" style="border-color:var(--teal);color:var(--teal);display:flex;align-items:center;gap:6px" onclick="reopenTask('${currentTask.id}');closeTaskModal()">${ic("unlock")} ${t("btn_reopen_task")}</button>`)
                : ""
            }
          </div>
          <div class="modal-actions-right">
            <button onclick="closeTaskModal()">${t("btn_cancel")}</button>
            ${(canEdit || (isPic && currentTask.status !== 'closed' && (!overdue || isManager))) ? `<button class="btn-primary" onclick="saveTaskModal('${currentTask.id}')">${t("btn_save")}</button>` : ""}
          </div>
        </div>
      </div>
    </div>
  `;
}
  