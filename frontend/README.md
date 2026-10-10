# BrewLite frontend

Next.js App Router, React, TypeScript và Tailwind CSS. Trang hiện tại là scaffold,
chưa gọi API nghiệp vụ.

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
npm.cmd run build
# Dừng dev server trước khi chạy bản build trên cùng cổng.
npm.cmd start
```
