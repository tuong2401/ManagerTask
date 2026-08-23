/* =====================================================================
   05-storage.js — Đồng bộ dữ liệu với Firebase Firestore (hoặc chế độ xem thử)
   initStorage() nạp dữ liệu lúc khởi động, saveData() lưu mỗi khi có thay đổi.
   ===================================================================== */

/* ===================== STORAGE (Firebase Firestore) ===================== */
function initStorage() {
  if (!IS_CONFIGURED) {
    departments = seedDepartments.slice();
    employees = seedEmployees.slice();
    tasks = seedTasks.slice();
    leaveRequests = seedLeaves.slice();
    machines = seedMachines.slice();
    loaded = true;
    render();
    return;
  }
  const docRef = db.collection("tcc").doc("data");
  docRef.onSnapshot(
    (snap) => {
      if (snap.exists) {
        const data = snap.data();
        departments = data.departments || seedDepartments.slice();
        employees = data.employees || [];
        tasks = data.tasks || [];
        leaveRequests = data.leaveRequests || [];
        machines = data.machines || [];
      } else {
        departments = seedDepartments.slice();
        employees = seedEmployees.slice();
        tasks = seedTasks.slice();
        leaveRequests = seedLeaves.slice();
        machines = seedMachines.slice();
        docRef.set({ departments, employees, tasks, leaveRequests, machines }).catch(() => {});
      }
      loaded = true; syncing = false; syncError = ""; lastSync = new Date();
      render();
    },
    (err) => {
      syncError = err.code === "permission-denied"
        ? "Không có quyền truy cập Firestore - kiểm tra lại Security Rules."
        : "Mất kết nối tới Firestore.";
      loaded = true; syncing = false; render();
    }
  );
}
async function saveData() {
  if (!IS_CONFIGURED) return;
  syncing = true; syncError = "";
  renderSyncBar();
  try {
    await db.collection("tcc").doc("data").set({ departments, employees, tasks, leaveRequests, machines });
    lastSync = new Date();
  } catch (e) {
    syncError = e.code === "permission-denied"
      ? "Không có quyền ghi dữ liệu - kiểm tra lại Security Rules."
      : "Lưu dữ liệu thất bại, vui lòng thử lại.";
  }
  syncing = false;
  renderSyncBar();
}
