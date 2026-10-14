# BrewLite — Kiến trúc đề xuất

**Ngày:** 15/10/2026. **Trạng thái:** Tài liệu thiết kế dựa trên baseline đã có; chờ nhóm review, chưa nghiệm thu Task 3. Chưa chọn hosting, triển khai hoặc đo hiệu năng.

Nguồn: [SRS](../requirements/srs.md), [UC-01](../requirements/use-case-checkout.md), [rubric A2 Task 3](../project-overview.md). Dùng kiến trúc phân lớp trong một backend NestJS để nhóm sinh viên dễ làm và tích hợp.

## Thành phần và trách nhiệm

| Thành phần | Trách nhiệm | Đường dẫn và trạng thái |
| --- | --- | --- |
| Next.js / PWA | Menu, tùy chọn, giỏ, auth, checkout, lịch sử; mobile-first, manifest/icon; không thanh toán offline hoặc cache dữ liệu auth/đơn nhạy cảm. | Hiện tại `frontend/`; đích A2 `apps/web/`; chưa hoàn thiện luồng. |
| NestJS REST | Controller nhận DTO; class-validator kiểm dữ liệu; JWT guard xác thực; service thực hiện nghiệp vụ và kiểm tra owner; không tin giá/userId từ client. | Hiện tại `backend/`; đích `apps/api/`; mới có AppModule/AppController/AppService scaffold. |
| Modules nghiệp vụ | Auth, Products, Orders, Payments, Promotions, Loyalty; tách trách nhiệm trong cùng tiến trình. | Thiết kế tại [module/ERD](../diagrams/brewlite-uml.md), chưa là module đã viết. |
| PostgreSQL / Prisma | Dữ liệu bền vững, migration/seed, transaction, unique và version chống ghi trùng/vượt kho. | Chưa có schema/migration được kiểm chứng. Không mở DB production trực tiếp ra Internet. |
| Mock Payment | Hàm nội bộ xác định, server kiểm soát success/failure cho WALLET/CARD; tiền lấy từ Order.total. | Thiết kế, không gọi mạng hoặc thu tiền thật. |
| CI/CD / Docker | Compose web/API/DB local; PR kiểm install/lint/unit/build; CD image có tag, migration an toàn, deploy, smoke và rollback. | Chưa có pipeline, Compose hoặc production được nghiệm thu. |

## Luồng qua các lớp

UI → controller/DTO/JWT guard → service nghiệp vụ → Prisma/PostgreSQL. Controller không tự tính giá từ dữ liệu client; service đọc cấu hình hợp lệ, lưu snapshot. Service Orders/Payments phối hợp trong transaction cho trạng thái, kho và điểm.

- Tạo đơn: giữ kho bằng stock/version và lưu đơn/key cùng transaction, rollback toàn bộ khi lỗi. Unique trong DB chặn cả hai request đồng thời.
- Payment: kiểm JWT/owner/key, khóa/cập nhật có điều kiện trên Order, giữ lại kho trước mock nếu retry. Mock nội bộ nhanh có thể chạy trong transaction; không giữ transaction trong lúc chờ người dùng. Lỗi trước commit rollback, timeout dùng lại key để đọc kết quả.
- Hủy PAID trước pha chế: hoàn mock, trả kho và ghi REVERSAL đúng một lần; giữ Payment và EARN gốc. Chi tiết tại [FSM](../diagrams/order-states.puml), [class](../diagrams/domain-classes.puml) và [sequence](../diagrams/sequence-checkout.puml).

## Config, log và health

- Local hiện dùng frontend :3000, backend :3001; CORS chỉ cho origin frontend local. Khi deploy phải cấu hình origin thực tế, không dùng wildcard để chữa lỗi.
- `NEXT_PUBLIC_API_BASE_URL` chỉ chứa API origin công khai. `DATABASE_URL`, `JWT_SECRET` và credentials triển khai nằm ở backend/CI secrets; `.env.example` không chứa secret thật.
- Log backend ghi mã lỗi, request/order ID và kết quả cần chẩn đoán; không ghi password, JWT hoặc chuỗi kết nối DB. Log hiện tại của scaffold không chứng minh logging nghiệp vụ đã hoàn thành.
- Endpoint health phải phản ánh khả năng phục vụ và kết nối DB, lỗi trả trạng thái không đạt; `GET /` trả Hello World không thay health check. Cấu hình probe cụ thể chốt theo hosting.

## Quyết định và đánh đổi

| ADR | Lựa chọn | Giới hạn |
| --- | --- | --- |
| [001 — Monorepo và phân lớp](adr/001-monorepo.md) | Một repo, một API theo module; Next.js/NestJS/PostgreSQL. | Đơn giản hóa tích hợp; web/API có thể triển khai riêng, chưa cần microservices hoặc công cụ monorepo mới. |
| [002 — Dữ liệu và mock payment](adr/002-data-and-payment.md) | Prisma, transaction/version/unique, snapshot và mock nội bộ. | Phải có integration test PostgreSQL; gateway thật cần thiết kế lại side effect. |
| [003 — Token auth](adr/003-auth-token.md) | Bcrypt + JWT; TTL/cách lưu token còn mở. | Phải chốt trước triển khai auth, không coi ví dụ 3600 giây là quyết định. |

Mô hình này ưu tiên dễ hiểu và đủ yêu cầu đề; backend/DB là điểm dùng chung nên lỗi có thể ảnh hưởng toàn luồng. Kiểm tra phục hồi, hiệu năng < 500 ms với dữ liệu mẫu và bảo mật bằng test thật, không suy ra từ sơ đồ.

## Deployment và điều kiện nghiệm thu

[Deployment diagram](../diagrams/deployment.puml) hiện là topology dự kiến. [Hướng dẫn bàn giao](../deployment.md) ghi phần đã có và việc cần hoàn tất. Trước nghiệm thu Task 3 phải chọn provider thực tế, chốt cổng/HTTPS/registry/storage/secrets/health/log và truy từng dịch vụ về code; render sơ đồ, review nhóm, đưa tạo phẩm vào Git với lý do thay đổi. ADR, sơ đồ và tài liệu này không chứng minh hệ thống đã triển khai.
