# BrewLite backend

NestJS REST API, TypeScript. Scaffold hiện có `GET /` trả `Hello World!`;
chưa triển khai PostgreSQL/Prisma, Auth hoặc API nghiệp vụ.

Hướng dẫn đầy đủ và smoke test: [README root](../README.md).
Yêu cầu Node.js 24 LTS; các lệnh dưới đây chạy bằng PowerShell trong `backend/`.
Trên macOS/Linux dùng `npm` và `cp`.

```powershell
npm.cmd ci
if (!(Test-Path .env)) {
  Copy-Item .env.example .env
}
npm.cmd run start:dev
```

Mở http://localhost:3001 để nhận `Hello World!`.
Backend nạp `.env` trong thư mục backend, đọc `PORT=3001` (mặc định 3001),
cho phép CORS từ `http://localhost:3000`. Env trong terminal có ưu tiên hơn `.env`;
nếu đã đặt `PORT` khác, xóa bằng `Remove-Item Env:PORT` để dùng cấu hình local.

`DATABASE_URL` và `JWT_SECRET` trong env mẫu để trống vì scaffold chưa dùng.
Điền cấu hình DB và secret riêng khi triển khai DB/Auth; không commit `.env`.
Frontend dùng duy nhất `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`;
secret và URL database chỉ nằm ở môi trường backend.

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd test
npm.cmd run test:e2e
# Dừng dev server trước khi chạy bản build trên cùng cổng.
npm.cmd run start:prod
```
