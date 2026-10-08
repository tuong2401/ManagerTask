/* =====================================================================
   10-actions-leave.js — Thao tác đơn nghỉ phép
   
   ===================================================================== */

/* ===================== LEAVE REQUEST ACTIONS ===================== */
async function addLeave() {
  let employeeId = document.getElementById("f-lemp").value;

  if (!hasPermission('leave:approve')){
    employeeId = currentUser.id;
  }

  const fromDate = document.getElementById("f-lfrom").value;
  const toDate = document.getElementById("f-lto").value;
  const reason = document.getElementById("f-lreason").value.trim();
  const errEl = document.getElementById("f-leave-error");
  if (!employeeId || !fromDate || !toDate) { if (errEl) errEl.textContent = "Vui lòng chọn nhân viên và khoảng ngày nghỉ."; return; }

  // Nếu người xin nghỉ là Quản lý → cần Giám đốc/Admin duyệt
  const applicant = employeeById(employeeId);
  const isMgrApplicant = applicant && (applicant.accessLevel === 'dept_manager');
  const initialStatus = isMgrApplicant ? "pending_director" : "pending";

  leaveRequests.push({ id: uid("l"), employeeId, departmentId: activeDeptId, fromDate, toDate, reason, status: initialStatus });
  showLeaveForm = false;
  render();
  await saveData();
}
async function setLeaveStatus(id, status) {
  if (!hasPermission('leave:approve')) {
    alert(t("err_perm_approve_leave"));
    return;
  }

  const l = leaveRequests.find((x) => x.id === id);
  if (!l) return;

  // Không được tự duyệt đơn của mình
  if (l.employeeId === currentUser.id) {
    alert(t("err_perm_self_approve"));
    return;
  }

  // Đơn "Chờ GĐ duyệt" chỉ admin/director mới được xử lý
  const isDirectorOnly = l.status === "pending_director" || status === "pending_director";
  const isHighRole = currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'director';
  if (isDirectorOnly && !isHighRole) {
    alert(t("err_perm_director_only"));
    return;
  }

  l.status = status;
  render();
  await saveData();
}

async function deleteLeave(id) {
  const l = leaveRequests.find((x) => x.id === id);
  if (!l) return;

  // 1. Chặn tuyệt đối xóa các đơn đã duyệt hoặc từ chối để giữ toàn vẹn lịch sử
  if (l.status === "approved" || l.status === "rejected") {
    alert(t("err_leave_finalized"));
    return;
  }

  // 2. Với đơn đang chờ (pending / pending_director):
  // Phải là người tạo đơn HOẶC người có quyền duyệt (Quản lý/Giám đốc)
  const isOwner = l.employeeId === currentUser.id;
  const canApprove = hasPermission('leave:approve', l.departmentId);
  if (!isOwner && !canApprove) {
    alert(t("err_perm_del_leave"));
    return;
  }

  if (!confirm("Bạn có chắc chắn muốn xoá đơn xin nghỉ phép này?")) return;

  leaveRequests = leaveRequests.filter((x) => x.id !== id);
  render();
  await saveData();
}

