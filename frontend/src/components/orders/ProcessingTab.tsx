import { QrCode } from "lucide-react";

export default function ProcessingTab() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-lg font-bold">Order #1042</h2>
        <span className="text-xs font-bold text-gray-400">PAID</span>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-[#D84315] animate-pulse"></span>
        <span className="text-[#D84315] text-sm font-medium">Preparing...</span>
      </div>

      <p className="text-xs text-gray-500 mb-6 pb-6 border-b border-gray-100">
        Your coffee is being freshly brewed.
      </p>

      <div className="flex justify-between mb-6">
        <div className="flex-1 pr-2">
          <p className="font-bold text-sm mb-1">1x Flat white</p>
          <p className="text-xs text-gray-500 mb-2">Medium · Vanilla syrup</p>
          <p className="font-medium text-sm">45.000đ</p>
        </div>
        <div className="flex-1 pl-2 border-l border-gray-100">
          <p className="font-bold text-sm mb-1">1x Espresso</p>
          <p className="text-xs text-gray-500 mb-2">Small · No toppings</p>
          <p className="font-medium text-sm">30.000đ</p>
        </div>
      </div>

      <div className="flex justify-between items-center font-bold text-lg mb-8">
        <span>Total</span>
        <span>75.000đ</span>
      </div>

      {/* QR Code Mẫu */}
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
        <p className="font-bold mb-4">Pickup code</p>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-2">
          <QrCode size={80} className="text-gray-800" />
        </div>
        <p className="text-[10px] text-gray-400 font-medium tracking-wider">
          SAMPLE
        </p>
        <p className="text-[11px] text-gray-400 mt-2 text-center">
          Demo only · Not scannable
          <br />
          Collect at the counter when your coffee is ready.
        </p>
      </div>
    </div>
  );
}
