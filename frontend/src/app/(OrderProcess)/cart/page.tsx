"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { useState, useEffect } from "react";

import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9CC8D] p-4 text-[#3E2723] max-w-md mx-auto shadow-2xl border-x border-gray-200">
      <div className="flex items-center mb-6">
        <Link
          href="/"
          className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">Your Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-[#D84315] text-white rounded-lg font-medium"
          >
            Đi xem Menu
          </Link>
        </div>
      ) : (
        // 2. Thêm 'flex flex-col flex-1' để khối này giãn hết khoảng trống còn lại
        <div className="flex flex-col flex-1">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            ))}
          </div>

          {/* 3. Thêm 'mt-auto' để đẩy khối CartSummary xuống tít dưới đáy */}
          <div className="mt-auto">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
}
