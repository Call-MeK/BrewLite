import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function CartSummary() {
  // Component này tự động móc nối thẳng vào Zustand để lấy hàm tính tiền
  const { getTotalPrice } = useCartStore();

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <span className="text-lg font-bold">Total</span>
        <span className="text-2xl font-bold">
          {getTotalPrice().toLocaleString("vi-VN")}đ
        </span>
      </div>

      <Link
        href="/checkout"
        className="w-full block text-center py-4 bg-[#D84315] text-white rounded-xl font-bold text-lg shadow-md hover:bg-[#bf3a11] transition"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
