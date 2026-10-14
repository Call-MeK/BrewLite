"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
function ProductDetailPage() {
  const router = useRouter();

  // Dữ liệu giả lập cho 1 ly cà phê
  const basePrice = 45000;

  // Các state quản lý lựa chọn của khách hàng
  const [size, setSize] = useState("M"); // Mặc định chọn size M
  const [hasVanilla, setHasVanilla] = useState(false);
  const [hasExtraShot, setHasExtraShot] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Hàm tính toán tổng tiền
  const calculateTotal = () => {
    let total = basePrice;

    // Cộng tiền size
    if (size === "M") total += 5000;
    if (size === "L") total += 10000;

    // Cộng tiền topping
    if (hasVanilla) total += 5000;
    if (hasExtraShot) total += 10000;

    // Nhân với số lượng
    return total * quantity;
  };

  return (
    <div className="min-h-screen bg-[#F9CC8D] max-w-md mx-auto flex flex-col relative shadow-xl overflow-hidden">
      {/* Header với nút Back */}
      <header className="flex justify-between items-center p-6 relative z-10">
        <button
          onClick={() => router.back()} // Hàm của Next.js để quay lại trang trước
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#3E2723]/10 text-[#3E2723] active:scale-95"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-[#3E2723]">BrewLite</h1>
        <div className="w-10"></div> {/* Div rỗng để cân bằng bố cục */}
      </header>

      {/* Ảnh sản phẩm tràn viền (Dùng khối xám giả lập) */}
      <div className="px-6 -mt-6">
        <div className="w-full aspect-[4/3] bg-gray-200 rounded-2xl flex items-center justify-center text-7xl shadow-inner mt-4 mb-6">
          🥛
        </div>
      </div>

      {/* Chi tiết nội dung cuộn được */}
      <div className="px-6 flex-1 overflow-y-auto pb-28">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-3xl font-bold text-[#3E2723]">Flat white</h2>
            <p className="text-[#3E2723] opacity-60 text-sm">
              Smooth & balanced
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[#3E2723]">
              {basePrice.toLocaleString("vi-VN")}đ
            </p>
            <p className="text-[10px] text-[#3E2723] opacity-50 uppercase">
              Base price
            </p>
          </div>
        </div>

        {/* Khối chọn Size */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-[#3E2723] text-lg">Size</h3>
            <p className="text-xs text-[#3E2723] opacity-50">Choose one</p>
          </div>
          <div className="flex gap-3">
            {/* Nút Size S */}
            <button
              onClick={() => setSize("S")}
              className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-colors ${size === "S" ? "border-[#D84315] bg-[#D84315] text-white" : "border-gray-200 bg-white text-[#3E2723]"}`}
            >
              S{" "}
              <span className="block text-[10px] font-normal opacity-80 mt-1">
                Included
              </span>
            </button>
            {/* Nút Size M */}
            <button
              onClick={() => setSize("M")}
              className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-colors ${size === "M" ? "border-[#D84315] bg-[#D84315] text-white" : "border-gray-200 bg-white text-[#3E2723]"}`}
            >
              M{" "}
              <span className="block text-[10px] font-normal opacity-80 mt-1">
                +5.000đ
              </span>
            </button>
            {/* Nút Size L */}
            <button
              onClick={() => setSize("L")}
              className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-colors ${size === "L" ? "border-[#D84315] bg-[#D84315] text-white" : "border-gray-200 bg-white text-[#3E2723]"}`}
            >
              L{" "}
              <span className="block text-[10px] font-normal opacity-80 mt-1">
                +10.000đ
              </span>
            </button>
          </div>
        </div>

        {/* Khối chọn Toppings */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-[#3E2723] text-lg">Toppings</h3>
            <p className="text-xs text-[#3E2723] opacity-50">Optional</p>
          </div>
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-[#D84315]"
                  checked={hasVanilla}
                  onChange={() => setHasVanilla(!hasVanilla)}
                />
                <span className="font-medium text-[#3E2723] text-sm">
                  Vanilla syrup
                </span>
              </div>
              <span className="text-[#3E2723] opacity-60 text-sm">+5.000đ</span>
            </label>

            <label className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-[#D84315]"
                  checked={hasExtraShot}
                  onChange={() => setHasExtraShot(!hasExtraShot)}
                />
                <span className="font-medium text-[#3E2723] text-sm">
                  Extra espresso shot
                </span>
              </div>
              <span className="text-[#3E2723] opacity-60 text-sm">
                +10.000đ
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Bottom Bar (Cố định ở đáy) */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-6 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {/* Bộ tăng giảm số lượng */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center text-[#3E2723] font-bold text-lg active:bg-gray-200 rounded-md transition-colors"
          >
            -
          </button>
          <span className="w-8 text-center font-bold text-[#3E2723]">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 flex items-center justify-center text-[#3E2723] font-bold text-lg active:bg-gray-200 rounded-md transition-colors"
          >
            +
          </button>
        </div>

        {/* Nút Add to Cart + Tổng tiền */}
        <button
          onClick={() => alert(`Đã thêm ${quantity} ly vào giỏ hàng!`)}
          className="bg-[#D84315] text-white font-bold py-3 px-6 rounded-xl active:bg-orange-800 transition-colors flex-1 ml-4 flex justify-between items-center"
        >
          <span>Add to Cart</span>
          <span>{calculateTotal().toLocaleString("vi-VN")}đ</span>
        </button>
      </div>
    </div>
  );
}
export default ProductDetailPage;
