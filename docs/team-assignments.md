# BrewLite — Phân công nhóm 6 người

Đọc [tổng quan dự án](project-overview.md) trước khi bắt đầu. Nhóm dùng một repo cho giữa kỳ và cuối kỳ; yêu cầu chi tiết nằm trong [SRS](requirements/srs.md).

Mỗi người có một phần chính, tự kiểm tra phần mình và gửi Pull Request (PR) để người khác review. Bảng dưới đây là phương án nhóm cần xác nhận khi chia việc, không phải bằng chứng thành viên đã nhận hoặc hoàn thành nhiệm vụ. TV5 dùng mã thành viên vì tên trong tài liệu cũ chưa thống nhất.

## Ai làm gì?

| Thành viên | Nhiệm vụ chính | Kết quả bàn giao |
| --- | --- | --- |
| TV1 — Anh Khoa | Điều phối tiến độ/Scrum, Git/PR; tích hợp frontend/backend; Docker Compose, CI/CD và triển khai. | README chạy được, bảng công việc và minh chứng hai Sprint; Compose web/API/DB; CI kiểm tra PR; production, hướng dẫn deploy/rollback và release. |
| TV2 — Tấn Nin | Backend sản phẩm, đơn hàng và kho; schema/migration, seed menu; API list/detail, tạo đơn, lịch sử/chi tiết đơn; trạng thái đơn. | API có validation và kiểm tra quyền sở hữu; backend tính giá/lưu snapshot; transaction và optimistic locking chống vượt kho; chống tạo đơn trùng; test phần phụ trách. |
| TV3 — Quốc Anh | Backend đăng ký/đăng nhập với bcrypt/JWT; bảo vệ API; thanh toán Ví/Thẻ mô phỏng, chống thanh toán trùng và retry; khuyến mãi/tích điểm. | Auth và payment chạy được; thanh toán lỗi/thành công đúng; không cộng điểm trùng; phối hợp TV2 về kho, giảm giá và xử lý hủy; test phần phụ trách. |
| TV4 — Hoàng An | Frontend layout, menu, chi tiết món, size/topping và giá; nhãn hết hàng; form đăng ký/đăng nhập và kết nối API. | Xem/chọn món và đăng nhập được trên điện thoại; có loading/empty/error; bàn giao lựa chọn món cho giỏ; test phần phụ trách. |
| TV5 | Frontend giỏ, checkout, nhập mã giảm giá, thanh toán/retry; xác nhận, lịch sử/chi tiết và trạng thái đơn. | Giỏ thêm/sửa/xóa, tổng tiền/badge và lưu qua reload/login; thanh toán lỗi giữ giỏ, retry cùng đơn; chỉ xóa giỏ khi server xác nhận thành công; test phần phụ trách. |
| TV6 — Đức Phúc | Rà SRS/use-case; tổng hợp UML và bảng truy vết; test cases, kiểm thử toàn luồng, ít nhất một E2E tự động; báo cáo và kịch bản demo. | Tài liệu khớp code; UML có nguồn và hình xuất; test có kết quả thực tế; báo cáo giữa kỳ/cuối kỳ và minh chứng. |

TV1 tích hợp, không làm thay toàn bộ phần của thành viên khác. TV6 tổng hợp tài liệu và kiểm thử toàn luồng, không chịu toàn bộ test của dự án.

## Cần phối hợp với ai?

- TV2 ↔ TV4: dữ liệu sản phẩm, size/topping và giá.
- TV3 ↔ TV4: request/response đăng ký, đăng nhập và cách dùng JWT.
- TV2 + TV3 ↔ TV5: tạo đơn, khuyến mãi, thanh toán, lịch sử, lỗi và retry.
- TV2 ↔ TV3: thống nhất schema/migration dùng chung, transaction, kho/điểm khi payment fail, retry hoặc hủy.
- TV1 ↔ cả nhóm: môi trường, CI/CD và tích hợp; TV6 ↔ cả nhóm: yêu cầu, tài liệu và kiểm thử.

TV2–TV3 review chéo backend; TV4–TV5 review chéo frontend. Khi xong phần chính, frontend hỗ trợ kiểm tra luồng backend đang ghép. Người viết chức năng cung cấp nội dung kỹ thuật để TV6 cập nhật sơ đồ và báo cáo.

## Làm theo thứ tự nào?

1. Chốt yêu cầu: cả nhóm đọc phạm vi/SRS, TV6 tổng hợp điểm cần sửa.
2. Chốt UML: TV2–TV5 cung cấp dữ liệu và luồng, TV6 tổng hợp và cùng nhóm review.
3. Chốt kiến trúc: TV1 cùng các owner xác định môi trường và quyết định kỹ thuật, TV6 tổng hợp kiến trúc/ADR/deployment diagram.
4. Sprint 1: môi trường, database/seed, API sản phẩm, menu, test và CI. Chuẩn bị auth, giỏ và ca kiểm thử để ghép tiếp.
5. Sprint 2: ghép auth → đặt đơn → payment → xác nhận/lịch sử; hoàn thiện kho, trạng thái, chống xử lý trùng, khuyến mãi/điểm, test, CD và production.

Cuối kỳ nghiệm thu theo thứ tự Task 1 → 2 → 3 → 4 → 5; tạo phẩm task trước phải có trên repo trước khi nghiệm thu task sau. Lịch chi tiết và checklist hai bài nằm trong [tổng quan](project-overview.md).

## Khi nào một việc được coi là xong?

- Chức năng chạy trên bản tích hợp và đáp ứng acceptance criteria trong SRS.
- Người viết tự kiểm tra; logic nghiệp vụ có test tự động phù hợp, không chỉ demo tay.
- PR có hướng dẫn kiểm tra ngắn, được thành viên khác review và qua kiểm tra bắt buộc khi CI đã thiết lập.
- Tài liệu liên quan được cập nhật; kết quả và minh chứng có thật trước khi đánh dấu hoàn thành.

Task 10 giữa kỳ phải đủ bốn phần: trạng thái đơn, chống xử lý trùng (idempotency), transaction/optimistic locking, khuyến mãi và tích điểm. Cuối kỳ cần ít nhất một E2E tự động và production hoạt động khi chấm.
