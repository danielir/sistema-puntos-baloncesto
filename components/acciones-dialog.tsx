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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import MonsterAvatar from "./monster-avatar"

interface Accion {
  id: string
  tipo: "positivo" | "negativo"
  descripcion: string
  puntos: number
}

interface Miembro {
  id: string
  nombre: string
  puntos: number
}

interface AccionesDialogProps {
  open: boolean
  onClose: () => void
  tipo: "positivo" | "negativo"
  acciones: Accion[]
  miembros: Miembro[]
  onSeleccionarAccion: (accionId: string, miembrosIds: string[]) => void
}

export default function AccionesDialog({
  open,
  onClose,
  tipo,
  acciones,
  miembros,
  onSeleccionarAccion,
}: AccionesDialogProps) {
  const [accionSeleccionada, setAccionSeleccionada] = useState<string | null>(null)
  const [asignacion, setAsignacion] = useState<"todos" | "algunos">("todos")
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState<string[]>([])

  const handleSeleccionarAccion = (accionId: string) => {
    setAccionSeleccionada(accionId)
  }

  const handleAsignarAccion = () => {
    if (!accionSeleccionada) return

    // Determinar a qué miembros asignar la acción
    const miembrosIds = asignacion === "todos" ? miembros.map((m) => m.id) : miembrosSeleccionados

    if (miembrosIds.length === 0) {
      alert("Por favor, selecciona al menos un miembro")
      return
    }

    // Llamar a la función para asignar la acción
    onSeleccionarAccion(accionSeleccionada, miembrosIds)

    // Resetear el estado
    setAccionSeleccionada(null)
    setAsignacion("todos")
    setMiembrosSeleccionados([])
  }

  const toggleMiembro = (id: string) => {
    setMiembrosSeleccionados((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={tipo === "positivo" ? "text-green-600" : "text-red-600"}>
            {tipo === "positivo" ? "Seleccionar Acción Positiva" : "Seleccionar Acción Negativa"}
          </DialogTitle>
          <DialogDescription>
            {tipo === "positivo"
              ? "Selecciona una acción positiva para asignar puntos"
              : "Selecciona una acción negativa para restar puntos"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 py-4">
            {acciones.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No hay acciones {tipo === "positivo" ? "positivas" : "negativas"} definidas. Crea algunas en la sección
                de Editar.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  {acciones.map((accion) => (
                    <Button
                      key={accion.id}
                      variant="outline"
                      className={`w-full justify-between text-left p-4 h-auto ${
                        accionSeleccionada === accion.id
                          ? tipo === "positivo"
                            ? "bg-green-50 border-green-300"
                            : "bg-red-50 border-red-300"
                          : tipo === "positivo"
                            ? "hover:bg-green-50 hover:border-green-200"
                            : "hover:bg-red-50 hover:border-red-200"
                      }`}
                      onClick={() => handleSeleccionarAccion(accion.id)}
                    >
                      <span className="font-medium">{accion.descripcion}</span>
                      <span
                        className={`font-bold ${
                          tipo === "positivo" ? "text-green-600" : "text-red-600"
                        } ml-2 px-2 py-1 rounded-full ${tipo === "positivo" ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {accion.puntos > 0 ? `+${accion.puntos}` : accion.puntos}
                      </span>
                    </Button>
                  ))}
                </div>

                {accionSeleccionada && (
                  <div className="mt-6 space-y-4 border-t pt-4">
                    <h3 className="font-medium">Asignar a:</h3>
                    <RadioGroup
                      value={asignacion}
                      onValueChange={(value) => setAsignacion(value as "todos" | "algunos")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="todos" id="todos" />
                        <Label htmlFor="todos">Todos los miembros</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="algunos" id="algunos" />
                        <Label htmlFor="algunos">Seleccionar miembros específicos</Label>
                      </div>
                    </RadioGroup>

                    {asignacion === "algunos" && (
                      <div className="space-y-2 border rounded-md p-3 max-h-60 overflow-y-auto">
                        <Label className="block mb-2">Selecciona los miembros:</Label>
                        <div className="space-y-2">
                          {miembros.map((miembro) => (
                            <div key={miembro.id} className="flex items-center space-x-3">
                              <Checkbox
                                id={miembro.id}
                                checked={miembrosSeleccionados.includes(miembro.id)}
                                onCheckedChange={() => toggleMiembro(miembro.id)}
                              />
                              <div className="flex items-center space-x-2">
                                <MonsterAvatar seed={miembro.id + miembro.nombre} name="" size="sm" showName={false} />
                                <Label htmlFor={miembro.id}>{miembro.nombre}</Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {accionSeleccionada && (
            <Button
              onClick={handleAsignarAccion}
              className={tipo === "positivo" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              Asignar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
