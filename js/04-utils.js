/* =====================================================================
   04-utils.js — Các hàm tiện ích dùng chung (ngày tháng, escape HTML, tra cứu...)
   
   ===================================================================== */

/* ===================== HELPERS ===================== */
function uid(prefix) { return prefix + Math.random().toString(36).slice(2, 9); }
function pad2(n) { return String(n).padStart(2, "0"); }
function taskDueDate(t) { return t.deadline || t.endDate; }
function isOverdue(t) {
  const due = taskDueDate(t);
  if (!due || t.status === "done") return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(due + "T00:00:00") < today;
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtTime(d) {
  if (!d) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function departmentById(id) { return departments.find((d) => d.id === id); }
function employeeById(id) { return employees.find((e) => e.id === id); }
function machineById(id) { return machines.find((m) => m.id === id); }
function statusInfo(key) { return STATUS_OPTS.find((s) => s.key === key) || STATUS_OPTS[0]; }
function priorityInfo(key) { return PRIORITY[key] || PRIORITY.medium; }
function deptEmployees(deptId) { return employees.filter((e) => e.departmentId === deptId); }
function deptTasks(deptId) { return tasks.filter((t) => t.departmentId === deptId); }
function deptMachines(deptId) { return machines.filter((m) => m.departmentId === deptId); }
function deptLeaves(deptId) { return leaveRequests.filter((l) => l.departmentId === deptId); }
function taskCountFor(empId) { return tasks.filter((t) => t.assigneeId === empId).length; }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }
