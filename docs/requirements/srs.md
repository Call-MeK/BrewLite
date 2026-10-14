# BrewLite — Đặc tả yêu cầu phần mềm chung (SRS)

**Phiên bản:** 2.0, ngày 13/10/2026.  
**Phạm vi:** Một sản phẩm cho Assignment 1 (A1, giữa kỳ) và Assignment 2 (A2, cuối kỳ).  
**Trạng thái:** Baseline yêu cầu đã hòa giải; **chưa nghiệm thu bất kỳ tiêu chí sản phẩm nào**. Tài liệu mô tả hành vi phải xây dựng, không khẳng định chức năng, test, CI/CD hay production đã hoạt động.  
**Kế hoạch nhóm:** 6 thành viên; mục tiêu hoàn thành trong 14 ngày, dự phòng tối đa khoảng 6 tuần. Đây là kế hoạch người dùng xác nhận, không phải hạn nộp trong PDF.

Tài liệu liên quan: [Bối cảnh và phạm vi](context-and-scope.md), [UC-01: Đặt và thanh toán đơn](use-case-checkout.md), [ma trận truy vết](../traceability-matrix.md), [thiết kế chung](../superpowers/specs/2026-10-13-brewlite-unified-project-design.md).

## 1. Nguồn và quy ước

| Ký hiệu | Nguồn | Cách dùng |
|---|---|---|
| A1 | [BrewLite-CongNghePhanMem.pdf](../references/BrewLite-CongNghePhanMem.pdf) | Trang 3–5: Scrum, phạm vi, yêu cầu; trang 6–7: 10 task; trang 7–8: nghiệp vụ, trạng thái, DoD, bàn giao và API. |
| A2 | [Assignment2-BrewLite.pdf](../references/Assignment2-BrewLite.pdf) | Trang 3: kế thừa A1, công nghệ và thứ tự task; trang 4–7: tạo phẩm và tiêu chí từng task; trang 7–8: truy vết, bàn giao và checklist. |
| Nhóm | [Thiết kế chung ngày 13/10/2026](../superpowers/specs/2026-10-13-brewlite-unified-project-design.md) | Chính sách thiết kế để làm rõ điều PDF chưa quy định; không gán các chính sách này cho giảng viên. |

Mọi số trang dưới đây là **trang vật lý trong PDF**, tính cả bìa và mục lục. Số in ở chân trang lệch một trang. Ví dụ A1 trang vật lý 8 có số in 7.

**MoSCoW:** Must = bắt buộc trong baseline chung; Should = nên có sau Must; Could = tùy nguồn lực; Won’t = ngoài lần bàn giao này. Các FR/NFR đang hoạt động dưới đây đều là Must để giữ đủ hai đề. Một tiêu chí gắn **[Nhóm]** vẫn là cam kết thiết kế của baseline, nhưng không phải câu chữ bắt buộc của PDF. Phần ngoài phạm vi ở mục 2 là Won’t; chưa thêm hạng mục Should/Could.

Mỗi tiêu chí có mã `AC-<mã yêu cầu>-<số>` để truy vết độc lập. Khi kiểm thử, ghi tiền điều kiện, thao tác, kết quả thực tế và bằng chứng; chỉ đổi trạng thái sang đạt sau khi đã chạy hoặc kiểm tra tạo phẩm tương ứng.

## 2. Phạm vi và actor

BrewLite cho phép khách xem menu → chọn size/topping → quản lý giỏ → đăng nhập → đặt đơn → thanh toán Ví/Thẻ mô phỏng → xác nhận, xem lịch sử và theo dõi đơn để nhận tại quầy. Next.js, NestJS và PostgreSQL là công nghệ bắt buộc theo A2 trang 3; A1 trang 3 yêu cầu Next.js và NestJS. Prisma là lựa chọn nhóm cho migration/truy cập dữ liệu.

| Actor hoặc vai trò | Trách nhiệm trong baseline |
|---|---|
| Khách chưa đăng nhập | Xem menu/chi tiết, chọn tùy chọn, quản lý giỏ, đăng ký và đăng nhập. |
| Khách đã đăng nhập | Đặt/thanh toán đơn, thử lại thanh toán và đọc đơn của chính mình. |
| Mock Payment Service | Thành phần mô phỏng thanh toán do backend kiểm soát; trả kịch bản thành công/thất bại xác định phục vụ demo và test. |
| Người thực hiện demo/test nội bộ | Thực hiện chuyển trạng thái pha chế và hủy có kiểm soát để chứng minh state machine; không phải chức năng quản trị công khai. |

Nhân viên quầy, quản lý/PO, giảng viên và nhóm phát triển vẫn là stakeholder; chi tiết kỳ vọng nằm trong tài liệu bối cảnh. Giao diện nhân viên nằm ngoài MVP theo A1 trang 4; nghiệp vụ backend chuyển trạng thái vẫn bắt buộc theo A1 trang 7–8.

**Giới hạn [Nhóm]:** Một cửa hàng; tiền VND nguyên; tồn kho theo số phần của Product, không tách theo size/topping; menu và khuyến mãi có dữ liệu seed. Khuyến mãi và tích điểm phải chạy được, không chỉ tồn tại trên class diagram.

**Won’t:** Thanh toán hoặc hoàn tiền thật, thu thập dữ liệu thẻ thật, giao hàng, nhiều chi nhánh, quản lý nguyên liệu theo công thức, dashboard quản trị đầy đủ, đổi điểm thành tiền, microservices và thanh toán offline. Hết hạn đơn tự động, tự chuyển trạng thái theo thời gian và chu kỳ polling cố định không thuộc baseline này.

## 3. Yêu cầu chức năng

| Mã | MoSCoW | Yêu cầu | Nguồn PDF và phần do nhóm quy định |
|---|---|---|---|
| FR-01 | Must | Xem menu công khai có mã, tên, ảnh, giá và trạng thái tải/rỗng/lỗi. | A1 trang 4, 6; A2 trang 6. Công khai là chính sách Nhóm phù hợp luồng xem trước đăng nhập. |
| FR-02 | Must | Xem chi tiết, chọn size S/M/L và topping hợp lệ; hiển thị giá theo lựa chọn. | A1 trang 4, 7; A2 trang 6. Quan hệ tùy chọn hợp lệ do Nhóm đặc tả. |
| FR-03 | Must | Hiển thị tình trạng tồn kho; hàng hết vẫn hiện và không cho thêm vào giỏ. | A1 trang 7 yêu cầu chống vượt kho; cách hiển thị/khóa nút là Nhóm. |
| FR-04 | Must | Thêm, sửa số lượng, xóa món trong giỏ; tổng tiền, badge số lượng và giữ dữ liệu giỏ. | A1 trang 4, 7; A2 trang 6. Lưu qua tải lại/gộp lựa chọn giống nhau là Nhóm. |
| FR-05 | Must | Đăng ký, đăng nhập bằng email/mật khẩu; bcrypt và JWT. | A1 trang 5, 7–8; A2 trang 6. Quy tắc phản hồi auth do Nhóm làm rõ. |
| FR-06 | Must | Yêu cầu đăng nhập trước checkout; giữ giỏ qua đăng nhập. | A1 trang 5, 7; A2 trang 6. Cách quay lại checkout là Nhóm. |
| FR-07 | Must | Backend tạo đơn `PENDING`, tính giá, lưu chi tiết và snapshot; trả mã đơn. | A1 trang 7–8; A2 trang 6. Snapshot và kiểm tra giá thay đổi là Nhóm. |
| FR-08 | Must | Tồn kho nhất quán bằng transaction và optimistic locking khi đặt đồng thời. | A1 trang 7; A2 trang 4. Giữ kho lúc tạo đơn, hoàn/giữ lại kho khi lỗi và retry là Nhóm. |
| FR-10 | Must | Thanh toán mô phỏng `WALLET`/`CARD`; thành công `PAID`, thất bại `PAYMENT_FAILED`. | A1 trang 5, 7–8; A2 trang 6. Mô phỏng xác định và số tiền lấy từ đơn là Nhóm. |
| FR-11 | Must | Idempotency cho tạo đơn và thanh toán, kể cả xử lý đồng thời. | A1 trang 7–8 và A2 trang 4 yêu cầu idempotency thanh toán; key riêng cho tạo đơn, phạm vi user, xung đột payload là Nhóm. |
| FR-12 | Must | Xác nhận mã/trạng thái đơn, lịch sử `GET /orders/me`, chi tiết đơn và quyền sở hữu. | A1 trang 4, 7–8; A2 trang 4, 6. `GET /orders/:id` và kiểm tra ownership là Nhóm. |
| FR-13 | Must | Chỉ cho phép các chuyển trạng thái đúng state machine, bao gồm `READY`, retry và hủy. | A1 trang 7–8; A2 trang 4. Cơ chế thao tác nội bộ, hoàn thanh toán mô phỏng và bù dữ liệu là Nhóm. |
| FR-14 | Must | Validate cả frontend/backend; lỗi rõ ràng, an toàn khi dữ liệu sai, hết hàng hoặc giá thay đổi. | A1 trang 5, 7–8; A2 trang 6. Mã lỗi và `expectedSubtotal` là Nhóm. |
| FR-15 | Must | Giữ giỏ khi thanh toán thất bại và cho thử lại **cùng đơn**. | A1 trang 5, 8. Giữ `orderId`, phân biệt retry mạng/thử lại nghiệp vụ là Nhóm. |
| FR-16 | Must | Áp mã khuyến mãi hợp lệ trong runtime, lưu kết quả giảm giá của đơn. | A1 trang 7; A2 trang 5 yêu cầu lớp Promotion. Giảm số tiền cố định và điều kiện áp dụng là Nhóm. |
| FR-17 | Must | Cộng điểm sau `PAID`, không cộng trùng; lưu giao dịch điểm và bù khi hủy đơn đã trả. | A1 trang 7–8; A2 trang 5 yêu cầu LoyaltyTransaction. Công thức và giao dịch bù là Nhóm. |

### FR-01 — Menu

- **AC-FR-01-1:** Với menu đã seed, gọi `GET /products` không cần JWT trả danh sách có `id`, tên, giá và ảnh; UI hiển thị tương ứng. [A1 trang 6; công khai: Nhóm]
- **AC-FR-01-2:** Khi API đang chờ, UI hiển thị loading; khi API trả danh sách rỗng, UI hiển thị empty state. Hai trường hợp kiểm thử độc lập. [A1 trang 6; A2 trang 6]
- **AC-FR-01-3:** Khi API lỗi, UI hiển thị thông báo và thao tác tải lại; lỗi không bị trình bày thành menu rỗng. [A2 trang 6; cách tải lại: Nhóm]

### FR-02 — Chi tiết và tùy chọn

- **AC-FR-02-1:** Với sản phẩm tồn tại, `GET /products/:id` trả chi tiết và tùy chọn; UI cho chọn size S/M/L và topping được cấu hình cho sản phẩm. [A1 trang 7–8; A2 trang 6]
- **AC-FR-02-2:** Đổi size hoặc topping làm cập nhật giá hiển thị theo dữ liệu giá của backend; thêm vào giỏ giữ đúng lựa chọn và số lượng. [A1 trang 7; cách lấy giá: Nhóm]
- **AC-FR-02-3:** Với mã sản phẩm không tồn tại, API trả 404 và UI có trạng thái không tìm thấy; size/topping không thuộc sản phẩm không được backend chấp nhận. [Nhóm; hỗ trợ validate A1 trang 5]

### FR-03 — Tình trạng tồn kho

- **AC-FR-03-1:** Khi `stock = 0`, menu/chi tiết vẫn hiển thị sản phẩm với nhãn hết hàng và nút thêm giỏ bị vô hiệu hóa. [Nhóm]
- **AC-FR-03-2:** Khi tồn kho thay đổi sau lúc xem menu, gửi yêu cầu đặt vượt kho bị backend từ chối; không tạo đơn hoặc trừ kho một phần. Nhãn trên UI không thay thế kiểm tra backend. [A1 trang 7; chi tiết phản hồi: Nhóm]

### FR-04 — Giỏ hàng

- **AC-FR-04-1:** Với giỏ có món, lần lượt thêm, tăng/giảm số lượng hợp lệ và xóa món cập nhật đúng dòng, tổng tiền và badge tổng số phần. [A1 trang 7; cách đếm badge: Nhóm]
- **AC-FR-04-2:** Hai lần thêm cùng sản phẩm/size/tập topping gộp số lượng; khác tùy chọn tạo dòng riêng. [Nhóm]
- **AC-FR-04-3:** Tải lại trang hoặc hoàn tất đăng nhập giữ nguyên sản phẩm, tùy chọn và số lượng trong giỏ. Cơ chế lưu giỏ phải xử lý dữ liệu lưu lỗi mà không làm UI ngừng hoạt động. [Nhóm]
- **AC-FR-04-4:** Giỏ rỗng hiển thị tổng 0 và không cho checkout; giỏ có món hiển thị tổng trên thao tác thanh toán. [A1 trang 5; giỏ rỗng: Nhóm]

### FR-05 — Xác thực

- **AC-FR-05-1:** Đăng ký dữ liệu hợp lệ tạo user; CSDL lưu mật khẩu băm bcrypt, không lưu mật khẩu nguyên văn; response không chứa `passwordHash`. [A1 trang 5, 7; response: Nhóm]
- **AC-FR-05-2:** Đăng nhập đúng cấp JWT; đăng nhập sai bị từ chối với 401 và không cấp JWT. [A1 trang 7; mã HTTP: Nhóm]
- **AC-FR-05-3:** Đăng ký email đã tồn tại bị từ chối với 409, không tạo user thứ hai. Dữ liệu sai định dạng bị từ chối với 400. [Nhóm; validate theo A1 trang 5]
- **AC-FR-05-4:** JWT sai chữ ký, sai định dạng hoặc hết hạn không truy cập được route bảo vệ. Thời hạn token và cách lưu token ở client là quyết định triển khai phải ghi ADR; SRS này chưa chốt giá trị/cơ chế mới. [A1 trang 7; chi tiết và ADR: Nhóm]

### FR-06 — Đăng nhập trước checkout

- **AC-FR-06-1:** Khách chưa đăng nhập chọn checkout được dẫn tới đăng nhập; sau đăng nhập có thể tiếp tục với giỏ giữ nguyên. [A1 trang 5; cách tiếp tục: Nhóm]
- **AC-FR-06-2:** Gọi trực tiếp `POST /orders` hoặc `POST /payments` không có JWT hợp lệ trả 401 và không tạo dữ liệu nghiệp vụ. [A1 trang 7; bảo vệ thanh toán: Nhóm]

### FR-07 — Tạo đơn và snapshot

- **AC-FR-07-1:** Với JWT, key tạo đơn, giỏ hợp lệ và đủ kho, `POST /orders` lưu một đơn `PENDING` cùng các OrderItem, trả mã đơn và tổng tiền. User của đơn được lấy từ JWT. [A1 trang 7; key/user: Nhóm]
- **AC-FR-07-2:** Backend tính đơn giá, thành tiền, subtotal, giảm giá và total từ dữ liệu hợp lệ của server; giá/tổng tiền do client gửi không thay được số tiền có hiệu lực. [Nhóm]
- **AC-FR-07-3:** Sau khi tạo đơn, thay đổi tên/giá menu hoặc cấu hình khuyến mãi không sửa snapshot của đơn đã tạo; đọc lại đơn trả đúng tùy chọn, số lượng, đơn giá và giảm giá đã chốt. [Nhóm]
- **AC-FR-07-4:** Bất kỳ bước ghi Order, OrderItem hoặc giữ kho lỗi đều rollback toàn bộ transaction; không tồn tại đơn thiếu chi tiết hoặc kho bị trừ cho đơn không tạo được. [A1 trang 7; phạm vi atomicity: Nhóm]

### FR-08 — Kho, transaction và optimistic locking

- **AC-FR-08-1:** Tạo đơn thành công giữ số phần đã mua, giảm `Product.stock` và cập nhật `Product.version` trong cùng transaction với đơn. Điều kiện ghi phải kiểm tra **version đã đọc** và lượng kho còn lại; chỉ kiểm tra `stock >= qty` không đủ để nghiệm thu optimistic locking. [A1 trang 7; thời điểm/cấu trúc: Nhóm]
- **AC-FR-08-2:** Với kho chỉ còn một phần, hai user đặt một phần đồng thời chỉ có một đơn giữ kho thành công; kho bằng 0, không âm và transaction thua không để lại đơn dở dang. [A1 trang 7]
- **AC-FR-08-3:** Khi version đã thay đổi trước lúc ghi, transaction dùng version cũ không được ghi đè; request phải đọc/kiểm tra lại an toàn hoặc trả xung đột 409 mà không làm lệch kho. [Nhóm; chứng minh optimistic locking A1 trang 7]
- **AC-FR-08-4:** Khi thanh toán thất bại hoặc đơn chưa trả bị hủy, lần giữ kho hiện tại chuyển `RELEASED` và trả kho đúng một lần; lặp yêu cầu không tăng kho lần hai. [Nhóm]
- **AC-FR-08-5:** Thử lại một đơn `PAYMENT_FAILED` phải kiểm tra/giữ kho lại trong transaction trước khi chuyển về `PENDING`. Nếu thiếu kho, đơn giữ `PAYMENT_FAILED`, không xử lý thanh toán và không giữ kho một phần. [Nhóm]

### FR-10 — Thanh toán Ví/Thẻ mô phỏng

- **AC-FR-10-1:** Với đơn `PENDING` của user và kho đã giữ, gửi `POST /payments` với `WALLET` hoặc `CARD`; kịch bản thành công ghi Payment, chuyển đơn `PAID` và hiển thị mã/trạng thái đơn. Kiểm tra riêng cả hai phương thức. [A1 trang 5, 7; giá trị enum: Nhóm]
- **AC-FR-10-2:** Kịch bản thanh toán thất bại ghi kết quả thất bại và chuyển đơn `PAYMENT_FAILED`; giữ giỏ, hoàn kho theo FR-08, không cộng điểm. Không đổi lỗi thanh toán thành `CANCELLED`. [A1 trang 5, 7; hoàn kho/điểm: Nhóm]
- **AC-FR-10-3:** `Payment.amount` bằng `Order.total` authoritative đã lưu; thay đổi amount hoặc cờ thành công ở request client không thể tạo thanh toán số tiền khác hoặc tự chứng nhận thành công. [Nhóm]
- **AC-FR-10-4:** Kịch bản mock được backend/test fixture kiểm soát và lặp lại được; không yêu cầu dữ liệu thẻ thật, không phát sinh thu tiền thật. Không giữ transaction mở trong khi chờ người dùng thao tác. [Nhóm]

### FR-11 — Idempotency và xử lý đồng thời

- **AC-FR-11-1:** Hai lần `POST /orders` cùng user, cùng key tạo đơn và cùng payload trả cùng kết quả/mã đơn; CSDL chỉ có một đơn và một lần giữ kho. Kiểm tra cả gửi nối tiếp và đồng thời. [Nhóm; đáp ứng test chống đặt trùng A1 trang 7]
- **AC-FR-11-2:** Hai lần `POST /payments` cùng user, cùng key thanh toán và cùng payload trả kết quả của cùng lần thanh toán; không gọi xử lý thanh toán, đổi kho hoặc cộng điểm lần hai. Kiểm tra nối tiếp và đồng thời. [A1 trang 7; phạm vi side effect: Nhóm]
- **AC-FR-11-3:** Cùng key trong cùng user/phép toán nhưng payload khác trả `409 IDEMPOTENCY_CONFLICT`; kết quả và dữ liệu của lần đầu không bị sửa. [Nhóm]
- **AC-FR-11-4:** Key tạo đơn và key thanh toán thuộc hai phạm vi riêng. CSDL có unique theo user, phép toán và key (hoặc các unique tương đương trên từng bảng); hai user dùng cùng chuỗi key không đọc kết quả của nhau. Không dựa riêng vào bộ nhớ tiến trình. [Nhóm]
- **AC-FR-11-5:** Hai yêu cầu thanh toán đồng thời dùng **key khác nhau** cho cùng đơn chỉ có tối đa một thanh toán thành công và một lần cộng điểm; request còn lại không được gây thêm thu tiền mô phỏng. [Nhóm]
- **AC-FR-11-6:** Sau timeout/kết quả chưa rõ, client gửi lại cùng key và `orderId` để lấy kết quả đã xử lý. Sau một kết quả thất bại đã xác định, khách chủ động thử lại bằng key thanh toán mới trên **cùng `orderId`**; key tạo đơn cũ không bị dùng làm key thanh toán. [Nhóm]

### FR-12 — Xác nhận, lịch sử và quyền sở hữu

- **AC-FR-12-1:** Thanh toán thành công dẫn đến màn hình xác nhận có mã đơn và trạng thái hiện tại; `GET /orders/me` trả lịch sử của user từ JWT. [A1 trang 5, 7–8]
- **AC-FR-12-2:** User đọc `GET /orders/:id` của mình thấy chi tiết, tổng tiền và trạng thái đã lưu; tải lại không làm phát sinh thanh toán hoặc tự chuyển trạng thái. [Nhóm]
- **AC-FR-12-3:** User gọi API đọc hoặc thanh toán đơn không tồn tại/không sở hữu nhận 404, không thấy chi tiết đơn và không đổi dữ liệu; API dùng cùng phản hồi cho hai trường hợp để không tiết lộ đơn người khác. [Nhóm]

### FR-13 — State machine

- **AC-FR-13-1:** Test từng cạnh hợp lệ ở mục 5.2 đều thành công khi đủ điều kiện nghiệp vụ; test mọi cặp trạng thái ngoài các cạnh này đều bị từ chối và giữ dữ liệu cũ. Đặc biệt có `PREPARING → READY → COMPLETED`. [A1 trang 7–8]
- **AC-FR-13-2:** Retry thanh toán phải có chuyển `PAYMENT_FAILED → PENDING` sau khi giữ lại đủ kho; không nhảy trực tiếp từ `PAYMENT_FAILED` sang `PAID`. [A1 trang 8; điều kiện kho: Nhóm]
- **AC-FR-13-3:** `COMPLETED` và `CANCELLED` là trạng thái kết thúc; gọi lặp thao tác đã hoàn tất không sinh transition hoặc tác dụng phụ mới. [A1 trang 7; lặp thao tác: Nhóm]
- **AC-FR-13-4:** Thao tác nội bộ có kiểm soát hủy đơn còn `PAID` ghi hoàn thanh toán mô phỏng, trả kho và đảo đúng số điểm từng cộng; tất cả kết quả bù được lưu cùng lịch sử. Lặp thao tác hủy không hoàn kho/hoàn thanh toán/trừ điểm lần nữa. [Cạnh `PAID → CANCELLED`: A1 trang 8; xử lý bù: Nhóm]
- **AC-FR-13-5:** Khách thông thường không gọi được thao tác demo/test nội bộ; chuyển pha chế/hủy không cần dashboard nhân viên công khai. Một đơn đã `PREPARING` không được hủy theo baseline. [Nhóm; phạm vi UI: A1 trang 4]

### FR-14 — Validate và lỗi

- **AC-FR-14-1:** Giỏ rỗng, số lượng không nguyên dương, product/size/topping sai hoặc method không thuộc `WALLET`/`CARD` bị chặn ở frontend khi có thể và luôn bị backend từ chối; không tạo/thay đổi dữ liệu nghiệp vụ. [A1 trang 5, 7–8; A2 trang 6; miền giá trị: Nhóm]
- **AC-FR-14-2:** Với giá đã đổi trước khi tạo đơn, `expectedSubtotal` khác subtotal backend tính trả `409 PRICE_CHANGED` kèm subtotal hiện tại để cập nhật giỏ/xác nhận lại; không giữ kho hoặc tạo đơn ở giá khách chưa xác nhận. Khách xác nhận giá mới dùng payload/key tạo đơn mới. `expectedSubtotal` chỉ phát hiện chênh lệch, không phải nguồn tính giá. [Nhóm]
- **AC-FR-14-3:** Lỗi validate 400, chưa xác thực 401, đơn không tồn tại/không thuộc user 404, xung đột nghiệp vụ 409 và mã khuyến mãi không hợp lệ 422 có thông báo có thể xử lý; hết kho trả `409 OUT_OF_STOCK`. UI giữ dữ liệu nhập/giỏ để sửa hoặc thử lại. Response không lộ stack trace, mật khẩu hoặc secret. [Validate/lỗi: A1 trang 5, 8 và A2 trang 6; mã lỗi: Nhóm]
- **AC-FR-14-4:** Khi lỗi mạng sau gửi order/payment mà chưa biết kết quả, UI không khẳng định thanh toán thất bại; gửi lại key cũ hoặc tải lại đơn để xác định kết quả trước thao tác mới. [Nhóm]

### FR-15 — Giữ giỏ và thử lại cùng đơn

- **AC-FR-15-1:** Thanh toán thất bại giữ nguyên sản phẩm, size, topping và số lượng trong giỏ; UI hiển thị lỗi và cho thử lại. [A1 trang 5]
- **AC-FR-15-2:** Khi khách thử lại đơn thất bại, frontend dùng lại `orderId` và snapshot đã chốt; backend giữ kho lại, chuyển về `PENDING`, rồi xử lý thanh toán bằng key mới. Không gọi tạo đơn mới chỉ để retry. [Retry: A1 trang 8; trình tự: Nhóm]
- **AC-FR-15-3:** Nếu kho không đủ cho retry, UI báo món thiếu, giỏ còn nguyên và đơn vẫn `PAYMENT_FAILED`; không ghi thanh toán thành công hoặc cộng điểm. [Nhóm]
- **AC-FR-15-4:** Thử lại thành công hiển thị xác nhận cho cùng mã đơn và xóa giỏ sau khi server xác nhận thành công. Muốn thay đổi món/tùy chọn của đơn đã tạo phải xác nhận một lần mua mới, không sửa snapshot của đơn cũ. [Nhóm]

### FR-16 — Khuyến mãi runtime

- **AC-FR-16-1:** Với mã đang hiệu lực và thỏa điều kiện, tạo đơn áp dụng đúng một khoản giảm số tiền cố định, lưu mã/giá trị giảm trong snapshot và tính `total = subtotal - discount`. [A1 trang 7; chính sách/công thức: Nhóm]
- **AC-FR-16-2:** Mã không tồn tại, không hoạt động, chưa đến hạn, hết hạn hoặc không đủ điều kiện áp dụng bị từ chối với `422 INVALID_VOUCHER`; không âm thầm bỏ mã hoặc tạo đơn có giá khác. Dùng thời gian server để kiểm tra hiệu lực. [Nhóm]
- **AC-FR-16-3:** Một đơn áp dụng tối đa một mã; giảm giá không tạo `total <= 0`. Cấu hình mã hoặc request vi phạm bị từ chối trước khi tạo đơn/giữ kho. [Nhóm]
- **AC-FR-16-4:** Retry cùng đơn dùng lại giảm giá đã chốt, không cộng thêm giảm giá hoặc tính lại theo cấu hình mã mới. [Nhóm]

### FR-17 — Điểm thưởng runtime

- **AC-FR-17-1:** Lần đầu đơn chuyển `PAID` tạo LoyaltyTransaction và tăng điểm user bằng `floor(Order.total / 10000)`, dùng tổng thực trả sau giảm giá; đơn chưa trả hoặc thanh toán lỗi không cộng điểm. [A1 trang 7; công thức: Nhóm]
- **AC-FR-17-2:** Replay request, callback/mock lặp hoặc thanh toán đồng thời bằng key khác không cộng điểm lần hai; uniqueness/transaction trong CSDL bảo vệ theo đơn. [Nhóm]
- **AC-FR-17-3:** Hủy nội bộ một đơn còn `PAID` tạo giao dịch bù ngược đúng số điểm đã cộng, giữ giao dịch gốc; lặp hủy không tạo bù lần hai. Không xóa lịch sử Payment hoặc LoyaltyTransaction. [Nhóm]

## 4. Yêu cầu phi chức năng

| Mã | MoSCoW | Yêu cầu | Nguồn PDF và phần do nhóm quy định |
|---|---|---|---|
| NFR-01 | Must | Bảo mật dữ liệu, xác thực, quyền sở hữu và secret. | A1 trang 5, 7; A2 trang 7. Kiểm tra ownership/log cụ thể là Nhóm. |
| NFR-02 | Must | Nhất quán giao dịch và cạnh tranh dữ liệu. | A1 trang 7; A2 trang 4, 7. Các invariant và tình huống rollback là Nhóm. |
| NFR-03 | Must | Mobile-first/PWA, dùng được trên trình duyệt và có khả năng tiếp cận. | A1 trang 5; A2 trang 3, 6. Manifest/icon, viewport và kiểm tra accessibility là tiêu chí Nhóm bổ sung. |
| NFR-04 | Must | Tính khả dụng, thông báo lỗi và phục hồi kết nối. | A2 trang 4 yêu cầu NFR khả dụng; trang 6–8 yêu cầu UI lỗi và production hoạt động. Không tự đặt SLA hosting. |
| NFR-05 | Must | Tái lập local/database bằng migration, seed và Compose. | A1 trang 6–8; A2 trang 6–8. Cách kiểm chứng trên môi trường sạch là Nhóm. |
| NFR-06 | Must | CI tự động trên PR và quality gate thực sự chặn merge. | A2 trang 6; A1 trang 8 yêu cầu build/review. |
| NFR-07 | Must | CD, production truy cập được, migration an toàn và rollback. | A2 trang 5, 7–8. Kiểm chứng lỗi/rollback là cách nghiệm thu Nhóm. |
| NFR-08 | Must | Unit, integration và ít nhất một E2E tự động cho luồng chính. | A1 trang 7; A2 trang 6–7. Không thay bằng kiểm tra cấu trúc tài liệu. |
| NFR-09 | Must | API phản hồi **< 500 ms với dữ liệu mẫu**. | A1 trang 4. Phương án đo bên dưới là đề xuất Nhóm, PDF chưa quy định percentile/tải. |
| NFR-10 | Must | Truy vết đầy đủ, artifact có lịch sử và nghiệm thu A2 đúng thứ tự. | A2 trang 3–8; A1 trang 3–4, 8 về Scrum và DoD. |

### NFR-01 — Bảo mật

- **AC-NFR-01-1:** Kiểm tra CSDL, response và log sau đăng ký/đăng nhập/thanh toán không thấy mật khẩu nguyên văn, hash trong response, JWT trong log hoặc secret; JWT chỉ được trả trong luồng auth cần thiết. [A1 trang 5, 7; kiểm tra cụ thể: Nhóm]
- **AC-NFR-01-2:** Thử JWT không hợp lệ và truy cập chéo user không đọc hoặc thay đổi được đơn; backend bỏ qua/từ chối `userId`, giá và kết quả thanh toán giả mạo từ client. [Nhóm; nền tảng bảo mật/validate: A1 trang 5]
- **AC-NFR-01-3:** Secret không nằm trong repo/log CI; `.env.example` chỉ chứa mẫu, production dùng secret cấu hình ngoài mã nguồn và CSDL không public trực tiếp. [A2 trang 7]

### NFR-02 — Nhất quán

- **AC-NFR-02-1:** Integration test cạnh tranh kho chứng minh transaction + kiểm tra `version` giữ `stock >= 0` và không bán vượt kho. [A1 trang 7]
- **AC-NFR-02-2:** Gây lỗi giữa các bước tạo đơn, thanh toán hoặc hủy có bù không để lại thay đổi từng phần về status, kho, Payment và điểm; chạy lại không nhân đôi tác dụng phụ. [Nhóm]
- **AC-NFR-02-3:** Gửi đồng thời cùng key và khác key cho cùng đơn vẫn giữ invariant: tối đa một thanh toán thành công, một giao dịch cộng điểm và một giao dịch bù tương ứng; lịch sử thất bại được giữ. [Nhóm]

### NFR-03 — Mobile-first, trình duyệt, khả năng tiếp cận và PWA

- **AC-NFR-03-1:** Kiểm tra menu → xác nhận trên trình duyệt ở viewport rộng 360 px và 1280 px không có cuộn ngang do bố cục, không che nút/tổng tiền hoặc mất thao tác chính. [Mobile-first/trình duyệt: A1 trang 5, A2 trang 3, 6; kích thước: Nhóm]
- **AC-NFR-03-2:** Toàn bộ thao tác mua hàng dùng được bằng bàn phím; focus nhìn thấy, input có nhãn, ảnh sản phẩm có mô tả phù hợp, lỗi gắn với trường nhập và trạng thái không chỉ phân biệt bằng màu. [Nhóm bổ sung; chưa tự nhận đạt một chứng nhận WCAG]
- **AC-NFR-03-3:** Bản production cung cấp web app manifest hợp lệ và icon; trình duyệt tải được chúng, có tên ứng dụng, `start_url` và cấu hình hiển thị phù hợp. [Hướng PWA: A2 trang 3; mức tối thiểu cụ thể: Nhóm]
- **AC-NFR-03-4:** Khi mất mạng trong checkout, UI thông báo tình trạng; không xếp hàng để tự thanh toán offline hoặc hiển thị thành công khi chưa có kết quả server. Cache/offline đầy đủ nằm ngoài baseline. [Nhóm]

### NFR-04 — Khả dụng

- **AC-NFR-04-1:** Khi API không phản hồi hoặc trả lỗi, màn hình liên quan có loading/error và thao tác thử lại; phục hồi kết nối cho phép tải lại đơn từ CSDL bằng quyền sở hữu hợp lệ. [A2 trang 6; phục hồi: Nhóm]
- **AC-NFR-04-2:** Retry sau gián đoạn/khoảng dừng dịch vụ không tạo thêm đơn, thanh toán hoặc điểm; áp dụng FR-11 ngay cả khi tiến trình API khởi động lại. [Nhóm]
- **AC-NFR-04-3:** Tại buổi nghiệm thu, frontend production HTTPS, URL API và health truy cập được; không ghi hoàn thành phần triển khai nếu URL production không hoạt động. [A2 trang 7–8]

### NFR-05 — Tái lập môi trường

- **AC-NFR-05-1:** Người ngoài nhóm clone repo, cấu hình theo `.env.example`/README và chạy `docker-compose.yml` để khởi động đủ Next.js, NestJS và PostgreSQL local. [A1 trang 7–8; A2 trang 7]
- **AC-NFR-05-2:** Trên CSDL local trống, migration và seed theo README tạo được schema cùng dữ liệu mẫu để chạy menu/checkout/test; không phụ thuộc bản CSDL cá nhân. [A2 trang 6–7]
- **AC-NFR-05-3:** `GET /health` có response phù hợp tình trạng sẵn sàng của API/CSDL, có hướng dẫn gọi; cấu hình lỗi không báo sẵn sàng giả. [Endpoint: A2 trang 7; readiness: Nhóm]
- **AC-NFR-05-4:** README có lệnh chạy local, test, build, deploy và rollback; người ngoài nhóm thực hiện được bằng hướng dẫn và quyền truy cập được cung cấp. [A2 trang 7]

### NFR-06 — CI và chặn merge

- **AC-NFR-06-1:** Mở/cập nhật PR tự chạy pipeline `Install → Lint → Unit Test → Build` cho phần liên quan; log thể hiện các bước thực sự chạy. [A2 trang 6]
- **AC-NFR-06-2:** PR có lint, test hoặc build thất bại không thể merge theo required checks/quy tắc nhánh; chỉ có cấu hình YAML mà chưa áp dụng chặn merge chưa đạt. [A2 trang 6]
- **AC-NFR-06-3:** Bàn giao link PR kèm ảnh/log của ít nhất một lần CI thành công và một lần pipeline phát hiện lỗi; minh chứng có commit thực để đối chiếu. [A2 trang 6]

### NFR-07 — CD, production và rollback

- **AC-NFR-07-1:** Push/tag kích hoạt quy trình phát hành có quality gate lint/test/build, tạo Docker image với tag commit SHA hoặc semantic version và push registry nếu nền tảng yêu cầu. [A2 trang 7]
- **AC-NFR-07-2:** Pipeline triển khai production bằng secret của CI, chạy migration theo phương án an toàn đã ghi trong tài liệu deployment và gọi health/smoke test sau triển khai. [A2 trang 7]
- **AC-NFR-07-3:** Nếu deploy/migration/health/smoke thất bại, pipeline dừng và báo thất bại; có hướng dẫn rollback về phiên bản đã biết. Kiểm chứng rollback trên môi trường kiểm thử, nêu cách xử lý tương thích schema/dữ liệu, không mặc định rollback image đảo được migration. [Yêu cầu dừng/rollback: A2 trang 7; cách kiểm chứng: Nhóm]
- **AC-NFR-07-4:** Bàn giao URL frontend production HTTPS, URL API và health; CSDL có lưu trữ bền vững, không public trực tiếp; secret không xuất hiện trong source/log CI. [A2 trang 5, 7]
- **AC-NFR-07-5:** Repo có release/tag, release notes, README local/test/build/deploy/rollback và video hoặc demo trực tiếp end-to-end; có Sprint Review và Retrospective. [A2 trang 7–8; A1 trang 8]
- **AC-NFR-07-6:** Deployment diagram phản ánh nền tảng thực: browser/PWA, Next.js/CDN, NestJS, PostgreSQL/persistent storage, registry/nền tảng deploy, HTTPS/kết nối/cổng, secret/health/log, ranh giới local/CI/production; mỗi dịch vụ truy được về kiến trúc và code. [A2 trang 5]

### NFR-08 — Kiểm thử bắt buộc

- **AC-NFR-08-1:** Unit test chứng minh cho phép/chặn từng transition, tính giá/khuyến mãi và cộng/bù điểm; integration test kiểm tra API order/payment, replay key và hai khách tranh kho. [A1 trang 7; A2 trang 7; chi tiết tập test: Nhóm]
- **AC-NFR-08-2:** Có ít nhất một E2E tự động qua menu → chọn tùy chọn → giỏ → đăng nhập/đặt đơn → thanh toán → xác nhận với mã đơn thực; test chạy bằng lệnh được ghi trong README. [A2 trang 7; tự động và lệnh: Nhóm]
- **AC-NFR-08-3:** MVP Sprint 1 có test tối thiểu API sản phẩm và component/luồng chính; Sprint 2 có integration cho cả tạo đơn/thanh toán thành công, lỗi và retry. [A2 trang 6–7; các nhánh cụ thể: Nhóm]
- **AC-NFR-08-4:** Báo cáo test gắn commit/môi trường và kết quả thực. Test cấu trúc Markdown/UML không được tính thay unit/integration/E2E của sản phẩm. [Nhóm]

### NFR-09 — Hiệu năng

- **AC-NFR-09-1:** Các API nghiệp vụ được đo với dữ liệu mẫu phải có thời gian phản hồi **< 500 ms**; lưu kết quả theo endpoint cùng cấu hình máy/môi trường, dữ liệu seed, cách đo và tải. [Mục tiêu: A1 trang 4; bằng chứng: Nhóm]
- **AC-NFR-09-2:** **Phương án đo đề xuất [Nhóm]:** dùng môi trường Compose nghiệm thu, ghi cấu hình và số bản ghi seed; warm-up 10 lần, đo 100 request hợp lệ/endpoint với tải một request tại một thời điểm, bao gồm list/detail/auth/order/payment/history. Request tạo mới dùng dữ liệu/key hợp lệ riêng, có đủ kho; đo từ phía client, ghi p50/p95/max và số request lỗi. Đối chiếu ngưỡng với từng request trong tập đo, không dùng riêng giá trị trung bình để che request vượt ngưỡng. Đây là phương pháp nhóm đề xuất, PDF không chỉ định tải hay percentile.
- **AC-NFR-09-3:** Ghi riêng kết quả cold start và môi trường production nếu có khác biệt; không tự hạ NFR xuống Should, miễn mục tiêu vì hosting miễn phí hoặc tuyên bố đạt từ số liệu chưa chạy. Nếu cần đổi phương án đo, ghi quyết định trước nghiệm thu và giữ nguyên mục tiêu PDF. [Nhóm]

### NFR-10 — Truy vết, quy trình và thứ tự nghiệm thu

- **AC-NFR-10-1:** Mỗi FR/NFR đang hoạt động có dòng trong [ma trận truy vết](../traceability-matrix.md), nối requirement → use-case/story → thiết kế/sơ đồ → code/API → test; mục chưa tạo ghi `planned`/chưa có bằng chứng, không tạo link giả hoặc ghi đã đạt. [A2 trang 7; trạng thái: Nhóm]
- **AC-NFR-10-2:** Chỉ nghiệm thu A2 theo Task 1 → 2 → 3 → 4 → 5 sau khi tạo phẩm bắt buộc task trước có trên repo và có lịch sử thay đổi. Thiếu tạo phẩm task trước thì task sau chưa đạt phần truy vết. [A2 trang 3, 8]
- **AC-NFR-10-3:** Task 1 có bối cảnh/stakeholder/phạm vi, SRS với mã/MoSCoW/AC, use-case tổng quát, đặc tả và diagram use-case checkout. Task 2 có activity, sequence, class nhất quán với SRS; sequence có cả nguồn và bản kết xuất. [A2 trang 3–5]
- **AC-NFR-10-4:** Class diagram có tối thiểu User, Product, Order, OrderItem, Payment, Promotion và LoyaltyTransaction với thuộc tính, quan hệ, multiplicity, enum. Task 3 có kiến trúc C4 hoặc phân lớp, ADR cho quyết định quan trọng và deployment diagram đúng nền tảng thật. [A2 trang 5]
- **AC-NFR-10-5:** Repo có cấu trúc web/API/docs, README, `.gitignore`, `.env.example`, nhánh/PR, quy ước commit, board cho hai Sprint và DoD; tài liệu Task 1–3 được theo dõi trong Git, thay đổi có lý do qua commit/PR. [A2 trang 5–6, 8]
- **AC-NFR-10-6:** Có vai trò Scrum, Planning/Daily/Review/Retro, backlog và burndown cập nhật theo tiến độ thật; task chỉ đánh dấu đạt khi chạy được, đủ AC, có commit/review và hướng dẫn. Hai checklist/báo cáo A1/A2 dùng chung sản phẩm nhưng nghiệm thu riêng theo rubric. [A1 trang 3–4, 8; hai báo cáo: Nhóm]

## 5. Quy tắc nghiệp vụ thống nhất

### 5.1. Giá, khuyến mãi và điểm [Nhóm]

- Tiền tại API/CSDL là số nguyên VND. `subtotal` bằng tổng thành tiền các dòng; giá size/topping lấy từ server. `expectedSubtotal` chỉ dùng phát hiện thay đổi trước lúc tạo đơn.
- Một mã giảm số tiền cố định/đơn, có trạng thái hoạt động, thời gian hiệu lực và điều kiện áp dụng; kiểm tra để `discount >= 0` và `total = subtotal - discount > 0`. Không chồng nhiều mã.
- Snapshot giữ tên sản phẩm, lựa chọn size/topping, số lượng, đơn giá, thành tiền, subtotal, mã/giá trị giảm và total. Retry thanh toán giữ snapshot; `Payment.amount = Order.total`, không nhận amount có hiệu lực từ client.
- Điểm cộng là `floor(Order.total / 10000)` sau lần thanh toán thành công đầu tiên; việc hủy bù lại số điểm **đã lưu**, không tính theo cấu hình mới. Giao dịch gốc và giao dịch bù cùng được giữ.

### 5.2. State machine đơn hàng

Các cạnh sau là đầy đủ theo A1 trang 7–8; mọi cạnh khác bị chặn:

| Từ | Đến | Sự kiện và điều kiện |
|---|---|---|
| `PENDING` | `PAID` | Thanh toán thành công; kho đã giữ. |
| `PENDING` | `PAYMENT_FAILED` | Thanh toán thất bại. |
| `PAYMENT_FAILED` | `PENDING` | Khách thử lại; phải giữ lại đủ kho trước khi xử lý thanh toán. |
| `PAID` | `PREPARING` | Thao tác nội bộ nhận pha chế. |
| `PREPARING` | `READY` | Thao tác nội bộ xác nhận pha xong. |
| `READY` | `COMPLETED` | Thao tác nội bộ xác nhận giao khách. |
| `PENDING` | `CANCELLED` | Hủy đơn chưa trả. |
| `PAYMENT_FAILED` | `CANCELLED` | Hủy đơn sau thanh toán thất bại. |
| `PAID` | `CANCELLED` | Hủy nội bộ có kiểm soát trước pha chế, kèm bù dữ liệu. |

`COMPLETED` và `CANCELLED` là trạng thái kết thúc. Điều kiện kho, cơ chế nội bộ và xử lý bù là chính sách Nhóm; PDF quy định các cạnh trạng thái. Không có trạng thái `PENDING_PAYMENT` hoặc `EXPIRED` trong baseline. Đọc đơn không tự đổi trạng thái theo thời gian.

### 5.3. Vòng đời kho và xử lý bù [Nhóm]

Giữ kho cùng transaction tạo đơn: `RESERVED`. Thanh toán thành công xác nhận lượng đã giữ: `COMMITTED`, không trừ kho lần hai. Thanh toán thất bại hoặc hủy trước thanh toán trả kho: `RELEASED`. Mỗi **lần giữ kho** được hoàn đúng một lần; retry đơn thất bại là lần giữ kho mới sau khi kiểm tra lại. Cách lưu các lần giữ kho phải được làm rõ trong schema/ADR, không dùng một cờ hoàn kho vĩnh viễn khiến retry sau đó không hoàn được.

Hủy một đơn còn `PAID` ghi hoàn thanh toán mô phỏng, trả kho đã commit và tạo LoyaltyTransaction bù đúng một lần trong xử lý nhất quán. Giữ lịch sử Payment/LoyaltyTransaction và trạng thái đơn; không xóa để che lần thanh toán cũ. Cơ chế này chỉ phục vụ demo/test nội bộ có kiểm soát; không cung cấp staff UI công khai hoặc hoàn tiền qua ngân hàng.

### 5.4. Key, đồng thời và quyền sở hữu [Nhóm]

`POST /orders` và `POST /payments` nhận `Idempotency-Key` riêng. Phạm vi uniqueness là `(userId, operation, key)` hoặc ràng buộc tương đương trên từng bảng; payload được so sánh trong cùng phạm vi. Cùng key/cùng payload trả kết quả cũ; cùng key/khác payload trả 409. User không được đọc kết quả của user khác dù trùng chuỗi key.

Timeout không đồng nghĩa thất bại: gửi lại cùng key và order. Thất bại đã xác định rồi chủ động thử lại dùng key payment mới trên cùng order. Ràng buộc theo order và transaction phải bảo vệ một lần thanh toán thành công/một lần cộng điểm cả khi key khác nhau. Khách không được thay đổi `userId`, giá, tổng, trạng thái hoặc kết quả mock bằng dữ liệu không đáng tin cậy.

## 6. Giao diện API tối thiểu

Không dùng prefix `/api/v1` trong hợp đồng chung. Hợp đồng dưới đây và các mã lỗi ở FR-14/16 thống nhất với UC-01. Chi tiết response/schema chưa mô tả được bổ sung ở Task 3; các quyết định mới phải đồng bộ SRS, use-case và ADR trước triển khai.

| Method | Route | Quyền / input chính | Kết quả và nguồn |
|---|---|---|---|
| GET | `/products` | Công khai | Menu; A1 trang 6, 8, A2 trang 6. |
| GET | `/products/:id` | Công khai | Chi tiết/tùy chọn; A1 trang 8, A2 trang 6. |
| POST | `/auth/register` | Email, mật khẩu hợp lệ | Tạo user, lưu bcrypt; A1 trang 7–8. |
| POST | `/auth/login` | Email, mật khẩu | JWT khi hợp lệ; A1 trang 7–8. |
| POST | `/orders` | JWT + key tạo đơn; `items[{productId,sizeCode,toppingIds,quantity}]`, `expectedSubtotal`, `voucherCode?` | Đơn `PENDING`, snapshot/mã đơn/tổng server, giữ kho; A1 trang 7–8, chi tiết input Nhóm. |
| POST | `/payments` | JWT + key thanh toán; `orderId`, `method: WALLET hoặc CARD`; phải sở hữu đơn | Kết quả mock; retry cùng đơn theo FR-11/15; A1 trang 7–8, chi tiết retry Nhóm. |
| GET | `/orders/me` | JWT | Lịch sử của user trong JWT; A1 trang 7–8. |
| GET | `/orders/:id` | JWT và quyền sở hữu | Chi tiết/trạng thái hiện tại; Nhóm bổ sung cho theo dõi. |
| GET | `/health` | Công khai, không lộ secret | Health/readiness; A2 trang 7, mức readiness Nhóm. |

`voucherCode` là tên trường request tham chiếu Promotion; không tạo hệ Voucher và Promotion trùng nhau. Khuyến mãi được áp khi tạo đơn, điểm được ghi sau thanh toán và đọc cùng thông tin đơn phù hợp; không bắt buộc tạo API quản trị promotion/loyalty riêng. Thao tác chuyển trạng thái nội bộ không mặc nhiên trở thành endpoint công khai. Kiểm soát truy cập của cơ chế demo/test phải được mô tả khi thiết kế.

## 7. Sơ đồ, truy vết và nghiệm thu

- Use-case tổng quát: [nguồn use-cases.puml](../diagrams/use-cases.puml).
- Use-case checkout: [đặc tả UC-01](use-case-checkout.md) và [nguồn use-case-checkout.puml](../diagrams/use-case-checkout.puml).

Các sơ đồ trên hiện mới có nguồn; chưa có SVG kết xuất. Xem [trạng thái và hướng dẫn render](../diagrams/README.md); phải render và kiểm tra hình trước nghiệm thu. Sơ đồ activity, sequence, class và deployment ở các task sau phải dùng đúng hợp đồng này. Mã test được quản lý trong ma trận truy vết; test còn kế hoạch không được tính là bằng chứng đã đạt.

Nhóm nghiệm thu theo từng AC, ghi người kiểm tra, ngày, commit, môi trường và bằng chứng thực tế. TV6 phụ trách đối chiếu yêu cầu/test; owner chức năng và người review xác nhận phần mình; người đại diện PO ưu tiên và nghiệm thu nội bộ. Không dùng việc tạo tài liệu để thay code/test/production hoặc tự đánh dấu hoàn tất cổng A2. Lịch sử Git/review vẫn phải được tạo thật khi tích hợp tài liệu.

## 8. Lịch sử hòa giải và mã ngừng dùng

| Thay đổi từ bản nháp Assignment 2 | Quyết định baseline 2.0 và lý do |
|---|---|
| Hai project độc lập; nhóm 3 người | Một sản phẩm kế thừa A1 theo A2 trang 3; 6 người, mục tiêu 14 ngày/dự phòng 6 tuần theo xác nhận người dùng. |
| **FR-09: hết hạn đơn 15 phút** | **Ngừng dùng trong baseline; giữ mã trong lịch sử, không tái sử dụng và không có hàng FR đang hoạt động.** `EXPIRED` và timeout tự động không phải yêu cầu PDF. |
| FR-07/10/13 dùng `PENDING_PAYMENT`, lỗi thành `CANCELLED`, thiếu `READY` | Dùng `PENDING`, `PAYMENT_FAILED` và đầy đủ các cạnh theo A1 trang 7–8. |
| FR-13 tự chuyển sau 10/30 giây, poll 3 giây | Bỏ khỏi baseline; chuyển trạng thái qua thao tác nghiệp vụ/demo nội bộ, không đặt mốc thời gian/polling bắt buộc. |
| FR-15 Should, thất bại tạo đơn mới | Nâng Must: giữ giỏ theo A1 trang 5; retry cùng đơn theo cạnh ở A1 trang 8 và chính sách Nhóm. |
| FR-16 Won’t voucher/loyalty runtime | Bỏ kết luận Won’t cũ; **FR-16 Must khuyến mãi runtime**, bổ sung **FR-17 Must loyalty runtime** để đủ A1 Task 10 trang 7. |
| API `/api/v1/orders` cho lịch sử | Hợp đồng dùng `GET /orders/me` theo A1 trang 8; các API chung không có prefix version. |
| JWT 24 giờ trong draft | Không mang sang baseline như yêu cầu PDF; thời hạn và lưu token chờ quyết định triển khai/ADR. |
| NFR-08/09 Should, chỉ ghi latency | Cả hai là Must: unit/integration/ít nhất một E2E theo A2 trang 7 và API < 500 ms với dữ liệu mẫu theo A1 trang 4. |
| Cold start gắn một nhà cung cấp | NFR-04 trung lập nền tảng; provider/kiến trúc triển khai phải được chọn và kiểm chứng ở Task 3. |

Các FR/NFR giữ nguyên mã khi ý nghĩa cốt lõi còn tương ứng; mọi thay đổi sau baseline phải cập nhật AC, use-case, sơ đồ, truy vết và test liên quan. Bản nháp trong project tham khảo không còn là nguồn hợp đồng hiện hành. Không xóa lịch sử để giả tạo thứ tự task hoặc kết quả nghiệm thu.
