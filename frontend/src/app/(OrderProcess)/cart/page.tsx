"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { useState, useEffect } from "react";
// Import 2 "mảnh ghép" vào
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
    <div className="min-h-screen bg-[#F9CC8D] p-4 text-[#3E2723]">
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
        <div className="space-y-4">
          {/* Lắp ráp các mảnh ghép CartItem */}
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
            />
          ))}

          {/* Lắp ráp mảnh ghép Summary */}
          <CartSummary />
        </div>
      )}
    </div>
  );
}
