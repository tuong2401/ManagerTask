# Task Working Tazmo Việt Nam — Cấu trúc source code

App đã được tách từ 1 file HTML duy nhất thành nhiều file nhỏ theo chức năng để
dễ quản lý và chỉnh sửa. Đây **không phải ES module** — tất cả file JS dùng
chung 1 global scope (giống hệt code gốc), nên khi mở `index.html` bằng cách
double-click (file://) vẫn chạy bình thường, không cần server.

## Cấu trúc thư mục

```
├── index.html              ← file khởi động, chỉ chứa khung HTML + load CSS/JS
├── css/
│   └── style.css           ← toàn bộ CSS (tất cả trang dùng chung 1 file)
└── js/
    ├── 01-config.js            Cấu hình Firebase + bộ icon SVG
    ├── 02-data.js               Hằng số + dữ liệu mẫu (seed data)
    ├── 03-state.js              Biến trạng thái toàn cục (state) của app
    ├── 04-utils.js              Hàm tiện ích dùng chung (ngày tháng, escape HTML...)
    ├── 05-storage.js            Đồng bộ Firebase Firestore / chế độ xem thử
    ├── 06-auth.js               Đăng nhập / đăng xuất
    ├── 07-navigation.js         Điều hướng Tổng quan ↔ Bộ phận
    ├── 08-actions-department.js Thao tác thêm bộ phận
    ├── 09-actions-employee.js   Thao tác nhân viên
    ├── 10-actions-leave.js      Thao tác đơn nghỉ phép
    ├── 11-calendar.js           Lịch đi làm
    ├── 12-actions-task.js       Thao tác công việc (CRUD) + modal chi tiết
    ├── 13-actions-machine.js    Thao tác máy
    ├── 14-data-tools.js         Khôi phục dữ liệu mẫu & Xuất Excel
    ├── 15-donut.js              Hàm dựng biểu đồ donut (SVG)
    ├── 16-dashboard.js          Khối Dashboard dùng chung (Tổng quan + Bộ phận)
    ├── 17-page-overview.js      Trang TỔNG QUAN
    ├── 18-page-department.js    Trang BỘ PHẬN (Dashboard/Nhân viên/Task/Máy)
    ├── 19-modal-task.js         Modal xem/sửa 1 công việc
    ├── 20-page-login.js         Trang ĐĂNG NHẬP
    └── 21-app.js                Điểm khởi động app — PHẢI nạp SAU CÙNG
```

## Nguyên tắc khi sửa code

- **Thứ tự nạp file trong `index.html` rất quan trọng** — không đảo thứ tự,
  vì file sau dùng biến/hàm khai báo ở file trước (state, data, utils phải
  nạp trước; `21-app.js` gọi `initStorage()` nên luôn nạp cuối cùng).
- **Sửa dữ liệu mẫu / cấu hình Firebase**: `js/01-config.js` (Firebase),
  `js/02-data.js` (dữ liệu mẫu departments/employees/tasks...).
- **Sửa giao diện / màu sắc / kích thước**: `css/style.css`. Đầu file có ghi
  chú giải thích cách đổi font chữ toàn app hoặc từng chỗ cụ thể (tìm các
  comment `/* FONT: ... */` cạnh mỗi chỗ set `font-family` riêng).
- **Sửa 1 trang cụ thể**: vào đúng file `js/1x-page-....js` tương ứng
  (trang Tổng quan, trang Bộ phận, trang Đăng nhập...).
- **Sửa 1 hành động cụ thể** (thêm/xoá/sửa task, nhân viên, máy, đơn nghỉ...):
  vào đúng file `js/0x-actions-....js` hoặc `js/1x-actions-....js` tương ứng.

## Chạy thử

Chỉ cần mở `index.html` bằng trình duyệt (double-click hoặc kéo thả vào
trình duyệt) — không cần cài đặt gì thêm. Khi chưa cấu hình Firebase
(`js/01-config.js`), app tự chạy "chế độ xem thử" với dữ liệu mẫu.
