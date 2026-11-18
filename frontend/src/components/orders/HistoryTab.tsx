export default function HistoryTab() {
  return (
    <div className="space-y-4">
      {/* Đơn hàng 1 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Order #1038</h3>
          <span className="text-xs text-gray-400">Oct 12, 14:30</span>
        </div>
        <p className="text-xs text-gray-500 mb-4 truncate">
          2 items: Flat white, Espresso...
        </p>
        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
          <span className="font-bold text-lg">75.000đ</span>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded-full tracking-wider">
              Completed
            </span>
            <button className="text-[#D84315] text-xs font-bold flex items-center gap-1 hover:underline">
              ↺ Reorder
            </button>
          </div>
        </div>
      </div>

      {/* Đơn hàng 2 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Order #1032</h3>
          <span className="text-xs text-gray-400">Oct 10, 08:15</span>
        </div>
        <p className="text-xs text-gray-500 mb-4 truncate">
          1 item: Cappuccino
        </p>
        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
          <span className="font-bold text-lg">45.000đ</span>
          <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded-full tracking-wider">
            Completed
          </span>
        </div>
      </div>

      {/* Đơn hàng 3 */}
      <div className="bg-white rounded-xl p-4 shadow-sm opacity-70">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Order #1021</h3>
          <span className="text-xs text-gray-400">Oct 08, 19:00</span>
        </div>
        <p className="text-xs text-gray-500 mb-4 truncate">
          2 items: Americano, Peach Tea
        </p>
        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
          <span className="font-bold text-lg text-gray-500">79.000đ</span>
          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-full tracking-wider">
            Cancelled
          </span>
        </div>
      </div>
    </div>
  );
}
