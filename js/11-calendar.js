/* =====================================================================
   11-calendar.js — Lịch đi làm của nhân viên
   
   ===================================================================== */

/* ===================== CALENDAR (Lịch đi làm) ===================== */
function setCalEmp(id) { calEmpId = id; render(); }
function calPrevMonth() { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1); render(); }
function calNextMonth() { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1); render(); }
function dateOnLeave(empId, dateStr) {
  return leaveRequests.some((l) => l.employeeId === empId && l.status !== "rejected" && l.fromDate && l.toDate && dateStr >= l.fromDate && dateStr <= l.toDate);
}
function buildCalendar(empId, monthDate) {
  const year = monthDate.getFullYear(), month = monthDate.getMonth();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // T2 = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);
  const dows = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  let cells = dows.map((d) => `<div class="cal-dow">${d}</div>`).join("");
  for (let i = 0; i < firstDow; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
    const dow = (new Date(year, month, day).getDay() + 6) % 7;
    const weekend = dow >= 5;
    const onLeave = empId ? dateOnLeave(empId, dateStr) : false;
    const cls = ["cal-cell"];
    if (weekend) cls.push("weekend");
    if (onLeave) cls.push("leave");
    if (dateStr === todayStr) cls.push("today");
    cells += `<div class="${cls.join(" ")}" title="${onLeave ? "Nghỉ phép" : weekend ? "Cuối tuần" : "Đi làm"}">${day}</div>`;
  }
  return `<div class="cal-grid">${cells}</div>`;
}
