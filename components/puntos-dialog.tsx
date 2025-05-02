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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import MonsterAvatar from "./monster-avatar"

interface Miembro {
  id: string
  nombre: string
  puntos: number
}

interface PuntosDialogProps {
  open: boolean
  onClose: () => void
  tipo: "positivo" | "negativo"
  miembros: Miembro[]
  onAsignarPuntos: (accion: string, puntos: number, miembrosIds: string[]) => void
}

export default function PuntosDialog({ open, onClose, tipo, miembros, onAsignarPuntos }: PuntosDialogProps) {
  const [accion, setAccion] = useState("")
  const [puntos, setPuntos] = useState(tipo === "positivo" ? "1" : "-1")
  const [asignacion, setAsignacion] = useState<"todos" | "algunos">("todos")
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState<string[]>([])

  const handleSubmit = () => {
    if (!accion.trim()) {
      alert("Por favor, introduce una acción")
      return
    }

    const puntosNum = Number.parseInt(puntos)
    if (isNaN(puntosNum)) {
      alert("Por favor, introduce un valor numérico válido para los puntos")
      return
    }

    // Determinar a qué miembros asignar los puntos
    const miembrosIds = asignacion === "todos" ? miembros.map((m) => m.id) : miembrosSeleccionados

    if (miembrosIds.length === 0) {
      alert("Por favor, selecciona al menos un miembro")
      return
    }

    // Llamar a la función para asignar puntos
    onAsignarPuntos(accion, puntosNum, miembrosIds)

    // Resetear el estado
    setAccion("")
    setPuntos(tipo === "positivo" ? "1" : "-1")
    setAsignacion("todos")
    setMiembrosSeleccionados([])

    // Cerrar el diálogo
    onClose()
  }

  const toggleMiembro = (id: string) => {
    setMiembrosSeleccionados((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={tipo === "positivo" ? "text-green-600" : "text-red-600"}>
            {tipo === "positivo" ? "Asignar Puntos Positivos" : "Asignar Puntos Negativos"}
          </DialogTitle>
          <DialogDescription>
            {tipo === "positivo"
              ? "Premia a los miembros por sus buenas acciones"
              : "Registra comportamientos a mejorar"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="accion">ACCIÓN</Label>
            <Input
              id="accion"
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              placeholder={tipo === "positivo" ? "Ej: Ayudar a un compañero" : "Ej: Interrumpir la clase"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="puntos">PUNTUACIÓN</Label>
            <Input
              id="puntos"
              type="number"
              value={puntos}
              onChange={(e) => setPuntos(e.target.value)}
              className={tipo === "positivo" ? "text-green-600" : "text-red-600"}
            />
          </div>

          <div className="space-y-2">
            <Label>ASIGNAR A</Label>
            <RadioGroup value={asignacion} onValueChange={(value) => setAsignacion(value as "todos" | "algunos")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="todos" id="todos" />
                <Label htmlFor="todos">Todos los miembros</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="algunos" id="algunos" />
                <Label htmlFor="algunos">Seleccionar miembros específicos</Label>
              </div>
            </RadioGroup>
          </div>

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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className={tipo === "positivo" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
