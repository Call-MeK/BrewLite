# BrewLite — Ca kiểm thử nghiệm thu dự kiến

**Ngày:** 13/10/2026. **Nguồn:** [SRS](srs.md), [UC-01](use-case-checkout.md), A1 Task 10 và A2 Task 4–5.  
**Trạng thái tất cả ca:** Chưa thực hiện. Đây là đặc tả test để dev/QA hiện thực; không phải test tự động hoặc báo cáo PASS. Kết quả sau này phải kèm commit, môi trường, dữ liệu đầu vào và log đã lọc secrets.

Unit kiểm quy tắc thuần; integration dùng PostgreSQL test riêng để chứng minh transaction/unique/version; browser E2E kiểm luồng UI nối API thật với Mock Payment nội bộ. Không dùng test cấu trúc Markdown thay kiểm thử sản phẩm.

### TC-01

**Menu — API/UI:** Seed sản phẩm có tên/ảnh/giá, gọi `GET /products` và mở menu. Đối chiếu dữ liệu; kiểm tra seed trống, API chậm/lỗi và sản phẩm hết hàng. UI có loading/empty/error và giá rõ, không yêu cầu login để xem.

### TC-02

**Chi tiết/tùy chọn — unit/API/UI:** `GET /products/:id` trả S/M/L và topping hợp lệ; chọn các tổ hợp và kiểm giá preview. Gửi size/topping không tồn tại hoặc không được hỗ trợ bị từ chối; không tin giá client. ID không tồn tại có lỗi rõ.

### TC-03

**Giỏ và đăng nhập — UI:** Thêm hai cấu hình món, tăng/giảm số lượng, xóa; tổng và badge đúng. Reload và login không làm mất giỏ; checkout giỏ rỗng bị chặn. Payment fail giữ nguyên giỏ; chỉ xóa sau khi server xác nhận thành công.

### TC-04

**Auth/ownership — API:** Đăng ký lưu hash bcrypt, không trả passwordHash; login cấp JWT. Token thiếu/sai/hết hạn không tạo hoặc thanh toán đơn. Khách B không đọc/thanh toán đơn khách A; `/orders/me` chỉ trả đơn của người gọi. Secret/token không xuất hiện trong log ngoài response auth có chủ đích.

### TC-05

**Tạo đơn/giá — integration:** Giá do DB quyết định, đơn mới `PENDING`, snapshot tùy chọn và tổng đúng. `expectedSubtotal` lệch bị từ chối trước giữ kho; giá giả/userId giả không được tin. Thay catalog sau tạo đơn không sửa lịch sử/số tiền payment. Tiêm lỗi trước commit chứng minh cả đơn và kho rollback.

### TC-06

**Kho đồng thời — integration PostgreSQL:** Seed stock=1, dùng điểm đồng bộ để hai request khác khách cùng cạnh tranh; chỉ một request tạo đơn/giữ kho, request kia không để order dở dang hoặc stock âm. Kiểm tra Product.version thực sự tham gia optimistic locking. Lặp với đơn nhiều item, có item thiếu kho: toàn bộ rollback.

### TC-07

**Payment và thử lại — integration/UI:** Chạy server-side mock success/failure cho cả Ví/Thẻ. Thành công `PAID`, thất bại `PAYMENT_FAILED`, giữ giỏ và trả phần kho đã giữ một lần. Cố ý thử lại: key mới, cùng orderId, giữ lại đủ kho rồi đi qua `PENDING`; thiếu kho vẫn thất bại và không tạo Order mới.

### TC-08

**Idempotency — integration có request đồng thời:** Lặp cùng key/payload khi tạo đơn chỉ có một Order và một lần giữ kho. Lặp payment cùng key không thêm lần xử lý/thanh toán/điểm; khác payload trả 409. Hai payment key khác nhau cho cùng đơn chỉ có một kết quả thành công. Timeout sau commit rồi replay phải lấy lại kết quả đã lưu. Key riêng giữa Orders/Payments và theo user.

### TC-09

**State machine — unit/integration:** Kiểm từng cạnh trong [nguồn FSM](../diagrams/order-states.puml); đặc biệt có `READY` và `PAID → CANCELLED`. Chặn `PENDING → COMPLETED`, `PAYMENT_FAILED → PAID` trực tiếp, `PREPARING → CANCELLED`, và mọi cạnh ra khỏi `COMPLETED`/`CANCELLED`. Đọc trạng thái không tự vượt bước.

### TC-10

**Khuyến mãi — unit/integration:** Mã đúng điều kiện giảm đúng số tiền; mã sai/chưa hiệu lực/hết hạn/không đạt tối thiểu hoặc làm finalTotal không dương bị từ chối. Không dùng hai mã cho cùng đơn. Snapshot giữ nguyên khi catalog hoặc mã thay đổi sau tạo đơn.

### TC-11

**Loyalty và hủy — unit/integration:** Sau `PAID` cộng `floor(finalTotal/10000)` một lần; thất bại không cộng. Replay hoặc hai key không cộng lặp. Hủy `PAID` trước pha chế ghi hoàn mock, trả kho, bút toán bù đúng số điểm đã cộng và giữ lịch sử. Hủy lặp không bù lần hai. Hủy sau `PAYMENT_FAILED` không trả kho đã trả; payment cạnh tranh với hủy chỉ có kết quả nhất quán.

### TC-12

**Tái lập môi trường — integration/smoke:** Từ clone sạch và env hợp lệ, migration/seed dựng database test mới; Compose chạy web/API/DB. Khởi động lại không làm mất dữ liệu đã lưu. README đủ local/test/build; không dùng lệnh reset trên production.

### TC-13

**Browser E2E tự động bắt buộc:** Menu → chi tiết/tùy chọn → giỏ → đăng nhập → đặt đơn → thanh toán → xác nhận mã và `PAID`, sau đó thấy đơn trong lịch sử. Browser dùng API/database test thật với mock gateway xác định. Ít nhất ca happy path này được tự động hóa; demo tay không thay thế nó.

### TC-14

**Hiệu năng:** Đo các API với dữ liệu mẫu theo protocol NFR-09 trong SRS, ghi môi trường, seed, số request, thời gian từng request và tổng hợp theo endpoint. Đối chiếu **< 500 ms**, không thay yêu cầu bằng “chỉ ghi nhận p95” hoặc tự miễn do cold start. Ghi rõ sai lệch/thất bại và cách tái hiện.

### TC-15

**CI/merge gate:** PR tự chạy install → lint → unit test → build. Lưu một PR/run đạt và một run phát hiện lỗi có chủ đích; chứng minh required checks chặn merge khi lint/test/build lỗi. Khôi phục code đạt trước merge; không giữ lỗi mẫu trong nhánh bàn giao.

### TC-16

**CD/production/rollback:** Quality gate chạy trước build Docker image tag SHA/semver; push registry nếu nền tảng cần. CI dùng secret deploy, migration an toàn, smoke web/API/health. Mô phỏng deploy lỗi: pipeline dừng, làm theo cách rollback đã viết và kiểm tra lại health. Production frontend HTTPS truy cập được, DB không public trực tiếp; release/tag/notes và README có thật. Không in secrets.

### TC-17

**Tính khả dụng/khôi phục:** Khi API chậm hoặc ngắt kết nối, UI thể hiện đang chờ/lỗi và cho thử lại; sau phục hồi không mất đơn đã commit, không tạo giao dịch lặp. Database không sẵn sàng phải được phản ánh trong health check/lỗi an toàn. Kiểm tra lại URL vào thời điểm nghiệm thu, không tự gán uptime chưa đo.

### TC-18

**Truy vết/quy trình — review:** Mỗi FR/NFR có AC, use-case/story, thiết kế, code/API và test hoặc trạng thái chưa triển khai. Task 1–3 có artifact và Git history trước nghiệm thu task sau; source + bản kết xuất UML nhất quán. Đối chiếu đủ 10 task A1 và 5 task A2; kiểm repo permissions, Scrum backlog/burndown/Review/Retro và hai báo cáo.

### TC-19

**Mobile-first/PWA/accessibility — UI:** Kiểm theo viewport/trình duyệt và acceptance criteria NFR-03; nhãn và lỗi rõ, bàn phím thao tác được, không tràn nội dung làm mất nút checkout. Manifest/icon phục vụ đúng; không cache response auth/order hoặc cho thanh toán offline. Tiêu chí PWA cụ thể là quyết định nhóm, không mạo nhận PDF định nghĩa chế độ offline.
