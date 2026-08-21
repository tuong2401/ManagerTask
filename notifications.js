/*
 * Email recipients for task notifications.
 *
 * NOTE: Add or change the PIC Gmail for each employee here. The key is the
 * employee id in app.js / Firestore (for example e2 is Thu Hà). The manager
 * always receives every task update.
 */
const MANAGER_EMAIL = "nguyencattuong2401@gmail.com";
const PIC_EMAIL_BY_EMPLOYEE_ID = {
  e2: "nguyencattuong2401@gmail.com", // Thu Hà — test recipient
  // e1: "pic-dien@example.com",
  // e3: "pic-bao-tri@example.com",
};

function notificationRecipients(task) {
  return [...new Set([MANAGER_EMAIL, PIC_EMAIL_BY_EMPLOYEE_ID[task.assigneeId]].filter(Boolean))];
}

function emailEscape(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));
}

async function queueTaskNotification(type, task) {
  if (!IS_CONFIGURED || !task) return;
  const recipients = notificationRecipients(task);
  if (!recipients.length) return;
  const employee = employeeById(task.assigneeId);
  const action = { created: "được tạo", updated: "được cập nhật", deleted: "được xóa" }[type] || "được cập nhật";
  const subject = `[ManagerTask] Công việc ${action}: ${task.title}`;
  const text = `Công việc “${task.title}” ${action}.\nBộ phận: ${departmentName(taskDepartment(task))}\nPIC: ${employee ? employee.name : "Chưa gán"}\nTrạng thái: ${statusInfo(task.status).label}\nHạn hoàn thành: ${fmtDate(task.endDate) || "Chưa đặt"}\nGhi chú: ${task.notes || "Không có"}`;
  const html = `<p>Công việc <strong>${emailEscape(task.title)}</strong> ${action}.</p><ul><li><strong>Bộ phận:</strong> ${emailEscape(departmentName(taskDepartment(task)))}</li><li><strong>PIC:</strong> ${emailEscape(employee ? employee.name : "Chưa gán")}</li><li><strong>Trạng thái:</strong> ${emailEscape(statusInfo(task.status).label)}</li><li><strong>Hạn hoàn thành:</strong> ${emailEscape(fmtDate(task.endDate) || "Chưa đặt")}</li></ul><p><strong>Ghi chú:</strong> ${emailEscape(task.notes || "Không có")}</p>`;
  try {
    // Requires the Firebase Trigger Email extension to watch the "mail" collection.
    await db.collection("mail").add({ to: recipients, message: { subject, text, html } });
  } catch (error) {
    console.warn("Không thể tạo yêu cầu gửi email.", error);
  }
}
