"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GrupoInterno {
  id: string
  nombre: string
  miembrosIds: string[]
}

interface Accion {
  id: string
  tipo: "positivo" | "negativo"
  descripcion: string
  puntos: number
}

interface PuntosGrupoDialogProps {
  open: boolean
  onClose: () => void
  grupo: GrupoInterno
  acciones: Accion[]
  onAsignarPuntos: (accionId: string) => void
}

export default function PuntosGrupoDialog({ open, onClose, grupo, acciones, onAsignarPuntos }: PuntosGrupoDialogProps) {
  const [accionSeleccionada, setAccionSeleccionada] = useState<string | null>(null)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<"positivo" | "negativo">("positivo")

  const handleSeleccionarAccion = (accionId: string) => {
    setAccionSeleccionada(accionId)
  }

  const handleAsignarPuntos = () => {
    if (!accionSeleccionada) return
    onAsignarPuntos(accionSeleccionada)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Puntos al Grupo: {grupo.nombre}</DialogTitle>
          <DialogDescription>
            Selecciona una acción para asignar puntos a todos los miembros del grupo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2 my-4">
          <Button
            variant={tipoSeleccionado === "positivo" ? "default" : "outline"}
            onClick={() => setTipoSeleccionado("positivo")}
            className={tipoSeleccionado === "positivo" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            Acciones Positivas
          </Button>
          <Button
            variant={tipoSeleccionado === "negativo" ? "default" : "outline"}
            onClick={() => setTipoSeleccionado("negativo")}
            className={tipoSeleccionado === "negativo" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            Acciones Negativas
          </Button>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 py-4">
            {acciones.filter((a) => a.tipo === tipoSeleccionado).length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No hay acciones {tipoSeleccionado === "positivo" ? "positivas" : "negativas"} definidas. Crea algunas en
                la sección de Editar.
              </p>
            ) : (
              <div className="space-y-2">
                {acciones
                  .filter((a) => a.tipo === tipoSeleccionado)
                  .map((accion) => (
                    <Button
                      key={accion.id}
                      variant="outline"
                      className={`w-full justify-between text-left p-4 h-auto ${
                        accionSeleccionada === accion.id
                          ? tipoSeleccionado === "positivo"
                            ? "bg-green-50 border-green-300"
                            : "bg-red-50 border-red-300"
                          : tipoSeleccionado === "positivo"
                            ? "hover:bg-green-50 hover:border-green-200"
                            : "hover:bg-red-50 hover:border-red-200"
                      }`}
                      onClick={() => handleSeleccionarAccion(accion.id)}
                    >
                      <span className="font-medium">{accion.descripcion}</span>
                      <span
                        className={`font-bold ${
                          tipoSeleccionado === "positivo" ? "text-green-600" : "text-red-600"
                        } ml-2 px-2 py-1 rounded-full ${tipoSeleccionado === "positivo" ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {accion.puntos > 0 ? `+${accion.puntos}` : accion.puntos}
                      </span>
                    </Button>
                  ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {accionSeleccionada && (
            <Button
              onClick={handleAsignarPuntos}
              className={
                tipoSeleccionado === "positivo" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              Asignar a Todo el Grupo
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
