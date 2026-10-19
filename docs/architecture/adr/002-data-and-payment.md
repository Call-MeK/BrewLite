# ADR-002 — Nhất quán dữ liệu và thanh toán mô phỏng

**Ngày:** 15/10/2026. **Trạng thái:** Ghi nhận thiết kế baseline; schema/constraints cụ thể chờ hai owner backend review và test.

## Bối cảnh

A1 Task 10 yêu cầu state machine, idempotency, transaction + optimistic locking và khuyến mãi/loyalty. Không có tiền thật trong phạm vi. [SRS](../../requirements/srs.md) quy định retry cùng đơn, giữ/trả kho và bù dữ liệu khi hủy PAID trước pha chế.

## Quyết định

PostgreSQL lưu dữ liệu; Prisma quản lý truy cập, migration và seed. Tạo đơn lưu snapshot và giữ kho cùng transaction, điều kiện cập nhật gồm stock/version. Key có phạm vi user/phép toán và unique ở DB; Order lock/version tuần tự hóa payment/retry/hủy. Giá và user lấy từ server/JWT.

Mock WALLET/CARD là hàm nội bộ xác định, server kiểm soát; giữ lại đủ kho trước mock khi retry. Không có I/O mạng hoặc chờ người dùng trong transaction. Ghi payment, trạng thái, kho và EARN/REVERSAL nhất quán; giữ lịch sử và chống lặp theo đơn/loại giao dịch. Không dùng scheduler hết hạn 15 phút.

[ERD](../../diagrams/brewlite-uml.md) 12 bảng là phương án chi tiết đề xuất, không phải yêu cầu số bảng của đề hoặc schema đã chạy. Hai bảng cấu hình tùy chọn theo sản phẩm và signed delta cho bù điểm phải được review trước migration.

## Đánh đổi và kiểm chứng

Giao dịch trong một DB dễ kiểm soát hơn nhiều dịch vụ. Khóa có thể làm request chờ; phải đo hiệu năng và giữ transaction ngắn. Gateway thật không thuộc thiết kế này, cần thiết kế lại side effect/transaction nếu bổ sung. TC-05..11 phải kiểm trên PostgreSQL test riêng: rollback, tranh kho, version cũ, replay/hai key và hủy lặp; chưa có kết quả PASS.
