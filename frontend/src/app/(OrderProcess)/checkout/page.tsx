"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Wallet, CreditCard, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  // State lưu phương thức thanh toán khách chọn (mặc định là Ví điện tử)
  const [paymentMethod, setPaymentMethod] = useState("WALLET");
  const [voucherCode, setVoucherCode] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return null;

  // Nếu khách truy cập checkout mà giỏ hàng rỗng, hiển thị thông báo
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9CC8D] p-4 flex flex-col items-center justify-center text-[#3E2723]">
        <p className="mb-4 font-medium">Không có sản phẩm nào để thanh toán.</p>
        <Link href="/" className="px-6 py-2 bg-[#D84315] text-white rounded-lg">
          Quay lại Menu
        </Link>
      </div>
    );
  }

  // Hàm xử lý khi bấm nút Confirm & Pay (Chúng ta sẽ viết API gọi Backend ở bước sau)
  const handleConfirmOrder = async () => {
    setIsLoading(true);

    try {
      // Ép kiểu dữ liệu giỏ hàng chuẩn 100% theo API Contract
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.productId,
          sizeCode: item.sizeCode,
          toppingIds: item.toppingIds || [],
          quantity: item.quantity,
        })),
        expectedSubtotal: getTotalPrice(),
        ...(voucherCode && { voucherCode }), // Chỉ gửi lên nếu có nhập mã giảm giá
      };

      // Tạo chìa khóa Idempotency (chống bấm thanh toán 2 lần bị tạo 2 đơn)
      // Dùng crypto.randomUUID() có sẵn của trình duyệt, không cần cài thêm thư viện
      const idempotencyKey = crypto.randomUUID();

      // Mock Token (Chờ TV4 làm xong Auth sẽ thay bằng token thật)
      const mockToken = "chua-co-token-that";

      // Gọi API POST /orders
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockToken}`,
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify(orderPayload),
        },
      );

      const responseData = await response.json();

      // KIỂM TRA LỖI (BẪY ĐỒ ÁN)
      if (!response.ok) {
        // Ném lỗi ra catch block. KHÔNG ĐƯỢC CHẠY clearCart() Ở ĐÂY.
        throw new Error(responseData.message || "Đã xảy ra lỗi khi tạo đơn!");
      }

      // NẾU THÀNH CÔNG: Xóa giỏ hàng và chuyển hướng
      alert("Tạo đơn thành công! Hệ thống sẽ chuyển tới Lịch sử đơn hàng.");
      clearCart();
      router.push("/orders");
    } catch (error) {
      // Kiểm tra an toàn theo chuẩn TypeScript
      const errorMessage =
        error instanceof Error ? error.message : "Đã xảy ra sự cố kết nối!";

      // Thông báo lỗi cho user nhưng giỏ hàng và dữ liệu vẫn còn nguyên!
      alert(
        `Thanh toán thất bại: ${errorMessage}\nGiỏ hàng của bạn vẫn được giữ nguyên để thử lại.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9CC8D] p-4 text-[#3E2723]">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link
          href="/cart"
          className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Checkout</h1>
      </div>

      {/* Tóm tắt đơn hàng */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">Order summary</h2>
          <span className="text-sm text-gray-500">{items.length} items</span>
        </div>

        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <span className="font-medium">
                  {item.quantity}x {item.name}
                </span>
                <p className="text-gray-500 text-xs">
                  Size {item.sizeCode}{" "}
                  {item.toppingIds && item.toppingIds.length > 0
                    ? "• Có Topping"
                    : ""}
                </p>
              </div>
              <span className="font-medium">
                {(item.price * item.quantity).toLocaleString("vi-VN")}đ
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
          <span>Total</span>
          <span>{getTotalPrice().toLocaleString("vi-VN")}đ</span>
        </div>
      </div>

      {/* Chọn phương thức thanh toán */}
      <div className="mb-8">
        <h2 className="font-bold mb-3">Payment Method</h2>
        <div className="space-y-3">
          {/* Tùy chọn: Ví điện tử */}
          <label
            className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "WALLET" ? "border-[#D84315] bg-orange-50" : "border-gray-200 bg-white"}`}
          >
            <Wallet
              className={`${paymentMethod === "WALLET" ? "text-[#D84315]" : "text-gray-500"} mr-3`}
            />
            <div className="flex-1">
              <p className="font-bold">Ví điện tử</p>
              <p className="text-xs text-gray-500">
                Thanh toán qua Momo/ZaloPay
              </p>
            </div>
            <input
              type="radio"
              name="payment"
              value="WALLET"
              checked={paymentMethod === "WALLET"}
              onChange={() => setPaymentMethod("WALLET")}
              className="w-5 h-5 accent-[#D84315]"
            />
          </label>

          {/* Tùy chọn: Thẻ ngân hàng */}
          <label
            className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "CARD" ? "border-[#D84315] bg-orange-50" : "border-gray-200 bg-white"}`}
          >
            <CreditCard
              className={`${paymentMethod === "CARD" ? "text-[#D84315]" : "text-gray-500"} mr-3`}
            />
            <div className="flex-1">
              <p className="font-bold">Thẻ ngân hàng</p>
              <p className="text-xs text-gray-500">Thẻ ATM nội địa / Visa</p>
            </div>
            <input
              type="radio"
              name="payment"
              value="CARD"
              checked={paymentMethod === "CARD"}
              onChange={() => setPaymentMethod("CARD")}
              className="w-5 h-5 accent-[#D84315]"
            />
          </label>
        </div>
      </div>

      {/* Mã giảm giá */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Nhập mã giảm giá (nếu có)"
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value)}
          className="w-full p-3 border rounded-xl outline-none focus:border-[#D84315] focus:ring-1 focus:ring-[#D84315]"
        />
      </div>

      {/* Nút xác nhận thanh toán */}
      <div className="mt-auto">
        <p className="text-center text-xs text-gray-400 mb-3">
          🔒 Giao dịch được bảo mật an toàn.
        </p>
        <button
          onClick={handleConfirmOrder}
          className="w-full py-4 bg-[#D84315] text-white rounded-xl font-bold text-lg shadow-md hover:bg-[#bf3a11] transition"
        >
          Xác nhận & Thanh toán
        </button>
      </div>
    </div>
  );
}
