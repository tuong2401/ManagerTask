/* =====================================================================
   01-config.js — Cấu hình Firebase + bộ icon SVG
   Sửa FIREBASE_CONFIG ở đây để kết nối dữ liệu thật (Firestore).
   ===================================================================== */

/* =====================================================================
   CẤU HÌNH FIREBASE - THAY 6 GIÁ TRỊ NÀY BẰNG CONFIG CỦA BẠN
   (Lấy tại: Firebase Console -> Project settings -> tạo Web App)
   Dùng lại đúng 1 document Firestore như bản cũ: collection "tcc",
   doc "data" - chỉ mở rộng thêm các trường dữ liệu mới bên trong.
   Nếu để nguyên như mặc định, app sẽ chạy "chế độ xem thử" (không lưu
   thật, mất dữ liệu khi tải lại trang) để bạn preview UI trước.
   ===================================================================== */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCOA2UXgDxuPhUsKouPLoAYI2ksg9EJK30",
  authDomain: "manager-task-working.firebaseapp.com",
  projectId: "manager-task-working",
  storageBucket: "manager-task-working.firebasestorage.app",
  messagingSenderId: "916020227715",
  appId: "1:916020227715:web:65bdb8975e7b75386f75b6",
  measurementId: "G-NBCQETRQ5G",
};
const IS_CONFIGURED =
  FIREBASE_CONFIG.apiKey !== "1:916020227715:web:65bdb8975e7b75386f75b6";
// const IS_CONFIGURED = FIREBASE_CONFIG.apiKey !== "1:786380791574:web:1392d291fded423c697a37";
let db = null;
if (IS_CONFIGURED) {
  firebase.initializeApp(FIREBASE_CONFIG);
  db = firebase.firestore();
}

/* ===================== ICONS ===================== */
const ICONS = {
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  grip: '<circle cx="7" cy="7" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="17" cy="7" r="1"/><circle cx="7" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="17" cy="12" r="1"/><circle cx="7" cy="17" r="1"/><circle cx="12" cy="17" r="1"/><circle cx="17" cy="17" r="1"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  trash:
    '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  alert:
    '<path d="M12 3l9.5 17H2.5L12 3z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="16.3" r="0.3" fill="currentColor"/>',
  users:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  download:
    '<path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><path d="M5 21h14"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  cog: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  clipboard:
    '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  wrench:
    '<path d="M14.7 6.3a4 4 0 1 1-5.66 5.66L3 18v3h3l6.04-6.04a4 4 0 1 1 5.66-5.66z"/>',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
};
function ic(name, cls) {
  return (
    '<svg class="' +
    (cls || "ic") +
    '" viewBox="0 0 24 24">' +
    ICONS[name] +
    "</svg>"
  );
}
