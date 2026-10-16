# Quy ước đặt tên API — BrewLite

Tài liệu chung cho frontend/backend khi đặt tên API và viết hợp đồng request/response.
Căn cứ: [SRS, mục 5–6](docs/requirements/srs.md) và [hợp đồng auth](docs/auth-contract.md).
Đây là quy ước triển khai, không phải xác nhận các API đã chạy. Hiện backend chỉ có `GET /` trả `Hello World!`.

## 1. URL và cách ghi endpoint

- Dùng tiếng Anh, chữ thường; đoạn URL nhiều từ dùng `kebab-case`.
- Tài nguyên dùng danh từ số nhiều: `/products`, `/orders`, `/payments`; không dùng `/getProducts`, `/createOrder` hoặc `/product`.
- Ghi endpoint dưới dạng `METHOD /path`, ví dụ `GET /products/:id`. HTTP method luôn viết hoa.
- Không thêm prefix `/api` hoặc `/api/v1`, không có dấu `/` cuối URL.
- Tham số đường dẫn dùng `:id` cho tài nguyên hiện tại; ID liên quan trong JSON dùng `productId`, `orderId`.
- Giữ các đường dẫn đặc biệt đã có trong hợp đồng: `/auth/register`, `/auth/login`, `/orders/me`, `/health`. `/auth/me` là đề xuất bổ trợ.
- `NEXT_PUBLIC_API_BASE_URL` chỉ chứa origin, ví dụ `http://localhost:3001`; nối trực tiếp với endpoint, ví dụ `${baseUrl}/products`.

## 2. Danh sách tên API thống nhất

Tên hàm là quy ước cho hàm gọi API ở frontend và handler ở backend khi triển khai; không yêu cầu tạo thêm lớp hoặc wrapper.

| Method | Endpoint | Tên hàm | Mục đích / quyền | Trạng thái |
| --- | --- | --- | --- | --- |
| GET | `/` | `getHello` | Endpoint mẫu hiện có | Đã triển khai |
| GET | `/products` | `getProducts` | Danh sách sản phẩm; công khai | Theo SRS, chưa triển khai |
| GET | `/products/:id` | `getProductById` | Chi tiết sản phẩm; công khai | Theo SRS, chưa triển khai |
| POST | `/auth/register` | `register` | Đăng ký bằng email/mật khẩu; công khai | Theo SRS, chưa triển khai |
| POST | `/auth/login` | `login` | Đăng nhập bằng email/mật khẩu; công khai | Theo SRS, chưa triển khai |
| POST | `/orders` | `createOrder` | Tạo đơn; JWT + `Idempotency-Key` | Theo SRS, chưa triển khai |
| POST | `/payments` | `createPayment` | Tạo lần thanh toán; JWT + `Idempotency-Key`, kiểm tra chủ đơn | Theo SRS, chưa triển khai |
| GET | `/orders/me` | `getMyOrders` | Lịch sử đơn của người dùng từ JWT | Theo SRS, chưa triển khai |
| GET | `/orders/:id` | `getOrderById` | Chi tiết đơn; JWT và quyền sở hữu | Theo SRS, chưa triển khai |
| GET | `/health` | `getHealth` | Readiness của API/CSDL; công khai, không lộ secret | Theo SRS, chưa triển khai |
| GET | `/auth/me` | `getCurrentUser` | Người dùng hiện tại; JWT | Đề xuất bổ trợ, chưa chốt |

Đặt route tĩnh `/orders/me` trước route động `/orders/:id` khi khai báo controller để tránh nhận `me` thành ID.
`GET /` không thay thế `/health`. Không tự bổ sung endpoint cho giỏ hàng, khuyến mãi, điểm thưởng hoặc chuyển trạng thái đơn từ bảng này.

## 3. Tên trường request/response

- JSON và query parameter dùng `camelCase`: `productId`, `imageUrl`, `createdAt`; không dùng `product_id`, `ImageURL` hoặc `created_at`.
- ID của đối tượng là `id`; tham chiếu dùng `<resource>Id`, danh sách ID dùng `<resource>Ids`, ví dụ `productId`, `toppingIds`. ID tài nguyên dùng UUID theo hợp đồng chung.
- Boolean dùng `is`/`has` khi phù hợp, ví dụ `isAvailable`, `isActive`.
- Thời gian dùng hậu tố `At`, ví dụ `createdAt`, `updatedAt`, `expiresAt`; giá trị là chuỗi ISO 8601 UTC. `expiresIn` là số giây hiệu lực token, không phải mốc thời gian.
- Giữ nguyên tên trường đã thống nhất dưới đây; không tạo tên đồng nghĩa giữa frontend/backend.

| Nhóm | Tên dùng chung | Lưu ý |
| --- | --- | --- |
| Auth | `email`, `password`, `accessToken`, `tokenType`, `expiresIn`, `user`, `loyaltyPoints` | Dùng `register`/`login` trong tên API; không đổi sang `signUp`/`signIn`. Không trả `passwordHash`. |
| Sản phẩm | `id`, `name`, `basePrice`, `imageUrl`, `stock`, `isAvailable` | Dùng `product`, không dùng `drink` hoặc `coffee` cho cùng tài nguyên. |
| Tạo đơn | `items`, `productId`, `sizeCode`, `toppingIds`, `quantity`, `expectedSubtotal`, `voucherCode` | `voucherCode` là trường tùy chọn tham chiếu Promotion; không tạo thêm tài nguyên Voucher trùng Promotion. |
| Tổng tiền đơn | `subtotal`, `discount`, `total` | Dùng `total` theo SRS hiện hành; không dùng `finalTotal` từ bản nháp cũ. Tiền là số nguyên VND. |
| Thanh toán | `orderId`, `method`, `amount` | Request gồm `orderId`, `method`; `amount` do server tính từ đơn, không lấy từ client. |
| Trạng thái | `status`, `inventoryStatus` | Giá trị enum dùng `UPPER_SNAKE_CASE`, ví dụ `PENDING`, `PAYMENT_FAILED`, `RESERVED`. |
| Lỗi | `statusCode`, `code`, `message` | `code` dùng `UPPER_SNAKE_CASE`, ví dụ `VALIDATION_ERROR`, `UNAUTHORIZED`; `statusCode` khớp HTTP status. |

Ví dụ request tạo đơn (các ID bên dưới là UUID minh họa):

```http
POST /orders
Authorization: Bearer <accessToken>
Idempotency-Key: <key>
Content-Type: application/json
```

```json
{
  "items": [
    {
      "productId": "00000000-0000-4000-8000-000000000001",
      "sizeCode": "M",
      "toppingIds": ["00000000-0000-4000-8000-000000000002"],
      "quantity": 1
    }
  ],
  "expectedSubtotal": 45000
}
```

`sizeCode` dùng `S`, `M`, `L`; phương thức thanh toán dùng `WALLET`, `CARD`.
User của đơn lấy từ JWT; giá, tổng tiền và trạng thái do server quyết định. Không thêm `userId`, giá tin cậy hoặc cờ kết quả mock vào request.

## 4. Header và đồng bộ hợp đồng

- Dùng `Authorization: Bearer <accessToken>`, `Content-Type: application/json`, `Idempotency-Key: <key>` trong ví dụ và tài liệu.
- Tạo đơn và thanh toán dùng key riêng. Retry do timeout giữ key cũ; chủ động thanh toán lại sau kết quả thất bại dùng key mới trên cùng đơn, không tạo endpoint `/retry-payment`.
- Tên class/DTO dùng `PascalCase` theo TypeScript/NestJS: `ProductsController`, `CreateOrderDto`, `CreatePaymentDto`; tên file theo cấu trúc NestJS, ví dụ `products.controller.ts`, `create-order.dto.ts`.
- Chi tiết schema/response chưa có trong SRS vẫn cần bổ sung vào hợp đồng trước triển khai; tài liệu này không tự chốt phân trang hoặc response envelope mới.
- Khi đổi tên đã có, cập nhật đồng thời controller/DTO, nơi gọi frontend, test/fixture và tài liệu liên quan. Quyết định thay đổi hợp đồng phải đồng bộ [SRS](docs/requirements/srs.md), [UC checkout](docs/requirements/use-case-checkout.md), [auth contract](docs/auth-contract.md) và ADR liên quan.
