/* =====================================================================
   07-navigation.js — Điều hướng giữa các trang (Tổng quan ↔ Bộ phận)
   
   ===================================================================== */

/* ===================== NAVIGATION ===================== */
function openDepartment(id) {
  activeDeptId = id;
  deptTab = "dashboard";
  filterId = null;
  showTaskForm = false; showEmpForm = false; showLeaveForm = false; showMachineForm = false;
  const de = deptEmployees(id);
  calEmpId = de.length ? de[0].id : null;
  view = "department";
  render();
}
function backToOverview() { view = "overview"; activeDeptId = null; render(); }
function setDeptTab(tab) { deptTab = tab; render(); }
