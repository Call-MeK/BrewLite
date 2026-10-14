# UML — baseline chung BrewLite

Nguồn chuẩn: [SRS](../requirements/srs.md), [UC-01](../requirements/use-case-checkout.md) và [thiết kế chung, mục 5](../project-overview.md). Đây là tài liệu thiết kế; chưa phải bằng chứng chức năng đã chạy.

| Nguồn PlantUML | Nội dung | Bản xuất |
|---|---|---|
| [use-cases.puml](use-cases.puml) | Customer; thao tác nhân viên nội bộ; checkout, khuyến mãi và loyalty runtime | Chưa render SVG |
| [use-case-checkout.puml](use-case-checkout.puml) | UC-01; JWT/giá/kho, tạo đơn, mock payment, retry và điểm | Chưa render SVG |
| [order-states.puml](order-states.puml) | Toàn bộ cạnh FSM từ A1; gồm `PAID → CANCELLED` và chính sách bù dữ liệu | Chưa render SVG |
| [activity-checkout.puml](activity-checkout.puml) | Checkout, login, hết hàng, payment fail/retry | Bản nháp 15/10, chưa render/review |
| [sequence-checkout.puml](sequence-checkout.puml) | Hợp nhất sequence tạo đơn/payment của Đức Phúc; JWT, key, kho trước mock và lịch sử | Bản nháp 15/10, chưa render/review |
| [domain-classes.puml](domain-classes.puml) | Bảy lớp nghiệp vụ, quan hệ/multiplicity và enum; EARN/REVERSAL | Bản nháp 15/10, chưa render/review |
| [deployment.puml](deployment.puml) | Local/CI/production dự kiến, chưa chọn provider/ADR triển khai thực tế | Bản nháp 15/10, chưa render/review |

[ERD và sơ đồ module Mermaid](brewlite-uml.md) kế thừa tài liệu Đức Phúc, đã hòa giải nội dung với SRS. Đây là thiết kế bổ trợ chưa kiểm chứng bằng công cụ; không thay UML class hoặc hình xuất bắt buộc. Use case và FSM dùng duy nhất các nguồn chung ở bảng trên.

Ngày 13/10/2026: đã kiểm tra các vị trí công cụ cục bộ truy cập được; có Java nhưng chưa tìm thấy PlantUML JAR hoặc Graphviz `dot`. Chưa chạy kiểm tra cú pháp bằng PlantUML và chưa kiểm tra hình xuất. Không dùng bản SVG overview Graphviz của repo cũ làm bản render UML. Các tệp SVG chỉ được đưa vào đây sau khi render thật từ nguồn tương ứng.

Đã thử tải JAR từ bản phát hành được liên kết trên [trang tải PlantUML chính thức](https://plantuml.com/download), nhưng lệnh tải trong môi trường hiện tại không kết nối được máy chủ. Chưa cài thêm công cụ hoặc tạo hình kết xuất.

Ngày 15/10/2026: kiểm tra lại Java có sẵn, chưa tìm được PlantUML/Graphviz; thử tải PlantUML JAR từ GitHub release vẫn lỗi kết nối. Các kiểm tra cấu trúc nguồn và liên kết không thay thế kiểm tra cú pháp/render. Vẫn chưa có SVG/PDF mới hoặc xác nhận hình đúng.

## Render khi có PlantUML cục bộ

Chạy PowerShell tại thư mục `BrewLite`, thay đường dẫn JAR bằng công cụ đã có trên máy. Nếu bản PlantUML yêu cầu Graphviz, bảo đảm `dot` dùng được hoặc cấu hình theo bản cài đó.

```powershell
$plantumlJar = 'C:/tools/plantuml/plantuml.jar'
java -Dfile.encoding=UTF-8 -jar $plantumlJar -charset UTF-8 -checkonly 'docs/diagrams/*.puml'
java -Dfile.encoding=UTF-8 -jar $plantumlJar -charset UTF-8 -tsvg 'docs/diagrams/*.puml'
```

Sau khi cả hai lệnh thành công, mở từng SVG cạnh nguồn để kiểm tra tiếng Việt, nhãn, hướng mũi tên và ghi chú; cập nhật cột bản xuất thành liên kết thật. Lưu phiên bản PlantUML và kết quả kiểm tra thực tế trong ghi chú review. Có thể xuất thêm PDF khi chuẩn bị báo cáo; SVG là bản xuất dự kiến trong repo.

## Quy ước cần giữ khi cập nhật

- Mock Payment là thành phần nội bộ, không phải external actor. Manager chỉ là stakeholder; Staff tương tác qua thao tác nội bộ có kiểm soát, không có dashboard public.
- Đăng nhập là luồng thay thế khi thiếu JWT; không dùng `<<include>>` có điều kiện cho Login. Các quan hệ `<<extend>>` có ghi điều kiện: mã giảm khi được nhập, cộng điểm bắt buộc khi thanh toán thành công.
- Retry do timeout dùng cùng key; cố ý thử lại sau `PAYMENT_FAILED` dùng key mới trên cùng đơn và phải giữ lại đủ kho trước khi về `PENDING`.
- Giữ FR-01–FR-17 theo SRS: FR-09 đã loại bỏ; FR-16 là khuyến mãi, FR-17 là loyalty. Hai chức năng này thuộc runtime bắt buộc của A1 Task 10.
- Đã có nguồn use-case/state cùng bản nháp activity/sequence/class/deployment; chưa kiểm tra cú pháp/render bằng PlantUML, chưa review nhóm. Kiến trúc/ADR và hosting vẫn cần chốt; không coi việc có nguồn là nghiệm thu Task 2–3.
