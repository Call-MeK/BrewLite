# BrewLite — Tóm tắt yêu cầu để bắt đầu (Week 1)

**Tác giả bản gốc:** Đức Phúc (TV6). **Hợp nhất:** 15/10/2026.
**Nguồn chuẩn:** [SRS](srs.md), [UC-01](use-case-checkout.md), [tổng quan](../project-overview.md).
**Trạng thái:** Bản đọc nhanh đã hòa giải; không thay SRS hoặc chứng minh chức năng đã hoàn thành.

## 1. Phạm vi

Khách chưa đăng nhập được xem menu, chọn size/topping và quản lý giỏ. Trước tạo đơn/thanh toán phải đăng nhập, giữ nguyên giỏ. Next.js + NestJS + PostgreSQL; Prisma là lựa chọn nhóm. Backend kiểm tra giá, kho, mã giảm và quyền sở hữu. Mock Payment là thành phần nội bộ, không phải actor bên ngoài.

Người demo/test nội bộ chuyển trạng thái và hủy có kiểm soát; khách không tự đổi trạng thái nhân viên. Không có scheduler hết hạn đơn 15 phút, thanh toán/hoàn tiền thật, dashboard đầy đủ, giao hàng hoặc microservices. Hủy nội bộ PAID trước pha chế vẫn có hoàn mock/trả kho/bù điểm. Không bắt buộc đúng 10 bảng.

## 2. Yêu cầu đọc nhanh — mã SRS hiện hành

| Mã | Điều kiện đạt tóm tắt |
| --- | --- |
| FR-01, FR-02 | API menu/chi tiết, size S/M/L và topping hợp lệ; loading/empty/error và 404. |
| FR-03 | Hiện hết hàng, khóa thêm giỏ; backend kiểm tra lại kho khi đặt. |
| FR-04, FR-06 | Thêm/sửa/xóa giỏ, tổng/badge, gộp cấu hình giống nhau; giữ qua reload/login. |
| FR-05 | Bcrypt/JWT, không lộ passwordHash; token sai/hết hạn bị chặn. Thời hạn/cách lưu token chờ chốt [ADR-003](../architecture/adr/003-auth-token.md). |
| FR-07, FR-08 | Tạo PENDING, tính giá/snapshot từ server; đơn và kho cùng transaction, kiểm tra stock/version. |
| FR-10, FR-15 | WALLET/CARD mock thành PAID hoặc PAYMENT_FAILED; lỗi giữ giỏ/trả kho một lần; retry cùng đơn, giữ đủ kho trước thanh toán. |
| FR-11 | Key theo user/phép toán; cùng payload trả kết quả cũ, khác payload trả 409; hai key không tạo hai thành công. |
| FR-12 | Chỉ chủ đơn xem lịch sử/chi tiết; không thêm yêu cầu phân trang bắt buộc. |
| FR-13 | Đúng FSM có READY, hủy nội bộ PAID trước pha chế kèm bù dữ liệu; chặn chuyển sai. |
| FR-14 | Validate FE/BE, lỗi rõ, phát hiện giá đổi trước tạo đơn; không tin giá/userId client. |
| FR-16 | Một mã giảm cố định hợp lệ/đơn; tổng sau giảm phải dương, lưu snapshot. |
| FR-17 | PAID cộng floor(total/10000) một lần; hủy PAID ghi bù điểm, giữ giao dịch gốc. |

FR-09 nghỉ dùng trong SRS, không tái sử dụng. Tiêu chí nghiệm thu chi tiết nằm trong SRS.

## 3. Quy tắc nghiệp vụ

- VND nguyên; unitPrice = basePrice + sizeDelta + tổng giá topping; lineTotal = unitPrice × quantity; total = subtotal - discount > 0.
- Tạo đơn giữ kho RESERVED; thanh toán thành công chuyển COMMITTED, không trừ kho lần hai. Payment fail chuyển PAYMENT_FAILED/RELEASED, trả lần giữ kho hiện tại đúng một lần.
- Retry nghiệp vụ dùng key mới, cùng orderId; thiếu kho giữ PAYMENT_FAILED, không gọi mock. Retry do timeout dùng lại key/payload để lấy kết quả cũ.
- Hủy nội bộ PENDING/PAYMENT_FAILED không trả kho lặp; hủy PAID hoàn mock, trả kho đã commit và bù số điểm đã lưu đúng một lần.
- Snapshot món/tùy chọn/giá/mã giảm không đổi; Payment.amount lấy từ Order.total. Không nhận cờ thành công do client tự khai.
- Đơn không tồn tại/không thuộc khách trả 404. isAvailable tính từ stock > 0, không cần cột riêng.

## 4. Chất lượng và bằng chứng

Giữ toàn bộ NFR-01..NFR-10 của SRS: bảo mật, nhất quán/cạnh tranh, mobile/PWA/accessibility, phục hồi, migration/Compose, CI, CD/production/rollback, unit/integration/E2E, API < 500 ms với dữ liệu mẫu và truy vết/Scrum. Không đưa secret/token vào giỏ hoặc log; không tự chốt sessionStorage hoặc thời hạn JWT trong bản này.

[Test cases](test-cases.md) là kế hoạch nghiệm thu; [smoke Week 1](../qa/week-1-smoke-checklist.md) là kết quả lịch sử riêng. Chỉ ghi PASS sau lần chạy có bằng chứng; test scaffold không thay test nghiệp vụ.

## 5. Ánh xạ mã của bản gốc

Chỉ dùng cột hiện hành cho code/test/sơ đồ mới; cột cũ phục vụ đọc lịch sử.

| FR Week 1 cũ | Mã SRS hiện hành |
| --- | --- |
| FR-01 Menu | FR-01, FR-03 |
| FR-02 Detail | FR-02 |
| FR-03 Auth | FR-05, FR-06 |
| FR-04 Cart | FR-04 |
| FR-05 Orders | FR-07, FR-08, FR-11, FR-14, FR-16 |
| FR-06 Payment | FR-10, FR-11, FR-15, FR-17 |
| FR-07 History | FR-12 |
| FR-08 Cancel/expiry | FR-13; bỏ expiry |
| FR-09 Voucher | FR-16; không mang mã FR-09 sang SRS |
| FR-10 Loyalty | FR-17 |

| NFR Week 1 cũ | Mã hiện hành |
| --- | --- |
| NFR-01 Atomicity, NFR-02 Locking | NFR-02 |
| NFR-03 Token | NFR-01; cơ chế lưu/thời hạn chờ ADR |
| NFR-04 UI states | FR-01, FR-03, NFR-03, NFR-04 |
| NFR-05 Checks/review | NFR-06, NFR-08, NFR-10 |
| NFR-06 Error JSON/time | FR-14; chi tiết API cần thống nhất khi triển khai |

Đối chiếu 10 task giữa kỳ và 5 task cuối kỳ tại [tổng quan](../project-overview.md); dùng [ma trận truy vết chung](../traceability-matrix.md).
