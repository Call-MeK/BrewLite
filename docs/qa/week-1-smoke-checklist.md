# BrewLite — Smoke checklist và kết quả Week 1

**Owner:** Đức Phúc (TV6 — QA)  
**Phạm vi:** cài/chạy, scaffold, `GET /products`, Menu và các trạng thái dữ liệu  
**Nguyên tắc:** chỉ ghi `PASS` sau khi đã chạy; chức năng chưa tồn tại là `FAIL`, ca chưa thể tạo tiền điều kiện là `BLOCKED`.

## 1. Môi trường chạy

| Thuộc tính | Giá trị |
| --- | --- |
| Ngày chạy | 2026-10-10 (Asia/Bangkok) |
| Commit | `fff2606` (`master`) |
| OS/Shell | Windows PowerShell 5.1 |
| Node.js | v24.21.0 |
| npm | 11.19.0 |
| Frontend | Next.js 16.3.8, cổng 3000 |
| Backend | NestJS 12.0.1, cổng 3001 |

## 2. Quy ước trạng thái

- `PASS`: kết quả thực tế khớp kỳ vọng trong lần chạy này.
- `FAIL`: đã chạy và kết quả không khớp.
- `BLOCKED`: chưa thể chạy vì thiếu API, dữ liệu seed hoặc chức năng phụ thuộc.
- `NOT RUN`: chưa chạy; không được xem là đạt.

## 3. Checklist và kết quả

| ID | Ca kiểm thử | Bước chính | Kỳ vọng | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| SMK-01 | Cài dependency frontend | `npm.cmd --prefix frontend ci` | Exit 0 | Exit 0; 358 packages; npm báo 5 high vulnerabilities | PASS |
| SMK-02 | Cài dependency backend | `npm.cmd --prefix backend ci` | Exit 0 | Exit 0; 340 packages; npm báo 5 vulnerabilities (2 low, 1 moderate, 2 high) | PASS |
| SMK-03 | Frontend lint | `npm.cmd --prefix frontend run lint` | Exit 0 | Exit 0, không có lint error | PASS |
| SMK-04 | Frontend production build | `npm.cmd --prefix frontend run build` | Exit 0 | Exit 0; compile, TypeScript và 4 static pages thành công | PASS |
| SMK-05 | Backend lint | `npm.cmd --prefix backend run lint` | Exit 0 | Exit 0, không có lint error | PASS |
| SMK-06 | Backend build/unit/e2e | Chạy build, `test`, `test:e2e` | Tất cả exit 0 | Build exit 0; unit 1/1 pass; e2e 1/1 pass | PASS |
| SMK-07 | Backend health | Start backend; `GET http://localhost:3001/` | 200, `Hello World!` | HTTP 200, body `Hello World!` | PASS |
| SMK-08 | Frontend scaffold | Start frontend; mở `/` | 200, hiển thị BrewLite | HTTP 200, HTML chứa `BrewLite` | PASS |
| SMK-09 | CORS local | `GET /` với Origin `http://localhost:3000` | Header allow-origin đúng | `Access-Control-Allow-Origin: http://localhost:3000` | PASS |
| SMK-10 | Products có dữ liệu | `GET /products` với seed có sản phẩm | 200 và `data` không rỗng, đúng schema | HTTP 404; Nest startup chỉ map route `GET /` | FAIL |
| SMK-11 | Products rỗng | Chạy với catalog rỗng; `GET /products` | 200 `{data:[]}` | Không thể tạo tiền điều kiện vì chưa có Products module/DB | BLOCKED |
| SMK-12 | Products hết hàng | Seed `stock=0`; gọi list/detail | `isAvailable=false`; UI disable thao tác đặt | Không thể tạo tiền điều kiện vì chưa có Products module/DB | BLOCKED |
| SMK-13 | Menu có dữ liệu | Mở `/` khi API có sản phẩm | Hiển thị danh sách và giá; không lỗi console | Trang hiện chỉ là scaffold, chưa có Menu/API consumer | FAIL |
| SMK-14 | Menu rỗng | API trả `{data:[]}` | Hiển thị empty state rõ ràng | Chưa có Menu/API consumer | BLOCKED |
| SMK-15 | Backend tắt | Dừng backend rồi tải Menu | Hiển thị error/retry; không crash trang | Chưa có Menu/API consumer | BLOCKED |

## 4. Defect đã xác định

### BUG-W1-01 — `GET /products` chưa tồn tại

- **Mức độ:** Blocker cho demo Week 1.
- **Liên kết:** FR-01, task Products API, SMK-10..12.
- **Bước tái hiện:**
  1. Cài dependency backend bằng `npm.cmd --prefix backend ci`.
  2. Chạy backend bằng `npm.cmd --prefix backend run start:dev`.
  3. Gửi `GET http://localhost:3001/products`.
- **Kỳ vọng:** HTTP 200 với `{data:[...]}` theo contract.
- **Thực tế:** HTTP 404. Log khởi động Nest chỉ map `GET /`; kiểm tra source cho thấy `AppModule` chưa có `ProductsModule`.
- **Owner đề xuất:** Tấn Nin; Anh Khoa review contract/integration.

### BUG-W1-02 — Menu chưa được triển khai

- **Mức độ:** Blocker cho demo Week 1.
- **Liên kết:** FR-01, task Menu UI, SMK-13..15.
- **Bước tái hiện:**
  1. Chạy frontend bằng `npm.cmd --prefix frontend run dev`.
  2. Mở `http://localhost:3000/`.
- **Kỳ vọng:** Menu gọi `GET /products`, có loading/data/empty/error/out-of-stock states.
- **Thực tế tại lúc kiểm tra source:** trang chỉ hiển thị thông báo khởi tạo thành công; chưa gọi API.
- **Owner đề xuất:** Hoàng An; Anh Khoa review integration.

### RISK-W1-01 — Dependency audit có cảnh báo

- Frontend: npm báo 5 high severity vulnerabilities.
- Backend: npm báo 2 low, 1 moderate và 2 high severity vulnerabilities.
- Không chạy `npm audit fix --force` trong smoke test vì thao tác này có thể nâng phiên bản gây breaking change. Tech Lead cần triage bằng `npm audit` và tạo task sửa riêng.

## 5. Điều kiện retest

Retest SMK-10..15 khi đã có Products API, dữ liệu seed tối thiểu gồm một sản phẩm còn hàng và một sản phẩm `stock=0`, cùng Menu có đủ loading/empty/error/out-of-stock states. Ghi commit, ngày chạy, output thực tế và chuyển trạng thái dựa trên bằng chứng; không đổi trực tiếp từ BLOCKED thành PASS nếu chưa chạy.

## 6. Đối chiếu với bộ yêu cầu hiện hành

| Ca lịch sử | FR/NFR hiện hành | Ca nghiệm thu liên quan |
| --- | --- | --- |
| SMK-01..06 | NFR-05, NFR-08 | TC-12; các test scaffold không chứng minh nghiệp vụ đã đạt |
| SMK-07..09 | NFR-05 | TC-12; `GET /` trả Hello World không thay health check có kiểm tra DB |
| SMK-10..11, SMK-13..15 | FR-01 | TC-01 |
| SMK-12 | FR-03 | TC-01, TC-06; smoke hết hàng không thay test cạnh tranh kho |

Lần retest mới ghi báo cáo riêng kèm ngày, commit và bằng chứng; không ghi đè bảng lịch sử này. Báo cáo mới dùng các mã trong [SRS](../requirements/srs.md) và [ma trận truy vết](../traceability-matrix.md).
