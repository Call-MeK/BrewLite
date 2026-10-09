# BrewLite — Architectural Design Specification

**Ngày:** 2026-10-09  
**Phiên bản:** 1.0 — Design selected / awaiting written-spec review  
**Dự án:** BrewLite — Web đặt cà phê không dùng tiền mặt, môn Công nghệ Phần mềm  
**Nguồn:** BrewLite VER 1.0 (PDF bài tập); các quyết định BR-01..BR-21, AC-01..AC-05.1, TD-01..TD-03 trong brainstorming.  
**Nguyên tắc phê duyệt:** Những mục có mã BR/AC/TD kể trên đã được người dùng chốt riêng. Các lựa chọn TD-04..TD-15 và chi tiết hoàn thiện API được người dùng ủy quyền cho trợ lý lựa chọn ngày 09/10/2026. **Tài liệu này cần được người dùng rà soát trước khi lập implementation plan hoặc viết product code**, theo quy trình Superpowers.

## 1. Mục tiêu, phạm vi, tiêu chí thành công

Ứng dụng web cho phép xem Menu, chọn size S/M/L và topping, quản lý Cart, đăng nhập, đặt Order, thanh toán giả lập qua Ví/Thẻ, xem xác nhận và lịch sử đơn. Hệ thống phải bảo đảm State Machine, payment/order idempotency, optimistic locking chống overselling, Voucher và Loyalty once-only.

**Ràng buộc:** Nhóm 6 thành viên, 4 Sprint x 1 tuần, khoảng 10–15 giờ/người/tuần. Next.js App Router + TypeScript + Tailwind trên frontend; NestJS modular monolith + TypeScript REST + class-validator + Passport JWT trên backend; PostgreSQL + Prisma; Docker Compose; GitHub và tài liệu Figma/UML.

**Theo 10 task PDF:** project scaffold, GET /products, Menu UI, Product Detail, Cart, POST /orders, Auth JWT, Mock Payments, confirmation/history/Compose, và bốn nghiệp vụ backend nâng cao kèm tests.

**Không triển khai trong MVP:** Guest Checkout, bảng Cart hoặc InventoryReservation, quản lý nguyên liệu chi tiết, Admin/Barista Dashboard, public staff state mutation, phân quyền staff, voucher quota, đổi Loyalty Points, Voucher Preview API, Refresh Token, OAuth, gateway tiền thật, refund, microservices, message queue, CI deploy cloud và browser E2E tự động bắt buộc.

## 2. Kiến trúc và module

\`\`\`text
Next.js App Router (TypeScript, Tailwind, Zustand Cart, TanStack Query)
   | REST/JSON + Bearer JWT
   v
NestJS modular monolith
   AuthModule | ProductsModule | Pricing domain | OrdersModule
   PaymentsModule | VouchersModule | LoyaltyModule | Expiration scheduler
   | Prisma ORM and short DB transactions
   v
PostgreSQL
\`\`\`

Mỗi module có Controller / Service / DTO riêng; PrismaService là hạ tầng dùng chung, transaction orchestration của Orders/Payments quản lý cập nhật đa bảng. OrderStateMachine chỉ là service nội bộ có test/demo script, không mở endpoint đổi trạng thái nhân viên.

Frontend: trang Menu, Product Detail, Cart, Login/Register, Checkout/Payment, Confirmation, Order History và Order Detail. Dùng Zustand persist LocalStorage **chỉ cho Cart**; TanStack Query cho dữ liệu lấy từ API và invalidate sau thanh toán/cancel. Dữ liệu nhạy cảm không nằm trong Cart.

## 3. Authentication và lựa chọn bảo mật

AC-01 đã chốt: register trả User không auto-login, login trả Bearer JWT + User, GET /auth/me bảo vệ JWT; access token sống 3600 giây, không Refresh Token. Bcrypt password hash, Secret qua môi trường, JwtAuthGuard, userId lấy từ JWT, không nhận userId client, xác thực ownership mọi Order/Payment.

**TD-05 được chọn cho MVP:** Lưu accessToken trong \`sessionStorage\` chỉ ở tab phiên làm việc; sau reload khôi phục nếu chưa hết hạn; logout xóa; 401 thì xóa và yêu cầu đăng nhập. Không dùng LocalStorage dành cho Cart để giữ JWT. Đây là đánh đổi thực dụng, **không chống được XSS**; cần sanitize output, tránh dangerouslySetInnerHTML, hạn chế CSP/origins. Production nên chuyển sang HttpOnly Secure SameSite cookie/BFF. Frontend authenticated pages dùng client-side fetch, không đòi SSR cookie auth trong MVP.

Đăng ký: email trim + lowercase, định dạng hợp lệ, password tối thiểu 8 ký tự và kiểm tra giới hạn bytes phù hợp bcrypt, 409 khi email trùng. Login sai thông tin 401 không tiết lộ email có tồn tại. Không trả passwordHash dưới bất kỳ endpoint nào. CORS allowlist frontend, không dùng "*" cùng credentials.

## 4. ERD logic — 10 bảng, không thêm bảng thứ 11

| Entity | Khóa, field và quan hệ trọng yếu |
| --- | --- |
| User | id UUID PK, email UNIQUE, passwordHash, loyaltyPoints int ≥0; User 1:N Order, 1:N LoyaltyTransaction. |
| Product | id UUID PK, name, imageUrl, basePrice int VND, stock int ≥0, **version int default 0**; Product 1:N OrderItem. |
| SizeOption | code (S/M/L) PK, priceDelta int; toàn hệ thống dùng chung. |
| Topping | id UUID PK, name, price int; toàn hệ thống dùng chung. |
| Voucher | id UUID PK, code UNIQUE, amount fixed int >0, minOrderValue ≥0, validFrom UTC, expiresAt UTC; 0:N Order. |
| Order | id UUID PK, userId NOT NULL FK, voucherId NULL FK, status, inventoryStatus, subtotal, discount, finalTotal >0, voucherCodeSnapshot, creationIdempotencyKey, requestHash, createdAt, updatedAt, expiresAt, **version int default 0**. UNIQUE(userId, creationIdempotencyKey). |
| OrderItem | id UUID PK, orderId/productId/sizeCode FK, quantity >0, productNameSnapshot, sizePriceSnapshot, unitPrice, lineTotal. |
| OrderItemTopping | composite (orderItemId, toppingId) UNIQUE/FK, nameSnapshot, priceSnapshot. |
| Payment | id UUID PK, orderId FK, idempotencyKey UNIQUE, requestHash, amount int, method, status, createdAt. Order 1:N Payment (một dòng/attempt). |
| LoyaltyTransaction | id UUID PK, userId FK, orderId FK UNIQUE, points int ≥0, createdAt. Order 0:1 LoyaltyTransaction. |

Các bảng đều thêm createdAt/updatedAt nơi có ích, nhưng không triển khai soft delete hoặc audit table riêng. Việc thêm version vào Product, Order là TD-02 được chốt sau ERD v1 mà không đổi số bảng. \`isAvailable\` là field **computed** từ stock > 0, không là column.

**Ràng buộc database:** UNIQUE cho email/voucher code/order user+key/payment key/loyalty order; CHECK stock ≥0, amounts hợp lệ, finalTotal= subtotal-discount >0; nullable voucherId; foreign keys không cascade xóa lịch sử. Partial UNIQUE indexes trên Payment(orderId) WHERE status='PROCESSING' và WHERE status='SUCCEEDED' để tối đa 1 trạng thái tương ứng (PROCESSING không được commit dài hạn trong MVP). Prisma migration có thể cần SQL thuần cho CHECK/partial index.

**Snapshots:** Lưu giá và mô tả sản phẩm, size, topping, voucher tại lúc tạo Order. Lịch sử không đọc giá hiện tại của Catalog để tính lại. Không xóa vật lý những Product/Topping/Size đã phát sinh Order; MVP chỉnh seed hoặc ẩn bằng UI nếu cần, không làm admin editor.

**Money:** VND là integer không có thập phân, backend tính subtotal và finalTotal; kiểm tra tràn integer PostgreSQL trước khi ghi. unitPrice = basePrice + sizeDelta + sum(topping.price); lineTotal = unitPrice × quantity; discount = voucher.amount (chỉ fixed), finalTotal = subtotal - discount >0. Một Order tối đa một voucher.

## 5. State machines & inventory

Order.status: \`PENDING\`, \`PAYMENT_FAILED\`, \`PAID\`, \`PREPARING\`, \`READY\`, \`COMPLETED\`, \`CANCELLED\`.
Allowed: \`PENDING→PAID\`, \`PENDING→PAYMENT_FAILED\`, \`PENDING→CANCELLED\`, \`PAYMENT_FAILED→PENDING\` khi retry re-reserve, \`PAYMENT_FAILED→CANCELLED\`, \`PAID→PREPARING→READY→COMPLETED\` qua internal service. \`CANCELLED\` và \`COMPLETED\` terminal. Không public status mutation sau PAID.

Order.inventoryStatus: \`RESERVED\`, \`RELEASED\`, \`COMMITTED\`. Initial PENDING/RESERVED khi đã trừ stock khả dụng. PAYMENT_FAILED/RELEASED khi thất bại và trả hàng. PAID/COMMITTED, không trừ thêm lần nữa. Cancel/expire release stock **chỉ nếu RESERVED**. Retry trên cùng Order re-reserve trước khi tạo Payment Attempt với key mới. One Product stock unit per drink quantity regardless of size/toppings.

Order.expiresAt = createdAt + 15 phút, tuyệt đối, retry không kéo dài. Chỉ trạng thái chưa trả tiền bị CANCELLED và hoàn stock. PAID không auto cancel.

## 6. REST API Contract v1 (final selections)

**General:** JSON, UUID string, integer VND, timestamps ISO 8601 UTC, bearer token; \`Idempotency-Key: <UUID>\` cho create Order/Payment. Error JSON \`{statusCode,code,message}\`, có thể thêm context như currentSubtotal. Các endpoint dưới đây là canonical; không tạo thêm aliases.

### Auth — AC-01 approved

- \`POST /auth/register\` public, body \`{email,password}\`, 201 \`{id,email,loyaltyPoints:0}\`, không auto-login, 400 invalid, 409 email duplicate.
- \`POST /auth/login\` public, body \`{email,password}\`, 200 \`{accessToken,tokenType:"Bearer",expiresIn:3600,user:{id,email,loyaltyPoints}}\`, 401 invalid.
- \`GET /auth/me\` JWT, 200 \`{id,email,loyaltyPoints}\`, 401 unauthorized.

### Products — AC-02 approved

- \`GET /products\` public, 200 \`{data:[{id,name,basePrice,imageUrl,stock,isAvailable}]}\`, no pagination in MVP.
- \`GET /products/:id\` public, 200 product fields plus \`sizes:[{code,priceDelta}]\` và \`toppings:[{id,name,price}]\` globally shared; 404 missing. \`isAvailable=(stock>0)\` computed.

### Order Creation — AC-03.1 approved

\`POST /orders\` JWT + Idempotency-Key. Body \`{items:[{productId,sizeCode,toppingIds,quantity}],voucherCode?,expectedSubtotal}\`, all monetary numbers integer VND. Client DOES NOT send trusted price or userId.

First check existing user+key: same canonical request fingerprint returns original Order and same stored totals **even if Catalog changed**; different payload => 409 IDEMPOTENCY_CONFLICT. For new key, recalculate \`subtotal\`; if \`expectedSubtotal\` different => 409 PRICE_CHANGED with \`currentSubtotal\` without reserve/Create. Validate voucher and stock; atomic Product versioned decrement + Order/Items snapshot creation. New Order 201 \`{id,status:"PENDING",inventoryStatus:"RESERVED",subtotal,discount,finalTotal,expiresAt}\`. Valid replay may return 200 with same Order representation; frontend must accept 200/201. Invalid body 400 VALIDATION_ERROR; voucher invalid/expired/below min or discount ≥ subtotal 422 INVALID_VOUCHER; insufficient stock 409 OUT_OF_STOCK.

Canonical fingerprint: normalize/validate voucher code, sort topping ID sets, items and property order into deterministic representation; duplicate topping IDs rejected. Idempotency conflict handled by DB UNIQUE and fetch-after-conflict; concurrent same-key requests must reserve at most once. \`expectedSubtotal\` participates in fingerprint.

### Order History and Cancellation — AC-03.2/3 approved

- \`GET /orders/me?page=1&limit=10\` JWT, 200 \`{data:[{id,status,finalTotal,itemCount,createdAt}],meta:{page,limit,total,totalPages}}\`; newest first, max limit 50; User from JWT.
- \`GET /orders/:id\` JWT + owner, 200 detailed snapshots (items, selected toppings, price breakdown, status, inventoryStatus, createdAt, expiresAt); 404 for missing or foreign order, 401 no JWT.
- \`POST /orders/:id/cancel\` JWT + owner, 200 \`{id,status:"CANCELLED",inventoryStatus:"RELEASED"}\` if PENDING/PAYMENT_FAILED; repeated CANCELLED call returns same result; 409 ORDER_NOT_CANCELLABLE for PAID onward, 404 foreign order. Transaction releases stock once if RESERVED and arbitrates races with Payment/expiration.

### Payment — AC-04.1–AC-04.4 approved

\`POST /payments\` JWT + Idempotency-Key. Body \`{orderId,method:"WALLET"|"CARD"}\`. Backend checks current-user ownership before any attempt lookup; globally unique idempotencyKey. Same key + matching user/order/method/amount fingerprint returns same terminal Payment attempt/outcome, without re-reserving or calling mock; different fingerprint => 409 IDEMPOTENCY_CONFLICT. If replay after Order later advances in internal state machine, Payment status stays original and included Order status may represent latest current Order state.

For new attempt: Order must be PENDING/RESERVED or PAYMENT_FAILED/RELEASED and not expired. On PAYMENT_FAILED retry reserve inventory transactionally and perform permitted state path PAYMENT_FAILED→PENDING→(PAID or PAYMENT_FAILED); no separate retry endpoint. DB computes Payment.amount=Order.finalTotal (no amount in request). Deterministic synchronous MockPaymentService yields SUCCESS/FAIL (test injection, no publicly writable \`forceSuccess\` flag). In one short PostgreSQL transaction record terminal Payment \`SUCCEEDED\`/\`FAILED\` and update Order/inventory/loyalty atomically. No durable PROCESSING between transactions.

HTTP 200 payment SUCCESS example \`{payment:{id,orderId,amount,method,status:"SUCCEEDED"},order:{id,status:"PAID",inventoryStatus:"COMMITTED"}}\`; payment business FAILURE HTTP 200 with \`status:"FAILED"\`, order \`PAYMENT_FAILED\`/\`RELEASED\`. Business failure is not server error.

Payment conflict error codes all HTTP 409: ORDER_EXPIRED, OUT_OF_STOCK, ORDER_ALREADY_PAID, ORDER_CANCELLED, PAYMENT_IN_PROGRESS, IDEMPOTENCY_CONFLICT. 400 VALIDATION_ERROR, 401 UNAUTHORIZED, 404 ORDER_NOT_FOUND (includes order belongs to another User). A rejected new attempt cannot create Payment or reserve inventory. Repeated same key must return prior attempt before state checks, after ownership check.

### Voucher and Loyalty — AC-05.1 approved

No Voucher Preview API. \`voucherCode?\` comes in POST /orders. Validate fixed amount, minOrderValue, \`validFrom <= db_now < expiresAt\` at Order creation; snapshot code/discount/finalTotal. Repeat payment never re-validates Voucher. \`User.loyaltyPoints\` exposed via GET /auth/me. No separate Loyalty API or redemption.

## 7. Atomic workflows and optimistic locking

**Create Order:** before transaction handle existing idempotency (with DB UNIQUE as final arbiter); validate server price & expectedSubtotal, Voucher and quantity; inside interactive Prisma transaction sort Product IDs; for each distinct Product conditional UPDATE with stock >= qty and version = previously read version, stock decrement/version increment; write Order PENDING/RESERVED, Items and snapshot; commit all-or-none. If Product conflict retry transaction at most 3 times using fresh reads with bounded backoff; not enough stock => 409 OUT_OF_STOCK, no negative stock.

**Payment first/retry:** authenticate, verify owner, detect existing payment key. Compute mock outcome locally. In a single transaction, re-evaluate now, Order version, status, inventoryStatus, payment uniqueness; if retry stock RELEASED, conditionally reacquire using Product.version. For success only if DB time strictly before expiresAt: create SUCCEEDED Payment, update Order to PAID/COMMITTED and version, create LoyaltyTransaction UNIQUE(orderId), increment User.loyaltyPoints by floor(finalTotal/10000) atomically. For failure create FAILED Payment, change Order to PAYMENT_FAILED/RELEASED, release stock once. Transaction rollback fully on error; no durable PROCESSING. A crash after commit and before HTTP response is resolved by same-key replay.

**Concurrency and database clock:** use PostgreSQL clock for expiration and compare at final status transition (must hold \`db_now < expiresAt\`), not a stale time captured before long processing; all races compete through Order.version/status and Product.version/stock. Retry serialization/conflict at most 3 times; if outcome already committed replay it. No payment made at/after expiry is accepted.

**Cancel/Expire:** shared OrderExpirationService + \`@nestjs/schedule\` every minute, plus guard on Order/Payment operations. Find expired unpaid Order, use version/status conditional update; only release Product stock if inventoryStatus RESERVED, change CANCELLED/RELEASED; already PAID or already CANCELLED untouched. Expiry can be persisted slightly after exact deadline due to scheduler, but payment is rejected immediately by guard/database time. Cancellation uses same atomic release helper and ownership check.

**Voucher Loyalty accounting:** Only successful PAID finalization awards points; UNIQUE loyalty orderId protects duplication. Failed/expired/cancelled orders award 0. User.loyaltyPoints acts as materialized balance; LoyaltyTransaction is immutable journal.

**Isolation strategy:** Optimistic locking via version CAS with ordinary short interactive transactions; avoid keeping DB transaction open while waiting for network/UI. Define unique indexes/check constraints at DB level, not service-only guards. For concurrent multi-item stock, update Product IDs consistently to reduce deadlocks.

## 8. Frontend user journeys

**Menu -> Product:** GET /products, GET /products/:id; UI computes price preview but shows stock availability; server is authority. S/M/L and global Topping selections. Loading, empty, error, out-of-stock states.

**Cart:** Zustand persist LocalStorage, one line uniquely by productId/sizeCode/sorted toppingIds; quantity edits and delete; no backend Cart API; no tokens in cart. On reload validate again at checkout.

**Checkout:** if not authenticated, redirect Login and preserve Cart. Send expectedSubtotal shown to customer and a new UUID Idempotency-Key on create Order. On 409 PRICE_CHANGED display new subtotal and ask customer to confirm, new key and payload; no Order yet. On success display server finalTotal, discount, 15-min expiry countdown. Never treat client-side timer as authoritative.

**Payment:** wallet/card selection, POST /payments unique key per intentional attempt. Disable double-click and preserve same key on network retry. FAILED business result retains Cart and allows retry on same Order until expiry; PAID clears Cart and navigates to Confirmation; 409 errors provide actionable messages. Order Detail/History uses JWT, ownership.

**Token storage:** client-only sessionStorage for JWT, clear/logout on expiry/401; app security controls XSS risks. TanStack Query caches server resources but does not store JWT itself.

## 9. Mock Payment and deterministic tests

Implement \`MockPaymentGateway\` interface injected into PaymentService. In test mode, inject scripted deterministic success/failure behavior; demo mode uses server-controlled fixtures/configuration. Client request cannot set a trusted \`succeeded\` flag. No external network or actual charging. Test replay of same idempotency key and concurrent mock calls. No retry worker for PROCESSING because one transaction stores final outcome.

## 10. Testing & Definition of Done — TD-04 selected

**A: Unit Tests + real PostgreSQL Integration Tests + manual UI Smoke Test.** Playwright optional, not required in MVP; Docker Compose test DB isolated from local dev. Unit: Order FSM invalid transitions, pricing, Voucher limits/time, Loyalty floor, payload normalization. Integration: concurrent checkout last stock, concurrent same-key Order creates once, duplicate Payment Attempt and key-conflict, failed/payment replay, payment success vs Cancel/Cron, strict expiry boundary, rollback after injected errors, Loyalty UNIQUE exactly once, authorization/404 foreign order, snapshot unchanged after catalog edits. UI smoke: Menu→Detail→Cart→Login→Order→Payment fail/retry/success→History.

Every task DoD: builds, typecheck/lint as configured, input validation, relevant tests passing, PR peer review, README/run instructions updated, basic UI loading/empty/error states. CI GitHub Actions runs install with lockfiles, lint, build, unit tests and DB integration tests with PostgreSQL service. DB migration test covers unique/partial indexes.

## 11. Scrum plan — 4 weeks, 6 members

| Sprint | Goal | Ownership proposal | Demonstration |
| --- | --- | --- | --- |
| Week 1 | Requirements, Figma, UML, repo, Prisma setup, GET /products, Menu | TV1 integration; TV2 Product BE; TV4 Menu FE; TV6 BA/QA, all support | Menu from API + diagrams |
| Week 2 | Product detail, Cart, Auth JWT, POST /orders / stock reserve | TV2 Order+stock; TV3 Auth; TV4 Product Detail; TV5 Cart/Checkout; TV6 tests | Create PENDING Order as authenticated user |
| Week 3 | Mock Payment, retry, voucher, loyalty, history, FSM | TV3 Payment/Voucher/Loyalty; TV2 FSM/expiry; TV4 history; TV5 payment UI; TV6 tests; TV1 integration | End-to-end PAID and PAYMENT_FAILED |
| Week 4 | Race/rollback tests, CI, Docker Compose, README, Figma/UML polish, delivery | TV1 integrate; TV2/TV3 backend tests; TV4/TV5 UI fixes; TV6 docs/test & Sprint Review | Full live demo and retrospective |

Roles TV1–TV6 are proposals, not names assigned by participant. Reserve ~20% capacity for integration/fixes. Existing 12-week sheets are separate and must not be overwritten.

## 12. Delivery and operational concerns

Repo structure root with \`frontend/\`, \`backend/\`, optional \`docs/\`; distinct npm lockfiles; Node version follow actual project package/README (current repo scaffold appears Node 24 — verify at implementation). Docker Compose 3 services: frontend, backend, PostgreSQL; healthcheck DB, env examples, prisma migration and seed. GitHub Actions PR checks, feature branches and PR review; do not merge directly to default branch without team convention.

Use \`NEXT_PUBLIC_API_BASE_URL\` only for public backend API origin; NestJS process secrets/database URLs in backend environment, never client bundle. Restrict CORS by frontend origin. Server-side audit/debug logs avoid JWT secrets, password, raw payment tokens.

Figma: 5 MVP screens + Login/Order History where necessary. UML: use case, class/ERD, sequence of create Order/payment, and Order State Machine; Mermaid diagrams can serve as code-adjacent design reference if accepted by instructor.

## 13. Risk and design consistency checks

1. **Mock in one transaction vs optimistic locking:** compute fake gateway result before DB transaction, then recheck all authoritative conditions inside DB transaction; short transactions only. Payment fail must not produce HTTP 500.
2. **Payment attempt status:** PROCESSING may exist in enum and partial unique index but is not committed as a durable state in MVP; eliminate recovery worker.
3. **Strict expiry:** Cron updates database periodically; lazy guard and final database comparison enforce deadline irrespective of Cron lag.
4. **Same-key replay vs catalog/Order state:** replay canonical Order/Payment outcome before live repricing/state checks, after auth+ownership. New attempt uses new key; never reopen already PAID Order.
5. **Initial Order stock vs retry:** PENDING has RESERVED; PAYMENT_FAILED has RELEASED. Retry re-reserves only if enough. Cancel/Expire never releases twice.
6. **Sensitive data:** sessionStorage JWT is MVP security compromise, never describe as production-safe; avoid XSS; no token in Cart persistence.
7. **External payment:** Real payment provider would require two-phase persistence, webhook validation, reconciliation/refund on delayed success. Explicitly out of MVP.
8. **Scope:** All chosen design details fit fixed 10 task assessment. No unforeseen admin or rewards UI feature.
9. **History and referential integrity:** historical order snapshot retained even if catalog changes.
10. **Prior written log drift:** any previous document line saying API still OPEN must be updated to final selection only after entire design is selected.

## 14. Status and next gate

**Decision selection:** BR-01..BR-21, AC-01..AC-05.1 and TD-01..TD-03 directly approved by user. TD-04..TD-15 and ancillary API/details were selected by the assistant under the user's explicit authorization to stop asking for per-item confirmation. They are recommendations tailored to a classroom 4-week MVP, not objectively optimal for a real payment production system.

**Superpowers workflow:** this document is the architectural design spec, not an implementation plan. Following written-spec review, the writing-plans skill creates a task-by-task implementation plan that must be reviewed before product code changes. No implementation/code has been performed by preparing this design specification.
