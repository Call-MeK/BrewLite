import { Wallet, CreditCard } from "lucide-react";

interface PaymentMethodsProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

export default function PaymentMethods({
  paymentMethod,
  setPaymentMethod,
}: PaymentMethodsProps) {
  return (
    <div className="mb-8">
      <h2 className="font-bold mb-3">Payment Method</h2>
      <div className="space-y-3">
        {/* Tùy chọn: Ví điện tử */}
        <label
          className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "WALLET" ? "border-[#D84315] bg-orange-50" : "border-gray-200 bg-white"}`}
        >
          <Wallet
            className={`${paymentMethod === "WALLET" ? "text-[#D84315]" : "text-gray-500"} mr-3`}
          />
          <div className="flex-1">
            <p className="font-bold">Ví điện tử</p>
            <p className="text-xs text-gray-500">Thanh toán qua Momo/ZaloPay</p>
          </div>
          <input
            type="radio"
            name="payment"
            value="WALLET"
            checked={paymentMethod === "WALLET"}
            onChange={() => setPaymentMethod("WALLET")}
            className="w-5 h-5 accent-[#D84315]"
          />
        </label>

        {/* Tùy chọn: Thẻ ngân hàng */}
        <label
          className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "CARD" ? "border-[#D84315] bg-orange-50" : "border-gray-200 bg-white"}`}
        >
          <CreditCard
            className={`${paymentMethod === "CARD" ? "text-[#D84315]" : "text-gray-500"} mr-3`}
          />
          <div className="flex-1">
            <p className="font-bold">Thẻ ngân hàng</p>
            <p className="text-xs text-gray-500">Thẻ ATM nội địa / Visa</p>
          </div>
          <input
            type="radio"
            name="payment"
            value="CARD"
            checked={paymentMethod === "CARD"}
            onChange={() => setPaymentMethod("CARD")}
            className="w-5 h-5 accent-[#D84315]"
          />
        </label>
      </div>
    </div>
  );
}
