# BrewLite — UML và ERD

**Owner:** Đức Phúc (TV6)  
**Baseline:** 10 bảng, REST contract v1 và state machine trong architectural design specification.

Các sơ đồ dưới đây dùng Mermaid để có thể review trực tiếp trên GitHub và cập nhật cùng source code.

## 1. Use case diagram

```mermaid
flowchart LR
    Guest[Khách vãng lai]
    Customer[Khách hàng]
    Gateway[Mock Payment Gateway]
    Cron[Expiration Scheduler]

    UC1((Xem Menu))
    UC2((Xem chi tiết sản phẩm))
    UC3((Đăng ký / Đăng nhập))
    UC4((Quản lý Cart))
    UC5((Tạo Order))
    UC6((Áp dụng Voucher))
    UC7((Thanh toán / Thử lại))
    UC8((Xem lịch sử / chi tiết Order))
    UC9((Hủy Order))
    UC10((Hủy Order hết hạn))
    UC11((Ghi Loyalty Points))

    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Customer --> UC1
    Customer --> UC2
    Customer --> UC4
    Customer --> UC5
    Customer --> UC7
    Customer --> UC8
    Customer --> UC9
    UC5 -. include .-> UC6
    Gateway --> UC7
    UC7 -. include khi thành công .-> UC11
    Cron --> UC10
```

## 2. ERD — đúng 10 bảng

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ LOYALTY_TRANSACTION : earns
    VOUCHER o|--o{ ORDER : applied_to
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : referenced_by
    SIZE_OPTION ||--o{ ORDER_ITEM : selected_as
    ORDER_ITEM ||--o{ ORDER_ITEM_TOPPING : has
    TOPPING ||--o{ ORDER_ITEM_TOPPING : selected
    ORDER ||--o{ PAYMENT : attempts
    ORDER ||--o| LOYALTY_TRANSACTION : awards

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

    VOUCHER {
        uuid id PK
        string code UK
        int amount
        int minOrderValue
        datetime validFrom
        datetime expiresAt
        datetime createdAt
        datetime updatedAt
    }

    ORDER {
        uuid id PK
        uuid userId FK
        uuid voucherId FK "nullable"
        string status
        string inventoryStatus
        int subtotal
        int discount
        int finalTotal
        string voucherCodeSnapshot "nullable"
        uuid creationIdempotencyKey
        string requestHash
        datetime expiresAt
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
        uuid idempotencyKey UK
        string requestHash
        int amount
        string method
        string status
        datetime createdAt
    }

    LOYALTY_TRANSACTION {
        uuid id PK
        uuid userId FK
        uuid orderId FK,UK
        int points
        datetime createdAt
    }
```

### Ràng buộc dữ liệu bắt buộc

- Unique: `User.email`, `Voucher.code`, `(Order.userId, Order.creationIdempotencyKey)`, `Payment.idempotencyKey`, `LoyaltyTransaction.orderId`.
- Check: stock/points không âm; quantity và amount hợp lệ; `finalTotal = subtotal - discount > 0`.
- Partial unique index: tối đa một Payment `PROCESSING` và một Payment `SUCCEEDED` cho mỗi Order.
- Không cascade-delete dữ liệu lịch sử. `isAvailable` chỉ là giá trị tính từ `Product.stock > 0`.

## 3. Class/module diagram

```mermaid
classDiagram
    class AuthModule
    class ProductsModule
    class OrdersModule
    class PaymentsModule
    class VouchersModule
    class LoyaltyModule
    class PrismaService
    class PricingService
    class OrderStateMachine
    class InventoryService
    class OrderExpirationService
    class MockPaymentGateway {
      <<interface>>
      +charge(orderId, amount, method) PaymentResult
    }

    AuthModule --> PrismaService
    ProductsModule --> PrismaService
    OrdersModule --> PrismaService
    OrdersModule --> PricingService
    OrdersModule --> InventoryService
    OrdersModule --> VouchersModule
    OrdersModule --> OrderStateMachine
    PaymentsModule --> PrismaService
    PaymentsModule --> MockPaymentGateway
    PaymentsModule --> InventoryService
    PaymentsModule --> LoyaltyModule
    PaymentsModule --> OrderStateMachine
    OrderExpirationService --> InventoryService
    OrderExpirationService --> OrderStateMachine
```

## 4. Sequence — tạo Order

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant UI as Checkout UI
    participant O as OrdersController/Service
    participant P as Pricing/Voucher
    participant DB as PostgreSQL

    C->>UI: Xác nhận cart và subtotal hiển thị
    UI->>O: POST /orders + JWT + Idempotency-Key
    O->>DB: Tìm (userId, key)
    alt Đã có cùng key
        DB-->>O: Order + requestHash
        alt Cùng canonical payload
            O-->>UI: 200 Order cũ (không reserve lại)
        else Payload khác
            O-->>UI: 409 IDEMPOTENCY_CONFLICT
        end
    else Key mới
        O->>P: Tính giá server và validate voucher
        alt expectedSubtotal khác
            O-->>UI: 409 PRICE_CHANGED + currentSubtotal
        else Giá hợp lệ
            O->>DB: Transaction: CAS stock/version, tạo Order + snapshots
            alt Không đủ stock/xung đột sau retry
                DB-->>O: Rollback
                O-->>UI: 409 OUT_OF_STOCK
            else Commit
                DB-->>O: PENDING + RESERVED
                O-->>UI: 201 Order, totals, expiresAt
            end
        end
    end
```

## 5. Sequence — payment fail/retry/success

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant UI as Payment UI
    participant PS as PaymentService
    participant GW as MockPaymentGateway
    participant DB as PostgreSQL

    C->>UI: Chọn WALLET hoặc CARD
    UI->>PS: POST /payments + JWT + unique key
    PS->>DB: Kiểm tra owner rồi tìm payment key
    alt Replay cùng key/payload
        DB-->>PS: Payment terminal đã lưu
        PS-->>UI: 200 kết quả cũ
    else Attempt mới hợp lệ
        PS->>GW: charge(orderId, amount, method)
        GW-->>PS: SUCCESS hoặc FAIL quyết định
        PS->>DB: Transaction + kiểm tra expiry/version/state
        alt Retry từ PAYMENT_FAILED
            DB->>DB: Re-reserve stock nếu còn
        end
        alt SUCCESS trước expiresAt
            DB->>DB: Payment SUCCEEDED; Order PAID/COMMITTED
            DB->>DB: LoyaltyTransaction unique + cộng điểm
            DB-->>PS: Commit
            PS-->>UI: 200 success; xóa Cart
        else FAIL
            DB->>DB: Payment FAILED; Order PAYMENT_FAILED/RELEASED
            DB->>DB: Hoàn stock đúng một lần
            DB-->>PS: Commit
            PS-->>UI: 200 business failure; cho phép retry
        else Hết hạn/xung đột
            DB-->>PS: Rollback
            PS-->>UI: 409 error code phù hợp
        end
    end
```

## 6. Order state machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: Create Order / RESERVED
    PENDING --> PAID: Payment success / COMMITTED
    PENDING --> PAYMENT_FAILED: Payment fail / RELEASED
    PENDING --> CANCELLED: User cancel hoặc expire / RELEASED
    PAYMENT_FAILED --> PENDING: Retry + re-reserve / RESERVED
    PAYMENT_FAILED --> CANCELLED: User cancel hoặc expire / RELEASED
    PAID --> PREPARING: Internal service
    PREPARING --> READY: Internal service
    READY --> COMPLETED: Internal service
    CANCELLED --> [*]
    COMPLETED --> [*]
```

### Invariant của state machine

- `CANCELLED` và `COMPLETED` là terminal; không có public endpoint đổi trạng thái hậu thanh toán.
- Stock chỉ được hoàn khi `inventoryStatus = RESERVED`; không hoàn lần hai.
- Order ở hoặc sau `PAID` không bị scheduler hủy.
- Payment tại hoặc sau `expiresAt` bị từ chối dù scheduler chưa kịp cập nhật Order.

## 7. Điểm review chéo

- Tấn Nin: xác nhận schema, Order/Inventory transaction và FSM.
- Quốc Anh: xác nhận Auth, Payment/Voucher/Loyalty contract và sequence payment.
- Anh Khoa: review phạm vi, conventions và quyết định tích hợp.
