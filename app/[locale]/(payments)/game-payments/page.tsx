'use client'
import { GameTransactionHistory } from "@/components/payment/game-transaction-history";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";


export default function GameHistoryModal() {

  const router = useRouter()

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={handleClose}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl p-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal
      >
        {/* Header with title and close icon */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Game fees and prizes</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal content */}
        <GameTransactionHistory />

        {/* Optional footer */}
        <div className="flex justify-end mt-4">
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
