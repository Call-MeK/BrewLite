# UC-01 — Đặt và thanh toán đơn hàng

**Phiên bản:** 2.0, 13/10/2026. **Ưu tiên:** Must. **Trạng thái:** Hợp đồng dùng chung; chưa có kết quả nghiệm thu sản phẩm.  
**Yêu cầu liên quan:** FR-02, FR-04–FR-08, FR-10–FR-17; NFR-01, NFR-02, NFR-08. FR-09 đã nghỉ dùng, không thuộc khoảng yêu cầu checkout.  
**Nguồn:** A1 trang vật lý 5, 7–8; A2 trang 4, 6–7. [SRS](srs.md) là nơi định nghĩa mã yêu cầu.

## Actors và Trigger

- Actor chính: Customer — khách hàng.
- Thành phần tham gia trong BrewLite: Next.js UI, NestJS API, PostgreSQL, Mock Payment. Mock nội bộ không phải actor bên ngoài toàn hệ thống.
- Trigger: Khách chọn đặt hàng/thanh toán từ giỏ có sản phẩm.
- Sơ đồ phạm vi: [nguồn UML checkout](../diagrams/use-case-checkout.puml). Sơ đồ chung: [use-cases.puml](../diagrams/use-cases.puml).
- Luồng chi tiết: [activity](../diagrams/activity-checkout.puml), [sequence](../diagrams/sequence-checkout.puml); bản nháp hòa giải ngày 15/10, chưa render/review.

## Preconditions — Tiền điều kiện

1. Menu và các tùy chọn được seed; khách có giỏ không rỗng. Phải kiểm tra lại ở backend, không tin state giỏ.
2. API và database sẵn sàng. Trước request tạo đơn/thanh toán, khách phải có JWT hợp lệ; nếu chưa đăng nhập, đi luồng thay thế A1 và giữ giỏ.
3. Mock Payment có kịch bản server-side xác định để demo thành công/thất bại. Client chỉ chọn `WALLET` hoặc `CARD`, không quyết định kết quả giao dịch.

## Postconditions — Hậu điều kiện

- Thành công: một Order `PAID`, một Payment thành công, giá/sản phẩm/tùy chọn/khuyến mãi được snapshot; tồn kho được ghi nhận một lần; loyalty được cộng một lần. UI hiện mã/trạng thái và xóa giỏ sau khi xác nhận thành công.
- Thanh toán thất bại: Order `PAYMENT_FAILED`, Payment thất bại được lưu, phần kho đã giữ được trả đúng một lần, không cộng loyalty, giỏ còn nguyên; khách có thể thử thanh toán lại **cùng đơn**.
- Lỗi trước commit: Không có Order/Payment/tồn kho/điểm cập nhật dở dang. Lỗi mạng sau commit chưa xác định kết quả ở UI: dùng lại key hoặc đọc đơn, không tự đoán thất bại và tạo giao dịch khác.
- Hủy: `CANCELLED` là kết thúc. Chính sách trả kho, hoàn mock và bù điểm được ghi dưới đây là **quyết định nhóm**, không phải chính sách refund do PDF quy định.

## Main flow — Luồng chính

| Bước | Thành phần | Hành động/kết quả |
| --- | --- | --- |
| M1 | Customer / UI | Xem menu, chọn sản phẩm, S/M/L và topping, sửa số lượng trong giỏ. |
| M2 | Customer / UI | Xem tổng tiền dự kiến; tùy chọn nhập một mã khuyến mãi; nếu chưa login đi A1. |
| M3 | UI → API | Tạo key cho lần đặt này; gửi `POST /orders` với JWT, `Idempotency-Key`, `items[{productId,sizeCode,toppingIds,quantity}]`, `expectedSubtotal`, `voucherCode?`. |
| M4 | NestJS | Validate JWT/DTO; user lấy từ token. Kiểm tra key đã xử lý trước khi định giá lại: replay cùng payload trả đơn cũ; khác payload đi A5. |
| M5 | NestJS | Lấy giá/tùy chọn từ DB, tính subtotal; `expectedSubtotal` chỉ dùng phát hiện chênh giá, không phải giá đáng tin. Validate mã, tính discount và finalTotal > 0. |
| M6 | NestJS → DB | Trong transaction, cập nhật Product bằng stock + version (optimistic locking), tạo Order `PENDING` và snapshot OrderItems/khuyến mãi. Commit tất cả hoặc rollback tất cả. |
| M7 | API → UI | Trả `orderId`, trạng thái và số tiền do backend tính. UI hiển thị số tiền cuối cùng để khách xác nhận. |
| M8 | Customer / UI | Chọn Ví hoặc Thẻ và xác nhận. Tạo payment key riêng; gửi `POST /payments` với `{orderId,method}` và JWT. Không gửi số tiền đáng tin hoặc cờ success. |
| M9 | NestJS | Kiểm tra quyền sở hữu, key và trạng thái; Payment.amount lấy từ snapshot tổng tiền Order. Mock nội bộ trả kết quả; kiểm tra lại điều kiện khi cập nhật DB. |
| M10 | NestJS → DB | Với kết quả thành công, trong transaction bảo vệ cạnh tranh: ghi Payment thành công, chuyển `PENDING → PAID`, ghi nhận kho đã giữ, tạo bút toán loyalty và tăng điểm một lần. |
| M11 | API → UI | Trả kết quả; UI xóa giỏ sau thành công, hiện mã đơn và `PAID`, cho mở lịch sử/chi tiết. |
| M12 | Customer / UI | Đọc `GET /orders/me` hoặc `GET /orders/:id` với JWT; chỉ xem đơn của mình. Backend thay đổi trạng thái theo FSM qua cơ chế nội bộ có kiểm soát; thao tác đọc không tự đẩy nhanh trạng thái. |

## Alternative flows — Luồng thay thế

| Mã | Tình huống | Kết quả |
| --- | --- | --- |
| A1 | Chưa đăng nhập tại M2 | Chuyển login/register, lấy JWT rồi quay checkout; giỏ và lựa chọn được giữ. Login là bước có điều kiện, không mô hình thành include bắt buộc trong mọi lần checkout. |
| A2 | Không đủ kho tại M6 | `409 OUT_OF_STOCK`; rollback toàn bộ, không có đơn mới hoặc tồn kho âm; giữ giỏ để sửa. |
| A3 | Số lượng/size/topping không hợp lệ | `400`; không ghi đơn hoặc giữ kho. Frontend hiện lỗi nhưng backend vẫn validate độc lập. |
| A4 | Subtotal ở M5 khác `expectedSubtotal` | `409 PRICE_CHANGED` kèm subtotal hiện tại; chưa tạo/giữ kho. Khách xác nhận giá mới, UI dùng payload/key đặt đơn mới. |
| A5 | Lặp key tạo đơn hoặc payment | Cùng user/key/payload trả lại kết quả đã lưu; key cũ khác payload trả `409 IDEMPOTENCY_CONFLICT`. Orders và Payments có phạm vi key riêng. |
| A6 | Thử thanh toán lại sau `PAYMENT_FAILED` | Giữ `orderId`, dùng **payment key mới** cho ý định thử mới. Kiểm tra/giữ lại đủ kho bằng transaction và optimistic locking, đi `PAYMENT_FAILED → PENDING`, rồi `PAID` hoặc `PAYMENT_FAILED`. Thiếu kho thì giữ `PAYMENT_FAILED`, không tạo Payment thành công. Không tạo Order thứ hai. |
| A7 | Mã khuyến mãi sai/hết hạn/không đạt điều kiện | `422 INVALID_VOUCHER`; không tạo đơn/giữ kho. Mã hợp lệ đã được snapshot không bị định giá lại khi retry payment. |

## Exception flows — Luồng ngoại lệ

| Mã | Tình huống | Kết quả |
| --- | --- | --- |
| E1 | Mock Payment thất bại | Ghi Payment thất bại và Order `PAYMENT_FAILED`, trả kho đang giữ một lần trong transaction; giữ giỏ, không cộng điểm. UI cho thử lại theo A6 hoặc rời checkout; rời màn hình không tự hủy đơn. Hủy chỉ qua thao tác nội bộ có kiểm soát. |
| E2 | Timeout sau gửi order/payment | UI gửi lại **cùng key và payload**, hoặc đọc đơn khi biết `orderId`; không tạo key mới chỉ vì timeout. Chỉ hiển thị thành công sau khi server xác nhận. |
| E3 | Hai khách tranh sản phẩm cuối | Chỉ một lần giữ kho thành công. Update version hoặc stock không đạt làm transaction còn lại retry có giới hạn/từ chối; không oversell. |
| E4 | Hai request payment khác key cho cùng đơn | Ràng buộc/cập nhật có điều kiện ở DB chỉ cho một lần ghi nhận thành công và loyalty; request còn lại bị từ chối xung đột. |
| E5 | Database lỗi trước commit | Rollback toàn bộ; trả lỗi an toàn, không log secrets. Retry cùng key để giải quyết cả trường hợp client chưa biết commit đã thành công hay chưa. |
| E6 | JWT sai/hết hạn hoặc đơn thuộc người khác | `401` cho JWT không hợp lệ; `404` cho đơn không tồn tại/không thuộc khách; không tiết lộ dữ liệu đơn người khác. |
| E7 | Hủy cạnh tranh với payment/chuyển pha chế | Cạnh tranh qua trạng thái/version của Order, chỉ một kết quả commit hợp lệ. Không hủy sau `PREPARING`; không hoàn kho/điểm lặp. |

HTTP status và error code chi tiết trong các bảng là hợp đồng nhóm đề xuất; PDF yêu cầu validate/xử lý lỗi nhưng không ấn định toàn bộ mã lỗi này. Business failure từ mock có response xác định, không giả làm lỗi hạ tầng.

## Trạng thái và chính sách hủy

Nguồn: [order-states.puml](../diagrams/order-states.puml), bám A1 trang 8. Luồng thành công `PENDING → PAID → PREPARING → READY → COMPLETED`; ngoại lệ `PENDING → PAYMENT_FAILED`, retry `PAYMENT_FAILED → PENDING`; hủy từ `PENDING`, `PAYMENT_FAILED` hoặc `PAID` sang `CANCELLED`. Mọi cạnh khác bị chặn. `COMPLETED` và `CANCELLED` kết thúc.

Thao tác demo nội bộ có kiểm soát minh chứng state machine; không tạo dashboard/endpoint công khai cho khách tự thay đổi trạng thái nhân viên. Chính sách nhóm:

- Hủy `PENDING`: trả phần kho đang giữ đúng một lần. Hủy `PAYMENT_FAILED`: phần kho đã trả trước đó không được trả lại lần hai.
- Hủy `PAID` trước `PREPARING`: giữ lịch sử Payment, ghi hoàn mock; trả kho và tạo bút toán bù điểm bằng đúng số điểm đã cộng, tất cả đúng một lần. Không hoàn tiền thật.
- Chưa có đổi điểm trong MVP; số điểm bị bù có nguồn từ đơn bị hủy, không tự tính lại bằng giá catalog mới.
- Không có timeout đơn 15 phút hoặc tự chuyển trạng thái sau 10/30 giây trong baseline này. Nếu bổ sung sau phải thay SRS, diagram và test qua review.

## Test derivation — Truy vết kiểm thử

[Test cases](test-cases.md): TC-03 giỏ/login; TC-04 auth/ownership; TC-05 tạo đơn/giá; TC-06 tồn kho đồng thời; TC-07 payment success/fail/retry; TC-08 idempotency; TC-09 FSM; TC-10 promotion; TC-11 loyalty/hủy; TC-13 E2E. Đây là ca kiểm thử **cần thực hiện**, chưa phải kết quả PASS.

## Review

TV2/TV3 review transaction, payment và chính sách bù; TV4/TV5 review giữ giỏ/thử lại/xác nhận; TV6 đối chiếu SRS/test/diagram; TV1 kiểm tra tích hợp và phạm vi. Chưa có xác nhận review thành viên hoặc PR được tạo trong tài liệu này.
