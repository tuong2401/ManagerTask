/* =====================================================================
   13-actions-machine.js — Thao tác máy (thêm máy, đánh dấu hoàn thành)
   
   ===================================================================== */

/* ===================== MACHINE ACTIONS ===================== */
async function addMachine() {
  if (!hasPermission('machine:add')) {
    alert(t("err_perm_add_machine"));
    return;
  }
  const name = document.getElementById("f-mname").value.trim();
  const deliveryDate = document.getElementById("f-mdate").value;
  const spec = document.getElementById("f-mspec").value.trim();
  const errEl = document.getElementById("f-machine-error");
  const dept = departmentById(activeDeptId);
  const isOffice = isOfficeDept(dept);
  if (!name) { 
    if (errEl) errEl.textContent = isOffice ? "Vui lòng nhập tên dự án / hạng mục." : "Vui lòng nhập tên máy."; 
    return; 
  }
  machines.push({ id: uid("m"), departmentId: activeDeptId, name, deliveryDate, spec, completed: false });
  showMachineForm = false;
  render();
  await saveData();
}
async function toggleMachineCompleted(id) {
  if (!hasPermission('machine:toggle')) {
    alert(t("err_perm_toggle_machine"));
    render();
    return;
  }
  const m = machineById(id);
  if (!m) return;
  m.completed = !m.completed;
  render();
  await saveData();
}
function toggleShowCompletedMachines() { showCompletedMachines = !showCompletedMachines; render(); }
