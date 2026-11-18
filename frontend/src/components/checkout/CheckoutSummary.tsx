import { CartItem } from "@/store/cartStore";

interface OrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
}

export default function OrderSummary({ items, totalPrice }: OrderSummaryProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">Order summary</h2>
        <span className="text-sm text-gray-500">{items.length} items</span>
      </div>

      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div>
              <span className="font-medium">
                {item.quantity}x {item.name}
              </span>
              <p className="text-gray-500 text-xs">
                Size {item.sizeCode}{" "}
                {item.toppingIds && item.toppingIds.length > 0
                  ? "• Có Topping"
                  : ""}
              </p>
            </div>
            <span className="font-medium">
              {(item.price * item.quantity).toLocaleString("vi-VN")}đ
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
        <span>Total</span>
        <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
      </div>
    </div>
  );
}
