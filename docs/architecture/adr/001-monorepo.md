# ADR-001 — Một repo và backend phân lớp theo module

**Ngày:** 15/10/2026. **Trạng thái:** Ghi nhận phương án trong baseline hiện hành; chờ review nhóm, chưa triển khai cấu trúc đích.

## Bối cảnh

[A2](../../references/Assignment2-BrewLite.pdf), trang PDF 3 và 6, kế thừa A1, bắt buộc Next.js/NestJS/PostgreSQL và cấu trúc apps/web, apps/api, docs. Nhóm 6 người cần chia việc và dùng một bộ tài liệu.

## Quyết định

Tiếp tục repo BrewLite. Frontend Next.js và backend NestJS cùng repo; backend phân controller/DTO/guard, service và truy cập DB, tổ chức module theo domain. Hiện vẫn ở frontend/backend; chuyển sang apps/web/apps/api là việc triển khai riêng phải cập nhật tất cả script, README, CI, Docker context và env liên quan. Không tạo project thứ ba, tách microservice hoặc thêm công cụ monorepo khi chưa cần.

## Đánh đổi và kiểm chứng

Dễ review/tích hợp và truy vết trong một repo; backend dùng chung nên cần phối hợp schema và kiểm tra hồi quy khi ghép module. Sau khi chuyển cấu trúc, chạy install/lint/test/build và clone-run theo README; chưa thực hiện các bước này. [Kiến trúc](../README.md) và [deployment](../../diagrams/deployment.puml) phải được cập nhật cùng thay đổi thực tế.
