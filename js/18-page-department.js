/* =====================================================================
   18-page-department.js — Trang BỘ PHẬN (Dashboard / Nhân viên / Task / Máy)
   
   ===================================================================== */

/* ===================== DEPARTMENT PAGE ===================== */
function renderDepartment() {
  const dept = departmentById(activeDeptId);
  if (!dept) {
    backToOverview();
    return "";
  }
  const dTasks = deptTasks(dept.id);
  const stats = {
    total: dTasks.length,
    doing: dTasks.filter((t) => t.status === "doing").length,
    done: dTasks.filter((t) => t.status === "done").length,
    overdue: dTasks.filter((t) => isOverdue(t)).length,
  };
  let body = "";
  if (deptTab === "dashboard")
    body = renderDashboardBlock(dTasks, deptEmployees(dept.id));
  else if (deptTab === "employees") body = renderDeptEmployeesTab(dept);
  else if (deptTab === "tasks") body = renderDeptTasksTab(dept);
  else body = renderDeptMachinesTab(dept);

  return `
        <div class="header">
      <div>
        <div class="title-row">
          <button class="back-btn" onclick="backToOverview()">${ic("back")} ${t("overview")}</button>
          <span class="title" style="margin-left:8px">${escapeHtml(dept.name).toUpperCase()}</span>
        </div>
        <div class="subtitle">${t("dept_subtitle", { name: escapeHtml(dept.name) })}</div>
      </div>
      <div class="stats">
        <div class="stat"><div class="stat-label">${t("stat_team_total")}</div><div class="stat-value mono">${stats.total}</div></div>
        <div class="stat"><div class="stat-label">${t("stat_in_progress")}</div><div class="stat-value mono">${stats.doing}</div></div>
        <div class="stat"><div class="stat-label">${t("stat_completed")}</div><div class="stat-value mono">${stats.done}</div></div>
        <div class="stat"><div class="stat-label">${t("stat_overdue")}</div><div class="stat-value mono ${stats.overdue > 0 ? "warn" : ""}">${stats.overdue}</div></div>
        <div style="display:flex;align-items:center;gap:8px;">
          ${renderLangSwitcher()}
          <div class="user-chip">${ic("users")}<span class="who"><b>${escapeHtml(currentUser.name)}</b></span><button class="logout-btn" onclick="logout()">${ic("logout")} ${t("logout")}</button></div>
        </div>
      </div>
    </div>
    <div class="sync-bar" id="sync-bar"></div>
    ${
      isDeptReadOnly(dept.id)
        ? `<div style="background:var(--blue-soft);border:1px solid var(--blue);color:var(--blue);border-radius:8px;padding:8px 12px;font-size:12.5px;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
            ${ic("alert")} <span>${t("dept_view_only_banner")}</span>
           </div>`
        : ""
    }

    <div class="toolbar">
      <div class="view-tabs">
        <button class="view-tab ${deptTab === "dashboard" ? "active" : ""}" onclick="setDeptTab('dashboard')">${ic("grid")} ${t("tab_dashboard")}</button>
        <button class="view-tab ${deptTab === "employees" ? "active" : ""}" onclick="setDeptTab('employees')">${ic("users")} ${t("tab_employees")}</button>
        <button class="view-tab ${deptTab === "tasks" ? "active" : ""}" onclick="setDeptTab('tasks')">${ic("clipboard")} ${t("tab_tasks")}</button>
        <button class="view-tab ${deptTab === "machines" ? "active" : ""}" onclick="setDeptTab('machines')">${isOfficeDept(dept) ? ic("folder") : ic("wrench")} ${isOfficeDept(dept) ? t("tab_machines_office") : t("tab_machines_tech")}</button>
      </div>
      ${hasPermission('data:export') ? `<div class="toolbar-actions"><button class="export-btn" onclick="exportExcel()">${ic("download")} ${t("export_excel")}</button></div>` : ""}
    </div>
    ${body}
  `;
}

/* ---- Tab: Nhân viên (nhân viên / đơn nghỉ / lịch đi làm) ---- */
function renderDeptEmployeesTab(dept) {
  const emps = deptEmployees(dept.id);
  const leaves = deptLeaves(dept.id)
    .slice()
    .sort((a, b) => (b.fromDate || "").localeCompare(a.fromDate || ""));

  const empRows = emps.length
    ? emps
        .map(
          (e) => `
    <div class="emp-row">
      <span class="dot" style="background:var(--${e.color})"></span>
      <div class="emp-info">
        <div class="emp-name">${escapeHtml(e.name)} <span class="emp-code">· ${escapeHtml(e.code)}</span></div>
        <div class="emp-role">${escapeHtml(e.role)}</div>
      </div>
      <span class="emp-count mono">${taskCountFor(e.id)}</span>
      ${hasPermission("employee:delete") && (!currentUser || currentUser.id !== e.id) ? `<button class="icon-btn danger" style="margin-left:4px" onclick="deleteEmployee('${e.id}')" aria-label="${t("btn_delete")}">${ic("trash")}</button>` : ""}
    </div>
  `,
        )
        .join("")
    : `<div class="empty-table" style="padding:16px">${t("empty_dept_employees")}</div>`;

  const leaveEmpOptions = emps
    .map(
      (e) =>
        `<option value="${e.id}">${escapeHtml(e.name)} (${escapeHtml(e.code)})</option>`,
    )
    .join("");
  let visibleLeaves = leaves;
  if (!hasPermission("leave:approve")) {
    visibleLeaves = leaves.filter((l) => l.employeeId == currentUser.id);
  }
  const leaveList = visibleLeaves.length
    ? visibleLeaves
        .map((l) => {
          const emp = employeeById(l.employeeId);
          const stColor =
            l.status === "approved"
              ? "green"
              : l.status === "rejected"
                ? "red"
                : l.status === "pending_director"
                  ? "purple"
                  : "amber";
          const stLabel =
            l.status === "approved" ? t("leave_status_approved")
            : l.status === "rejected" ? t("leave_status_rejected")
            : l.status === "pending_director" ? t("leave_status_pending_director")
            : t("leave_status_pending");

          // Chỉ được duyệt nếu: có quyền approve + KHÔNG phải đơn của mình
          // + nếu status pending_director thì chỉ admin/director mới được
          const isHighRole = currentUser && (currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'director');
          const canApproveThis = hasPermission("leave:approve")
            && l.employeeId !== currentUser.id
            && (l.status !== "pending_director" || isHighRole);

          return `
      <div class="leave-item">
        <div class="item-info">
          <div class="item-title">${emp ? escapeHtml(emp.name) : t("deleted_user")} <span class="item-sub">(${fmtDate(l.fromDate)} → ${fmtDate(l.toDate)})</span></div>
          ${l.reason ? `<div class="item-sub">${escapeHtml(l.reason)}</div>` : ""}
        </div>
        <div class="leave-actions">
          ${
            canApproveThis
              ? `
                    <select class="status-select" style="color:var(--${stColor});border-color:var(--${stColor})" onchange="setLeaveStatus('${l.id}',this.value)">
                      <option value="pending" ${l.status === "pending" ? "selected" : ""}>${t("leave_status_pending")}</option>
                      ${isHighRole ? `<option value="pending_director" ${l.status === "pending_director" ? "selected" : ""}>${t("leave_status_pending_director")}</option>` : ""}
                      <option value="approved" ${l.status === "approved" ? "selected" : ""}>${t("leave_status_approved")}</option>
                      <option value="rejected" ${l.status === "rejected" ? "selected" : ""}>${t("leave_status_rejected")}</option>
                    </select>
                `
              : `
                  <span class="badge mono" style="color:var(--${stColor});border-color:var(--${stColor})">
                    ${stLabel}
                  </span>
                `
          }
          ${
            (l.status === "pending" || l.status === "pending_director") &&
            (l.employeeId === currentUser.id || hasPermission("leave:approve", l.departmentId))
              ? `<button class="icon-btn danger" title="${t("btn_delete") || "Xoá"}" onclick="deleteLeave('${l.id}')">${ic("trash")}</button>`
              : ""
          }
        </div>
      </div>`;
        })
        .join("")
    : `<div class="empty-dash">${t("empty_leaves")}</div>`;

  const calEmpOptions = emps
    .map(
      (e) =>
        `<option value="${e.id}" ${calEmpId === e.id ? "selected" : ""}>${escapeHtml(e.name)}</option>`,
    )
    .join("");
  const locale = currentLang === "en" ? "en-US" : "vi-VN";
  const monthLabel = calMonth.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  return `
    <div class="dash-grid">
      <div class="dash-card">
        <div class="dash-card-head">${ic("users")} ${t("card_emp_manage")}</div>
        ${empRows}
          ${
            hasPermission("employee:add")
              ? !showEmpForm
                ? `<button class="small-btn" onclick="showEmpForm=true;render()">${ic("plus")} ${t("btn_add_emp")}</button>`
                : `<div class="form">
                 <input id="f-ecode" placeholder="${t("f_emp_code_ph")}" />
               <input id="f-ename" placeholder="${t("f_emp_name_ph")}" />
               <input id="f-erole" placeholder="${t("f_emp_role_ph")}" />
               <select id="f-eaccess" style="width:100%;margin-bottom:8px">
                 <option value="employee">${t("role_employee")}</option>
                 <option value="dept_manager">${t("role_dept_manager")}</option>
                 ${currentUser && (currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'director') ? `<option value="director">${t("role_director")}</option>` : ""}
               </select>
               <input id="f-epass" placeholder="${t("f_emp_pass_ph")}" />
               <div id="f-emp-error" class="form-error"></div>
               <div class="form-actions">
                 <button class="btn-primary" onclick="addEmployee('${dept.id}')">${t("btn_save")}</button>
                 <button onclick="showEmpForm=false;render()">${t("btn_cancel")}</button>
               </div>
             </div>`
              : ""
          }
      </div>

      <div class="dash-card">
        <div class="dash-card-head">${ic("calendar")} ${t("card_leave_manage")}</div>
        ${
          !showLeaveForm
            ? `<button class="small-btn" onclick="showLeaveForm=true;render()">${ic("plus")} ${t("btn_create_leave")}</button>`
            : `<div class="form" style="margin-top:0;border-top:none;padding-top:0">
               ${
                 hasPermission("leave:approve")
                   ? `<select id="f-lemp"><option value="">${t("select_emp")}</option>${leaveEmpOptions}</select>
                      <div style="color:var(--amber);font-size:0.82em;margin-top:4px;opacity:0.85">${t("leave_director_note")}</div>`
                   : `<input type="hidden" id="f-lemp" value="${currentUser.id}" />
                     <div style="margin-bottom: 8px; font-weight: 500;">${t("leave_applicant")}: <span style="color:var(--blue)">${escapeHtml(currentUser.name)}</span></div>
                     ${currentUser.accessLevel === 'dept_manager' ? `<div style="color:var(--amber);font-size:0.82em;margin-bottom:6px">${t("leave_director_note")}</div>` : ""}`
               }
               <div style="display:flex;gap:8px">
                 <input id="f-lfrom" type="date" style="flex:1" />
                 <input id="f-lto" type="date" style="flex:1" />
               </div>
               <input id="f-lreason" placeholder="${t("leave_reason_ph")}" />
               <div id="f-leave-error" class="form-error"></div>
               <div class="form-actions">
                 <button class="btn-primary" onclick="addLeave()">${t("btn_create")}</button>
                 <button onclick="showLeaveForm=false;render()">${t("btn_cancel")}</button>
               </div>
             </div>`
        }
        <div class="leave-list" style="margin-top:12px">${leaveList}</div>
      </div>

      <div class="dash-card" style="grid-column:1 / -1">
        <div class="dash-card-head">${ic("calendar")} ${t("card_attendance_cal")}</div>
        ${
          emps.length
            ? `
          <div class="cal-head">
            <select onchange="setCalEmp(this.value)" style="min-width:180px">${calEmpOptions}</select>
            <div style="display:flex;align-items:center;gap:8px">
              <button class="cal-nav-btn" onclick="calPrevMonth()">‹</button>
              <span class="cal-month-label">${escapeHtml(monthLabel)}</span>
              <button class="cal-nav-btn" onclick="calNextMonth()">›</button>
            </div>
          </div>
          ${buildCalendar(calEmpId, calMonth)}
          <div class="cal-legend">
            <span><span class="sw" style="background:var(--panel-2);border:1px solid var(--border)"></span>${t("calendar_working")}</span>
            <span><span class="sw" style="background:var(--amber-soft);border:1px solid var(--amber)"></span>${t("calendar_leave")}</span>
            <span><span class="sw" style="background:var(--panel-2)"></span>${t("calendar_weekend")}</span>
          </div>
        `
            : `<div class="empty-dash">${t("empty_calendar")}</div>`
        }
      </div>
    </div>
  `;
}

/* ---- Tab: Task công việc ---- */
function renderDeptTasksTab(dept) {
  const emps = deptEmployees(dept.id);
  const allDeptTasks = deptTasks(dept.id);
  const visibleTasks = filterId
    ? allDeptTasks.filter((t) => t.assigneeId === filterId)
    : allDeptTasks;
  const filterEmp = filterId ? employeeById(filterId) : null;
  const machineOptions = deptMachines(dept.id)
    .map((m) => `<option value="${m.id}">${escapeHtml(m.name)}</option>`)
    .join("");

  return `
    <div class="layout">
      <div class="panel">
        <div class="panel-head">${ic("users")} ${t("filter_by_emp")}</div>
        ${emps.length === 0 ? `<div class="empty-table">${t("empty_personnel")}</div>` : ""}
        ${emps
          .map(
            (emp) => `
          <div class="emp-row ${filterId === emp.id ? "active" : ""}" onclick="toggleFilter('${emp.id}')">
            <span class="dot" style="background:var(--${emp.color})"></span>
            <div class="emp-info"><div class="emp-name">${escapeHtml(emp.name)}</div><div class="emp-role">${escapeHtml(emp.role)}</div></div>
            <span class="emp-count mono">${taskCountFor(emp.id)}</span>
          </div>
        `,
          )
          .join("")}
      </div>

      <div>
        <div class="toolbar">
          <div class="toolbar-left">
            ${filterEmp ? `<span class="filter-chip" onclick="toggleFilter('${filterEmp.id}')">${t("filter_filtering", { name: escapeHtml(filterEmp.name) })} ${ic("x")}</span>` : `<span style="font-size:12.5px;color:var(--text-faint)">${t("filter_hint_click_task")}</span>`}
          </div>
          <div class="toolbar-actions">
            ${hasPermission('task:create') ? `<button class="add-task-btn" onclick="showTaskForm=!showTaskForm;render()">${ic("plus")}${t("btn_add_task")}</button>` : ""}
          </div>
        </div>

        ${
          showTaskForm
            ? `
          <div class="task-form">
            <div class="task-form-row">
            <div><label class="field-label">${t("form_task_name")}</label><input id="f-title" placeholder="VD: Hiệu chỉnh cảm biến trạm AL" style="width:100%" /></div>
            <div><label class="field-label">${t("form_pic")}</label>
              <select id="f-assignee" style="width:100%"><option value="">${t("form_choose")}</option>
                ${emps.map((e) => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join("")}
              </select>
            </div>
            <div><label class="field-label">${t("form_priority")}</label>
              <select id="f-priority" style="width:100%">
                <option value="high">${t("pri_high")}</option><option value="medium" selected>${t("pri_medium")}</option><option value="low">${t("pri_low")}</option>
              </select>
            </div>
          </div>
          <div class="task-form-row3">
            <div><label class="field-label">${isOfficeDept(dept) ? t("form_project_attach") : t("form_machine_attach")}</label>
              <select id="f-machine" style="width:100%"><option value="">${isOfficeDept(dept) ? t("form_no_project") : t("form_no_machine")}</option>${machineOptions}</select>
            </div>
            <div><label class="field-label">${t("form_notes")}</label><textarea id="f-notes" placeholder="${t("form_notes_placeholder")}"></textarea></div>
          </div>
          <div class="task-form-row2">
            <div><label class="field-label">${t("form_start_date")}</label><input id="f-start" type="date" style="width:100%" /></div>
            <div><label class="field-label">${t("form_end_date")}</label><input id="f-end" type="date" style="width:100%" /></div>
            <div><label class="field-label">${t("form_deadline")}</label><input id="f-deadline" type="date" style="width:100%" /></div>
            <div></div>
          </div>
          <div class="form-actions" style="max-width:260px">
            <button class="btn-primary" onclick="addTask()">${t("btn_save")}</button>
            <button class="btn btn-ghost" onclick="showTaskForm=false;render()">${t("btn_cancel")}</button>
            <div id="f-error" class="form-error"></div>
          </div>
        `
            : ""
        }

        <div class="table-wrap">
          <table class="tasks">
            <colgroup>${colWidths.map((w) => `<col style="width:${w}px">`).join("")}</colgroup>
            <thead>
              <tr>
                ${getColLabels()
                  .map(
                    (label, i) => `
                  <th>${escapeHtml(label)}${i < getColLabels().length - 1 ? `<span class="col-resizer" onmousedown="startColResize(event,${i})"></span>` : ""}</th>
                `,
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${visibleTasks.length === 0 ? `<tr><td colspan="9" class="empty-table">${t("no_tasks_table")}</td></tr>` : ""}
              ${visibleTasks
                .map((task) => {
                  const emp = employeeById(task.assigneeId);
                  const overdue = isOverdue(task);
                  const prio = priorityInfo(task.priority);
                  const st = statusInfo(task.status);
                  const canEdit = canEditTask(task);
                  const canDelete = canDeleteTask(task);
                  const isManager = hasPermission('task:edit', task.departmentId);
                  const canEditNotes = canEditTaskNotes(task);
                  const isPic = currentUser && task.assigneeId === currentUser.id;
                  const canChangeStatus = canChangeTaskStatus(task, task.status);
                  // Quản lý được chọn tất cả trạng thái bao gồm closed. Nhân viên không có tuỳ chọn closed.
                  const availableStatusOpts = isManager ? STATUS_OPTS : STATUS_OPTS.filter((s) => s.key !== 'closed');
                  return `
                  <tr data-task-id="${task.id}" style="${rowHeights[task.id] ? "height:" + rowHeights[task.id] + "px" : ""}">
                    <td class="col-title"><button class="task-title-btn" onclick="openTaskModal('${task.id}')">${escapeHtml(task.title)}</button></td>
                    <td class="col-assignee"><span class="assignee-cell">${emp ? `<span class="dot" style="background:var(--${emp.color})"></span>${escapeHtml(emp.name)}` : t("unassigned")}</span></td>
                    <td><span class="badge mono" style="color:var(--${prio.color});border-color:var(--${prio.color})">${prio.label}</span></td>
                    <td>
                      ${
                        (isManager || (isPic && task.status !== 'closed' && !overdue))
                          ? `<select class="status-select" style="color:var(--${st.color});border-color:var(--${st.color})" onchange="setStatus('${task.id}',this.value)">
                              ${availableStatusOpts.map((s) => `<option value="${s.key}" ${s.key === task.status ? "selected" : ""}>${s.label}</option>`).join("")}
                            </select>`
                          : `<span class="badge mono" style="color:var(--${st.color});border-color:var(--${st.color})">${st.label}</span>`
                      }
                    </td>
                    <td class="col-date"><input type="date" class="date-edit" ${!isManager ? "disabled" : ""} value="${task.startDate || ""}" onchange="updateField('${task.id}','startDate',this.value)" /></td>
                    <td class="col-date"><input type="date" class="date-edit" ${!isManager ? "disabled" : ""} value="${task.endDate || ""}" onchange="updateField('${task.id}','endDate',this.value)" /></td>
                    <td class="col-date ${overdue ? "overdue" : ""}"><input type="date" class="date-edit ${overdue ? "overdue" : ""}" ${!isManager ? "disabled" : ""} value="${task.deadline || ""}" onchange="updateField('${task.id}','deadline',this.value)" />${overdue ? " ⚠" : ""}</td>
                    <td class="col-notes"><textarea class="notes-edit" rows="1" placeholder="${t("notes_placeholder")}" ${!canEditNotes ? "disabled" : ""} title="${escapeAttr(task.notes || "")}" onchange="updateField('${task.id}','notes',this.value)">${escapeHtml(task.notes || "")}</textarea></td>
                    <td><div class="actions-cell">
                      <span class="row-resizer" title="${t("drag_row_height")}" onmousedown="startRowResize(event,this)">${ic("grip")}</span>
                      ${canDelete ? `<button class="icon-btn danger" onclick="deleteTask('${task.id}')" aria-label="${t("btn_delete")}">${ic("trash")}</button>` : ""}
                    </div></td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ---- Tab: Máy đang chạy ---- */
function machineTaskGroup(title, list) {
  return `
    <div class="machine-group">
      <div class="machine-group-head"><span>${title}</span><span class="mono">${list.length}</span></div>
      ${
        list.length
          ? list
              .slice(0, 6)
              .map(
                (t) =>
                  `<div class="machine-task-item" onclick="openTaskModal('${t.id}')">${escapeHtml(t.title)}</div>`,
              )
              .join("")
          : `<div class="machine-empty">${t("machine_empty_group")}</div>`
      }
    </div>
  `;
}
function renderMachineCard(m, dept) {
  const isOffice = isOfficeDept(dept);
  const mTasks = tasks.filter((t) => t.machineId === m.id);
  const doing = mTasks.filter((t) => t.status === "doing");
  const pending = mTasks.filter((t) => t.status === "pending");
  const done = mTasks.filter((t) => t.status === "done");
  const closed = mTasks.filter((t) => t.status === "closed");
  const todo = mTasks.filter((t) => t.status === "todo");
  const highPrio = mTasks.filter(
    (t) => t.priority === "high" && t.status !== "done" && t.status !== "closed",
  );
  return `
    <div class="machine-card ${m.completed ? "completed" : ""}">
      <div class="machine-head">
        <div>
          <div class="machine-name">${escapeHtml(m.name)}</div>
          <div class="machine-meta">${ic("calendar")} ${isOffice ? t("project_delivery_date", { date: fmtDate(m.deliveryDate) }) : t("machine_delivery_date", { date: fmtDate(m.deliveryDate) })}</div>
        </div>
        <span class="badge mono" style="color:var(--${m.completed ? "green" : "teal"});border-color:var(--${m.completed ? "green" : "teal"})">${m.completed ? t("machine_status_done") : t("machine_status_running")}</span>
      </div>
      ${m.spec ? `<div class="machine-spec">${escapeHtml(m.spec)}</div>` : ""}
      <div class="machine-groups">
        ${machineTaskGroup(t("status_doing"), doing)}
        ${machineTaskGroup(t("status_pending"), pending)}
        ${machineTaskGroup(t("status_todo"), todo)}
        ${machineTaskGroup(t("status_done"), done)}
        ${machineTaskGroup(t("status_closed"), closed)}
      </div>
      ${machineTaskGroup(t("pri_high"), highPrio)}
      <div class="machine-actions">
        ${hasPermission('task:create') ? `<button onclick="deptTab='tasks';showTaskForm=true;render();document.getElementById('f-machine') && (document.getElementById('f-machine').value='${m.id}')">${ic("plus")} ${isOffice ? t("project_add_task") : t("machine_add_task")}</button>` : ""}
        ${hasPermission('machine:toggle') ? `<button class="${m.completed ? "" : "btn-primary"}" onclick="toggleMachineCompleted('${m.id}')">${m.completed ? t("machine_reopen") : t("machine_mark_completed")}</button>` : ""}
      </div>
    </div>
  `;
}
function renderDeptMachinesTab(dept) {
  const isOffice = isOfficeDept(dept);
  const all = deptMachines(dept.id);
  const active = all.filter((m) => !m.completed);
  const completed = all.filter((m) => m.completed);
  return `
    <div class="toolbar">
      <div class="toolbar-left"><span style="font-size:12.5px;color:var(--text-faint)">${isOffice ? t("project_status_summary", { active: active.length, completed: completed.length }) : t("machine_status_summary", { active: active.length, completed: completed.length })}</span></div>
      ${hasPermission('machine:add') ? `<div class="toolbar-actions"><button class="add-task-btn" onclick="showMachineForm=!showMachineForm;render()">${ic("plus")} ${isOffice ? t("btn_add_project") : t("btn_add_machine")}</button></div>` : ""}
    </div>
    ${
      showMachineForm
        ? `
      <div class="task-form">
        <div class="task-form-row">
          <div><label class="field-label">${isOffice ? t("f_project_name") : t("f_machine_name")}</label><input id="f-mname" placeholder="${isOffice ? t("f_project_name_ph") : t("f_machine_name_ph")}" style="width:100%" /></div>
          <div><label class="field-label">${isOffice ? t("f_project_delivery") : t("f_machine_delivery")}</label><input id="f-mdate" type="date" style="width:100%" /></div>
          <div></div>
        </div>
        <div><label class="field-label">${isOffice ? t("f_project_spec") : t("f_machine_spec")}</label><textarea id="f-mspec" placeholder="${isOffice ? t("f_project_spec_ph") : t("f_machine_spec_ph")}" style="width:100%"></textarea></div>
        <div class="form-actions" style="max-width:220px">
          <button class="btn-primary" onclick="addMachine()">${isOffice ? t("btn_save_project") : t("btn_save_machine")}</button>
          <button onclick="showMachineForm=false;render()">${t("btn_cancel")}</button>
        </div>
        <div id="f-machine-error" class="form-error"></div>
      </div>
    `
        : ""
    }

    ${active.length ? `<div class="machine-grid">${active.map((m) => renderMachineCard(m, dept)).join("")}</div>` : `<div class="empty-table">${isOffice ? t("empty_active_projects") : t("empty_active_machines")}</div>`}

    <div class="section-title" style="cursor:pointer" onclick="toggleShowCompletedMachines()">
      ${ic("check")} ${isOffice ? t("completed_projects_title", { count: completed.length }) : t("completed_machines_title", { count: completed.length })} ${showCompletedMachines ? "▲" : "▼"}
    </div>
    ${showCompletedMachines ? (completed.length ? `<div class="machine-grid">${completed.map((m) => renderMachineCard(m, dept)).join("")}</div>` : `<div class="empty-table">${isOffice ? t("empty_completed_projects") : t("empty_completed_machines")}</div>`) : ""}
  `;
}
