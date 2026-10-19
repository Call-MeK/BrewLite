# BrewLite — Chạy, triển khai và bàn giao

**Cập nhật:** 15/10/2026. **Trạng thái:** Hướng dẫn chuẩn bị bàn giao; chưa có production, pipeline hoặc migration được xác nhận. Không phải runbook triển khai đã chạy thành công.

## Local hiện tại

Lệnh cài đặt/chạy/lint/test/build nằm trong [README dự án](../README.md). Code vẫn ở frontend/backend, web :3000 và API :3001; backend hiện chỉ có scaffold. Lệnh và env trong README phải cập nhật khi chuyển sang apps/web/apps/api. Chưa có Compose ba dịch vụ hoặc schema/seed để khẳng định clone sạch chạy được nghiệp vụ.

## Điều kiện cần hoàn tất

| Bước | Đầu ra phải có | Người phối hợp |
| --- | --- | --- |
| Chọn môi trường | Provider/registry, quyền deploy, persistent PostgreSQL, domain/HTTPS, chi phí/giới hạn đã kiểm tra; cập nhật deployment diagram theo thực tế. | TV1 + backend |
| Cấu hình | Env mẫu không chứa secret; secrets chỉ ở backend/CI; API origin công khai cho web; DB private, CORS đúng origin. | TV1 + frontend/backend |
| Đóng gói local | Dockerfile và Compose chạy web/API/DB, volume, health, migration/seed trên DB dev mới; README đã chạy thử từ clone sạch. | TV1 + TV2/TV3 |
| CI | PR chạy install → lint → unit → build; required checks chặn merge; lưu một run đạt và một run phát hiện lỗi. | TV1 + các owner |
| CD | Quality gate → Docker image tag SHA/semver → registry nếu cần → deploy bằng CI secrets → migration an toàn → health/smoke; lỗi phải dừng. | TV1 + backend |
| Bàn giao | URL web HTTPS, API/health, release/tag/notes, video/demo, Sprint Review/Retro và truy vết tới code/test thật. | Cả nhóm |

## Migration và rollback cần kiểm chứng

- Không dùng reset/drop hoặc seed phá dữ liệu trên production. Trước migration phải có phương án backup/khôi phục và kiểm tra tương thích với phiên bản cũ.
- Khi health/smoke lỗi, dừng phát hành và khôi phục image/release trước đã biết hoạt động. Rollback ứng dụng chỉ an toàn khi DB còn tương thích; migration không tương thích cần kế hoạch phục hồi/forward fix đã thử riêng.
- Chốt lệnh cụ thể theo scripts và provider thực tế sau khi triển khai; chưa có lệnh deploy/rollback được kiểm chứng để sao chép. Khi chốt, bổ sung lệnh, người thực hiện, điều kiện dừng và kết quả thử tại đây.

## Kiểm tra nghiệm thu

[TC-12/15/16/17](requirements/test-cases.md) kiểm clone/Compose, CI, CD/production/rollback và phục hồi. [Deployment diagram](diagrams/deployment.puml) và [kiến trúc/ADR](architecture/README.md) phải phản ánh cấu hình thực tế. Production phải hoạt động lúc chấm; tài liệu hoặc demo local không thay yêu cầu này.
