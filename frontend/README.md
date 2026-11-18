# BrewLite frontend

Next.js App Router, React, TypeScript và Tailwind CSS. Menu, chi tiết sản phẩm,
đăng ký và đăng nhập gọi REST API của backend. Các màn hình giữ trạng thái đang tải,
trống/không tìm thấy và lỗi có thể thử lại; điều hướng hủy request cũ.

Hướng dẫn đầy đủ và smoke test: [README root](../README.md).
Yêu cầu Node.js 24 LTS; các lệnh dưới đây chạy bằng PowerShell trong `frontend/`.
Trên macOS/Linux dùng `npm` và `cp`.

```powershell
npm.cmd ci
if (!(Test-Path .env.local)) {
  Copy-Item .env.example .env.local
}
npm.cmd run dev
```

Mở http://localhost:3000. Lệnh dev và start cố định cổng 3000.
Backend chạy riêng ở http://localhost:3001.

Trong `.env.local`, dùng `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`
theo spec (origin không có `/api` hoặc dấu `/` cuối). Nếu có env cũ, đổi tên
`NEXT_PUBLIC_API_URL` thành `NEXT_PUBLIC_API_BASE_URL`, giữ giá trị URL phù hợp.
Consumer API đọc `process.env.NEXT_PUBLIC_API_BASE_URL` và nối endpoint.
Không đặt secret vào biến `NEXT_PUBLIC_*` vì chúng công khai trong trình duyệt.
Khởi động lại dev server sau khi sửa env; build lại khi chạy production.
Không commit `.env.local`.

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
# Dừng dev server trước khi chạy bản build trên cùng cổng.
npm.cmd start
```

Đăng ký dùng email/mật khẩu (tối thiểu 8 ký tự), chuẩn hóa email bằng trim và chữ
thường, rồi chuyển về `/login` mà không tự đăng nhập. Đăng nhập thành công chuyển
đến `/menu`. JWT và user chỉ nằm trong React context ở bộ nhớ; không dùng
localStorage, sessionStorage hoặc cookie. Reload/đóng trang cần đăng nhập lại;
điều hướng nội bộ bằng Next.js giữ phiên. Phiên tự xóa theo `expiresIn` backend trả
về. Backend cấu hình `JWT_EXPIRES_IN` bằng giây, mặc định `3600` (một giờ).
Mật khẩu và token không được ghi log hoặc lưu trong giỏ hàng.

`src/lib/api.ts` cung cấp typed callers cho toàn bộ endpoint trong `API.md`,
gồm `/auth/me`, đơn hàng, thanh toán và readiness. API riêng tư nhận `accessToken`
từ `useAuth().session` một cách tường minh. Mọi caller nhận tùy chọn
`{ signal, timeoutMs }`; timeout mặc định 10 giây. Lỗi HTTP là `ApiError` với
`status`, `code`, `message`, cùng `details` giữ nguyên JSON lỗi (ví dụ
`details.subtotal` khi `PRICE_CHANGED`, `details.productId` khi `OUT_OF_STOCK`);
lỗi kết nối/timeout có `status: 0`. Hủy từ caller trả
`AbortError`. Không tự retry request ghi dữ liệu.

Ví dụ cho caller chưa có màn hình checkout (giỏ hàng hiện tại giữ nguyên):

```ts
import { createOrder, createPayment } from "@/lib/api";

// Tạo một lần cho mỗi thao tác; giữ key này khi thử lại sau timeout/mất kết nối.
const orderKey = crypto.randomUUID();
const order = await createOrder({
  items: [{ productId, sizeCode: "M", toppingIds: [], quantity: 1 }],
  expectedSubtotal: 50000,
}, orderKey, accessToken);

const paymentKey = crypto.randomUUID();
await createPayment({ orderId: order.id, method: "CARD" }, paymentKey, accessToken);
```

`createOrder(input, key, token, options?)` và `createPayment(input, key, token,
options?)` yêu cầu UUID do caller cung cấp. Mỗi thao tác dùng key riêng. Sau kết
quả thanh toán `FAILED`, lần thanh toán chủ động tiếp theo dùng key mới và cùng
`orderId`. Giá và kết quả thanh toán do backend quyết định. Chưa thêm trang
checkout/lịch sử hoặc API giỏ hàng.

`npm.cmd test` dùng Node.js 24 built-in test runner và TypeScript stripping,
không thêm dependency. Các kiểm tra HTTP chạy với server tạm trên localhost:
đúng URL/header/payload, key retry không đổi, lỗi API, timeout, hủy request và
lỗi kết nối; kèm kiểm tra email/mật khẩu và tính giá tùy chọn sản phẩm.
