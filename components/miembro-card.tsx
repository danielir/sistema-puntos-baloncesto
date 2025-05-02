"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MonsterAvatar from "./monster-avatar"
import { ThumbsUp, ThumbsDown, Award } from "lucide-react"
import AccionesDialog from "./acciones-dialog"
import AccionesConseguidasDialog from "./acciones-conseguidas-dialog"

interface Miembro {
  id: string
  nombre: string
  puntos: number
  logros?: string[]
}

interface Accion {
  id: string
  tipo: "positivo" | "negativo"
  descripcion: string
  puntos: number
}

interface MiembroCardProps {
  miembro: Miembro
  miembros: Miembro[]
  acciones: Accion[]
  onAsignarAccion: (accionId: string, miembrosIds: string[]) => void
  onAsignarLogro: (miembroId: string, logro: string) => void
}

export default function MiembroCard({
  miembro,
  miembros,
  acciones,
  onAsignarAccion,
  onAsignarLogro,
}: MiembroCardProps) {
  const [showButtons, setShowButtons] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTipo, setDialogTipo] = useState<"positivo" | "negativo">("positivo")
  const [accionesConseguidasOpen, setAccionesConseguidasOpen] = useState(false)

  const handleClick = () => {
    setShowButtons(!showButtons)
  }

  const openDialog = (tipo: "positivo" | "negativo") => {
    setDialogTipo(tipo)
    setDialogOpen(true)
  }

  return (
    <>
      <Card
        className={`p-4 flex flex-col items-center transition-all duration-300 ${
          showButtons ? "bg-indigo-50" : "bg-white"
        } shadow-md hover:shadow-lg`}
      >
        <div onClick={handleClick} className="w-full flex flex-col items-center cursor-pointer">
          <MonsterAvatar seed={miembro.id + miembro.nombre} name={miembro.nombre} size="lg" puntos={miembro.puntos} />
          {miembro.logros && miembro.logros.length > 0 && (
            <div className="mt-2 flex">
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center">
                <Award className="h-3 w-3 mr-1" /> {miembro.logros.length}
              </span>
            </div>
          )}
        </div>

        {showButtons && (
          <div className="flex flex-col gap-2 mt-4 w-full">
            <div className="flex gap-2 w-full">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => openDialog("positivo")}>
                <ThumbsUp className="mr-1 h-4 w-4" /> POSITIVO
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => openDialog("negativo")}>
                <ThumbsDown className="mr-1 h-4 w-4" /> NEGATIVO
              </Button>
            </div>
            <Button className="w-full bg-amber-500 hover:bg-amber-600" onClick={() => setAccionesConseguidasOpen(true)}>
              <Award className="mr-1 h-4 w-4" /> ACCIONES CONSEGUIDAS
            </Button>
          </div>
        )}
      </Card>

      <AccionesDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        tipo={dialogTipo}
        acciones={acciones.filter((accion) => accion.tipo === dialogTipo)}
        miembros={miembros}
        onSeleccionarAccion={(accionId, miembrosIds) => {
          onAsignarAccion(accionId, miembrosIds)
          setDialogOpen(false)
        }}
      />

      <AccionesConseguidasDialog
        open={accionesConseguidasOpen}
        onClose={() => setAccionesConseguidasOpen(false)}
        miembro={miembro}
        onAsignarLogro={onAsignarLogro}
      />
    </>
  )
}
