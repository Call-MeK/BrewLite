# ADR-003 — Auth JWT và quyết định token còn mở

**Ngày:** 15/10/2026. **Trạng thái:** Bcrypt/JWT theo baseline; TTL và cách lưu token là quyết định chưa chốt. ADR nháp này không đủ để nghiệm thu thiết kế auth.

## Bối cảnh và phần đã xác định

A1 Task 7 yêu cầu bcrypt, JWT và guard bảo vệ đặt đơn; [SRS FR-05/06](../../requirements/srs.md) yêu cầu validate token, giữ giỏ qua login và kiểm tra ownership. [Hợp đồng auth](../../auth-contract.md) đề xuất response JSON và Authorization: Bearer. GET /auth/me chỉ là endpoint bổ trợ đề xuất.

## Phần phải chốt trước triển khai

- TTL của access token, tên/cách cấp cấu hình backend và expiresIn/exp khớp nhau. 3600 trong ví dụ response không phải TTL đã duyệt.
- Cách lưu token tại client. Bản cũ dùng sessionStorage chỉ là phương án tham khảo; phải cân nhắc XSS khi JavaScript đọc được token, hành vi reload/tab và logout. Nếu dùng cookie HttpOnly phải cập nhật contract, CORS/credentials và kiểm soát CSRF tương ứng.
- Khi token hết hạn: chặn request, đưa về login và giữ giỏ; không tự thêm refresh token/OAuth ngoài phạm vi.

## Giới hạn và kiểm chứng

Chưa chọn thay nhóm một phương án lưu token mới. Không lưu password hoặc JWT trong cart, không log token/secret; JWT_SECRET chỉ ở backend. Owner Auth và frontend cần ghi lựa chọn/lý do trong ADR này rồi đồng bộ SRS/contract/test. TC-04 phải kiểm token thiếu/sai/hết hạn, dữ liệu trả về và quyền sở hữu; chưa chạy.
