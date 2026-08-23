/* =====================================================================
   19-modal-task.js — Modal xem/sửa chi tiết 1 công việc
   
   ===================================================================== */

/* ===================== TASK DETAIL MODAL ===================== */
function renderTaskModal() {
  const t = tasks.find((x) => x.id === taskModalId);
  if (!t) return "";
  const dept = departmentById(t.departmentId);
  const emps = deptEmployees(t.departmentId);
  const machs = deptMachines(t.departmentId);
  return `
    <div class="modal-overlay" onclick="if(event.target===this) closeTaskModal()">
      <div class="modal">
        <div class="modal-head">
          <h3>Chi tiết công việc</h3>
          <button class="modal-close" onclick="closeTaskModal()">${ic("x")}</button>
        </div>
        <div class="modal-grid full modal-field">
          <div><label class="field-label">Tên công việc</label><input id="m-title" value="${escapeAttr(t.title)}" /></div>
        </div>
        <div class="modal-grid">
          <div class="modal-field"><label class="field-label">Người phụ trách</label>
            <select id="m-assignee">${emps.map((e) => `<option value="${e.id}" ${e.id === t.assigneeId ? "selected" : ""}>${escapeHtml(e.name)}</option>`).join("")}</select>
          </div>
          <div class="modal-field"><label class="field-label">Gắn với máy</label>
            <select id="m-machine"><option value="">— Không gắn máy —</option>${machs.map((m) => `<option value="${m.id}" ${m.id === t.machineId ? "selected" : ""}>${escapeHtml(m.name)}</option>`).join("")}</select>
          </div>
          <div class="modal-field"><label class="field-label">Độ ưu tiên</label>
            <select id="m-priority">
              <option value="high" ${t.priority === "high" ? "selected" : ""}>Cao</option>
              <option value="medium" ${t.priority === "medium" ? "selected" : ""}>Trung bình</option>
              <option value="low" ${t.priority === "low" ? "selected" : ""}>Thấp</option>
            </select>
          </div>
          <div class="modal-field"><label class="field-label">Trạng thái</label>
            <select id="m-status">${STATUS_OPTS.map((s) => `<option value="${s.key}" ${s.key === t.status ? "selected" : ""}>${s.label}</option>`).join("")}</select>
          </div>
          <div class="modal-field"><label class="field-label">Ngày Start</label><input id="m-start" type="date" value="${t.startDate || ""}" /></div>
          <div class="modal-field"><label class="field-label">Ngày End</label><input id="m-end" type="date" value="${t.endDate || ""}" /></div>
          <div class="modal-field"><label class="field-label">Deadline</label><input id="m-deadline" type="date" value="${t.deadline || ""}" /></div>
          <div class="modal-field"><label class="field-label">Bộ phận</label><input value="${escapeAttr(dept ? dept.name : "")}" disabled /></div>
        </div>
        <div class="modal-grid full modal-field">
          <div><label class="field-label">Ghi chú</label><textarea id="m-notes" rows="3">${escapeHtml(t.notes || "")}</textarea></div>
        </div>
        <div class="modal-actions">
          <button class="icon-btn danger" onclick="deleteTask('${t.id}')" aria-label="Xoá công việc">${ic("trash")}</button>
          <div class="modal-actions-right">
            <button onclick="closeTaskModal()">Huỷ</button>
            <button class="btn-primary" onclick="saveTaskModal('${t.id}')">Lưu thay đổi</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
