# Auth Contract (AC-01) — BrewLite

## Quy ước chung
- Dữ liệu JSON; id là UUID; thời gian theo ISO 8601 UTC.
- Lỗi luôn có dạng: { "statusCode": 400, "code": "VALIDATION_ERROR", "message": "..." }
- Gọi API cần đăng nhập: header  Authorization: Bearer <accessToken>

## POST /auth/register  (public)
Request:  { "email": "a@example.com", "password": "12345678" }
Quy tắc:  email trim + chuyển chữ thường, đúng định dạng; password tối thiểu 8 ký tự
201:      { "id": "uuid", "email": "a@example.com", "loyaltyPoints": 0 }
Lỗi:      400 VALIDATION_ERROR (dữ liệu sai) | 409 (email đã tồn tại)
Lưu ý:    không tự đăng nhập; không bao giờ trả passwordHash

## POST /auth/login  (public)
Request:  { "email": "a@example.com", "password": "12345678" }
200:      { "accessToken": "...", "tokenType": "Bearer", "expiresIn": 3600,
            "user": { "id": "uuid", "email": "a@example.com", "loyaltyPoints": 0 } }
Lỗi:      401 (sai thông tin; không tiết lộ email có tồn tại hay không)

## GET /auth/me  (cần JWT)
200:      { "id": "uuid", "email": "a@example.com", "loyaltyPoints": 0 }
Lỗi:      401 UNAUTHORIZED