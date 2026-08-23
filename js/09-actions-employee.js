/* =====================================================================
   09-actions-employee.js — Thao tác thêm/xoá nhân viên
   
   ===================================================================== */

/* ===================== EMPLOYEE ACTIONS ===================== */
async function addEmployee() {
  const code = document.getElementById("f-ecode").value.trim();
  const name = document.getElementById("f-ename").value.trim();
  const role = document.getElementById("f-erole").value.trim();
  const pass = document.getElementById("f-epass").value.trim();
  const errEl = document.getElementById("f-emp-error");
  if (!code || !name) { if (errEl) errEl.textContent = "Vui lòng nhập mã số và tên nhân viên."; return; }
  if (employees.some((e) => e.code.toLowerCase() === code.toLowerCase())) {
    if (errEl) errEl.textContent = "Mã nhân viên đã tồn tại.";
    return;
  }
  const color = PALETTE[employees.length % PALETTE.length];
  employees.push({ id: uid("e"), code, name, role: role || "Nhân viên", password: pass || code, departmentId: activeDeptId, color });
  showEmpForm = false;
  render();
  await saveData();
}
async function deleteEmployee(id) {
  if (!confirm("Xoá nhân viên này? Các công việc đã giao sẽ chuyển về trạng thái Chưa gán.")) return;
  employees = employees.filter((e) => e.id !== id);
  if (calEmpId === id) { const de = deptEmployees(activeDeptId); calEmpId = de.length ? de[0].id : null; }
  render();
  await saveData();
}
