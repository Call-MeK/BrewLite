# BrewLite — Bối cảnh và phạm vi chung

**Ngày:** 13/10/2026. **Phiên bản:** 2.0, hợp nhất giữa kỳ và cuối kỳ.  
**Trạng thái:** Người dùng đã đồng ý hướng dùng một repo và giữ đủ yêu cầu hai bài; tài liệu cần review nhóm trước khi nghiệm thu Task 1 A2. Chưa xác nhận sản phẩm đã đáp ứng yêu cầu.

## 1. Nguồn và mục tiêu

- **A1:** [BrewLite VER 1.0](../references/BrewLite-CongNghePhanMem.pdf), báo cáo giữa kỳ theo người dùng; 10 task, mỗi task 1 điểm.
- **A2:** [BrewLite — Assignment 2](../references/Assignment2-BrewLite.pdf), báo cáo cuối kỳ; 5 task, mỗi task 2 điểm. Trang vật lý 3 ghi tiếp tục đề tài của A1.
- Cách dẫn trang trong bộ tài liệu này: trang vật lý PDF, gồm bìa và mục lục.

Khách mua đồ uống cần chọn món, tùy chọn và thanh toán không tiền mặt trước khi nhận tại quầy. Cửa hàng cần đơn đúng giá, trạng thái rõ, tồn kho nhất quán và không ghi nhận thanh toán lặp. BrewLite giải quyết luồng này bằng **thanh toán mô phỏng**, phục vụ việc học và nghiệm thu, không xử lý tiền/thẻ thật.

Một repo `BrewLite` chứa code và tài liệu dùng chung; giữ hai checklist và hai mốc bàn giao riêng. Tài liệu được thống nhất theo cả hai PDF. Những lựa chọn cụ thể ngoài PDF được ghi là **quyết định thiết kế của nhóm**, không tự gán thành yêu cầu của giảng viên.

## 2. Stakeholder

| Stakeholder | Mục tiêu/kỳ vọng | Cách kiểm chứng |
| --- | --- | --- |
| Customer — khách hàng | Chọn món, size/topping, giỏ, đăng nhập, thanh toán Ví/Thẻ, xem đơn | E2E menu → xác nhận; thanh toán lỗi giữ giỏ; chỉ truy cập đơn của mình. |
| Counter Staff — nhân viên quầy | Tiếp nhận và cập nhật tiến độ pha chế | Backend có state machine hợp lệ đến `COMPLETED`; demo nội bộ/test có kiểm soát. Dashboard nhân viên không thuộc MVP A1. |
| Store Manager / PO — quản lý và đại diện sản phẩm | Ưu tiên backlog, kiểm soát giá/kho/khuyến mãi, nghiệm thu Increment | Sprint Review, acceptance criteria, test kho và khuyến mãi/loyalty. |
| Lecturer / Acceptance Customer — giảng viên | Đủ rubric, quy trình có minh chứng, chạy được local và production | Đối chiếu A1/A2, Git/PR/CI, clone theo README và truy cập URL. |
| Development Team — nhóm 6 người | Có hợp đồng chung để chia việc và tích hợp | FR/NFR, use-case, sơ đồ, test cases và trách nhiệm owner rõ. |
| Payment Provider — đơn vị thanh toán | Kết quả giao dịch rõ, retry không xử lý trùng | Mock Payment nội bộ, test success/failure/idempotency; không tích hợp gateway tiền thật. |

Nguồn stakeholder: A1 trang 4; A2 trang 3–4. Stakeholder không đồng nghĩa actor runtime: PO/giảng viên/nhà cung cấp không cần tài khoản ứng dụng riêng trong MVP.

## 3. Phạm vi

| Phân loại | Nội dung | Căn cứ |
| --- | --- | --- |
| IN_MVP | Menu, chi tiết, S/M/L, topping, giỏ và tính tổng | A1 trang 4–7; A2 trang 6. |
| IN_MVP | Bcrypt/JWT, đặt đơn, thanh toán Ví/Thẻ mô phỏng, xác nhận/lịch sử/trạng thái | A1 trang 5, 7–8; A2 trang 6–7. |
| IN_MVP | State machine, idempotency, transaction + optimistic locking, khuyến mãi và loyalty | **Cả 4 nghiệp vụ A1 Task 10**, trang 7–8. |
| IN_MVP | SRS/use-case, UML, kiến trúc/ADR, traceability, Scrum và tài liệu versioned | A1 trang 3–4, 8; A2 trang 3–8. |
| IN_MVP | Test, Compose, migration/seed, CI/CD, HTTPS production, health, release/rollback | A2 trang 6–8. |
| DESIGN_CHOICE | Một cửa hàng; tồn kho theo số phần Product; VND số nguyên; dữ liệu seed | Phương án nhỏ nhất được chọn trong thiết kế chung. |
| DESIGN_CHOICE | Giỏ lưu local, snapshot giá, giữ/trả kho đúng một lần, xử lý bù khi hủy đơn đã trả | Chính sách nhóm; chi tiết trong SRS và use-case. |
| FUTURE | Hết hạn đơn sau 15 phút, tự chuyển trạng thái theo thời gian | Tài liệu cũ có nêu nhưng PDF không bắt buộc; không thuộc baseline này. |
| OUT_OF_SCOPE | Thanh toán/ngân hàng thật, nhận dữ liệu thẻ thật, giao hàng, nhiều chi nhánh | Không cần cho hai rubric. |
| OUT_OF_SCOPE | Dashboard quản trị đầy đủ, nguyên liệu theo công thức, đổi điểm, microservices | Không bỏ backend state machine, promotion hoặc loyalty vì giới hạn này. |

Theo dõi đơn dùng API đọc trạng thái; thao tác backend demo có kiểm soát cho các bước pha chế/hủy. Không mở endpoint công khai cho khách tự đánh dấu đã trả tiền hoặc tự đổi trạng thái nhân viên. Mock Payment là thành phần trong hệ thống, không vẽ thành actor bên ngoài toàn bộ BrewLite.

## 4. Giả định và ràng buộc

1. Người dùng xác nhận **6 thành viên**, mục tiêu báo cáo khoảng **2 tuần**, chậm nhất khoảng **6 tuần**; chưa có ngày nộp chính thức riêng cho hai bài. Kế hoạch 14 ngày là mục tiêu, không bảo đảm hoàn thành.
2. Next.js, NestJS và PostgreSQL là stack chung bắt buộc theo A2; Prisma là lựa chọn nhóm. Frontend theo hướng mobile-first/PWA; thanh toán cần kết nối mạng.
3. A2 nghiệm thu Task 1 → 2 → 3 → 4 → 5. Tạo phẩm task trước phải có trên repo với lịch sử thay đổi rõ trước khi nghiệm thu task sau. Hai Sprint triển khai theo A2; ba Sprint trong A1 là gợi ý.
4. Scope Task 10 A1 vẫn đầy đủ ở mốc giữa kỳ; không dời khuyến mãi/loyalty sang ngoài phạm vi để rút lịch.
5. Hai bản PDF nguồn được lưu trong repo để người clone đối chiếu. Source, sơ đồ và báo cáo cần commit/PR thực; không ghi lùi ngày hoặc tự tạo peer approval.
6. Menu/khuyến mãi có seed để demo; không cần editor quản trị. Test dùng database riêng, không reset dữ liệu production.
7. Nền tảng production chưa được chọn hoặc kiểm tra quyền sử dụng. Phải xác minh ở Task 3, rồi cập nhật deployment diagram đúng cấu hình thật.

## 5. Rủi ro và trách nhiệm

| Rủi ro | Hậu quả | Cách xử lý / owner |
| --- | --- | --- |
| Dùng tài liệu cũ lẫn bản chung | Sai trạng thái, bỏ Task 10 hoặc sai API | Chỉ dùng bộ yêu cầu hiện hành trong [mục lục](../README.md); TV1/TV6 kiểm tra thay đổi. |
| Thời gian ngắn, code hiện mới scaffold | Không kịp demo đầy đủ | Tích hợp hằng ngày, bỏ tính năng mở rộng, báo cáo đúng phần chưa đạt; TV1 và các owner. |
| Race ở stock/payment/cancel | Oversell, ghi nhận hai lần, bù kho/điểm sai | Transaction, optimistic locking, unique constraints và integration test thực; TV2/TV3. |
| URL tắt, cold start, CI/deploy thất bại | Mất phần triển khai hoặc không đạt hiệu năng | Kiểm tra hosting sớm, smoke/health và rollback; giữ mục tiêu API < 500 ms với dữ liệu mẫu; TV1. |
| Thiếu artifact hoặc tài liệu chỉ ở local | Không được nghiệm thu/truy vết A2 | Theo dõi checklist, Git/PR từng task, không đánh dấu đạt khi chưa có minh chứng; TV6/TV1. |
| Secret/log nhạy cảm | Lộ tài khoản hoặc database | Env mẫu không có secret, secrets CI, log đã lọc, DB production không public trực tiếp; các dev/TV1. |

## 6. Tiêu chí thành công và trạng thái

Một người ngoài nhóm clone được repo, chạy theo README, hoàn thành luồng menu → thanh toán → xác nhận; các ca lỗi/retry/concurrency có kết quả kiểm thử. Giữa kỳ có bằng chứng cho đủ 10 task A1 và Scrum. Cuối kỳ có đủ 5 task A2, UML/ADR/truy vết, test/CI/CD, release và production hoạt động lúc chấm.

Tài liệu liên quan: [SRS](srs.md), [UC-01 checkout](use-case-checkout.md), [ca kiểm thử dự kiến](test-cases.md), [ma trận truy vết](../traceability-matrix.md). Kết quả chạy, review nhóm, PR và các cổng nghiệm thu **chưa được xác nhận** bởi việc soạn bộ tài liệu này.
