/* =====================================================================
   08-actions-department.js — Thao tác thêm bộ phận
   
   ===================================================================== */

/* ===================== DEPARTMENT ACTIONS ===================== */
async function addDepartment() {
  const name = document.getElementById("f-dname").value.trim();
  const errEl = document.getElementById("f-dept-error");
  if (!name) { if (errEl) errEl.textContent = "Vui lòng nhập tên bộ phận."; return; }
  const color = PALETTE[departments.length % PALETTE.length];
  departments.push({ id: uid("d"), name, color });
  showDeptForm = false;
  render();
  await saveData();
}
