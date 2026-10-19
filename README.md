# BrewLite

Ứng dụng web đặt cà phê và thanh toán mô phỏng cho môn Công nghệ Phần mềm.
Frontend Next.js ở `frontend/`; REST API NestJS và PostgreSQL/Prisma ở `backend/`.
Nguồn yêu cầu: [SRS](docs/requirements/srs.md), [API](API.md), [auth contract](docs/auth-contract.md), [tài liệu dự án](docs/README.md), [phân công nhóm](docs/team-assignments.md).

## Phần đã triển khai

- API sản phẩm, đăng ký/đăng nhập email, JWT, tạo/đọc đơn, mock payment WALLET/CARD và health.
- PostgreSQL lưu tài khoản, catalogue, snapshot đơn, payment/idempotency key và điểm thưởng.
- Transaction/version giữ kho, payment lỗi trả kho, retry cùng đơn giữ lại kho. Khuyến mãi và loyalty theo SRS.
- Menu/chi tiết và form auth gọi API thật. Hàm frontend cho mọi API nằm tại [api.ts](frontend/src/lib/api.ts).

Giỏ hàng hiện vẫn là giao diện mẫu. Trang checkout, lịch sử đơn, PWA, production và nghiệm thu toàn bộ SRS là các việc tiếp theo; có API không đồng nghĩa đã hoàn thành các luồng giao diện đó.

## Cài đặt local

Yêu cầu Node.js 24 LTS, npm và PostgreSQL. Chạy từ root bằng PowerShell; macOS/Linux dùng `npm` và `cp` tương ứng.

```powershell
npm.cmd --prefix frontend ci
npm.cmd --prefix backend ci
if (!(Test-Path frontend/.env.local)) { Copy-Item frontend/.env.example frontend/.env.local }
if (!(Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

Điền cấu hình trước khi chạy backend:

| File | Biến | Giá trị/cách dùng |
| --- | --- | --- |
| `frontend/.env.local` | `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3001`; chỉ origin, không `/api`. |
| `backend/.env` | `PORT` | `3001`. |
| `backend/.env` | `FRONTEND_ORIGIN` | `http://localhost:3000`; đổi thành origin web thực tế khi deploy. |
| `backend/.env` | `DATABASE_URL` | `postgresql://<user>:<password>@localhost:5432/brewlite`; database phải tồn tại. |
| `backend/.env` | `JWT_SECRET` | Secret ngẫu nhiên ít nhất 32 byte, chỉ ở backend. |
| `backend/.env` | `JWT_EXPIRES_IN` | Số giây nguyên dương, mặc định `3600`. |
| `backend/.env` | `MOCK_PAYMENT_RESULT` | `SUCCEEDED` hoặc `FAILED`; mặc định thành công, không nhận từ client. |

Tạo JWT secret riêng để điền vào file local:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Không commit `.env`/`.env.local`; không đặt secret trong `NEXT_PUBLIC_*`.
Backend đọc `.env` từ thư mục backend; biến terminal có ưu tiên cao hơn.

```powershell
npm.cmd --prefix backend run db:generate
npm.cmd --prefix backend run db:migrate
npm.cmd --prefix backend run db:seed
```

Seed tạo bốn sản phẩm, size S/M/L, hai topping và mã `BREW10K` giảm 10.000đ cho subtotal từ 50.000đ. Iced latte có stock 0 để minh họa hết hàng. Seed lại giữ nguyên giá/kho/cấu hình hiện có; migration không reset dữ liệu. Không có tài khoản mặc định.

## Chạy ứng dụng

Hai terminal riêng:

```powershell
# Terminal 1: web :3000
npm.cmd --prefix frontend run dev
```

```powershell
# Terminal 2: API :3001
npm.cmd --prefix backend run start:dev
```

Mở http://localhost:3000/menu, đăng ký tại `/register`, đăng nhập tại `/login`.
Đăng ký không tự đăng nhập. Token chỉ ở bộ nhớ React; reload/đóng tab cần login lại. Xem [ADR-003](docs/architecture/adr/003-auth-token.md).

```powershell
Invoke-RestMethod http://localhost:3001/health
Invoke-RestMethod http://localhost:3001/products
```

Health trả 200 khi PostgreSQL trả lời, 503 khi DB không sẵn sàng. `GET /` vẫn trả `Hello World!`, không thay health. API riêng dùng `Authorization: Bearer <accessToken>`; POST order/payment còn cần `Idempotency-Key` UUID riêng mỗi phép toán. Request/response và retry: [API.md](API.md).

## Kiểm tra

```powershell
npm.cmd --prefix frontend test
npm.cmd --prefix frontend run lint
npm.cmd --prefix frontend run build
npm.cmd --prefix backend test
npm.cmd --prefix backend run lint
npm.cmd --prefix backend run build
npm.cmd --prefix backend run test:e2e
```

`test:e2e` tự tạo PostgreSQL tạm bằng `embedded-postgres`, áp migration/seed, chạy HTTP tests rồi dừng/xóa cluster tạm. Lệnh không dùng hoặc reset `DATABASE_URL` local, không cần Docker; chạy bằng tài khoản thường vì PostgreSQL không chạy dưới root. Bao gồm auth, validation, ownership, tranh kho, concurrent/replay keys, payment lỗi/retry, snapshot, promotion, loyalty và hủy nội bộ. Đây là kiểm thử API, chưa phải browser E2E checkout theo SRS.

Bản build local: chạy `npm.cmd --prefix frontend start` và `npm.cmd --prefix backend run start:prod` ở hai terminal sau khi build. Đảm bảo port 3000/3001 trống; restart dev server sau khi đổi env và build lại frontend nếu đổi biến public trong production.

## Làm việc nhóm

Chỉ có một Git repository ở root. Dùng branch riêng và Pull Request, commit Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`). Đối chiếu [traceability](docs/traceability-matrix.md) và acceptance criteria trước khi ghi nghiệm thu.
Remote: https://github.com/Call-MeK/BrewLite.git.
