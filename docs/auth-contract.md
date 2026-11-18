# Auth Contract (AC-01) — BrewLite

**Cập nhật:** 19/10/2026. Các endpoint đã triển khai trong `backend/src/auth/`.
Nguồn yêu cầu: [SRS — FR-05/06](requirements/srs.md). Quyết định token/cách lưu tại [ADR auth](architecture/adr/003-auth-token.md).

Backend dùng `JWT_EXPIRES_IN` (số giây nguyên dương, mặc định 3600); `expiresIn` luôn bằng `exp - iat`. Frontend giữ JWT trong React context và xóa khi hết hạn; reload/đóng tab cần login lại. Không dùng sessionStorage/localStorage hoặc cart để lưu token.

## Quy ước chung
- Tên endpoint, hàm và trường JSON theo [API.md](../API.md).
- Dữ liệu JSON; id là UUID; thời gian theo ISO 8601 UTC.
- Lỗi đề xuất có dạng `{ "statusCode": <HTTP status>, "code": "...", "message": "..." }`; statusCode phải khớp HTTP status, không luôn là 400. Dữ liệu sai là 400, xác thực sai là 401, email trùng là 409.
- Gọi API cần đăng nhập: header  Authorization: Bearer <accessToken>

## POST /auth/register  (public)
Request:  { "email": "a@example.com", "password": "12345678" }
Quy tắc:  email trim + chuyển chữ thường, đúng định dạng; password tối thiểu 8 ký tự, tối đa 72 byte UTF-8 (giới hạn bcrypt); từ chối trường ngoài DTO
201:      { "id": "uuid", "email": "a@example.com", "loyaltyPoints": 0 }
Lỗi:      400 VALIDATION_ERROR (dữ liệu sai) | 409 (email đã tồn tại)
Lưu ý:    không tự đăng nhập; không bao giờ trả passwordHash

## POST /auth/login  (public)
Request:  { "email": "a@example.com", "password": "12345678" }
200:      { "accessToken": "...", "tokenType": "Bearer", "expiresIn": 3600,
            "user": { "id": "uuid", "email": "a@example.com", "loyaltyPoints": 0 } }
Lỗi:      401 (sai thông tin; không tiết lộ email có tồn tại hay không)

## GET /auth/me  (cần JWT)
Endpoint bổ trợ đã triển khai, không thay API bắt buộc của đề.
200:      { "id": "uuid", "email": "a@example.com", "loyaltyPoints": 0 }
Lỗi:      401 UNAUTHORIZED
