export type SizeCode = "S" | "M" | "L";
export type Product = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  stock: number;
  isAvailable: boolean;
};
export type ProductDetail = Product & {
  sizes: { code: SizeCode; priceDelta: number }[];
  toppings: { id: string; name: string; price: number }[];
};
export type User = { id: string; email: string; loyaltyPoints: number };
export type Credentials = { email: string; password: string };
export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: User;
};
export type CreateOrderInput = {
  items: { productId: string; sizeCode: SizeCode; toppingIds: string[]; quantity: number }[];
  expectedSubtotal: number;
  voucherCode?: string;
};
export type OrderStatus = "PENDING" | "PAID" | "PAYMENT_FAILED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  inventoryStatus: "RESERVED" | "COMMITTED" | "RELEASED";
  subtotal: number;
  discount: number;
  total: number;
  voucherCode: string | null;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    sizeCode: SizeCode;
    sizePrice: number;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    toppings: { toppingId: string; name: string; price: number }[];
  }[];
};
export type CreatePaymentInput = { orderId: string; method: "WALLET" | "CARD" };
export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  method: "WALLET" | "CARD";
  status: "SUCCEEDED" | "FAILED";
  orderStatus: "PAID" | "PAYMENT_FAILED";
};
export type RequestOptions = { signal?: AbortSignal; timeoutMs?: number };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(status: number, code: string, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function apiOrigin() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  try {
    const url = new URL(base ?? "");
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin === base) return base;
  } catch {
    // Report configuration errors without exposing environment values.
  }
  throw new ApiError(0, "CONFIGURATION_ERROR", "Chưa cấu hình địa chỉ API hợp lệ.");
}

async function request<T>(path: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T> {
  const url = `${apiOrigin()}${path}`;
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (options.signal?.aborted) abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, options.timeoutMs ?? 10000);
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      credentials: "omit",
      signal: controller.signal,
    });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const error = body !== null && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : null;
      throw new ApiError(
        response.status,
        typeof error?.code === "string" ? error.code : "HTTP_ERROR",
        typeof error?.message === "string" ? error.message : "Không thể hoàn tất yêu cầu. Vui lòng thử lại.",
        error ?? {},
      );
    }
    if (body === null) throw new ApiError(response.status, "INVALID_RESPONSE", "Phản hồi API không hợp lệ.");
    return body as T;
  } catch (error) {
    if (options.signal?.aborted) throw new DOMException("Request aborted", "AbortError");
    if (timedOut) throw new ApiError(0, "TIMEOUT", "Yêu cầu quá thời gian chờ. Vui lòng thử lại.");
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, "NETWORK_ERROR", "Không thể kết nối máy chủ. Vui lòng thử lại.");
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abort);
  }
}

function jsonPost(body: unknown, headers: Record<string, string> = {}): RequestInit {
  return { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) };
}

function idempotencyHeaders(key: string, token: string) {
  if (typeof key !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Idempotency-Key phải là UUID do bên gọi cung cấp.");
  }
  return { Authorization: `Bearer ${token}`, "Idempotency-Key": key };
}

export const getProducts = (options?: RequestOptions) => request<Product[]>("/products", {}, options);
export const getProductById = (id: string, options?: RequestOptions) => request<ProductDetail>(`/products/${encodeURIComponent(id)}`, {}, options);
export const register = (credentials: Credentials, options?: RequestOptions) => request<User>("/auth/register", jsonPost({ ...credentials, email: credentials.email.trim().toLowerCase() }), options);
export const login = (credentials: Credentials, options?: RequestOptions) => request<LoginResponse>("/auth/login", jsonPost({ ...credentials, email: credentials.email.trim().toLowerCase() }), options);
export const getCurrentUser = (accessToken: string, options?: RequestOptions) => request<User>("/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } }, options);
export const getMyOrders = (accessToken: string, options?: RequestOptions) => request<Order[]>("/orders/me", { headers: { Authorization: `Bearer ${accessToken}` } }, options);
export const getOrderById = (id: string, accessToken: string, options?: RequestOptions) => request<Order>(`/orders/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${accessToken}` } }, options);
export const getHealth = (options?: RequestOptions) => request<{ status: "ok"; database: "up" }>("/health", {}, options);

// The caller keeps each operation's UUID through transport retries; no automatic POST retry.
export async function createOrder(input: CreateOrderInput, idempotencyKey: string, accessToken: string, options?: RequestOptions) {
  return request<Order>("/orders", jsonPost(input, idempotencyHeaders(idempotencyKey, accessToken)), options);
}

export async function createPayment(input: CreatePaymentInput, idempotencyKey: string, accessToken: string, options?: RequestOptions) {
  return request<Payment>("/payments", jsonPost(input, idempotencyHeaders(idempotencyKey, accessToken)), options);
}
