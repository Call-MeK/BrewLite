import { Trash2, Plus, Minus } from "lucide-react";
import { CartItem as CartItemType } from "@/store/cartStore";

// Khai báo các "ống dẫn" (props) để nhận dữ liệu từ file trang chính truyền vào
interface CartItemProps {
  item: CartItemType;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
}

export default function CartItem({
  item,
  updateQuantity,
  removeItem,
}: CartItemProps) {
  return (
    <div className="flex bg-white p-4 rounded-xl shadow-sm items-center justify-between">
      <div className="flex-1">
        <h3 className="font-bold">{item.name}</h3>
        <p className="text-sm text-gray-500">
          Size: {item.sizeCode}{" "}
          {item.toppingIds && item.toppingIds.length > 0 ? "• Có Topping" : ""}
        </p>
        <p className="font-medium mt-1">
          {item.price.toLocaleString("vi-VN")}đ
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() =>
            updateQuantity(item.id, Math.max(1, item.quantity - 1))
          }
          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-[#D84315]"
        >
          <Minus size={16} />
        </button>

        <span className="font-bold w-4 text-center">{item.quantity}</span>

        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center bg-[#D84315] text-white rounded-full"
        >
          <Plus size={16} />
        </button>

        <button
          onClick={() => removeItem(item.id)}
          className="ml-2 text-red-400 hover:text-red-600 p-2"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
