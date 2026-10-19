import { create } from "zustand";
import { persist } from "zustand/middleware";

// 1. Định nghĩa "Hình dáng" của 1 món hàng trong giỏ
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  sizeCode: string;
  toppingIds: string[];
}

interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void; // TV3/TV5 dùng khi thanh toán xong
  getTotalItems: () => number; // Lấy tổng số lượng (để hiển thị badge)
  getTotalPrice: () => number; // Lấy tổng tiền (để hiển thị thanh toán)
}

// 3. Khởi tạo "Kho" bằng Zustand
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [
        {
          id: "mock-1",
          productId: "00000000-0000-4000-8000-000000000001",
          name: "Flat white",
          price: 45000,
          quantity: 1,
          sizeCode: "M",
          toppingIds: [],
        },
      ],

      // Thêm món vào giỏ
      addToCart: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === newItem.id,
          );

          if (existingItemIndex !== -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        });
      },

      // Đổi số lượng của 1 món
      updateQuantity: (id, qty) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: qty } : item,
          ),
        }));
      },

      // Xóa 1 món khỏi giỏ
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      // Dọn sạch giỏ hàng
      clearCart: () => {
        set({ items: [] });
      },

      // Hàm tính tổng số lượng món (Ví dụ: 2 ly Flat White = 2)
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Hàm tự động tính tổng tiền giỏ hàng
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "brewlite-cart-v2",
    },
  ),
);
