# BrewLite backend

NestJS REST API, TypeScript, PostgreSQL/Prisma. Các endpoint và schema response tại [API.md](../API.md); cấu hình/chạy hai ứng dụng tại [README root](../README.md).

## Cấu hình và chạy

Yêu cầu Node.js 24 LTS và PostgreSQL. Trong `backend/`:

```powershell
npm.cmd ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Điền `DATABASE_URL` và `JWT_SECRET` (ít nhất 32 byte) vào `.env`. Mặc định `PORT=3001`, `FRONTEND_ORIGIN=http://localhost:3000`, `JWT_EXPIRES_IN=3600`. `MOCK_PAYMENT_RESULT=SUCCEEDED|FAILED` chọn kết quả mock cho WALLET/CARD; restart backend sau khi đổi. Mật khẩu băm bcrypt cost 10; không có shared API key. Biến terminal có ưu tiên hơn `.env`.

```powershell
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run start:dev
```

Database phải tồn tại trước khi migrate. Seed idempotent giữ giá/kho hiện có; migration không reset dữ liệu. Seed không tạo tài khoản mặc định.

## Hành vi chính

- Sản phẩm/auth/health công khai; order/payment kiểm JWT và owner; `/auth/me` trả user an toàn.
- Key order/payment unique trong PostgreSQL theo user/phép toán. Cùng key/payload trả response ban đầu; khác payload trả 409.
- Snapshot giữ giá/tùy chọn. Stock/version kiểm trong transaction; cập nhật kho lấy khóa theo thứ tự ổn định.
- Payment khóa Order để serialize payment/retry/hủy. Lỗi trả kho một lần; retry giữ kho lại trên cùng đơn.
- `BREW10K` giảm 10.000đ khi subtotal từ 50.000đ; PAID cộng `floor(total / 10000)` điểm một lần.
- `OrdersService.transitionOrder` chỉ phục vụ nội bộ, không có endpoint public cho trạng thái nhân viên/hủy. Hủy PAID trước pha chế hoàn mock, kho và điểm trong cùng transaction, giữ lịch sử.
- `GET /health` truy vấn PostgreSQL và trả 503 nếu DB lỗi; `GET /` giữ response scaffold.
- JSON giới hạn 100 KB; lỗi parse không echo request, không trả stack/secret.

## Kiểm thử/build

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
npm.cmd run test:e2e
npm.cmd run start:prod
```

Unit test không cần DB. `test:e2e` tạo PostgreSQL tạm với credential ngẫu nhiên, migrate/seed, chạy HTTP tests rồi dọn cluster; không truy cập database local hoặc cần Docker. Chạy bằng tài khoản thường, không phải root. Browser checkout, production và đo latency SRS chưa nằm trong lệnh API này.
