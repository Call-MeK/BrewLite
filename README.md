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
Chạy từ root bằng PowerShell:

```powershell
npm --prefix frontend ci
npm --prefix backend ci
Copy-Item frontend/.env.example frontend/.env.local
Copy-Item backend/.env.example backend/.env
```

Chỉ copy env khi chưa có file local; không ghi đè cấu hình đang dùng.
Không commit `.env` hoặc `.env.local`. Chỉ commit `.env.example`.
`JWT_SECRET` trong file mẫu là placeholder; thay bằng secret riêng trước khi triển khai authentication.

Terminal 1:

```powershell
cd frontend
npm run dev
```

Mở http://localhost:3000 để xem trang BrewLite.
Frontend đọc `NEXT_PUBLIC_API_URL=http://localhost:3001` từ `.env.local`.

Terminal 2:

```powershell
cd backend
npm run start:dev
```

Mở http://localhost:3001 để nhận `Hello World!`.
Backend đọc `.env` từ thư mục backend, lấy `PORT` (mặc định 3001),
và bật CORS cho `http://localhost:3000`. Biến môi trường trong terminal có ưu tiên hơn `.env`.
Đảm bảo port 3000 và 3001 đang trống. Dùng Ctrl+C để dừng từng server.

## Kiểm tra trước Pull Request

```powershell
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix backend run lint
npm --prefix backend run build
npm --prefix backend test
npm --prefix backend run test:e2e
```

Smoke test khi hai dev server đang chạy:

```powershell
(Invoke-WebRequest http://localhost:3000 -UseBasicParsing).StatusCode
(Invoke-WebRequest http://localhost:3001 -UseBasicParsing).Content
```

Kết quả mong đợi: `200` và `Hello World!`.

## Git và làm việc nhóm

Branch chính: `main`. Mỗi thành viên tạo branch từ main, ví dụ
`feature/product-api`, `feature/menu`, `feature/cart`, `feature/auth`.
Tạo Pull Request, nhờ thành viên khác review và chạy kiểm tra trước khi merge.

Commit theo Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.

```powershell
git add .
git diff --cached --stat
git commit -m "chore: initialize BrewLite project"
git push -u origin main
```

Remote: https://github.com/Call-MeK/BrewLite.git. Push cần quyền truy cập GitHub và mạng.

Definition of Done: code chạy được, build không lỗi, đúng acceptance criteria,
có commit rõ ràng và được review; các task nghiệp vụ cần validate input,
loading/error state cho UI và cập nhật README khi cần.
