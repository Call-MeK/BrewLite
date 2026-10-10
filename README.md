# BrewLite

Ứng dụng web đặt cà phê và thanh toán không tiền mặt cho môn Công nghệ Phần mềm.

## Công nghệ và phạm vi

- Frontend: Next.js, React, TypeScript, Tailwind CSS.
- Backend: NestJS, TypeScript, REST API.
- Dự kiến: PostgreSQL, Prisma, JWT, Mock Payment Gateway, Docker Compose.
- Quy trình: Agile Scrum, branch riêng và Pull Request để review.

Task 1 cung cấp trang khởi tạo frontend và `GET /` trả `Hello World!` từ backend.
Database, authentication, payment và API nghiệp vụ thuộc các task tiếp theo; hiện chưa cần PostgreSQL để chạy.

## Cấu trúc

```text
BrewLite/
├── frontend/
│   ├── public/
│   ├── src/app/
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── src/
│   ├── test/
│   ├── .env.example
│   └── package.json
├── .gitignore
├── README.md
└── .git/
```

Chỉ có một Git repository ở root. Không chạy `git init` trong frontend hoặc backend.

## Chạy local

Yêu cầu Node.js 24 LTS và npm (môi trường kiểm tra: Node 24.15.0, npm 11.12.1).
Chạy từ root bằng PowerShell. Dùng `npm.cmd` để tránh lỗi execution policy
chặn `npm.ps1`; trên macOS/Linux dùng `npm` và `cp` thay cho `Copy-Item`.

```powershell
npm.cmd --prefix frontend ci
npm.cmd --prefix backend ci
if (!(Test-Path frontend/.env.local)) {
  Copy-Item frontend/.env.example frontend/.env.local
}
if (!(Test-Path backend/.env)) {
  Copy-Item backend/.env.example backend/.env
}
```

Không commit `.env` hoặc `.env.local`. Chỉ commit `.env.example`.
Env mẫu không chứa secret thật; `DATABASE_URL` và `JWT_SECRET` để trống
vì scaffold chưa dùng DB/Auth. Điền cấu hình DB và secret riêng khi triển khai các module đó.

| File local | Biến | Giá trị/cách dùng |
| --- | --- | --- |
| `frontend/.env.local` | `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3001`, origin API công khai, không có `/api` hoặc dấu `/` cuối. |
| `backend/.env` | `PORT` | `3001`; backend mặc định cũng là 3001. |
| `backend/.env` | `DATABASE_URL` | Chưa dùng; sau này là URL PostgreSQL riêng của môi trường backend. |
| `backend/.env` | `JWT_SECRET` | Chưa dùng; sau này là secret riêng của backend. |

Theo spec, chỉ dùng `NEXT_PUBLIC_API_BASE_URL` cho API origin. Nếu đã có
`frontend/.env.local` từ scaffold cũ, đổi tên `NEXT_PUBLIC_API_URL` thành
`NEXT_PUBLIC_API_BASE_URL`, giữ giá trị URL phù hợp. Không đưa secret/URL database
vào biến `NEXT_PUBLIC_*` vì chúng công khai trong trình duyệt.
Consumer API dùng `process.env.NEXT_PUBLIC_API_BASE_URL` và nối endpoint
(ví dụ `/products`); trang khởi tạo hiện chưa gọi API. Khởi động lại dev server
sau khi sửa env; nếu dùng production, build lại để cập nhật biến public.

Terminal 1:

```powershell
cd frontend
npm.cmd run dev
```

Mở http://localhost:3000 để xem trang BrewLite.
Lệnh dev cố định cổng 3000; Next.js nạp env từ `frontend/.env.local`.

Terminal 2:

```powershell
cd backend
npm.cmd run start:dev
```

Mở http://localhost:3001 để nhận `Hello World!`.
Backend đọc `.env` từ thư mục backend, lấy `PORT` (mặc định 3001),
và bật CORS cho `http://localhost:3000`. Biến môi trường trong terminal có ưu tiên hơn `.env`.
Đảm bảo port 3000 và 3001 đang trống. Dùng Ctrl+C để dừng từng server.
Nếu cổng bị chiếm (`EADDRINUSE`), dừng server cũ trước khi chạy lại để giữ đúng
origin CORS. Nếu terminal đã đặt `PORT` khác, xóa bằng `Remove-Item Env:PORT`
trước khi chạy backend với cấu hình local 3001.

## Chạy bản build local

Từ root, build cả hai ứng dụng:

```powershell
npm.cmd --prefix frontend run build
npm.cmd --prefix backend run build
```

Chạy ở hai terminal riêng từ root:

```powershell
# Terminal 1: frontend :3000
npm.cmd --prefix frontend start
```

```powershell
# Terminal 2: backend :3001
npm.cmd --prefix backend run start:prod
```

## Kiểm tra trước Pull Request

```powershell
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
npm.cmd --prefix backend run lint
npm.cmd --prefix backend run build
npm.cmd --prefix backend test
npm.cmd --prefix backend run test:e2e
```

Smoke test khi hai dev server đang chạy:

```powershell
(Invoke-WebRequest http://localhost:3000 -UseBasicParsing).StatusCode
(Invoke-WebRequest http://localhost:3001 -UseBasicParsing).Content
(Invoke-WebRequest http://localhost:3001 -UseBasicParsing -Headers @{ Origin = 'http://localhost:3000' }).Headers['Access-Control-Allow-Origin']
```

Kết quả mong đợi: `200`, `Hello World!` và `http://localhost:3000`.

## Git và làm việc nhóm

Remote default hiện là `master`; nhánh đang làm việc là `develop`.
Nhóm thống nhất nhánh đích PR trước khi tích hợp. Mỗi thành viên dùng branch riêng, ví dụ
`feature/product-api`, `feature/menu`, `feature/cart`, `feature/auth`.
Tạo Pull Request, nhờ thành viên khác review và chạy kiểm tra trước khi merge.

Commit theo Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.

```powershell
git add .
git diff --cached --stat
git commit -m "docs: standardize local setup"
git push -u origin HEAD
```

Remote: https://github.com/Call-MeK/BrewLite.git. Push cần quyền truy cập GitHub và mạng.

Definition of Done: code chạy được, build không lỗi, đúng acceptance criteria,
có commit rõ ràng và được review; các task nghiệp vụ cần validate input,
loading/error state cho UI và cập nhật README khi cần.
