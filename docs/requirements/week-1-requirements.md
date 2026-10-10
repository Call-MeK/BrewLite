# BrewLite — Baseline yêu cầu MVP (Week 1)

**Owner:** Đức Phúc (TV6 — BA/QA/UML/Documentation)  
**Nguồn chuẩn:** `docs/superpowers/specs/2026-10-09-brewlite-design.md`  
**Trạng thái:** Baseline v1.0 — dùng để review phạm vi và truy vết kiểm thử

## 1. Mục tiêu và phạm vi

BrewLite là ứng dụng web cho phép khách hàng đã đăng nhập xem menu cà phê, cấu hình sản phẩm, quản lý giỏ hàng, đặt đơn, thanh toán giả lập không tiền mặt và xem lịch sử đơn hàng.

Trong MVP:

- Frontend dùng Next.js App Router; backend dùng NestJS REST API.
- Cart được lưu cục bộ ở trình duyệt, không có bảng Cart.
- Giá, tồn kho, voucher và quyền sở hữu đơn do backend xác thực.
- Thanh toán là mock, không gọi cổng thanh toán thật.
- Mô hình dữ liệu có đúng 10 bảng như ERD đã chốt.

Ngoài phạm vi: guest checkout, admin/barista dashboard, thanh toán thật, refund, refresh token, OAuth, microservices và quản lý nguyên liệu chi tiết.

## 2. Actor và use case

| Actor | Use case chính |
| --- | --- |
| Khách vãng lai | Xem menu, xem chi tiết sản phẩm, đăng ký, đăng nhập |
| Khách hàng | Quản lý giỏ hàng, tạo đơn, áp voucher, thanh toán, hủy đơn hợp lệ, xem lịch sử/chi tiết đơn |
| Mock Payment Gateway | Trả kết quả thanh toán thành công/thất bại có tính quyết định trong test |
| Expiration Scheduler | Hủy đơn chưa thanh toán khi hết hạn và hoàn tồn kho đúng một lần |

## 3. Yêu cầu chức năng có thể kiểm thử

| ID | Yêu cầu | Tiêu chí chấp nhận tóm tắt | API/UI liên quan |
| --- | --- | --- | --- |
| FR-01 | Danh sách sản phẩm | Trả tên, giá gốc, ảnh, tồn kho và `isAvailable`; hỗ trợ trạng thái có dữ liệu/rỗng/lỗi | `GET /products`, Menu |
| FR-02 | Chi tiết sản phẩm | Trả sản phẩm cùng size S/M/L và topping; 404 khi không tồn tại | `GET /products/:id`, Product Detail |
| FR-03 | Đăng ký/đăng nhập | Email chuẩn hóa; mật khẩu hợp lệ; JWT sống 3600 giây; không lộ `passwordHash` | `/auth/*`, Login/Register |
| FR-04 | Giỏ hàng | Một dòng được định danh bởi product + size + tập topping đã sắp xếp; sửa số lượng/xóa/persist | Cart |
| FR-05 | Tạo đơn | JWT + idempotency key; backend tính lại giá, kiểm tra voucher/tồn kho và reserve atomically | `POST /orders`, Checkout |
| FR-06 | Thanh toán | Một attempt cho mỗi key; success/fail đồng bộ; retry đúng FSM; cộng điểm đúng một lần | `POST /payments`, Payment |
| FR-07 | Lịch sử đơn | Chỉ chủ đơn xem được danh sách/chi tiết; phân trang; dữ liệu snapshot không đổi | `GET /orders/me`, `GET /orders/:id` |
| FR-08 | Hủy/hết hạn | Chỉ đơn chưa trả tiền được hủy; hoàn stock tối đa một lần; đơn PAID không tự hủy | cancel API, scheduler |
| FR-09 | Voucher | Fixed amount, đúng thời gian và min order; discount phải nhỏ hơn subtotal | Create Order |
| FR-10 | Loyalty | Chỉ payment thành công cộng `floor(finalTotal/10000)` điểm, tối đa một lần/đơn | Payment, `/auth/me` |

## 4. Quy tắc nghiệp vụ trọng yếu

| ID | Quy tắc |
| --- | --- |
| BR-01 | Tiền VND là số nguyên; backend là nguồn giá chính thức. |
| BR-02 | `unitPrice = basePrice + sizeDelta + sum(topping.price)`; `lineTotal = unitPrice × quantity`. |
| BR-03 | `finalTotal = subtotal - discount > 0`; mỗi Order tối đa một Voucher. |
| BR-04 | Một đơn PENDING giữ tồn kho trong 15 phút; retry không kéo dài hạn. |
| BR-05 | Một đơn PAID chuyển inventory sang COMMITTED và không trừ stock lần nữa. |
| BR-06 | Payment fail chuyển đơn sang PAYMENT_FAILED/RELEASED; retry phải reserve lại. |
| BR-07 | Replay cùng idempotency key và cùng payload trả kết quả cũ; khác payload trả 409. |
| BR-08 | Order lưu snapshot tên/giá sản phẩm, size, topping và voucher tại lúc tạo. |
| BR-09 | Order/Payment chỉ được truy cập bởi chủ sở hữu; đơn của người khác trả 404. |
| BR-10 | `isAvailable` được tính từ `stock > 0`, không lưu thành cột database. |

## 5. Yêu cầu phi chức năng

| ID | Yêu cầu |
| --- | --- |
| NFR-01 | Các cập nhật Order/Payment/Inventory/Loyalty liên quan phải atomically all-or-none. |
| NFR-02 | Optimistic locking dùng `version`; stock không âm khi có request đồng thời. |
| NFR-03 | JWT/secret không được log hay lưu trong Cart/LocalStorage; MVP dùng sessionStorage cho token. |
| NFR-04 | UI phải có loading, empty, error và out-of-stock state. |
| NFR-05 | Mỗi thay đổi phải qua lint/build/test phù hợp và peer review trước khi hoàn thành. |
| NFR-06 | API lỗi dùng JSON `{statusCode, code, message}`; timestamps dùng ISO 8601 UTC. |

## 6. Ma trận truy vết 10 hạng mục bài tập

| Hạng mục | Yêu cầu được phủ | Bằng chứng dự kiến |
| --- | --- | --- |
| 1. Project scaffold | NFR-05 | build, unit/e2e test, smoke cài/chạy |
| 2. Products API | FR-01, FR-02, BR-10 | API/integration tests + smoke `GET /products` |
| 3. Menu UI | FR-01, NFR-04 | UI component tests + manual smoke |
| 4. Product Detail | FR-02, BR-01/02 | UI/API tests |
| 5. Cart | FR-04, NFR-03 | store unit tests + reload smoke |
| 6. Orders | FR-05, BR-01..08 | unit + PostgreSQL integration tests |
| 7. Auth JWT | FR-03, BR-09, NFR-03 | unit/integration + unauthorized smoke |
| 8. Mock Payment | FR-06, FR-09/10 | deterministic integration tests |
| 9. Confirmation/History/Compose | FR-07, NFR-04 | API/UI smoke + Docker healthcheck |
| 10. Nghiệp vụ nâng cao | FR-08..10, NFR-01/02 | concurrency/rollback/FSM tests |

## 7. Điều kiện hoàn thành tài liệu

- Mọi thay đổi requirement phải cập nhật ID liên quan trong test case và UML.
- Chỉ đánh dấu test `PASS` sau khi có lần chạy và bằng chứng thực tế.
- Sai khác giữa code và tài liệu phải được ghi thành defect; không sửa kết quả để khớp kỳ vọng.
