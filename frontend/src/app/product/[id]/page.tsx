"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductImage from "@/components/ui/ProductImage";
import { ApiError, getProductById, type ProductDetail, type SizeCode } from "@/lib/api";
import { calculateProductTotal } from "@/lib/product-price";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductDetailContent key={id} id={id} />;
}

function ProductDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [pageState, setPageState] = useState<"loading" | "success" | "error" | "not-found">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [size, setSize] = useState<SizeCode>("M");
  const [toppingIds, setToppingIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    getProductById(id, { signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      setProduct(data);
      setSize(data.sizes.find((option) => option.code === "M")?.code ?? data.sizes[0]?.code ?? "S");
      setToppingIds([]);
      setPageState("success");
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
        setPageState("not-found");
        return;
      }
      setErrorMessage(error instanceof ApiError ? error.message : "Không thể tải sản phẩm. Vui lòng thử lại.");
      setPageState("error");
    });
    return () => controller.abort();
  }, [id, attempt]);

  function retry() {
    setPageState("loading");
    setAttempt((previous) => previous + 1);
  }

  return (
    <div className="min-h-screen bg-[#F9CC8D] max-w-md mx-auto flex flex-col relative shadow-xl overflow-hidden">
      <header className="flex justify-between items-center p-6 relative z-10">
        <button onClick={() => router.back()} aria-label="Quay lại" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#3E2723]/10 text-[#3E2723] active:scale-95">←</button>
        <h1 className="text-xl font-bold text-[#3E2723]">BrewLite</h1>
        <div className="w-10" />
      </header>

      {pageState === "loading" && (
        <div role="status" aria-label="Đang tải sản phẩm" className="px-6 animate-pulse">
          <div className="aspect-[4/3] bg-gray-200 rounded-2xl mb-6" />
          <div className="h-8 bg-white/60 rounded-xl w-3/4 mb-3" />
          <div className="h-4 bg-white/60 rounded-xl w-1/2" />
        </div>
      )}

      {pageState === "not-found" && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24 text-center text-[#3E2723]">
          <h2 className="text-xl font-bold mb-3">Không tìm thấy sản phẩm</h2>
          <p className="text-sm opacity-60 mb-8">Món này không có trong menu hiện tại.</p>
          <Link href="/menu" className="bg-[#D84315] text-white font-bold py-3 px-8 rounded-xl">Về menu</Link>
        </div>
      )}

      {pageState === "error" && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24 text-center text-[#3E2723]">
          <h2 className="text-xl font-bold mb-3">Oops, có lỗi xảy ra!</h2>
          <p role="alert" className="text-sm opacity-60 mb-8">{errorMessage}</p>
          <button onClick={retry} className="bg-[#D84315] text-white font-bold py-3 px-8 rounded-xl active:bg-orange-800">Thử lại</button>
        </div>
      )}

      {pageState === "success" && product && (
        <>
          <div className="px-6 -mt-6">
            <div className="relative w-full aspect-[4/3] bg-gray-200 rounded-2xl flex items-center justify-center shadow-inner mt-4 mb-6 overflow-hidden">
              <ProductImage key={product.imageUrl} src={product.imageUrl} alt={product.name} sizes="(max-width: 448px) 100vw, 400px" />
            </div>
          </div>

          <div className="px-6 flex-1 overflow-y-auto pb-28">
            <div className="flex justify-between items-start mb-2 gap-3">
              <div>
                <h2 className="text-3xl font-bold text-[#3E2723]">{product.name}</h2>
                <p className="text-[#3E2723] opacity-60 text-sm">{product.description}</p>
                {!product.isAvailable && <p className="mt-2 text-sm font-bold text-[#D84315]">Tạm hết</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-[#3E2723]">{product.basePrice.toLocaleString("vi-VN")}đ</p>
                <p className="text-[10px] text-[#3E2723] opacity-50 uppercase">Base price</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-end mb-3">
                <h3 className="font-bold text-[#3E2723] text-lg">Size</h3>
                <p className="text-xs text-[#3E2723] opacity-50">Choose one</p>
              </div>
              <div className="flex gap-3">
                {product.sizes.map((option) => (
                  <button key={option.code} onClick={() => setSize(option.code)} aria-pressed={size === option.code} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-colors ${size === option.code ? "border-[#D84315] bg-[#D84315] text-white" : "border-gray-200 bg-white text-[#3E2723]"}`}>
                    {option.code}
                    <span className="block text-[10px] font-normal opacity-80 mt-1">{option.priceDelta ? `+${option.priceDelta.toLocaleString("vi-VN")}đ` : "Included"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-end mb-3">
                <h3 className="font-bold text-[#3E2723] text-lg">Toppings</h3>
                <p className="text-xs text-[#3E2723] opacity-50">Optional</p>
              </div>
              <div className="flex flex-col gap-3">
                {product.toppings.length === 0 && <p className="text-sm text-[#3E2723] opacity-60">Món này chưa có topping.</p>}
                {product.toppings.map((topping) => (
                  <label key={topping.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer active:scale-[0.98] transition-transform">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="w-5 h-5 accent-[#D84315]" checked={toppingIds.includes(topping.id)} onChange={(event) => setToppingIds((selected) => event.target.checked ? [...selected, topping.id] : selected.filter((value) => value !== topping.id))} />
                      <span className="font-medium text-[#3E2723] text-sm">{topping.name}</span>
                    </div>
                    <span className="text-[#3E2723] opacity-60 text-sm">+{topping.price.toLocaleString("vi-VN")}đ</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-6 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Giảm số lượng" className="w-8 h-8 flex items-center justify-center text-[#3E2723] font-bold text-lg active:bg-gray-200 rounded-md transition-colors">-</button>
              <span className="w-8 text-center font-bold text-[#3E2723]">{quantity}</span>
              <button onClick={() => setQuantity((value) => value + 1)} aria-label="Tăng số lượng" className="w-8 h-8 flex items-center justify-center text-[#3E2723] font-bold text-lg active:bg-gray-200 rounded-md transition-colors">+</button>
            </div>
            <button onClick={() => alert(`Đã thêm ${quantity} ly vào giỏ hàng!`)} disabled={!product.isAvailable || product.sizes.length === 0} className="bg-[#D84315] text-white font-bold py-3 px-6 rounded-xl active:bg-orange-800 transition-colors flex-1 ml-4 flex justify-between items-center disabled:bg-gray-300 disabled:cursor-not-allowed">
              <span>Add to Cart</span>
              <span>{calculateProductTotal(product, size, toppingIds, quantity).toLocaleString("vi-VN")}đ</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
