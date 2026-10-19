# BrewLite — ERD và sơ đồ module đề xuất

**Tác giả bản gốc:** Đức Phúc (TV6). **Hợp nhất:** 15/10/2026.
**Nguồn chuẩn:** [SRS](../requirements/srs.md), [UC-01](../requirements/use-case-checkout.md).
**Trạng thái:** Bản nháp hòa giải; chưa render bằng công cụ hoặc được nhóm review. ERD/module không thay class nghiệp vụ.

Mermaid giữ thiết kế hữu ích của bản gốc. Dùng chung [use case](use-cases.puml) và [state machine](order-states.puml), không sao chép thành hai bản.

## 1. ERD đề xuất

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ LOYALTY_TRANSACTION : earns
    PROMOTION o|--o{ ORDER : applied_to
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : referenced_by
    SIZE_OPTION ||--o{ ORDER_ITEM : selected_as
    ORDER_ITEM ||--o{ ORDER_ITEM_TOPPING : has
    TOPPING ||--o{ ORDER_ITEM_TOPPING : selected
    ORDER ||--o{ PAYMENT : attempts
    USER ||--o{ PAYMENT : requests
    PRODUCT ||--o{ PRODUCT_SIZE : supports
    SIZE_OPTION ||--o{ PRODUCT_SIZE : offers
    PRODUCT ||--o{ PRODUCT_TOPPING : supports
    TOPPING ||--o{ PRODUCT_TOPPING : offers
    ORDER ||--o{ LOYALTY_TRANSACTION : records

    USER {
        uuid id PK
        string email UK
        string passwordHash
        int loyaltyPoints
        datetime createdAt
        datetime updatedAt
    }

    PRODUCT {
        uuid id PK
        string name
        string imageUrl
        int basePrice
        int stock
        int version
        datetime createdAt
        datetime updatedAt
    }

    SIZE_OPTION {
        string code PK "S, M, L"
        int priceDelta
    }

    TOPPING {
        uuid id PK
        string name
        int price
        datetime createdAt
        datetime updatedAt
    }

    PRODUCT_SIZE {
        uuid productId PK,FK
        string sizeCode PK,FK
    }

    PRODUCT_TOPPING {
        uuid productId PK,FK
        uuid toppingId PK,FK
    }

    PROMOTION {
        uuid id PK
        string code UK
        int amount
        boolean isActive
        int minOrderValue
        datetime validFrom
        datetime expiresAt
        datetime createdAt
        datetime updatedAt
    }

    ORDER {
        uuid id PK
        uuid userId FK
        uuid promotionId FK "nullable"
        string status
        string inventoryStatus
        int subtotal
        int discount
        int total
        string voucherCodeSnapshot "nullable"
        uuid creationIdempotencyKey
        string requestHash
        int version
        datetime createdAt
        datetime updatedAt
    }

    ORDER_ITEM {
        uuid id PK
        uuid orderId FK
        uuid productId FK
        string sizeCode FK
        int quantity
        string productNameSnapshot
        int sizePriceSnapshot
        int unitPrice
        int lineTotal
    }

    ORDER_ITEM_TOPPING {
        uuid orderItemId PK,FK
        uuid toppingId PK,FK
        string nameSnapshot
        int priceSnapshot
    }

    PAYMENT {
        uuid id PK
        uuid orderId FK
        uuid userId FK
        uuid idempotencyKey
        string requestHash
        int amount
        string method
        string status
        datetime createdAt
    }

    LOYALTY_TRANSACTION {
        uuid id PK
        uuid userId FK
        uuid orderId FK
        string kind "EARN or REVERSAL"
        int points "signed delta"
        datetime createdAt
    }
```

### Ràng buộc đề xuất

- Bản 10 bảng được mở rộng thành 12 để biểu diễn size/topping hợp lệ theo sản phẩm. Đây là đề xuất, chưa có schema/migration được kiểm chứng. Voucher chuẩn hóa thành Promotion; request vẫn dùng voucherCode theo SRS.
- Unique: User.email, Promotion.code, (Order.userId, creationIdempotencyKey), (Payment.userId, idempotencyKey), (LoyaltyTransaction.orderId, kind). Hai bảng order/payment tách phạm vi phép toán.
- LoyaltyTransaction.kind là EARN hoặc REVERSAL; mỗi loại tối đa một lần/đơn. EARN không âm, REVERSAL là số đối của EARN đã lưu. Giữ cả hai kể cả điểm bằng 0; User.loyaltyPoints không âm, bút toán bù được âm.
- Check stock >= 0, quantity > 0, Payment.amount > 0, discount >= 0 và total = subtotal - discount > 0. Backend kiểm tra size/topping thuộc sản phẩm và Payment.amount = Order.total.
- Partial unique: tối đa một Payment PROCESSING và một SUCCEEDED/đơn. Khóa/cập nhật Order.version tuần tự hóa payment/hủy/retry; tìm key trước ghi không tự bảo đảm chống trùng đồng thời.
- Payment.status đề xuất PROCESSING/SUCCEEDED/FAILED/REFUNDED. Hủy PAID giữ Payment, chuyển REFUNDED cho hoàn mock, không gọi cổng hoàn tiền thật; Order đã CANCELLED không được thanh toán lại.
- Reserve từ RELEASED sang RESERVED cùng tăng version sau kiểm tra stock/version. Release chỉ từ RESERVED; retry tạo chu kỳ giữ kho mới. Hủy PAID cho phép COMMITTED → RELEASED cùng hoàn mock/bù điểm. Trạng thái/version của Order chặn hủy/release lặp.
- Không cascade-delete lịch sử. isAvailable tính từ stock > 0. Không có expiry của Order; Promotion.expiresAt là hạn mã giảm và vẫn giữ.

## 2. Sơ đồ module bổ trợ

```mermaid
classDiagram
    class AuthModule
    class ProductsModule
    class OrdersModule
    class PaymentsModule
    class PromotionsModule
    class LoyaltyModule
    class PrismaService
    class PricingService
    class OrderStateMachine
    class InventoryService
    class MockPaymentGateway {
      <<interface>>
      +charge(orderId, amount, method) PaymentResult
    }

    AuthModule --> PrismaService
    ProductsModule --> PrismaService
    OrdersModule --> PrismaService
    OrdersModule --> PricingService
    OrdersModule --> InventoryService
    OrdersModule --> PromotionsModule
    OrdersModule --> OrderStateMachine
    PaymentsModule --> PrismaService
    PaymentsModule --> MockPaymentGateway
    PaymentsModule --> InventoryService
    PaymentsModule --> LoyaltyModule
    PaymentsModule --> OrderStateMachine
```


## 3. Nguồn UML dùng chung

- [Activity](activity-checkout.puml): chưa login, hết hàng, payment fail/retry.
- [Sequence checkout](sequence-checkout.puml): hợp nhất hai sequence gốc, giữ kho trước gọi mock, JWT/validate và chống xử lý trùng; không có expiry.
- [Class nghiệp vụ](domain-classes.puml): bảy lớp, enum và quan hệ, bổ sung cho module diagram.
- [Deployment dự kiến](deployment.puml): local/CI/production, chưa chọn nhà cung cấp hoặc xác minh triển khai.

## 4. Review trước triển khai

Tấn Nin review schema/kho/FSM; Quốc Anh review Auth/Payment/Promotion/Loyalty và hoàn mock; Anh Khoa review môi trường/ADR/tích hợp; Đức Phúc cùng frontend đối chiếu truy vết, retry/lỗi và hình render với UI. Chưa có xác nhận review hoặc nghiệm thu. Xem [trạng thái hình xuất](README.md).
