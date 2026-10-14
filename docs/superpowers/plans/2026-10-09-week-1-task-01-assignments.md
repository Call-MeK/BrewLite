# BrewLite — Task 01: Bảng chia việc tuần 1

**Phạm vi:** Task 01 trong checklist tuần 1 của anh Khoa: chuẩn bị bảng phân công và cách phối hợp. Không phải Task 1 «cấu trúc dự án» trong bài tập PDF.

**Nguồn đã đọc:**
- Google Sheets: https://docs.google.com/spreadsheets/d/1XUdXsbVVKz5chpHiBFWnBZMf_ZXNWn6ThppcKDYi0uA/edit
- `BrewLite - Overview!A13:D18`: tên thành viên và vai trò đã chốt.
- `BrewLite - Sprint Plan!A4:H4`: Week 1 / Task 1–3 + design; đầu ra README, demo Menu, data model thống nhất.
- `docs/superpowers/specs/file.md`, mục 6, 10, 11, 12; checklist `2026-10-09-khoa-week-1.md`, Task 01.

**Mục tiêu bàn giao:** Nhóm chạy được dự án theo README; Menu đọc dữ liệu thật từ GET /products; có Figma và UML/ERD để trình bày.

**Trạng thái bảng:** Đã soạn để anh Khoa dùng phân công. Vai trò giữ nguyên phân công đã chốt; các đầu việc, người review và thứ tự dưới đây là đề xuất thực hiện, chưa đại diện cho xác nhận của thành viên.

## Công việc cụ thể

| Mã | Công việc | Người phụ trách | Người review đề xuất | Đầu ra / tiêu chí hoàn thành | Phụ thuộc / người nhận |
| --- | --- | --- | --- | --- | --- |
| W1-01 | Chuẩn hóa README và cấu hình chạy | Anh Khoa | Quốc Anh | Làm theo README chạy được frontend :3000, backend :3001; env mẫu không chứa secret thật; thống nhất biến API theo spec. Có scaffold sẵn, không tạo lại. | Làm đầu tiên; tất cả thành viên dùng. |
| W1-02 | PostgreSQL/Prisma baseline và Product seed | Tấn Nin | Anh Khoa; Quốc Anh góp ý hạ tầng dùng chung | Backend kết nối DB dev; migration/seed chạy trên DB mới; Product có UUID/name/imageUrl/basePrice/stock/version; giá VND integer, stock không âm, isAvailable computed. Seed đủ để demo còn hàng và hết hàng. Không reset DB có dữ liệu. | Phối hợp W1-01; GET /products nhận kết quả. |
| W1-03 | Triển khai GET /products | Tấn Nin | Anh Khoa | Public HTTP 200 `{data:[{id,name,basePrice,imageUrl,stock,isAvailable}]}` từ DB; stock = 0 → false; danh sách trống → `{data:[]}`; test liên quan, lint/build đạt. | Chờ W1-02; Hoàng An dùng API. |
| W1-04 | Chuẩn bị Auth contract và phối hợp backend | Quốc Anh | Anh Khoa | Đối chiếu register/login/me với spec; ghi request/response và lỗi 400/401/409 theo từng endpoint; thống nhất PrismaService/User schema với Tấn Nin. Không mở rộng Refresh Token/OAuth. | Làm song song; bàn giao cho Sprint 2 và tránh hạ tầng backend bị làm trùng. |
| W1-05 | Thiết kế Figma Menu | Hoàng An | Thị Thủy; Anh Khoa kiểm tra khớp API | Link Figma truy cập được; Menu có tên/ảnh/giá/trạng thái sản phẩm; thể hiện loading/empty/error/out-of-stock. | Làm song song theo contract; W1-07 dùng thiết kế. |
| W1-06 | Hỗ trợ Figma và thống nhất luồng màn hình | Thị Thủy | Hoàng An | Review Menu và bố cục/luồng sơ bộ Product → Cart → Checkout/Payment; bàn giao góp ý cụ thể, tránh hai người tạo thiết kế mâu thuẫn. UI Cart/Checkout chưa nằm trong tuần 1. | Phối hợp W1-05; chuẩn bị cho Sprint 2. |
| W1-07 | Menu frontend đọc API thật | Hoàng An | Anh Khoa | Hiển thị dữ liệu GET /products; dùng API origin đã thống nhất; có loading/empty/error và hết hàng; lint/build đạt, thao tác cơ bản dùng được bằng bàn phím. | Chờ W1-01, W1-03, W1-05; Anh Khoa tích hợp. |
| W1-08 | Yêu cầu và UML/ERD | Đức Phúc | Quốc Anh review diagram; Anh Khoa review phạm vi | Link tài liệu truy cập được; use case, ERD/class dựa trên 10 bảng trong spec; diễn đạt luồng đặt hàng/thanh toán và FSM nhất quán với spec, không thêm module ngoài MVP. | Làm song song; đối chiếu schema với Tấn Nin và Auth với Quốc Anh. |
| W1-09 | Smoke checklist và ghi kết quả | Đức Phúc | Anh Khoa | Checklist cài/chạy, GET /products, Menu; ca có dữ liệu/trống/hết hàng/backend tắt; ghi kết quả thực tế và lỗi có bước tái hiện. Không đánh dấu đạt trước khi chạy. | Soạn sớm; chạy sau W1-03, W1-07; gửi lỗi đúng owner. |
| W1-10 | Review PR, tích hợp và demo tuần 1 | Anh Khoa | Đức Phúc kiểm chứng; Quốc Anh review thay đổi của Khoa | PR liên quan được review; API ↔ Menu chạy trên bản tích hợp; README cập nhật theo DB/API thật; demo Menu + Figma/UML; việc chưa đạt có owner và bước tiếp theo. | Nhận W1-01–09; chốt Sprint Review/Retrospective. |

## Thứ tự bàn giao

1. Anh Khoa làm W1-01; frontend/backend xác nhận cùng port, tên env và Product contract.
2. Tấn Nin làm W1-02 → W1-03. Hoàng An/Thị Thủy làm W1-05/W1-06 song song; Quốc Anh làm W1-04; Đức Phúc chuẩn bị W1-08/W1-09.
3. Hoàng An ghép W1-07 với API đã bàn giao; Đức Phúc chạy W1-09; owner xử lý lỗi trong module của mình.
4. Anh Khoa thực hiện W1-10 khi đủ kết quả; phần chưa đạt ghi rõ vào backlog, không tính như đã hoàn thành.

Không đặt ngày lịch vì Sheet chưa có ngày bắt đầu Sprint. Dành khoảng 20% thời gian cho review, tích hợp và sửa lỗi.

## Quy ước phối hợp đề xuất

- Nhánh phát triển đang checkout là `develop`; remote default theo ref local là `master`. README đang ghi `main`, cần sửa sau khi anh Khoa xác nhận quy ước với nhóm.
- Đề xuất feature branch → PR vào `develop`; phát hành Sprint từ `develop` → `master` qua PR. Đây là đề xuất, không tự đổi default branch, tạo branch hoặc merge trong Task 01 này.
- Tên nhánh gợi ý: `feature/product-api`, `feature/menu`, `docs/auth-contract`, `docs/uml-week1`, `docs/dev-setup`.
- Mỗi PR ghi việc đã làm, cách kiểm tra và lỗi/giới hạn còn lại; ít nhất một người khác review. Owner sửa module của mình; Anh Khoa giải quyết cấu hình/tích hợp chung.
- Các kiểm tra đang có: `npm.cmd --prefix frontend run lint`, `npm.cmd --prefix frontend run build`; `npm.cmd --prefix backend run lint`, `npm.cmd --prefix backend run build`, `npm.cmd --prefix backend test`, `npm.cmd --prefix backend run test:e2e`. Dùng `npm.cmd` trong PowerShell nếu `npm.ps1` bị execution policy chặn; không đổi policy hệ thống để chạy npm.
- Cập nhật tiến độ ngắn mỗi ngày: đã làm, việc tiếp theo, đang bị chặn bởi việc nào/người nào. Dùng bốn trạng thái cho bảng nhóm: Chưa bắt đầu / Đang làm / Chờ review / Hoàn thành.
- Chỉ «Hoàn thành» khi có đầu ra kiểm tra được, review và README/tài liệu liên quan đã cập nhật. Figma/UML cần link mà nhóm truy cập được.
- Không đổi trách nhiệm các thành viên chỉ vì họ hỗ trợ/review chéo.

## Checklist riêng của anh Khoa cho Task 01

- [x] Đọc vai trò và kế hoạch tuần 1 từ Google Sheets.
- [x] Soạn đầu việc cho đủ 6 thành viên, kèm đầu ra, reviewer đề xuất và phụ thuộc.
- [x] Ghi các việc riêng của anh Khoa: môi trường, review, tích hợp, demo và điều phối.
- [x] Soạn quy ước nhánh/PR/cập nhật tiến độ để nhóm dùng.
- [ ] Anh Khoa xác nhận quy ước nhánh và lịch thực tế với nhóm.
- [ ] Đưa bảng lên nơi nhóm theo dõi và nhận xác nhận bàn giao từ thành viên.

## Lưu ý đối chiếu nguồn

- Giữ nguyên timeline 12 tuần và ba tab cũ; bảng này chỉ áp dụng BrewLite Week 1.
- Dùng tên **Thị Thủy** theo Sheet (`BrewLite - Overview!D17`); spec local ghi Thị Thúy, cần anh Khoa xác nhận tên khi chia sẻ bảng.
- Tab Overview và Google Doc liên kết vẫn ghi một số API Order/Payment chờ duyệt; spec local có contract mới hơn. Bảng này chỉ dùng Product đã duyệt và chuẩn bị Auth, không tự sửa trạng thái API khác.
- Chưa gửi thông báo, tạo GitHub Issues/PR, chỉnh Google Sheet hay nhận xác nhận từ nhóm. Việc xem tài liệu và soạn bảng không đồng nghĩa các task triển khai đã hoàn thành.
- File này ở `docs/`, đang bị `.gitignore` bỏ qua; bản local không tự xuất hiện trên GitHub.
