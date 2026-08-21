# ManagerTask – dữ liệu dùng chung khi deploy

Ứng dụng dùng **Firebase Firestore** để mọi người đang mở cùng bản deploy nhìn
thấy thay đổi gần như ngay lập tức. Mỗi thao tác ghi chạy trong transaction nên
hai người chỉnh các công việc khác nhau cùng lúc sẽ không ghi đè dữ liệu nhau.

## Cấu trúc source

| Tệp | Vai trò |
| --- | --- |
| `index.html` | Khung HTML và nạp các thư viện/tệp ứng dụng. |
| `styles.css` | Toàn bộ giao diện và bố cục responsive. |
| `app.js` | State ứng dụng, thao tác công việc/nhân sự và đồng bộ Firebase. |
| `dashboard.js` | Dashboard: KPI tiến độ, biểu đồ trạng thái, tải công việc và danh sách cần chú ý. |
| `firebase-config.js` | Cấu hình Firebase của môi trường deploy. |

## Thiết lập một lần

## Gửi email khi task thay đổi

Web sẽ ghi yêu cầu gửi mail vào collection `mail` sau mỗi lần tạo, sửa hoặc xóa
task. Để Firebase gửi email thật, cài extension **Trigger Email** và đặt
**Mail collection** là `mail`; khi cài cần cung cấp SMTP của dịch vụ gửi mail
(ví dụ SendGrid hoặc Mailgun). [Hướng dẫn chính thức](https://firebase.google.com/docs/extensions/official/firestore-send-email).

Địa chỉ manager và PIC được đặt trong `notifications.js`. Trong đó đã cấu hình
test cho nhân viên Hà (`e2`) và manager cùng nhận tại
`nguyencattuong2401@gmail.com`; thêm PIC khác ngay dưới ghi chú trong tệp này.

Khi test chưa có đăng nhập, thêm rule sau vào Firestore Rules (cùng cấp với
`match /tcc/data`) để web có thể tạo yêu cầu gửi mail:

```text
match /mail/{mailId} {
  allow create: if true;
  allow read, update, delete: if false;
}
```

Vì collection `mail` có thể kích hoạt gửi email, chỉ nên cho người dùng đã đăng
nhập được ghi vào đó khi đưa lên môi trường thật.

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
