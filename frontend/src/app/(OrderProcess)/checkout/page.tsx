"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import PaymentMethods from "@/components/checkout/PaymentMethods";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("WALLET");
  const [voucherCode, setVoucherCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9CC8D] p-4 text-[#3E2723] max-w-md mx-auto shadow-2xl border-x border-gray-200">
        <p className="mb-4 font-medium">Không có sản phẩm nào để thanh toán.</p>
        <Link href="/" className="px-6 py-2 bg-[#D84315] text-white rounded-lg">
          Quay lại Menu
        </Link>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    // 1. Bật trạng thái loading để nút bấm hiện chữ "Đang xử lý..."
    setIsLoading(true);
    const toastId = toast.loading("Đang xử lý thanh toán...");

    setTimeout(() => {
      setIsLoading(false);
      toast.success("Tạo đơn thành công!", { id: toastId });
      alert("Tạo đơn thành công! Hệ thống sẽ chuyển tới Lịch sử đơn hàng.");
      clearCart(); // Xóa sạch giỏ hàng
      router.push("/orders"); // Chuyển sang trang My Orders
    }, 1500);

    /* === TẠM ĐÓNG LOGIC GỌI API THẬT Ở DƯỚI ĐÂY ===
    try {
      const orderPayload = { ... };
      const idempotencyKey = crypto.randomUUID();
      const mockToken = "chua-co-token-that";

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
      if (!response.ok) throw new Error(responseData.message || "Lỗi!");

    } catch (error) {
      alert("Lỗi kết nối...");
    }
    ================================================ */
  };

  return (
    // Dùng flex-col để đẩy nút xuống đáy màn hình
    <div className="min-h-screen flex flex-col bg-[#F9CC8D] p-4 text-[#3E2723] max-w-md mx-auto shadow-2xl border-x border-gray-200">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex items-center mb-6">
        <Link
          href="/cart"
          className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Checkout</h1>
      </div>

      {/* Vùng nội dung ở giữa giãn ra (flex-1) */}
      <div className="flex-1">
        <CheckoutSummary items={items} totalPrice={getTotalPrice()} />

        <PaymentMethods
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />

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
      </div>

      <div className="mt-auto pt-4">
        <p className="text-center text-xs text-gray-400 mb-3">
          🔒 Giao dịch được bảo mật an toàn.
        </p>
        <button
          onClick={handleConfirmOrder}
          disabled={isLoading}
          className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-md transition ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#D84315] hover:bg-[#bf3a11]"
          }`}
        >
          {isLoading ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
        </button>
      </div>
    </div>
  );
}
