"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Import 2 mảnh ghép vừa tạo
import ProcessingTab from "@/components/orders/ProcessingTab";
import HistoryTab from "@/components/orders/HistoryTab";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"processing" | "history">(
    "processing",
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F9CC8D] p-4 text-[#3E2723] max-w-md mx-auto shadow-2xl border-x border-gray-200">
      {/* Header */}
      <div className="flex items-center mb-6 relative justify-center">
        <Link
          href="/"
          className="absolute left-0 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">My Orders</h1>
      </div>

      {/* Nút chuyển Tab */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm mb-6">
        <button
          onClick={() => setActiveTab("processing")}
          className={`flex-1 py-2 text-center rounded-lg font-medium text-sm transition-colors ${
            activeTab === "processing"
              ? "bg-[#D84315] text-white shadow"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Processing
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 text-center rounded-lg font-medium text-sm transition-colors ${
            activeTab === "history"
              ? "bg-[#D84315] text-white shadow"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          History
        </button>
      </div>

      {/* Render Component theo Tab */}
      <div className="flex-1">
        {activeTab === "processing" ? <ProcessingTab /> : <HistoryTab />}
      </div>

      <p className="text-center text-[10px] text-gray-400 mt-auto pt-6 pb-2">
        A little coffee. A little calm.
      </p>
    </div>
  );
}
