/* =====================================================================
   02-data.js — Mô hình dữ liệu, hằng số & dữ liệu mẫu (seed data)
   Sửa seedDepartments/seedEmployees/seedTasks/... ở đây để đổi dữ liệu demo mặc định.
   ===================================================================== */

/* ===================== DATA MODEL =====================
   departments: {id, name, color}
   employees:   {id, code, name, role, password, departmentId, color}
   tasks:       {id, title, assigneeId, departmentId, machineId, priority, status, startDate, endDate, deadline, notes}
   leaveRequests:{id, employeeId, departmentId, fromDate, toDate, reason, status}
   machines:    {id, departmentId, name, deliveryDate, spec, completed}
   ======================================================= */
const PALETTE = ["blue", "teal", "green", "amber", "red", "purple"];
const STATUS_OPTS = [
  { key: "todo", label: "Chưa làm", color: "border-strong" },
  { key: "pending", label: "Đang chờ (pending)", color: "amber" },
  { key: "doing", label: "Đang làm", color: "teal" },
  { key: "done", label: "Hoàn thành", color: "green" },
];
const PRIORITY = {
  high: { label: "Cao", color: "red" },
  medium: { label: "Trung bình", color: "amber" },
  low: { label: "Thấp", color: "border-strong" },
};

const seedDepartments = [
  { id: "d1", name: "Thiết Kế Điện", color: "blue" },
  { id: "d2", name: "Thiết Kế Cơ Khí", color: "teal" },
  { id: "d3", name: "Kế Toán", color: "amber" },
];
const seedEmployees = [
  { id: "e1", code: "NV001", name: "Minh Tuấn", role: "Kỹ sư điều khiển", password: "123456", departmentId: "d1", color: "blue" },
  { id: "e2", code: "NV002", name: "Quốc Bảo", role: "Kỹ thuật viên bảo trì", password: "123456", departmentId: "d1", color: "teal" },
  { id: "e3", code: "NV003", name: "Thu Hà", role: "Kỹ sư cơ khí", password: "123456", departmentId: "d2", color: "green" },
  { id: "e4", code: "NV004", name: "Lan Anh", role: "Kế toán viên", password: "123456", departmentId: "d3", color: "amber" },
];
const seedMachines = [
  { id: "m1", departmentId: "d1", name: "Máy A - X197", deliveryDate: "2026-09-15", spec: "TAZMO X197, EFEM 4 slot, EtherCAT servo MR-J5", completed: false },
  { id: "m2", departmentId: "d2", name: "Máy B - EFEM Retrofit", deliveryDate: "2026-10-01", spec: "Cải tạo cơ khí khung EFEM, thay băng tải", completed: false },
];
const seedTasks = [
  { id: "t1", title: "Kiểm tra động cơ trục Y trạm BP", assigneeId: "e1", departmentId: "d1", machineId: "m1", priority: "high", status: "doing",
    startDate: "2026-08-19", endDate: "2026-08-22", deadline: "2026-08-23", notes: "Cần tắt nguồn trước khi kiểm tra" },
  { id: "t2", title: "Cấu hình Word Lamp GT Designer3", assigneeId: "e1", departmentId: "d1", machineId: "m1", priority: "medium", status: "todo",
    startDate: "", endDate: "", deadline: "2026-08-28", notes: "" },
  { id: "t3", title: "Hiệu chỉnh cảm biến Load Port", assigneeId: "e2", departmentId: "d1", machineId: "m1", priority: "high", status: "pending",
    startDate: "2026-08-16", endDate: "2026-08-20", deadline: "2026-08-21", notes: "Chờ linh kiện thay thế" },
  { id: "t4", title: "Test chương trình PLC trạm nạp", assigneeId: "e2", departmentId: "d1", machineId: "m1", priority: "low", status: "done",
    startDate: "2026-08-11", endDate: "2026-08-18", deadline: "2026-08-18", notes: "Đã bàn giao" },
  { id: "t5", title: "Bảo trì định kỳ băng tải", assigneeId: "e3", departmentId: "d2", machineId: "m2", priority: "medium", status: "doing",
    startDate: "2026-08-21", endDate: "2026-08-23", deadline: "2026-08-25", notes: "" },
  { id: "t6", title: "Đối chiếu công nợ tháng 8", assigneeId: "e4", departmentId: "d3", machineId: "", priority: "medium", status: "todo",
    startDate: "", endDate: "", deadline: "2026-08-30", notes: "" },
];
const seedLeaves = [
  { id: "l1", employeeId: "e3", departmentId: "d2", fromDate: "2026-08-27", toDate: "2026-08-28", reason: "Nghỉ phép cá nhân", status: "approved" },
];
