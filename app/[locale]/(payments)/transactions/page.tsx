// 'use client'
// import { TransactionHistory } from "@/components/payment/transaction-history";
// import { Button } from "@/components/ui/button";
// import { DialogHeader } from "@/components/ui/dialog";
// import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
// import { useRouter } from "next/navigation";


// export default function Transactions(){

//      const router = useRouter();

//     // Called when user closes the dialog (click outside, press Esc, etc.)
//     const handleClose = () => {
//         router.back(); // Goes back to /wallet
//     };

//     return (
//         <Dialog open={true} onOpenChange={handleClose}>
//             <DialogContent className="max-w-2xl">
//               <DialogHeader>
//                 <DialogTitle>
//                   Deposits and Withdrawals
//                 </DialogTitle>
//               </DialogHeader>
//               <TransactionHistory />
//             </DialogContent>
//         </Dialog>
            
//     )
// }


'use client'
import { TransactionHistory } from "@/components/payment/transaction-history";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Transactions() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/'); // Close modal
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={handleClose}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl py-6 px-2"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal
      >
        {/* Header with title and close icon */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Deposits and Withdrawals</h2>
          <button
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 pe-3"
            onClick={handleClose}
          >
            <X className="h-5 w-5 cursor-pointer" />
          </button>
        </div>

        {/* Transaction history */}
        <TransactionHistory />

        {/* Optional footer */}
        <div className="flex justify-end mt-4">
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
