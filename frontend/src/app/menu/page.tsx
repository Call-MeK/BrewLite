"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

// Dữ liệu TEXT
export const mockProducts = [
  {
    id: 1,
    name: "Espresso",
    desc: "Rich & bold",
    price: 30000,
    // Link ảnh thật từ Unsplash
    imageUrl:
      "https://images.unsplash.com/photo-1502462041640-b3d7e50d0662?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",

    isAvailable: true,
  },
  {
    id: 2,
    name: "Flat white",
    desc: "Smooth & balanced",
    price: 45000,
    imageUrl:
      "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=400&q=80",
    isAvailable: true,
  },
  {
    id: 3,
    name: "Cappuccino",
    desc: "Soft & velvety",
    price: 45000,
    imageUrl:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=400&q=80",
    isAvailable: true,
  },
  {
    id: 4,
    name: "Iced latte",
    desc: "Cool & creamy",
    price: 50000,
    // Thử làm hỏng link này để test tính năng lỗi ảnh
    imageUrl:
      "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=400&q=80",
    isAvailable: false,
  },
];

function MenuPage() {
  const [cartCount, setCartCount] = useState(0);
  // Trạng thái của toàn bộ trang (loading | error | empty | success)
  const [pageState, setPageState] = useState("loading");
  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };
  // Giả lập gọi API: Chờ 1.5 giây để thấy được hiệu ứng Loading Skeleton
  useEffect(() => {
    const fetchData = () => {
      setPageState("loading");
      setTimeout(() => {
        setPageState("success"); // Đổi chữ "success" thành "error" hoặc "empty" để test các màn hình khác
      }, 1500);
    };
    fetchData();
  }, []);
  return (
    <div className="min-h-screen bg-[#F9CC8D] max-w-md mx-auto relative shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 pb-2">
        {/* Thông tin User */}
        <div className="flex items-center gap-3">
          {/* Avatar (Dùng chữ cái đầu làm hình đại diện) */}
          <div className="w-10 h-10 rounded-full bg-[#D84315]/10 flex items-center justify-center text-[#D84315] font-bold text-lg">
            A
          </div>

          {/* Lời chào & Tên */}
          <div className="flex flex-col">
            <p className="text-[10px] font-bold text-[#D84315] uppercase tracking-wider">
              BrewLite
            </p>
            <h1 className="text-lg font-bold text-[#3E2723]">Chào An 👋</h1>
          </div>
        </div>

        {/* Nút Giỏ hàng */}
        <button className="p-2 bg-white rounded-full shadow-sm border border-[#3E2723]/10 relative active:scale-95 transition-transform">
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#D84315] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* Slogan */}
      <div className="px-6 mb-6 flex flex-col m-auto">
        <h2 className="text-xl font-bold text-[#3E2723]">A little coffee.</h2>
        <p className="text-sm text-[#3E2723] opacity-70 mt-1">
          Your favorites, freshly brewed.
        </p>
      </div>

      {/* 1. TRẠNG THÁI ĐANG TẢI (LOADING SKELETON) */}
      {pageState === "loading" && (
        <div className="grid grid-cols-2 gap-4 px-6 pb-24 overflow-y-auto">
          {[1, 2, 3, 4].map((skeleton) => (
            <div
              key={skeleton}
              className="bg-white rounded-2xl p-3 flex flex-col shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
              <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2 mt-1"></div>
              <div className="h-3 bg-gray-200 rounded-full w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded-full w-1/3 mb-4"></div>
              <div className="h-9 bg-gray-200 rounded-lg w-full"></div>
            </div>
          ))}
        </div>
      )}
      {/* 2. TRẠNG THÁI LỖI (ERROR) */}
      {pageState === "error" && (
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center pb-24">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm text-red-500 mb-6 border border-gray-100">
            <span className="text-3xl font-bold">!</span>
          </div>
          <h3 className="text-xl font-bold text-[#3E2723] mb-3">
            Oops, có lỗi xảy ra!
          </h3>
          <p className="text-sm text-[#3E2723] opacity-60 mb-8">
            Chúng tôi đang gặp vấn đề khi tải menu. Hãy thử lại để tiếp tục đặt
            hàng nhé.
          </p>
          <button
            onClick={() => setPageState("loading")} // Nút thử lại
            className="bg-[#D84315] text-white font-bold py-3 px-8 rounded-xl active:bg-orange-800 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 3. TRẠNG THÁI TRỐNG (EMPTY) */}
      {pageState === "empty" && (
        <div className="flex flex-col items-center justify-center flex-1 px-8 text-center pb-24">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 mb-6 border border-gray-100">
            <span className="text-3xl font-bold">📖</span>
          </div>
          <h3 className="text-xl font-bold text-[#3E2723] mb-3">
            Menu chưa có món
          </h3>
          <p className="text-sm text-[#3E2723] opacity-60">
            BrewLite chưa thêm món vào menu.
            <br />
            Bạn ghé lại sau để chọn món yêu thích nhé.
          </p>
        </div>
      )}

      {/* 4. TRẠNG THÁI CÓ DỮ LIỆU (SUCCESS) & HẾT MÓN */}
      {pageState === "success" && (
        <div className="grid grid-cols-2 gap-4 px-6 pb-24 overflow-y-auto">
          {mockProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-3 flex flex-col shadow-sm border border-orange-50 relative"
            >
              <Link
                href={`/product/${product.id}`}
                className={!product.isAvailable ? "pointer-events-none" : ""}
              >
                <div className="relative aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center text-5xl overflow-hidden">
                  {/* {product.image} */}
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill // Thuộc tính yêu cầu ảnh tự động co giãn lấp đầy thẻ div cha
                    priority
                    sizes="(max-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      // Xử lý thay thế ảnh lỗi đặc thù cho thẻ Image của Next.js
                      e.currentTarget.srcset = "";
                      e.currentTarget.src =
                        "https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image";
                    }}
                  />
                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <span className="font-bold  text-black text-xl tracking-wide">
                        tạm hết
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-[#3E2723]">{product.name}</h3>
                  <p className="text-[11px] text-[#3E2723] opacity-60 mb-2">
                    {product.desc}
                  </p>
                  <p className="font-bold text-[#3E2723] text-sm">
                    {product.price.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </Link>

              {/* Disable Button */}
              <button
                className={`mt-3 w-full text-sm font-bold py-2 rounded-lg transition-colors z-20 ${
                  product.isAvailable
                    ? "bg-[#D84315] text-white active:bg-orange-800" // Món còn hàng
                    : "bg-gray-200 text-white cursor-not-allowed" // Món hết hàng
                }`}
                onClick={handleAddToCart}
                disabled={!product.isAvailable} // Khóa nút
              >
                Add to cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer nhỏ ở dưới cùng */}
      <div className="absolute bottom-2 left-0 w-full flex justify-center gap-2 p-2 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <button
          onClick={() => setPageState("loading")}
          className="text-[10px] bg-gray-200 px-2 py-1 rounded"
        >
          Test Loading
        </button>
        <button
          onClick={() => setPageState("error")}
          className="text-[10px] bg-red-200 px-2 py-1 rounded"
        >
          Test Error
        </button>
        <button
          onClick={() => setPageState("empty")}
          className="text-[10px] bg-yellow-200 px-2 py-1 rounded"
        >
          Test Empty
        </button>
        <button
          onClick={() => setPageState("success")}
          className="text-[10px] bg-green-200 px-2 py-1 rounded"
        >
          Test Success
        </button>
      </div>
    </div>
  );
}
export default MenuPage;
