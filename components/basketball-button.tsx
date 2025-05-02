"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBasketIcon as Basketball, Edit, Star, PlusCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export default function BasketballButton() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleMenuItemClick = (action: string) => {
    setIsOpen(false)

    if (action === "crear") {
      router.push("/crear")
    } else if (action === "favoritos") {
      router.push("/favoritos")
    } else if (action === "editar") {
      router.push("/editar")
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg transition-all hover:shadow-xl flex items-center gap-2"
          >
            <Basketball className="mr-2" />
            PULSA AQUÍ
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white p-2 rounded-lg shadow-xl border-2 border-cyan-300 min-w-[200px]">
          <DropdownMenuItem
            className="cursor-pointer py-3 flex items-center gap-2 text-lg font-semibold hover:bg-cyan-100 focus:bg-cyan-100"
            onClick={() => handleMenuItemClick("editar")}
          >
            <Edit className="text-cyan-600" />
            EDITAR
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer py-3 flex items-center gap-2 text-lg font-semibold hover:bg-cyan-100 focus:bg-cyan-100"
            onClick={() => handleMenuItemClick("favoritos")}
          >
            <Star className="text-cyan-600" />
            FAVORITOS
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer py-3 flex items-center gap-2 text-lg font-semibold hover:bg-cyan-100 focus:bg-cyan-100"
            onClick={() => handleMenuItemClick("crear")}
          >
            <PlusCircle className="text-cyan-600" />
            CREAR
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Instructions */}
      {!isOpen && (
        <p className="text-white animate-pulse mt-4 text-center drop-shadow-lg">
          Haz clic en el botón para ver las opciones
        </p>
      )}
    </div>
  )
}
