/* =====================================================================
   10-actions-leave.js — Thao tác đơn nghỉ phép
   
   ===================================================================== */

/* ===================== LEAVE REQUEST ACTIONS ===================== */
async function addLeave() {
  const employeeId = document.getElementById("f-lemp").value;
  const fromDate = document.getElementById("f-lfrom").value;
  const toDate = document.getElementById("f-lto").value;
  const reason = document.getElementById("f-lreason").value.trim();
  const errEl = document.getElementById("f-leave-error");
  if (!employeeId || !fromDate || !toDate) { if (errEl) errEl.textContent = "Vui lòng chọn nhân viên và khoảng ngày nghỉ."; return; }
  leaveRequests.push({ id: uid("l"), employeeId, departmentId: activeDeptId, fromDate, toDate, reason, status: "pending" });
  showLeaveForm = false;
  render();
  await saveData();
}
async function setLeaveStatus(id, status) {
  const l = leaveRequests.find((x) => x.id === id);
  if (!l) return;
  l.status = status;
  render();
  await saveData();
}
async function deleteLeave(id) {
  leaveRequests = leaveRequests.filter((l) => l.id !== id);
  render();
  await saveData();
}
