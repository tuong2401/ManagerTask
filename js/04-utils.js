/* =====================================================================
   04-utils.js — Các hàm tiện ích dùng chung (ngày tháng, escape HTML, tra cứu...)
   
   ===================================================================== */

/* ===================== HELPERS ===================== */
function uid(prefix) { return prefix + Math.random().toString(36).slice(2, 9); }
function pad2(n) { return String(n).padStart(2, "0"); }
function taskDueDate(t) { return t.deadline || t.endDate; }
function isOverdue(t) {
  const due = taskDueDate(t);
  if (!due || t.status === "done" || t.status === "closed") return false;
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
function taskById(id) { return tasks.find((t) => t.id === id); }
function statusInfo(key) { return STATUS_OPTS.find((s) => s.key === key) || STATUS_OPTS[0]; }
function priorityInfo(key) { return PRIORITY[key] || PRIORITY.medium; }
function deptEmployees(deptId) { return employees.filter((e) => e.departmentId === deptId); }
function deptTasks(deptId) { return tasks.filter((t) => t.departmentId === deptId); }
function deptMachines(deptId) { return machines.filter((m) => m.departmentId === deptId); }
function deptLeaves(deptId) { return leaveRequests.filter((l) => l.departmentId === deptId); }
function taskCountFor(empId) { return tasks.filter((t) => t.assigneeId === empId).length; }
function isOfficeDept(dept) {
  if (!dept) return false;
  if (dept.hasMachine === false || dept.type === 'office') return true;
  const name = (dept.name || "").toLowerCase();
  return name.includes("kế toán") || name.includes("nhân sự") || name.includes("hành chính") || name.includes("accounting") || name.includes("hr");
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

/* ===================== RBAC PERMISSIONS ===================== */
const SYSTEM_ROLES = {
  EMPLOYEE: 'employee',
  DEPT_MANAGER: 'dept_manager',
  ADMIN: 'admin',
  DIRECTOR: 'director'
};

const PERMISSIONS = {
  [SYSTEM_ROLES.EMPLOYEE]: [
    'leave:create',
    'task:status_self'
  ],
  [SYSTEM_ROLES.DEPT_MANAGER]: [
    'task:create',
    'task:edit',
    'task:delete',
    'task:status_self',
    'task:status_close',
    'leave:create',
    'leave:approve',
    'employee:add',
    'employee:delete',
    'machine:add',
    'machine:toggle',
    'data:export'
  ],

  // Ban giám đốc / Admin: Toàn quyền mọi phòng ban + tạo phòng ban + reset hệ thống
  [SYSTEM_ROLES.ADMIN]: [
    'task:create',
    'task:edit',
    'task:delete',
    'task:status_self',
    'task:status_close',
    'leave:create',
    'leave:approve',
    'employee:add',
    'employee:delete',
    'department:add',
    'machine:add',
    'machine:toggle',
    'system:reset',
    'data:export'
  ],
  [SYSTEM_ROLES.DIRECTOR]: [
    'task:create',
    'task:edit',
    'task:delete',
    'task:status_self',
    'task:status_close',
    'leave:create',
    'leave:approve',
    'employee:add',
    'employee:delete',
    'department:add',
    'machine:add',
    'machine:toggle',
    'system:reset',
    'data:export'
  ]
};

// Kiểm tra quyền hạn theo action và phòng ban (deptId)
function hasPermission(action, targetDeptId) {
  if (!currentUser || !currentUser.accessLevel) return false;
  const userRole = currentUser.accessLevel;
  const userPermissions = PERMISSIONS[userRole] || [];
  if (!userPermissions.includes(action)) return false;

  // Cấp cao (admin/director) có quyền trên toàn bộ các phòng ban
  if (userRole === SYSTEM_ROLES.ADMIN || userRole === SYSTEM_ROLES.DIRECTOR) {
    return true;
  }

  // Quản lý bộ phận (dept_manager / manager):
  // Các thao tác phạm vi bộ phận phải đúng phòng ban mình quản lý
  const deptScopedActions = [
    'task:create',
    'task:edit',
    'task:delete',
    'task:status_close',
    'leave:approve',
    'employee:add',
    'employee:delete',
    'machine:add',
    'machine:toggle'
  ];

  if (deptScopedActions.includes(action)) {
    const scopeDeptId = targetDeptId !== undefined ? targetDeptId : (typeof activeDeptId !== "undefined" ? activeDeptId : null);
    if (scopeDeptId && currentUser.departmentId && scopeDeptId !== currentUser.departmentId) {
      return false; // Chuyển sang View-only khi ở phòng ban khác
    }
  }

  return true;
}

// Kiểm tra xem người dùng hiện tại có ở chế độ chỉ xem (View-only) trong phòng ban hay không
function isDeptReadOnly(deptId) {
  if (!currentUser) return true;
  const userRole = currentUser.accessLevel;
  if (userRole === SYSTEM_ROLES.ADMIN || userRole === SYSTEM_ROLES.DIRECTOR) return false;
  const checkDeptId = deptId || activeDeptId;
  return currentUser.departmentId !== checkDeptId;
}

function canEditTask(task) {
  if (!currentUser || !task) return false;
  if (hasPermission('task:edit', task.departmentId)) return true;
  // Nhân viên không có quyền quản lý sẽ không được sửa các thông tin cơ bản
  return false;
}

function canEditTaskNotes(task) {
  if (!currentUser || !task) return false;
  if (hasPermission('task:edit', task.departmentId)) return true;
  // Nhân viên phụ trách (PIC) luôn được ghi chú bình thường (kể cả khi quá hạn hay bị closed)
  return task.assigneeId === currentUser.id;
}

function canDeleteTask(task) {
  if (!task) return false;
  return hasPermission('task:delete', task.departmentId);
}

function canChangeTaskStatus(task, newStatus) {
  if (!currentUser || !task) return false;
  // Quản lý có quyền task:edit/task:status_close có toàn quyền đổi mọi trạng thái (bao gồm closed)
  if (hasPermission('task:edit', task.departmentId) || hasPermission('task:status_close', task.departmentId)) {
    return true;
  }
  // Nhân viên:
  // Không được đổi sang trạng thái closed
  if (newStatus === 'closed') return false;
  // Nếu task đã ở trạng thái closed thì nhân viên không được đổi
  if (task.status === 'closed') return false;
  // Nếu task quá hạn, nhân viên không được tự ý đổi trạng thái
  if (isOverdue(task)) return false;
  // Chỉ người phụ trách (PIC) mới có quyền cập nhật
  if (hasPermission('task:status_self') && task.assigneeId === currentUser.id) {
    return true;
  }
  return false;
}

