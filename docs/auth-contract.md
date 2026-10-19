# Auth Contract (AC-01) — BrewLite

**Cập nhật:** 15/10/2026. Hợp đồng đề xuất, chưa phải API đã triển khai.
Nguồn yêu cầu: [SRS — FR-05/06](requirements/srs.md). Quyết định token được theo dõi trong [ADR auth](architecture/adr/003-auth-token.md), còn chờ chốt thời hạn và cách lưu ở client.

Các response bên dưới là ví dụ. `expiresIn: 3600` minh họa số giây hiệu lực, không ấn định TTL một giờ; giá trị thật phải khớp cấu hình backend và `exp` của JWT sau khi ADR được chốt. Không mặc nhiên chọn sessionStorage/localStorage từ tài liệu cũ.

## Quy ước chung
- Tên endpoint, hàm và trường JSON theo [API.md](../API.md).
- Dữ liệu JSON; id là UUID; thời gian theo ISO 8601 UTC.
- Lỗi đề xuất có dạng `{ "statusCode": <HTTP status>, "code": "...", "message": "..." }`; statusCode phải khớp HTTP status, không luôn là 400. Dữ liệu sai là 400, xác thực sai là 401, email trùng là 409.
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
Endpoint bổ trợ đề xuất, không thay API bắt buộc của đề và không phải điều kiện hoàn thành auth khi chưa được nhóm chốt.
200:      { "id": "uuid", "email": "a@example.com", "loyaltyPoints": 0 }
Lỗi:      401 UNAUTHORIZED
