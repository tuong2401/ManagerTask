/* =====================================================================
   13-actions-machine.js — Thao tác máy (thêm máy, đánh dấu hoàn thành)
   
   ===================================================================== */

/* ===================== MACHINE ACTIONS ===================== */
async function addMachine() {
  const name = document.getElementById("f-mname").value.trim();
  const deliveryDate = document.getElementById("f-mdate").value;
  const spec = document.getElementById("f-mspec").value.trim();
  const errEl = document.getElementById("f-machine-error");
  if (!name) { if (errEl) errEl.textContent = "Vui lòng nhập tên máy."; return; }
  machines.push({ id: uid("m"), departmentId: activeDeptId, name, deliveryDate, spec, completed: false });
  showMachineForm = false;
  render();
  await saveData();
}
async function toggleMachineCompleted(id) {
  const m = machineById(id);
  if (!m) return;
  m.completed = !m.completed;
  render();
  await saveData();
}
function toggleShowCompletedMachines() { showCompletedMachines = !showCompletedMachines; render(); }
