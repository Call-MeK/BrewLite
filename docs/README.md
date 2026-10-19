# Tài liệu chuẩn BrewLite — giữa kỳ và cuối kỳ

**Cập nhật:** 15/10/2026. Người dùng đã đồng ý tiếp tục một repo, giữ đầy đủ yêu cầu cả hai bài. Bộ tài liệu dưới đây là nguồn yêu cầu hiện hành để nhóm review và triển khai; chưa xác nhận chức năng hoặc các task chấm điểm đã hoàn thành.

## Bắt đầu ở đây

Thành viên mới đọc **Tổng quan → Phân công**, rồi đọc yêu cầu liên quan đến phần mình làm. Hướng dẫn cài đặt/chạy nằm trong [README dự án](../README.md).

| Thứ tự | Tài liệu | Đọc để làm gì? |
| --- | --- | --- |
| 1. Tổng quan | [Project chung](project-overview.md) | Nắm mục tiêu, phạm vi hai bài, kiến trúc đề xuất, rubric và lộ trình. |
| 2. Phân công | [Ai làm gì và phối hợp với ai](team-assignments.md) | Biết phần phụ trách, đầu ra, người phối hợp và cách xác nhận hoàn thành. |
| 3. Yêu cầu | [Đọc nhanh](requirements/week-1-requirements.md), [Bối cảnh/phạm vi](requirements/context-and-scope.md), [SRS](requirements/srs.md), [Checkout](requirements/use-case-checkout.md) | Bắt đầu bằng bản tóm tắt; dùng SRS/UC để nghiệm thu. |
| 4. Sơ đồ | [UML](diagrams/README.md) | Xem nguồn sơ đồ, trạng thái render và cách xuất hình. |
| 5. Kiểm thử | [Test cases](requirements/test-cases.md), [Smoke Week 1](qa/week-1-smoke-checklist.md), [Truy vết](traceability-matrix.md) | Phân biệt kế hoạch test, kết quả lịch sử và liên kết tới yêu cầu. |

Frontend/backend làm auth đọc thêm [hợp đồng API auth](auth-contract.md) và đối chiếu SRS trước khi triển khai.
Quy ước chung về tên endpoint, tên hàm và trường dữ liệu nằm trong [API.md](../API.md).

Thiết kế kỹ thuật: [kiến trúc và ADR](architecture/README.md). Chuẩn bị chạy/deploy/bàn giao: [deployment.md](deployment.md). Các file này mô tả phương án và điều kiện cần hoàn tất, không khẳng định đã triển khai.

## Tài liệu nhóm đã hợp nhất ngày 15/10/2026

- Bản yêu cầu của Đức Phúc được chuyển thành [bản đọc nhanh](requirements/week-1-requirements.md), dùng mã SRS hiện hành; có bảng ánh xạ mã cũ.
- ERD/module được giữ và chỉnh tại [thiết kế bổ trợ](diagrams/brewlite-uml.md). Hai sequence gốc được hợp nhất thành nguồn sequence chung; bổ sung activity, class nghiệp vụ và deployment dự kiến. Tất cả còn chờ render/review; deployment chưa xác nhận hosting thực tế.
- [Smoke report](qa/week-1-smoke-checklist.md) giữ kết quả ngày 10/10/2026 tại commit fff2606, không phải kết quả chạy lại hoặc nghiệm thu phiên bản hiện tại.
- Yêu cầu và báo cáo kiểm thử được giữ trong `requirements/` và `qa/`; UML hiện hành tập trung tại `diagrams/`, bản `uml/` cũ đã được dọn. Nội dung mới giữ ghi nhận tác giả bản gốc, không đồng nghĩa tác giả đã duyệt các chỉnh sửa hợp nhất.

## Căn cứ và thứ tự ưu tiên

- [PDF giữa kỳ A1](references/BrewLite-CongNghePhanMem.pdf) và [PDF cuối kỳ A2](references/Assignment2-BrewLite.pdf) là yêu cầu gốc; trang trích dẫn tính cả bìa/mục lục.
- SRS/UC hiện hành cụ thể hóa phần hai PDF chưa quy định; phải phân biệt yêu cầu gốc với quyết định thiết kế nhóm.
- Không sử dụng chi tiết trái PDF trong tài liệu cũ để cắt yêu cầu. Khi phát hiện khác biệt, sửa đồng thời SRS, UC, diagram, test cases và traceability, có lý do trong PR.

## Tài liệu lịch sử

Các bản spec/plan ngày 09/10, ghi chú triển khai AI và UML cũ đã được dọn khỏi bộ tài liệu. Dùng [SRS](requirements/srs.md), [phân công nhóm](team-assignments.md) và [nguồn UML hiện hành](diagrams/README.md). Ghi chú AI tạo về sau trong `docs/superpowers/` được Git ignore. Phân vai trong bản tổng hợp giữ thông tin đã có; tên TV5 chưa thống nhất trong tài liệu cũ nên dùng mã TV5.

Ghi chú cá nhân mới đặt trong `docs/private/` (đã ignore). Chỉ đưa file chưa được Git theo dõi vào đây; với file đã tracked/staged, phải bỏ theo dõi bằng `git rm --cached` để giữ file local và ngừng đưa vào các commit mới. Ignore không xóa nội dung đã có trong lịch sử Git hoặc trên remote, và không phải cơ chế bảo mật.

## Markdown cần chia sẻ

| File/nhóm file | Mục đích |
| --- | --- |
| `README.md`, `frontend/README.md`, `backend/README.md` | Cài đặt, chạy và kiểm tra dự án. |
| `docs/README.md` | Mục lục và quy tắc dùng tài liệu hiện hành. |
| `docs/requirements/*.md` | Phạm vi, SRS, checkout và ca kiểm thử. |
| `docs/diagrams/README.md` | Nguồn UML, trạng thái và hướng dẫn render. |
| `docs/diagrams/brewlite-uml.md` | ERD/module đề xuất kế thừa từ tài liệu nhóm; không thay class nghiệp vụ. |
| `docs/architecture/README.md`, `docs/architecture/adr/*.md` | Kiến trúc, quyết định/đánh đổi và phần chưa chốt. |
| `docs/deployment.md` | Chuẩn bị môi trường, CI/CD, migration, rollback và bàn giao; chưa có lệnh deploy đã kiểm chứng. |
| `docs/qa/*.md` | Báo cáo kết quả chạy test theo ngày/commit, tách khỏi kế hoạch test. |
| `docs/traceability-matrix.md` | Đối chiếu yêu cầu với thiết kế, code và test. |
| `docs/project-overview.md` | Thiết kế chung, rubric A1/A2 và lộ trình. |
| `docs/team-assignments.md` | Phân công nhóm, phối hợp và tiêu chí bàn giao. |
| `docs/auth-contract.md` | Hợp đồng API để frontend/backend phối hợp; cần đối chiếu SRS trước khi triển khai, nhất là thời hạn JWT chưa chốt trong baseline. |
| `frontend/AGENTS.md`, `frontend/CLAUDE.md` | Hướng dẫn công cụ AI của dự án, không phải ghi chú cá nhân hay tài liệu nộp bài. |

Repo riêng `brewlite-assignment2` là nguồn nháp trước khi hợp nhất, không phải bộ yêu cầu song song. Không dùng các quy tắc cũ “độc lập A1”, “3 người”, bỏ voucher/loyalty, lỗi payment thành CANCELLED, thiếu READY, hoặc bỏ mục tiêu API < 500 ms cho project chung.

## Hiện trạng và cổng nghiệm thu

- Code vẫn ở `frontend/` và `backend/`, mới có scaffold. Chuẩn hóa sang `apps/web`/`apps/api` thuộc bước triển khai riêng, cần cập nhật mọi đường dẫn/CI/Docker/README liên quan.
- Bộ này tạo nền Task 1 A2 và truy vết dự kiến. Review nhóm, commit/PR, hình UML xuất từ nguồn và việc nghiệm thu phải có bằng chứng thật; trạng thái render cụ thể nằm trong mục UML.
- Activity/sequence/class, kiến trúc/ADR/deployment, chức năng sản phẩm, test tự động nghiệp vụ, CI/CD và production vẫn cần hoàn tất theo thứ tự **Task 1 → 2 → 3 → 4 → 5**.
- Giữa kỳ vẫn phải đủ 10 task A1, đặc biệt cả bốn nghiệp vụ Task 10. Cuối kỳ cần hai Sprint triển khai và production hoạt động khi chấm, không chỉ bản demo local.

## Đối chiếu lại đề gốc ngày 15/10/2026

Đã đọc cả hai PDF gốc: phạm vi hiện hành giữ đủ 10 task A1 và 5 task A2. Số bảng 10/12, hạn đơn 15 phút và JWT một giờ không phải yêu cầu bắt buộc của đề. SRS 2.1 làm rõ class-validator cho API đặt đơn; auth-contract ghi 3600 là ví dụ, không tự chốt token.

| Cổng A2 | Tạo phẩm đã soạn | Còn thiếu trước nghiệm thu |
| --- | --- | --- |
| Task 1 — Yêu cầu | Context, SRS/MoSCoW/AC, use case và nguồn diagram. | Hình kết xuất, review nhóm, commit/PR và minh chứng thực tế. |
| Task 2 — Mô hình | Nguồn activity/sequence/class và FSM. | Kiểm tra cú pháp, render/kiểm tra hình, review tính nhất quán. |
| Task 3 — Kiến trúc | Kiến trúc phân lớp, ba ADR và deployment dự kiến. | Chốt token/hosting, hoàn thiện ADR và sơ đồ theo môi trường thật, render/review/truy vết tới code. |
| Task 4 — Sprint 1 | Có scaffold và kế hoạch. | apps/web + apps/api, menu/API/seed/test, board/Scrum, CI chặn merge và minh chứng xanh/đỏ. |
| Task 5 — Sprint 2/Delivery | Có đặc tả, ca kiểm thử và hướng dẫn chuẩn bị bàn giao. | Chức năng, test nghiệp vụ/E2E, Compose/migration, CD, production HTTPS, health/rollback/release và demo thật. |

Không đánh dấu đạt các cổng từ việc tạo tài liệu. Giữ thứ tự Task 1 → 2 → 3 → 4 → 5 khi nghiệm thu; smoke report 10/10 chỉ phản ánh commit lịch sử.

Thay đổi lần này chuẩn hóa tài liệu, bỏ quy tắc Git ignore toàn bộ `docs`, và đưa bản sao hai PDF nguồn vào repo. Bỏ ignore cho phép Git thấy file; không đồng nghĩa file đã được commit hoặc push.
