"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, getProducts, type Product } from "@/lib/api";
import ProductImage from "@/components/ui/ProductImage";

function MenuPage() {
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [pageState, setPageState] = useState<"loading" | "error" | "empty" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };
  useEffect(() => {
    const controller = new AbortController();
    getProducts({ signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      setProducts(data);
      setPageState(data.length ? "success" : "empty");
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải menu. Vui lòng thử lại.");
      setPageState("error");
    });
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setPageState("loading");
    setAttempt((previous) => previous + 1);
  }
  return (
    <div className="min-h-screen bg-[#F9CC8D] max-w-md mx-auto relative shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 pb-2">
        {/* Thông tin User */}
        <div className="flex items-center gap-3">
          {/* Avatar (Dùng chữ cái đầu làm hình đại diện) */}
          <div className="w-10 h-10 rounded-full bg-[#D84315]/10 flex items-center justify-center text-[#D84315] font-bold text-lg">
            B
          </div>

          {/* Lời chào & Tên */}
          <div className="flex flex-col">
            <p className="text-[10px] font-bold text-[#D84315] uppercase tracking-wider">
              BrewLite
            </p>
            <h1 className="text-lg font-bold text-[#3E2723]">Chào bạn 👋</h1>
          </div>
        </div>

        {/* Nút Giỏ hàng */}
        <button aria-label="Giỏ hàng" className="p-2 bg-white rounded-full shadow-sm border border-[#3E2723]/10 relative active:scale-95 transition-transform">
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
        <div role="status" aria-label="Đang tải menu" className="grid grid-cols-2 gap-4 px-6 pb-24 overflow-y-auto">
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
          <p role="alert" className="text-sm text-[#3E2723] opacity-60 mb-8">
            {errorMessage}
          </p>
          <button
            onClick={retry}
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
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-3 flex flex-col shadow-sm border border-orange-50 relative"
            >
              <Link
                href={`/product/${product.id}`}
                className={!product.isAvailable ? "pointer-events-none" : ""}
              >
                <div className="relative aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center text-5xl overflow-hidden">
                  <ProductImage
                    key={product.imageUrl}
                    src={product.imageUrl}
                    alt={product.name}
                    sizes="(max-width: 448px) 50vw, 180px"
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
                    {product.description}
                  </p>
                  <p className="font-bold text-[#3E2723] text-sm">
                    {product.basePrice.toLocaleString("vi-VN")}đ
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

    </div>
  );
}
export default MenuPage;
