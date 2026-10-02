/* =====================================================================
   08-actions-department.js — Thao tác thêm bộ phận
   
   ===================================================================== */

/* ===================== DEPARTMENT ACTIONS ===================== */
async function addDepartment() {
  if (!hasPermission('department:add')) {
    alert(t("err_perm_add_dept"));
    return;
  }
  const name = document.getElementById("f-dname").value.trim();
  const typeEl = document.getElementById("f-dtype");
  const type = typeEl ? typeEl.value : "tech";
  const errEl = document.getElementById("f-dept-error");
  if (!name) { if (errEl) errEl.textContent = "Vui lòng nhập tên bộ phận."; return; }
  const color = PALETTE[departments.length % PALETTE.length];
  departments.push({ id: uid("d"), name, color, type, hasMachine: type === "tech" });
  showDeptForm = false;
  render();
  await saveData();
}
