# BrewLite — Ma trận truy vết yêu cầu chung

**Ngày:** 13/10/2026. Nguồn chuẩn: [SRS](requirements/srs.md), [UC-01](requirements/use-case-checkout.md), [test cases](requirements/test-cases.md).  
**Trạng thái:** Yêu cầu và ca kiểm thử đã được đặc tả; code/API nghiệp vụ và các test sản phẩm bên dưới **chưa triển khai/chưa chạy**. Các tên module/API là đích cần làm, không phải link đến code đang tồn tại. Không dùng ma trận này để khẳng định đã nghiệm thu.

UML đã có nguồn: [tổng quan](diagrams/use-cases.puml), [checkout](diagrams/use-case-checkout.puml), [FSM](diagrams/order-states.puml). Activity/sequence/class là tạo phẩm Task 2 chưa có; kiến trúc/ADR/deployment là Task 3 chưa hoàn tất. Trạng thái render ghi ở [diagrams/README.md](diagrams/README.md).

## Chức năng

| Yêu cầu | Use-case / user story | Thiết kế / sơ đồ | Code/API dự kiến | Test dự kiến |
| --- | --- | --- | --- | --- |
| FR-01 | Khách xem menu | Use-case tổng quan / Menu; Activity cần bổ sung | Products; `GET /products`; Menu UI | [TC-01](requirements/test-cases.md#tc-01) |
| FR-02 | Khách chọn size/topping | Tổng quan / Detail; checkout / ValidateOrder | `GET /products/:id`; Detail UI; pricing | [TC-02](requirements/test-cases.md#tc-02), [TC-05](requirements/test-cases.md#tc-05) |
| FR-03 | Khách nhận biết hết hàng | Tổng quan / Menu; checkout / ValidateOrder | Product stock và UI hết hàng | [TC-01](requirements/test-cases.md#tc-01), [TC-06](requirements/test-cases.md#tc-06) |
| FR-04 | Khách quản lý giỏ | Tổng quan / Cart; UC-01 M1–M3 | Cart UI/state | [TC-03](requirements/test-cases.md#tc-03) |
| FR-05 | Đăng ký/đăng nhập | Tổng quan / Auth; checkout / ValidateAuth | `/auth/register`, `/auth/login`; bcrypt/JWT | [TC-04](requirements/test-cases.md#tc-04) |
| FR-06 | Login rồi trở lại checkout | UC-01 A1; ghi chú precondition trên checkout | Auth guard + điều hướng UI giữ giỏ | [TC-03](requirements/test-cases.md#tc-03), [TC-04](requirements/test-cases.md#tc-04) |
| FR-07 | UC-01 tạo đơn | Checkout / CreateOrder; UC-01 M3–M7; Sequence/Class cần bổ sung | `POST /orders`; snapshot Order/Items | [TC-05](requirements/test-cases.md#tc-05) |
| FR-08 | UC-01 giữ kho | Checkout / ReserveStock; UC-01 M6/E3; Sequence/Class cần bổ sung | Transaction + Product.version/stock | [TC-06](requirements/test-cases.md#tc-06) |
| FR-10 | UC-01 thanh toán | Checkout / Pay; UC-01 M8–M11/E1 | `POST /payments`; Mock Payment | [TC-07](requirements/test-cases.md#tc-07) |
| FR-11 | UC-01 retry an toàn | Checkout / Retry và ghi chú key; UC-01 A5/A6/E2/E4 | Orders/Payments unique key + ràng buộc thành công một lần | [TC-08](requirements/test-cases.md#tc-08) |
| FR-12 | Khách xem đơn của mình | Tổng quan / History; UC-01 M12/E6 | `GET /orders/me`, `GET /orders/:id`; ownership | [TC-04](requirements/test-cases.md#tc-04), [TC-13](requirements/test-cases.md#tc-13) |
| FR-13 | Theo dõi/chuyển trạng thái hợp lệ | FSM; tổng quan / Transition; UC-01 chính sách hủy | Order FSM/service nội bộ | [TC-09](requirements/test-cases.md#tc-09), [TC-11](requirements/test-cases.md#tc-11) |
| FR-14 | UC-01 dữ liệu/giá/lỗi | Checkout / ValidateOrder; UC-01 A2–A4/E5/E6 | DTO validation, pricing, error UI | [TC-02](requirements/test-cases.md#tc-02), [TC-05](requirements/test-cases.md#tc-05) |
| FR-15 | Khách giữ giỏ và thử lại | Checkout / Retry; UC-01 A6/E1 | Cart, checkout retry cùng Order | [TC-03](requirements/test-cases.md#tc-03), [TC-07](requirements/test-cases.md#tc-07) |
| FR-16 | Áp mã giảm giá | Checkout / Promotion; UC-01 M2/M5/A7; Class cần bổ sung | Promotion; validation/snapshot trong Order | [TC-10](requirements/test-cases.md#tc-10) |
| FR-17 | Cộng điểm sau PAID | Checkout / Loyalty; UC-01 M10/chính sách hủy; Class cần bổ sung | LoyaltyTransaction; cập nhật User points | [TC-11](requirements/test-cases.md#tc-11) |

FR-09 (hết hạn 15 phút) đã nghỉ dùng trong baseline; không tái sử dụng ID này. Đây là bỏ lựa chọn của nháp cũ, không bỏ yêu cầu PDF. FR-16 giữ chủ đề khuyến mãi và trở thành runtime Must; FR-17 tách rõ loyalty Must. Các thay đổi được ghi ở SRS.

## Phi chức năng

| Yêu cầu | Use-case / nhu cầu | Thiết kế liên quan | Code/cấu hình dự kiến | Test/minh chứng dự kiến |
| --- | --- | --- | --- | --- |
| NFR-01 | Khách dùng hệ thống an toàn | UC-01 M4/M9/E6; ADR auth cần bổ sung | Hash, JWT, ownership, validation, secret/log/CORS | [TC-04](requirements/test-cases.md#tc-04), [TC-16](requirements/test-cases.md#tc-16) |
| NFR-02 | UC-01 không làm lệch dữ liệu | UC-01 M6/M10/E3–E7; FSM; Sequence/Class cần bổ sung | Transaction, version, unique và bút toán bù | [TC-06](requirements/test-cases.md#tc-06), [TC-08](requirements/test-cases.md#tc-08), [TC-11](requirements/test-cases.md#tc-11) |
| NFR-03 | Khách dùng trên điện thoại/trình duyệt | UI/kiến trúc web Task 3 cần bổ sung | Responsive, nhãn/bàn phím, manifest/icon | [TC-19](requirements/test-cases.md#tc-19) |
| NFR-04 | Khách sử dụng khi dịch vụ chậm/phục hồi | UC-01 E2/E5; deployment Task 3 cần bổ sung | Loading/error/retry, persistence, readiness | [TC-17](requirements/test-cases.md#tc-17) |
| NFR-05 | Người ngoài clone/chạy được | Kiến trúc/deployment Task 3 cần bổ sung | Migration/seed, Docker Compose, env, README | [TC-12](requirements/test-cases.md#tc-12) |
| NFR-06 | Nhóm chặn thay đổi lỗi trước merge | Quy trình PR/CI Task 4 cần bổ sung | Workflow install/lint/unit/build, required checks | [TC-15](requirements/test-cases.md#tc-15) |
| NFR-07 | Bàn giao production có thể phục hồi | ADR/deployment Task 3 cần bổ sung | Docker image/tag, registry nếu cần, CI secrets, deploy/migrate/smoke/rollback | [TC-16](requirements/test-cases.md#tc-16) |
| NFR-08 | Chứng minh chức năng hoạt động | Use-case/UML → các ca kiểm thử | Test API/UI Sprint 1, unit, integration PostgreSQL, browser E2E | [TC-01](requirements/test-cases.md#tc-01)–[TC-13](requirements/test-cases.md#tc-13) |
| NFR-09 | Phản hồi nhanh với dữ liệu mẫu | Protocol đo trong SRS; kiến trúc Task 3 | Các API nghiệp vụ và môi trường benchmark | [TC-14](requirements/test-cases.md#tc-14) |
| NFR-10 | Giảng viên/nhóm truy vết kết quả | Ma trận này và [bảng rubric](superpowers/specs/2026-10-13-brewlite-unified-project-design.md) | Git/PR, tài liệu, report, backlog/burndown, quyền repo | [TC-18](requirements/test-cases.md#tc-18) |

## Quy tắc cập nhật khi triển khai

1. Giữ ID yêu cầu; đổi nghĩa/phạm vi phải ghi lịch sử và cập nhật UC, UML, test cùng PR.
2. Thay cột dự kiến bằng đường dẫn file/API/test thực sự tồn tại khi hoàn thành; bổ sung commit và kết quả chạy. Không đánh dấu test PASS chỉ vì đã viết test case.
3. Có review từng cổng A2 và hai checklist A1/A2 riêng. Không lấy ma trận dự kiến làm bằng chứng task trước đã được nghiệm thu.
