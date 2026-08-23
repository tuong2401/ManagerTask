/* =====================================================================
   14-data-tools.js — Khôi phục dữ liệu mẫu & Xuất Excel
   
   ===================================================================== */

/* ===================== RESET / EXPORT ===================== */
async function resetData() {
  if (!confirm("Xoá toàn bộ dữ liệu hiện tại và khôi phục dữ liệu mẫu? Hành động này ảnh hưởng đến tất cả mọi người đang dùng chung.")) return;
  departments = seedDepartments.slice();
  employees = seedEmployees.slice();
  tasks = seedTasks.slice();
  leaveRequests = seedLeaves.slice();
  machines = seedMachines.slice();
  render();
  await saveData();
}
function exportExcel() {
  const taskRows = tasks.map((t) => {
    const emp = employeeById(t.assigneeId);
    const dept = departmentById(t.departmentId);
    const mach = machineById(t.machineId);
    return {
      "Bộ phận": dept ? dept.name : "",
      "Tên công việc": t.title,
      "Người phụ trách": emp ? emp.name : "Chưa gán",
      "Máy": mach ? mach.name : "",
      "Độ ưu tiên": priorityInfo(t.priority).label,
      "Trạng thái": statusInfo(t.status).label,
      "Ngày bắt đầu": t.startDate ? fmtDate(t.startDate) : "",
      "Ngày kết thúc": t.endDate ? fmtDate(t.endDate) : "",
      "Deadline": t.deadline ? fmtDate(t.deadline) : "",
      "Quá hạn": isOverdue(t) ? "Có" : "Không",
      "Ghi chú": t.notes || "",
    };
  });
  const empRows = employees.map((e) => ({
    "Mã NV": e.code, "Tên nhân viên": e.name, "Chức vụ": e.role,
    "Bộ phận": departmentById(e.departmentId) ? departmentById(e.departmentId).name : "",
    "Số công việc": taskCountFor(e.id),
  }));
  const machineRows = machines.map((m) => ({
    "Bộ phận": departmentById(m.departmentId) ? departmentById(m.departmentId).name : "",
    "Tên máy": m.name, "Ngày giao hàng": m.deliveryDate ? fmtDate(m.deliveryDate) : "",
    "Spec": m.spec || "", "Trạng thái": m.completed ? "Đã hoàn thành" : "Đang chạy",
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(taskRows), "Công việc");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(empRows), "Nhân sự");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(machineRows), "Máy");
  XLSX.writeFile(wb, "task-working-tazmo-" + new Date().toISOString().slice(0, 10) + ".xlsx");
}
