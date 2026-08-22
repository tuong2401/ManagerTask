/* ===================== I18N (VI / EN) ===================== */
/* Load this file first — every other module calls t(key) at render time. */
const I18N = {
  vi: {
    appTitle: "TRUNG TÂM ĐIỀU PHỐI CÔNG VIỆC",
    appSubtitle: "Theo dõi tiến độ công việc theo từng nhân viên.",
    statTotal: "Tổng công việc",
    statDoing: "Đang thực hiện",
    statDone: "Hoàn thành",
    statOverdue: "Quá hạn",

    dashboardWord: "DASHBOARD",
    allDepartmentsLong: "Tất cả bộ phận",
    allDepartmentsShort: "Tất cả",
    noDepartment: "Chưa phân bộ phận",
    deptElectrical: "Thiết kế điện",
    deptMechanical: "Thiết kế cơ khí",
    deptAutomation: "Tự động hóa",

    taskSectionKicker: "CÔNG VIỆC",
    allTasks: "Tất cả công việc",
    sortLabel: "Sắp xếp",
    sortDefault: "Mặc định",
    sortEmpAsc: "Nhân viên A–Z",
    sortEmpDesc: "Nhân viên Z–A",
    exportBtn: "Xuất Excel",
    addTaskBtn: "Thêm công việc",

    thTask: "Công việc",
    thDepartment: "Bộ phận",
    thAssignee: "Người phụ trách",
    thPriority: "Ưu tiên",
    thStatus: "Trạng thái",
    thDue: "Hạn hoàn thành",
    thNotes: "Ghi chú",
    emptyDeptTable: "Chưa có công việc trong bộ phận này.",
    unassigned: "Chưa gán",

    statusTodo: "Chờ xử lý",
    statusDoing: "Đang thực hiện",
    statusDone: "Hoàn thành",
    statusClose: "Close",
    statusReopen: "Reopen",

    priorityHigh: "Cao",
    priorityMedium: "Trung bình",
    priorityLow: "Thấp",

    fTitle: "Tên công việc",
    fDepartment: "Bộ phận",
    fAssignee: "Người phụ trách",
    fPriority: "Ưu tiên",
    fStatus: "Trạng thái",
    fAssigned: "Ngày giao",
    fStart: "Ngày bắt đầu",
    fEnd: "Ngày kết thúc",
    fNotes: "Ghi chú",
    chooseAssignee: "Chọn...",
    createTask: "Tạo công việc",
    cancel: "Hủy",
    formErrorRequired: "Vui lòng nhập tên công việc và người phụ trách.",

    dashStatusCard: "Trạng thái công việc",
    dashAttentionCard: "Cần chú ý (quá hạn)",
    dashClosedCard: "Công việc đã Close",
    donutDoneSub: "hoàn thành",
    noOverdue: "Không có công việc quá hạn 🎉",
    noClosed: "Chưa có công việc nào Close.",

    detailKicker: "CHI TIẾT CÔNG VIỆC",
    detailTitle: "Chỉnh sửa task",
    closeLabel: "Đóng",
    saveChanges: "Lưu thay đổi",
    deleteTaskLabel: "Xóa công việc",
    detailFormErrorRequired: "Tên công việc không được để trống.",
    deleteConfirm: (title) => `Xóa công việc "${title}"?`,

    syncDemoBanner: "Chế độ xem thử: chưa cấu hình Firebase, dữ liệu chỉ tồn tại trong phiên này và không dùng chung được với người khác.",
    syncSharedNote: "Dữ liệu dùng chung cho cả nhóm, đồng bộ tức thời",
    syncSaving: "· đang lưu...",
    syncUpdatedAt: (time) => `· cập nhật lúc ${time}`,
    syncPermissionRead: "Không có quyền truy cập Firestore - kiểm tra lại Security Rules.",
    syncConnectionLost: "Mất kết nối tới Firestore.",
    syncPermissionWrite: "Không có quyền ghi dữ liệu - kiểm tra lại Security Rules.",
    syncSaveFailed: "Lưu dữ liệu thất bại, vui lòng thử lại.",

    expTaskName: "Tên công việc",
    expAssignee: "Người phụ trách",
    expPriority: "Độ ưu tiên",
    expStatus: "Trạng thái",
    expAssignedDate: "Ngày giao",
    expStartDate: "Ngày bắt đầu",
    expEndDate: "Ngày kết thúc",
    expOverdue: "Quá hạn",
    expNotes: "Ghi chú",
    expYes: "Có",
    expNo: "Không",
    expEmpName: "Tên nhân viên",
    expEmpRole: "Chức vụ",
    expEmpTaskCount: "Số công việc",
    expSheetTasks: "Công việc",
    expSheetEmployees: "Nhân sự",
    expFilePrefix: "cong-viec-",
  },
  en: {
    appTitle: "TASK COORDINATION CENTER",
    appSubtitle: "Track task progress for every employee.",
    statTotal: "Total tasks",
    statDoing: "In progress",
    statDone: "Done",
    statOverdue: "Overdue",

    dashboardWord: "DASHBOARD",
    allDepartmentsLong: "All departments",
    allDepartmentsShort: "All",
    noDepartment: "No department",
    deptElectrical: "Electrical design",
    deptMechanical: "Mechanical design",
    deptAutomation: "Automation",

    taskSectionKicker: "TASKS",
    allTasks: "All tasks",
    sortLabel: "Sort",
    sortDefault: "Default",
    sortEmpAsc: "Employee A–Z",
    sortEmpDesc: "Employee Z–A",
    exportBtn: "Export Excel",
    addTaskBtn: "Add task",

    thTask: "Task",
    thDepartment: "Department",
    thAssignee: "Assignee",
    thPriority: "Priority",
    thStatus: "Status",
    thDue: "Due date",
    thNotes: "Notes",
    emptyDeptTable: "No tasks in this department yet.",
    unassigned: "Unassigned",

    statusTodo: "To do",
    statusDoing: "In progress",
    statusDone: "Done",
    statusClose: "Close",
    statusReopen: "Reopen",

    priorityHigh: "High",
    priorityMedium: "Medium",
    priorityLow: "Low",

    fTitle: "Task name",
    fDepartment: "Department",
    fAssignee: "Assignee",
    fPriority: "Priority",
    fStatus: "Status",
    fAssigned: "Assigned date",
    fStart: "Start date",
    fEnd: "End date",
    fNotes: "Notes",
    chooseAssignee: "Choose...",
    createTask: "Create task",
    cancel: "Cancel",
    formErrorRequired: "Please enter a task name and choose an assignee.",

    dashStatusCard: "Task status",
    dashAttentionCard: "Needs attention (overdue)",
    dashClosedCard: "Closed tasks",
    donutDoneSub: "done",
    noOverdue: "No overdue tasks 🎉",
    noClosed: "No closed tasks yet.",

    detailKicker: "TASK DETAILS",
    detailTitle: "Edit task",
    closeLabel: "Close",
    saveChanges: "Save changes",
    deleteTaskLabel: "Delete task",
    detailFormErrorRequired: "Task name cannot be empty.",
    deleteConfirm: (title) => `Delete task "${title}"?`,

    syncDemoBanner: "Preview mode: Firebase isn't configured yet, so data only lives in this session and isn't shared with others.",
    syncSharedNote: "Data is shared with the whole team, synced instantly",
    syncSaving: "· saving...",
    syncUpdatedAt: (time) => `· updated at ${time}`,
    syncPermissionRead: "No access to Firestore - check your Security Rules.",
    syncConnectionLost: "Lost connection to Firestore.",
    syncPermissionWrite: "No write access - check your Security Rules.",
    syncSaveFailed: "Failed to save data, please try again.",

    expTaskName: "Task name",
    expAssignee: "Assignee",
    expPriority: "Priority",
    expStatus: "Status",
    expAssignedDate: "Assigned date",
    expStartDate: "Start date",
    expEndDate: "End date",
    expOverdue: "Overdue",
    expNotes: "Notes",
    expYes: "Yes",
    expNo: "No",
    expEmpName: "Employee name",
    expEmpRole: "Role",
    expEmpTaskCount: "Task count",
    expSheetTasks: "Tasks",
    expSheetEmployees: "Employees",
    expFilePrefix: "tasks-",
  },
};

let currentLang = "vi";
try {
  const saved = localStorage.getItem("appLang");
  if (saved === "vi" || saved === "en") currentLang = saved;
} catch (e) {
  /* localStorage unavailable (e.g. privacy mode) — fall back to Vietnamese */
}

function t(key, ...args) {
  const dict = I18N[currentLang] || I18N.vi;
  const entry = key in dict ? dict[key] : I18N.vi[key];
  return typeof entry === "function" ? entry(...args) : entry;
}

function dateLocale() {
  return currentLang === "en" ? "en-US" : "vi-VN";
}

function setLang(lang) {
  if (lang !== "vi" && lang !== "en") return;
  if (lang === currentLang) return;
  currentLang = lang;
  try { localStorage.setItem("appLang", lang); } catch (e) {}
  if (typeof render === "function") render();
}
