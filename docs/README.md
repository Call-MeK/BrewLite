# Tài liệu chuẩn BrewLite — giữa kỳ và cuối kỳ

**Cập nhật:** 14/10/2026. Người dùng đã đồng ý tiếp tục một repo, giữ đầy đủ yêu cầu cả hai bài. Bộ tài liệu dưới đây là nguồn yêu cầu hiện hành để nhóm review và triển khai; chưa xác nhận chức năng hoặc các task chấm điểm đã hoàn thành.

## Bắt đầu ở đây

Thành viên mới đọc **Tổng quan → Phân công**, rồi đọc yêu cầu liên quan đến phần mình làm. Hướng dẫn cài đặt/chạy nằm trong [README dự án](../README.md).

| Thứ tự | Tài liệu | Đọc để làm gì? |
| --- | --- | --- |
| 1. Tổng quan | [Project chung](project-overview.md) | Nắm mục tiêu, phạm vi hai bài, kiến trúc đề xuất, rubric và lộ trình. |
| 2. Phân công | [Ai làm gì và phối hợp với ai](team-assignments.md) | Biết phần phụ trách, đầu ra, người phối hợp và cách xác nhận hoàn thành. |
| 3. Yêu cầu | [Bối cảnh/phạm vi](requirements/context-and-scope.md), [SRS](requirements/srs.md), [Checkout](requirements/use-case-checkout.md) | Hiểu chức năng, tiêu chí đạt, luồng chính và các ca lỗi. |
| 4. Sơ đồ | [UML](diagrams/README.md) | Xem nguồn sơ đồ, trạng thái render và cách xuất hình. |
| 5. Kiểm thử | [Test cases](requirements/test-cases.md), [Truy vết](traceability-matrix.md) | Biết cần kiểm tra gì và nối yêu cầu với thiết kế/code/test. |

Frontend/backend làm auth đọc thêm [hợp đồng API auth](auth-contract.md) và đối chiếu SRS trước khi triển khai.

## Căn cứ và thứ tự ưu tiên

- [PDF giữa kỳ A1](references/BrewLite-CongNghePhanMem.pdf) và [PDF cuối kỳ A2](references/Assignment2-BrewLite.pdf) là yêu cầu gốc; trang trích dẫn tính cả bìa/mục lục.
- SRS/UC hiện hành cụ thể hóa phần hai PDF chưa quy định; phải phân biệt yêu cầu gốc với quyết định thiết kế nhóm.
- Không sử dụng chi tiết trái PDF trong tài liệu cũ để cắt yêu cầu. Khi phát hiện khác biệt, sửa đồng thời SRS, UC, diagram, test cases và traceability, có lý do trong PR.

## Tài liệu lịch sử

Spec `superpowers/specs/2026-10-09-brewlite-design.md`, bản trùng `file.md` và hai plan ngày 09/10 là bản cũ hoặc ghi chú cá nhân, được giữ trên máy và khai báo trong `.gitignore`; không cần cho bộ tài liệu bàn giao. Không dùng các hợp đồng/scope/timeline cũ thay cho bộ yêu cầu hiện hành. Phân vai trong bản tổng hợp giữ thông tin đã có; tên TV5 chưa thống nhất trong tài liệu cũ nên dùng mã TV5.

Ghi chú cá nhân mới đặt trong `docs/private/` (đã ignore). Chỉ đưa file chưa được Git theo dõi vào đây; với file đã tracked/staged, phải bỏ theo dõi bằng `git rm --cached` để giữ file local và ngừng đưa vào các commit mới. Ignore không xóa nội dung đã có trong lịch sử Git hoặc trên remote, và không phải cơ chế bảo mật.

## Markdown cần chia sẻ

| File/nhóm file | Mục đích |
| --- | --- |
| `README.md`, `frontend/README.md`, `backend/README.md` | Cài đặt, chạy và kiểm tra dự án. |
| `docs/README.md` | Mục lục và quy tắc dùng tài liệu hiện hành. |
| `docs/requirements/*.md` | Phạm vi, SRS, checkout và ca kiểm thử. |
| `docs/diagrams/README.md` | Nguồn UML, trạng thái và hướng dẫn render. |
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

Thay đổi lần này chuẩn hóa tài liệu, bỏ quy tắc Git ignore toàn bộ `docs`, và đưa bản sao hai PDF nguồn vào repo. Bỏ ignore cho phép Git thấy file; không đồng nghĩa file đã được commit hoặc push.
