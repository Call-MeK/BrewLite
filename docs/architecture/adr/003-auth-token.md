# ADR-003 — Bcrypt/JWT và token trong bộ nhớ

**Cập nhật:** 19/10/2026. **Trạng thái:** Đã chọn và triển khai cho tích hợp API; chưa khẳng định nghiệm thu auth toàn bộ sản phẩm.

## Bối cảnh

A1 Task 7 yêu cầu bcrypt, JWT và guard; [SRS FR-05/06](../../requirements/srs.md) yêu cầu validate token, giữ giỏ qua login và ownership. [Auth contract](../../auth-contract.md) dùng email/password, JSON và Authorization: Bearer.

## Quyết định

- Bcrypt cost 10; mật khẩu từ 8 ký tự, tối đa 72 byte UTF-8 để tránh truncation bcrypt.
- JWT HS256, issuer `brewlite`, audience `brewlite-web`; bắt buộc subject UUID, iat, exp, chữ ký hợp lệ. `JWT_SECRET` ít nhất 32 byte, chỉ ở backend.
- `JWT_EXPIRES_IN` là số giây nguyên dương, mặc định 3600. `expiresIn` bằng `exp - iat`; không thêm refresh token/OAuth.
- Frontend giữ token/thời điểm hết hạn trong React context. Reload/đóng tab cần login lại; bỏ tùy chọn “ghi nhớ” chưa hỗ trợ.
- Token không nằm trong localStorage/sessionStorage, cookie hoặc cart. Giữ hợp đồng Bearer nên không thêm cookie credentials/CSRF.
- `/auth/me` bổ trợ an toàn. Order/payment kiểm JWT và owner; đơn không tồn tại/không sở hữu cùng trả 404.

## Đánh đổi

Bộ nhớ giảm lưu giữ credential trên thiết bị dùng chung, đổi lại không giữ login qua reload. JavaScript đang chạy vẫn đọc được token; bộ nhớ không giải quyết XSS. Nếu cần login bền qua reload phải thiết kế lại session và đồng bộ contract/CORS/CSRF.

Login không sửa/xóa giỏ; quay lại checkout sau login vẫn cần tích hợp khi có trang checkout.

## Kiểm chứng

Unit/HTTP tests tại `backend/src/auth/` và `backend/test/public-api.e2e-spec.ts` kiểm normalization, bcrypt, token thiếu/sai/hết hạn và response an toàn. PostgreSQL tests chạy bằng `npm.cmd --prefix backend run test:e2e`. Frontend client có test trong `frontend/tests/`. Chưa có browser E2E checkout hoặc xác nhận review của thành viên nhóm.
