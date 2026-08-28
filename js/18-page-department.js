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
          <button class="back-btn" onclick="backToOverview()">${ic("back")} Tổng quan</button>
          <span class="title" style="margin-left:8px">${escapeHtml(dept.name).toUpperCase()}</span>
        </div>
        <div class="subtitle">Trang quản lý riêng của bộ phận ${escapeHtml(dept.name)}.</div>
      </div>
      <div class="stats">
        <div class="stat"><div class="stat-label">Tổng công việc của nhóm</div><div class="stat-value mono">${stats.total}</div></div>
        <div class="stat"><div class="stat-label">Đang thực hiện</div><div class="stat-value mono">${stats.doing}</div></div>
        <div class="stat"><div class="stat-label">Hoàn thành</div><div class="stat-value mono">${stats.done}</div></div>
        <div class="stat"><div class="stat-label">Quá hạn</div><div class="stat-value mono ${stats.overdue > 0 ? "warn" : ""}">${stats.overdue}</div></div>
        <div class="user-chip">${ic("users")}<span class="who"><b>${escapeHtml(currentUser.name)}</b></span><button class="logout-btn" onclick="logout()">${ic("logout")} Đăng xuất</button></div>
      </div>
    </div>
    <div class="sync-bar" id="sync-bar"></div>

    <div class="toolbar">
      <div class="view-tabs">
        <button class="view-tab ${deptTab === "dashboard" ? "active" : ""}" onclick="setDeptTab('dashboard')">${ic("grid")} Dashboard</button>
        <button class="view-tab ${deptTab === "employees" ? "active" : ""}" onclick="setDeptTab('employees')">${ic("users")} Nhân viên</button>
        <button class="view-tab ${deptTab === "tasks" ? "active" : ""}" onclick="setDeptTab('tasks')">${ic("clipboard")} Task công việc</button>
        <button class="view-tab ${deptTab === "machines" ? "active" : ""}" onclick="setDeptTab('machines')">${ic("wrench")} List máy đang work</button>
      </div>
      <div class="toolbar-actions"><button class="export-btn" onclick="exportExcel()">${ic("download")} Xuất Excel</button></div>
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
      ${hasPermission("employee:delete") ? `<button class="icon-btn danger" style="margin-left:4px" onclick="deleteEmployee('${e.id}')" aria-label="Xoá nhân viên">${ic("trash")}</button>` : ""}
    </div>
  `,
        )
        .join("")
    : `<div class="empty-table" style="padding:16px">Chưa có nhân viên nào trong bộ phận này.</div>`;

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
                : "amber";
          return `
      <div class="leave-item">
        <div class="item-info">
          <div class="item-title">${emp ? escapeHtml(emp.name) : "Đã xoá"} <span class="item-sub">(${fmtDate(l.fromDate)} → ${fmtDate(l.toDate)})</span></div>
          ${l.reason ? `<div class="item-sub">${escapeHtml(l.reason)}</div>` : ""}
        </div>
        <div class="leave-actions">
          ${hasPermission("leave:approve")
              ? `
                    <select class="status-select" style="color:var(--${stColor});border-color:var(--${stColor})" onchange="setLeaveStatus('${l.id}',this.value)">
                      <option value="pending" ${l.status === "pending" ? "selected" : ""}>Chờ duyệt</option>
                      <option value="approved" ${l.status === "approved" ? "selected" : ""}>Đã duyệt</option>
                      <option value="rejected" ${l.status === "rejected" ? "selected" : ""}>Từ chối</option>
                    </select>
                `
              : `
                  <span class="badge mono" style="color:var(--${stColor});border-color:var(--${stColor})">${l.status === "pending" ? "Chờ duyệt" : l.status === "approved" ? "Đã duyệt" : "Từ chối"}</span>
                `
          }
          ${(hasPermission("leave:approve") ||
              l.employeeId === currentUser.id && l.status === "pending")
              ? `<button class="icon-btn danger" onclick="deleteLeave('${l.id}')">${ic("trash")}</button>`
              : ""
          }
        </div>
      </div>`;
    })
    .join("")
    : `<div class="empty-dash">Chưa có đơn nghỉ nào.</div>`;

  const calEmpOptions = emps
    .map(
      (e) =>
        `<option value="${e.id}" ${calEmpId === e.id ? "selected" : ""}>${escapeHtml(e.name)}</option>`,
    )
    .join("");
  const monthLabel = calMonth.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return `
    <div class="dash-grid">
      <div class="dash-card">
        <div class="dash-card-head">${ic("users")} Quản lý nhân viên</div>
        ${empRows}
          ${hasPermission('employee:add') ? (
          !showEmpForm
            ? `<button class="small-btn" onclick="showEmpForm=true;render()">${ic("plus")} Thêm nhân viên</button>`
            : `<div class="form">
                 <input id="f-ecode" placeholder="Mã số nhân viên (VD: NV005)" />
               <input id="f-ename" placeholder="Họ tên" />
               <input id="f-erole" placeholder="Chức vụ" />
               <input id="f-epass" placeholder="Mật khẩu đăng nhập (để trống = dùng mã NV)" />
               <div id="f-emp-error" class="form-error"></div>
               <div class="form-actions">
                 <button class="btn-primary" onclick="addEmployee()">Thêm</button>
                 <button onclick="showEmpForm=false;render()">Huỷ</button>
               </div>
             </div>`
        ) : ''
        }
      </div>

      <div class="dash-card">
        <div class="dash-card-head">${ic("calendar")} Tạo đơn nghỉ</div>
        ${
          !showLeaveForm
            ? `<button class="small-btn" onclick="showLeaveForm=true;render()">${ic("plus")} Tạo đơn nghỉ mới</button>`
            : `<div class="form" style="margin-top:0;border-top:none;padding-top:0">
               ${hasPermission('leave:approve') 
                 ? `<select id="f-lemp"><option value="">Chọn nhân viên...</option>${leaveEmpOptions}</select>` 
                 : `<input type="hidden" id="f-lemp" value="${currentUser.id}" />
                    <div style="margin-bottom: 8px; font-weight: 500;">Người xin nghỉ: <span style="color:var(--blue)">${escapeHtml(currentUser.name)}</span></div>`
               }
               <div style="display:flex;gap:8px">
                 <input id="f-lfrom" type="date" style="flex:1" />
                 <input id="f-lto" type="date" style="flex:1" />
               </div>
               <input id="f-lreason" placeholder="Lý do nghỉ (không bắt buộc)" />
               <div id="f-leave-error" class="form-error"></div>
               <div class="form-actions">
                 <button class="btn-primary" onclick="addLeave()">Tạo đơn</button>
                 <button onclick="showLeaveForm=false;render()">Huỷ</button>
               </div>
             </div>`
        }
        <div class="leave-list" style="margin-top:12px">${leaveList}</div>
      </div>

      <div class="dash-card" style="grid-column:1 / -1">
        <div class="dash-card-head">${ic("calendar")} Lịch đi làm của nhân viên</div>
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
            <span><span class="sw" style="background:var(--panel-2);border:1px solid var(--border)"></span>Đi làm</span>
            <span><span class="sw" style="background:var(--amber-soft);border:1px solid var(--amber)"></span>Nghỉ phép</span>
            <span><span class="sw" style="background:var(--panel-2)"></span>Cuối tuần (chữ mờ)</span>
          </div>
        `
            : `<div class="empty-dash">Chưa có nhân viên để hiển thị lịch.</div>`
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
        <div class="panel-head">${ic("users")} Lọc theo nhân viên</div>
        ${emps.length === 0 ? `<div class="empty-table">Chưa có nhân sự nào.</div>` : ""}
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
            ${filterEmp ? `<span class="filter-chip" onclick="toggleFilter('${filterEmp.id}')">Đang lọc: ${escapeHtml(filterEmp.name)} ${ic("x")}</span>` : `<span style="font-size:12.5px;color:var(--text-faint)">Nhấn tên công việc để xem chi tiết</span>`}
          </div>
          <div class="toolbar-actions">
            <button class="add-task-btn" onclick="showTaskForm=!showTaskForm;render()">${ic("plus")} Thêm công việc</button>
          </div>
        </div>

        ${
          showTaskForm
            ? `
          <div class="task-form">
            <div class="task-form-row">
              <div><label class="field-label">Tên công việc</label><input id="f-title" placeholder="VD: Hiệu chỉnh cảm biến trạm AL" style="width:100%" /></div>
              <div><label class="field-label">Người phụ trách</label>
                <select id="f-assignee" style="width:100%"><option value="">Chọn...</option>
                  ${emps.map((e) => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join("")}
                </select>
              </div>
              <div><label class="field-label">Độ ưu tiên</label>
                <select id="f-priority" style="width:100%">
                  <option value="high">Cao</option><option value="medium" selected>Trung bình</option><option value="low">Thấp</option>
                </select>
              </div>
            </div>
            <div class="task-form-row3">
              <div><label class="field-label">Gắn với máy</label>
                <select id="f-machine" style="width:100%"><option value="">— Không gắn máy —</option>${machineOptions}</select>
              </div>
              <div><label class="field-label">Ghi chú</label><textarea id="f-notes" placeholder="Ghi chú thêm (không bắt buộc)"></textarea></div>
            </div>
            <div class="task-form-row2">
              <div><label class="field-label">Ngày Start</label><input id="f-start" type="date" style="width:100%" /></div>
              <div><label class="field-label">Ngày End</label><input id="f-end" type="date" style="width:100%" /></div>
              <div><label class="field-label">Deadline</label><input id="f-deadline" type="date" style="width:100%" /></div>
              <div></div>
            </div>
            <div class="form-actions" style="max-width:260px">
              <button class="btn-primary" onclick="addTask()">Tạo công việc</button>
              <button onclick="showTaskForm=false;render()">Huỷ</button>
            </div>
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
                ${COL_LABELS.map(
                  (label, i) => `
                  <th>${escapeHtml(label)}${i < COL_LABELS.length - 1 ? `<span class="col-resizer" onmousedown="startColResize(event,${i})"></span>` : ""}</th>
                `,
                ).join("")}
              </tr>
            </thead>
            <tbody>
              ${visibleTasks.length === 0 ? `<tr><td colspan="9" class="empty-table">Không có công việc nào.</td></tr>` : ""}
              ${visibleTasks
                .map((task) => {
                  const emp = employeeById(task.assigneeId);
                  const overdue = isOverdue(task);
                  const prio = priorityInfo(task.priority);
                  const st = statusInfo(task.status);
                  return `
                  <tr data-task-id="${task.id}" style="${rowHeights[task.id] ? "height:" + rowHeights[task.id] + "px" : ""}">
                    <td class="col-title"><button class="task-title-btn" onclick="openTaskModal('${task.id}')">${escapeHtml(task.title)}</button></td>
                    <td class="col-assignee"><span class="assignee-cell">${emp ? `<span class="dot" style="background:var(--${emp.color})"></span>${escapeHtml(emp.name)}` : "Chưa gán"}</span></td>
                    <td><span class="badge mono" style="color:var(--${prio.color});border-color:var(--${prio.color})">${prio.label}</span></td>
                    <td>
                      <select class="status-select" style="color:var(--${st.color});border-color:var(--${st.color})" onchange="setStatus('${task.id}',this.value)">
                        ${STATUS_OPTS.map((s) => `<option value="${s.key}" ${s.key === task.status ? "selected" : ""}>${s.label}</option>`).join("")}
                      </select>
                    </td>
                    <td class="col-date"><input type="date" class="date-edit" value="${task.startDate || ""}" onchange="updateField('${task.id}','startDate',this.value)" /></td>
                    <td class="col-date"><input type="date" class="date-edit" value="${task.endDate || ""}" onchange="updateField('${task.id}','endDate',this.value)" /></td>
                    <td class="col-date ${overdue ? "overdue" : ""}"><input type="date" class="date-edit ${overdue ? "overdue" : ""}" value="${task.deadline || ""}" onchange="updateField('${task.id}','deadline',this.value)" />${overdue ? " ⚠" : ""}</td>
                    <td class="col-notes"><textarea class="notes-edit" rows="1" placeholder="Ghi chú..." title="${escapeAttr(task.notes || "")}" onchange="updateField('${task.id}','notes',this.value)">${escapeHtml(task.notes || "")}</textarea></td>
                    <td><div class="actions-cell">
                      <span class="row-resizer" title="Kéo để chỉnh chiều cao hàng" onmousedown="startRowResize(event,this)">${ic("grip")}</span>
                      <button class="icon-btn danger" onclick="deleteTask('${task.id}')" aria-label="Xoá công việc">${ic("trash")}</button>
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
          : `<div class="machine-empty">— trống —</div>`
      }
    </div>
  `;
}
function renderMachineCard(m, dept) {
  const mTasks = tasks.filter((t) => t.machineId === m.id);
  const doing = mTasks.filter((t) => t.status === "doing");
  const pending = mTasks.filter((t) => t.status === "pending");
  const done = mTasks.filter((t) => t.status === "done");
  const todo = mTasks.filter((t) => t.status === "todo");
  const highPrio = mTasks.filter(
    (t) => t.priority === "high" && t.status !== "done",
  );
  return `
    <div class="machine-card ${m.completed ? "completed" : ""}">
      <div class="machine-head">
        <div>
          <div class="machine-name">${escapeHtml(m.name)}</div>
          <div class="machine-meta">${ic("calendar")} Ngày giao hàng: ${fmtDate(m.deliveryDate)}</div>
        </div>
        <span class="badge mono" style="color:var(--${m.completed ? "green" : "teal"});border-color:var(--${m.completed ? "green" : "teal"})">${m.completed ? "Đã xong" : "Đang chạy"}</span>
      </div>
      ${m.spec ? `<div class="machine-spec">${escapeHtml(m.spec)}</div>` : ""}
      <div class="machine-groups">
        ${machineTaskGroup("Đang làm", doing)}
        ${machineTaskGroup("Đang pending", pending)}
        ${machineTaskGroup("Chưa làm", todo)}
        ${machineTaskGroup("Đã hoàn thành", done)}
      </div>
      ${machineTaskGroup("Ưu tiên cao", highPrio)}
      <div class="machine-actions">
        <button onclick="deptTab='tasks';showTaskForm=true;render();document.getElementById('f-machine') && (document.getElementById('f-machine').value='${m.id}')">${ic("plus")} Thêm việc cho máy</button>
        <button class="${m.completed ? "" : "btn-primary"}" onclick="toggleMachineCompleted('${m.id}')">${m.completed ? "Khôi phục đang chạy" : "Đánh dấu hoàn thành"}</button>
      </div>
    </div>
  `;
}
function renderDeptMachinesTab(dept) {
  const all = deptMachines(dept.id);
  const active = all.filter((m) => !m.completed);
  const completed = all.filter((m) => m.completed);
  return `
    <div class="toolbar">
      <div class="toolbar-left"><span style="font-size:12.5px;color:var(--text-faint)">${active.length} máy đang chạy · ${completed.length} máy đã hoàn thành</span></div>
      <div class="toolbar-actions"><button class="add-task-btn" onclick="showMachineForm=!showMachineForm;render()">${ic("plus")} Thêm máy mới</button></div>
    </div>
    ${
      showMachineForm
        ? `
      <div class="task-form">
        <div class="task-form-row">
          <div><label class="field-label">Tên máy</label><input id="f-mname" placeholder="VD: Máy C - X198" style="width:100%" /></div>
          <div><label class="field-label">Ngày giao hàng</label><input id="f-mdate" type="date" style="width:100%" /></div>
          <div></div>
        </div>
        <div><label class="field-label">Spec</label><textarea id="f-mspec" placeholder="Thông số kỹ thuật, cấu hình..." style="width:100%"></textarea></div>
        <div class="form-actions" style="max-width:220px">
          <button class="btn-primary" onclick="addMachine()">Thêm máy</button>
          <button onclick="showMachineForm=false;render()">Huỷ</button>
        </div>
        <div id="f-machine-error" class="form-error"></div>
      </div>
    `
        : ""
    }

    ${active.length ? `<div class="machine-grid">${active.map((m) => renderMachineCard(m, dept)).join("")}</div>` : `<div class="empty-table">Chưa có máy nào đang chạy trong bộ phận này.</div>`}

    <div class="section-title" style="cursor:pointer" onclick="toggleShowCompletedMachines()">
      ${ic("check")} Máy cũ đã hoàn thành (${completed.length}) ${showCompletedMachines ? "▲" : "▼"}
    </div>
    ${showCompletedMachines ? (completed.length ? `<div class="machine-grid">${completed.map((m) => renderMachineCard(m, dept)).join("")}</div>` : `<div class="empty-table">Chưa có máy nào hoàn thành.</div>`) : ""}
  `;
}
