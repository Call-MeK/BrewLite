# Quy ước đặt tên API — BrewLite

Tài liệu chung cho frontend/backend khi đặt tên API và viết hợp đồng request/response.
Căn cứ: [SRS, mục 5–6](docs/requirements/srs.md) và [hợp đồng auth](docs/auth-contract.md).
Các endpoint bên dưới đã có trong backend NestJS. PostgreSQL/Prisma lưu dữ liệu nghiệp vụ; xem [hướng dẫn chạy](README.md) và [kiểm thử HTTP](backend/test/commerce.e2e-spec.ts). Việc có API không có nghĩa toàn bộ giao diện checkout hoặc các tiêu chí SRS đã nghiệm thu.

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
| GET | `/products` | `getProducts` | Danh sách sản phẩm; công khai | Đã triển khai |
| GET | `/products/:id` | `getProductById` | Chi tiết sản phẩm; công khai | Đã triển khai |
| POST | `/auth/register` | `register` | Đăng ký bằng email/mật khẩu; công khai | Đã triển khai |
| POST | `/auth/login` | `login` | Đăng nhập bằng email/mật khẩu; công khai | Đã triển khai |
| POST | `/orders` | `createOrder` | Tạo đơn; JWT + `Idempotency-Key` | Đã triển khai |
| POST | `/payments` | `createPayment` | Tạo lần thanh toán; JWT + `Idempotency-Key`, kiểm tra chủ đơn | Đã triển khai |
| GET | `/orders/me` | `getMyOrders` | Lịch sử đơn của người dùng từ JWT | Đã triển khai |
| GET | `/orders/:id` | `getOrderById` | Chi tiết đơn; JWT và quyền sở hữu | Đã triển khai |
| GET | `/health` | `getHealth` | Readiness của API/CSDL; công khai, không lộ secret | Đã triển khai |
| GET | `/auth/me` | `getCurrentUser` | Người dùng hiện tại; JWT | Đã triển khai bổ trợ |

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

## 5. Request/response đã triển khai

Frontend dùng các hàm có kiểu tại [frontend/src/lib/api.ts](frontend/src/lib/api.ts).
Không cần shared API key: sản phẩm/auth/health công khai; các API riêng dùng JWT theo hợp đồng.

### Sản phẩm

`GET /products` trả trực tiếp một mảng; danh sách rỗng là `[]`:

```json
[
  {
    "id": "00000000-0000-4000-8000-000000000001",
    "name": "Espresso",
    "description": "Rich & bold",
    "imageUrl": "https://images.unsplash.com/photo-1502462041640-b3d7e50d0662?auto=format&fit=crop&w=400&q=80",
    "basePrice": 30000,
    "stock": 20,
    "isAvailable": true
  }
]
```

`GET /products/:id` trả một đối tượng như trên, thêm:

```json
{
  "sizes": [
    { "code": "S", "priceDelta": 0 },
    { "code": "M", "priceDelta": 5000 },
    { "code": "L", "priceDelta": 10000 }
  ],
  "toppings": [
    { "id": "00000000-0000-4000-8000-000000000101", "name": "Vanilla syrup", "price": 5000 },
    { "id": "00000000-0000-4000-8000-000000000102", "name": "Extra espresso shot", "price": 10000 }
  ]
}
```

Thứ tự tùy chọn không phải hợp đồng. UUID sai hoặc sản phẩm không tồn tại trả 404 `PRODUCT_NOT_FOUND`. `isAvailable` luôn tính từ `stock > 0`.

### Tạo và đọc đơn

`POST /orders` dùng request ở mục 3, bắt buộc cả JWT và `Idempotency-Key` UUID.
`expectedSubtotal` bắt buộc; `toppingIds` là mảng, kể cả khi không chọn topping.
`voucherCode` chỉ bỏ qua khi không gửi, không nhận `null`.
Giới hạn request: 1–100 dòng, tối đa 100 topping ID duy nhất/dòng; quantity là số nguyên dương; tiền và quantity không vượt giới hạn INTEGER PostgreSQL (2147483647). Trường ngoài DTO bị từ chối với 400.

Response 201 và response 200 của `GET /orders/:id` có cùng cấu trúc:

```json
{
  "id": "10000000-0000-4000-8000-000000000001",
  "userId": "20000000-0000-4000-8000-000000000001",
  "status": "PENDING",
  "inventoryStatus": "RESERVED",
  "subtotal": 35000,
  "discount": 0,
  "total": 35000,
  "voucherCode": null,
  "createdAt": "2026-10-19T00:00:00.000Z",
  "updatedAt": "2026-10-19T00:00:00.000Z",
  "items": [{
    "id": "30000000-0000-4000-8000-000000000001",
    "productId": "00000000-0000-4000-8000-000000000001",
    "productName": "Espresso",
    "sizeCode": "M",
    "sizePrice": 5000,
    "quantity": 1,
    "unitPrice": 35000,
    "lineTotal": 35000,
    "toppings": []
  }]
}
```

Topping snapshot có dạng `{ "toppingId": "uuid", "name": "Vanilla syrup", "price": 5000 }`.
`GET /orders/me` trả mảng các đối tượng đơn, mới nhất trước, chỉ gồm đơn của JWT hiện tại.
Replay cùng key/payload trả **response tạo ban đầu**, kể cả khi đơn đã thanh toán; đọc endpoint chi tiết để lấy trạng thái hiện tại.

### Thanh toán

`POST /payments` nhận `{ "orderId": "uuid", "method": "WALLET" }` hoặc `CARD`, cùng JWT và payment key UUID. Không nhận `amount` hoặc cờ kết quả từ client.
Response 201:

```json
{
  "id": "40000000-0000-4000-8000-000000000001",
  "orderId": "10000000-0000-4000-8000-000000000001",
  "amount": 35000,
  "method": "WALLET",
  "status": "SUCCEEDED",
  "orderStatus": "PAID"
}
```

Kịch bản thất bại trả 201 với `status: FAILED`, `orderStatus: PAYMENT_FAILED`; đây là kết quả nghiệp vụ đã lưu, không phải lỗi mạng. `MOCK_PAYMENT_RESULT=SUCCEEDED|FAILED` là cấu hình backend; mặc định thành công. Đổi cấu hình và khởi động lại backend để thử nhánh lỗi hoặc thử lại cùng đơn. Không có thanh toán thật.
Replay payment key giữ nguyên response của lần đó. Thử lại sau `FAILED` dùng key mới và cùng `orderId`; nếu hết kho trả 409 `OUT_OF_STOCK` và giữ đơn `PAYMENT_FAILED`.

### Health và lỗi

`GET /health`: 200 `{ "status": "ok", "database": "up" }` khi PostgreSQL trả lời; 503 `{ "status": "error", "database": "down" }` khi không kết nối được. Không trả URL CSDL hoặc secret.
Các lỗi nghiệp vụ dùng `{ "statusCode": 409, "code": "PRICE_CHANGED", "message": "...", "subtotal": 35000 }`; `subtotal` chỉ kèm khi giá thay đổi. `OUT_OF_STOCK` có `productId` để UI chỉ ra món cần sửa. UUID đơn không hợp lệ, không tồn tại hoặc không sở hữu cùng trả 404 `NOT_FOUND`.
Frontend giữ chi tiết lỗi để caller xử lý; HTTP/mạng/timeout không tự tạo idempotency key mới hoặc tự retry POST.
