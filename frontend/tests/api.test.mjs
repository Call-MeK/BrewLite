import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, beforeEach, test } from "node:test";
import * as api from "../src/lib/api.ts";

const productId = "00000000-0000-4000-8000-000000000001";
const orderId = "00000000-0000-4000-8000-000000000010";
const key = "00000000-0000-4000-8000-000000000020";
const user = { id: productId, email: "a@example.com", loyaltyPoints: 0 };
const product = { id: productId, name: "Espresso", description: "Rich & bold", imageUrl: "/coffee.jpg", basePrice: 30000, stock: 10, isAvailable: true };
const detail = { ...product, sizes: [{ code: "S", priceDelta: 0 }], toppings: [] };
const order = { id: orderId, userId: productId, status: "PENDING", inventoryStatus: "RESERVED", subtotal: 30000, discount: 0, total: 30000, voucherCode: null, createdAt: "2026-10-19T00:00:00.000Z", updatedAt: "2026-10-19T00:00:00.000Z", items: [] };
const requests = [];
let respond;
let origin;
const server = createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  requests.push({ path: req.url, method: req.method, headers: req.headers, body: body ? JSON.parse(body) : undefined });
  respond(req, res);
});

before(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});
beforeEach(() => {
  requests.length = 0;
  process.env.NEXT_PUBLIC_API_BASE_URL = origin;
  respond = (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const responses = {
      "/products": [product],
      [`/products/${productId}`]: detail,
      "/auth/register": user,
      "/auth/login": { accessToken: "test-token", tokenType: "Bearer", expiresIn: 3600, user },
      "/auth/me": user,
      "/orders": order,
      "/orders/me": [order],
      [`/orders/${orderId}`]: order,
      "/payments": { id: key, orderId, amount: 30000, method: "CARD", status: "SUCCEEDED", orderStatus: "PAID" },
      "/health": { status: "ok", database: "up" },
    };
    res.end(JSON.stringify(responses[req.url]));
  };
});

test("catalogue requests use the configured origin and preserve product options", async () => {
  assert.deepEqual(await api.getProducts(), [product]);
  assert.deepEqual(await api.getProductById(productId), detail);
  assert.deepEqual(requests.map(({ path, method }) => [path, method]), [["/products", "GET"], [`/products/${productId}`, "GET"]]);
  assert.equal(requests[0].headers.authorization, undefined);
});

test("auth sends normalized email and leaves passwords unchanged", async () => {
  assert.deepEqual(await api.register({ email: " A@Example.com ", password: " pass word " }), user);
  assert.equal((await api.login({ email: " A@Example.com ", password: " pass word " })).accessToken, "test-token");
  for (const request of requests) {
    assert.deepEqual(request.body, { email: "a@example.com", password: " pass word " });
    assert.equal(request.headers["content-type"], "application/json");
  }
});

test("private reads send the supplied JWT and use the documented routes", async () => {
  assert.deepEqual(await api.getCurrentUser("test-token"), user);
  assert.deepEqual(await api.getMyOrders("test-token"), [order]);
  assert.deepEqual(await api.getOrderById(orderId, "test-token"), order);
  assert.deepEqual(requests.map(({ path }) => path), ["/auth/me", "/orders/me", `/orders/${orderId}`]);
  assert.ok(requests.every(({ headers }) => headers.authorization === "Bearer test-token"));
});

test("order retries preserve the caller's idempotency key and exact payload", async () => {
  const input = { items: [{ productId, sizeCode: "S", toppingIds: [], quantity: 1 }], expectedSubtotal: 30000 };
  assert.deepEqual(await api.createOrder(input, key, "test-token"), order);
  await api.createOrder(input, key, "test-token");
  for (const request of requests) {
    assert.equal(request.path, "/orders");
    assert.equal(request.method, "POST");
    assert.equal(request.headers["idempotency-key"], key);
    assert.equal(request.headers.authorization, "Bearer test-token");
    assert.deepEqual(request.body, input);
  }
});

test("payments send only the order and payment method with their caller key", async () => {
  const payment = await api.createPayment({ orderId, method: "CARD" }, key, "test-token");
  assert.equal(payment.orderStatus, "PAID");
  assert.equal(requests[0].path, "/payments");
  assert.equal(requests[0].headers["idempotency-key"], key);
  assert.deepEqual(requests[0].body, { orderId, method: "CARD" });
});

test("missing or malformed idempotency keys are rejected before a request", async () => {
  for (const invalidKey of [undefined, "", "not-a-uuid"]) {
    await assert.rejects(api.createOrder({ items: [], expectedSubtotal: 0 }, invalidKey, "test-token"), (error) => error instanceof api.ApiError && error.code === "VALIDATION_ERROR");
    await assert.rejects(api.createPayment({ orderId, method: "WALLET" }, invalidKey, "test-token"), (error) => error instanceof api.ApiError && error.code === "VALIDATION_ERROR");
  }
  assert.equal(requests.length, 0);
});

test("non-OK responses preserve HTTP status and safe API code/message", async () => {
  respond = (_req, res) => {
    res.writeHead(409, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ statusCode: 409, code: "PRICE_CHANGED", message: "Price changed" }));
  };
  await assert.rejects(api.getProducts(), (error) => error instanceof api.ApiError && error.status === 409 && error.code === "PRICE_CHANGED" && error.message === "Price changed");
});

test("business errors preserve authoritative price and inventory response details", async () => {
  const input = { items: [{ productId, sizeCode: "S", toppingIds: [], quantity: 1 }], expectedSubtotal: 30000 };
  for (const errorBody of [
    { statusCode: 409, code: "PRICE_CHANGED", message: "Prices changed", subtotal: 35000 },
    { statusCode: 409, code: "OUT_OF_STOCK", message: "A product is out of stock", productId },
  ]) {
    respond = (_req, res) => { res.writeHead(409, { "Content-Type": "application/json" }); res.end(JSON.stringify(errorBody)); };
    await assert.rejects(api.createOrder(input, key, "test-token"), (error) => {
      assert.ok(error instanceof api.ApiError);
      assert.equal(error.status, 409);
      assert.deepEqual(error.details, errorBody);
      return true;
    });
  }
});

test("non-JSON error responses keep HTTP status without exposing response bodies", async () => {
  respond = (_req, res) => { res.writeHead(502); res.end("<html>internal upstream details</html>"); };
  await assert.rejects(api.getProducts(), (error) => error instanceof api.ApiError && error.status === 502 && error.code === "HTTP_ERROR" && !error.message.includes("upstream"));
});

test("health succeeds only on an OK response and preserves readiness failures", async () => {
  assert.deepEqual(await api.getHealth(), { status: "ok", database: "up" });
  respond = (_req, res) => { res.writeHead(503); res.end(JSON.stringify({ statusCode: 503, code: "SERVICE_UNAVAILABLE", message: "Database unavailable" })); };
  await assert.rejects(api.getHealth(), (error) => error.status === 503 && error.code === "SERVICE_UNAVAILABLE");
});

test("a timeout aborts the request and reports a safe timeout error", async () => {
  respond = () => {};
  await assert.rejects(api.getProducts({ timeoutMs: 20 }), (error) => error instanceof api.ApiError && error.status === 0 && error.code === "TIMEOUT");
});

test("caller cancellation remains distinguishable from API and timeout errors", async () => {
  respond = () => {};
  const controller = new AbortController();
  const pending = api.getProducts({ signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, (error) => error.name === "AbortError");
});

test("network errors never expose low-level connection details", async () => {
  respond = (_req, res) => res.destroy(new Error("private upstream details"));
  await assert.rejects(api.getProducts(), (error) => error instanceof api.ApiError && error.status === 0 && error.code === "NETWORK_ERROR" && !error.message.includes("private"));
});

test("invalid API configuration does not silently request a frontend route", async () => {
  for (const invalidOrigin of [undefined, "", `${origin}/api`, "javascript:alert(1)"]) {
    if (invalidOrigin === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = invalidOrigin;
    await assert.rejects(api.getProducts(), (error) => error instanceof api.ApiError && error.code === "CONFIGURATION_ERROR");
  }
  assert.equal(requests.length, 0);
});
