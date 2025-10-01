// import { DialogHeader } from "@/components/ui/dialog";
// import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
// import { useEffect, useState } from "react";
// import { WinnerBanner } from "./winner-banner";
// import { GameWinner } from "@/lib/types";


// export interface WinnerDialohProps{
//     showResult: boolean
//     resultMessage?: string
//     onClose: () => void
//     winner: GameWinner
// }
// export function WinnerDialog({showResult, resultMessage, onClose, winner}: WinnerDialohProps){

//     const [open, setOpen] = useState(false)

//     useEffect(()=>{
//         if(showResult){
//             setOpen(true)

//             const timer = setTimeout(()=>{

//                 setOpen(false)
//                 onClose?.()
//             }, 5000)

//             return () => clearTimeout(timer)
//         }

//     }, [showResult, onClose])

//     return (
//         <Dialog open={open} onOpenChange={setOpen}>
//           {/* <DialogTrigger asChild>
//             <Button variant="outline" size="sm">
//               <span className="hidden sm:inline">Game Result</span>
//             </Button>
//           </DialogTrigger> */}
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>
//                 Game Result
//               </DialogTitle>
//             </DialogHeader>
//                <WinnerBanner winner={winner} />
//           </DialogContent>
//       </Dialog>
//     )
// }


"use client"

import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog"
import { useEffect, useState } from "react"
import { WinnerBanner } from "./winner-banner"
import { GameWinner } from "@/lib/types"

interface WinnerDialogProps {
  showResult: boolean
  onClose: () => void
  winner: GameWinner
}

export function WinnerDialog({ showResult, onClose, winner }: WinnerDialogProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (showResult) {
      setOpen(true)

      const timer = setTimeout(() => {
        setOpen(false)
        onClose?.()
      }, 5000) // Auto-close after 5s

      return () => clearTimeout(timer)
    }
  }, [showResult, onClose])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="
          fixed left-1/2 top-1/2 
          -translate-x-1/2 -translate-y-1/2
          w-80 sm:w-96 max-w-full
          rounded-2xl shadow-lg
          bg-white dark:bg-gray-900
          p-6
          flex flex-col items-center
          text-center
          z-50
        "
      >
        <DialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-primary dark:text-primary-foreground">
          🎉 Game Result 🎉
        </DialogTitle>

        <WinnerBanner winner={winner} />
      </DialogContent>
    </Dialog>
  )
}
