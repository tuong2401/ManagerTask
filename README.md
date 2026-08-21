# ManagerTask – dữ liệu dùng chung khi deploy

Ứng dụng dùng **Firebase Firestore** để mọi người đang mở cùng bản deploy nhìn
thấy thay đổi gần như ngay lập tức. Mỗi thao tác ghi chạy trong transaction nên
hai người chỉnh các công việc khác nhau cùng lúc sẽ không ghi đè dữ liệu nhau.

## Thiết lập một lần

1. Tạo một project tại [Firebase Console](https://console.firebase.google.com/),
   thêm **Web app**, rồi bật **Cloud Firestore** (Production mode).
2. Sao chép `firebase-config.example.js` thành `firebase-config.js` và dán cấu
   hình Web app Firebase vào đó. Đặt `firebase-config.js` cùng thư mục với
   `index.html` trước khi deploy. Cấu hình Web Firebase không phải khóa bí mật;
   quyền truy cập thực tế được bảo vệ bằng Firestore Rules.
3. Trong Firestore Database → **Rules**, dùng quy tắc sau cho một trang nội bộ
   chưa có đăng nhập:

   ```text
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /tcc/data {
         allow read, write: if true;
       }
     }
   }
   ```

4. Deploy `index.html` **và** `firebase-config.js` lên cùng một website. Mở URL
   đó ở hai trình duyệt; sửa ở một bên sẽ tự xuất hiện ở bên còn lại.

> Quy tắc trên chỉ phù hợp cho trang nội bộ có URL được kiểm soát. Nếu website
> công khai, hãy thêm Firebase Authentication và đổi rules để chỉ tài khoản đã
> đăng nhập được đọc/ghi.
