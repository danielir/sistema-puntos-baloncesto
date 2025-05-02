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

interface CrearAccionDialogProps {
  open: boolean
  onClose: () => void
  tipo: "positivo" | "negativo"
  miembros: Miembro[]
  onGuardarAccion: (descripcion: string, puntos: number, aplicarA?: "todos" | "algunos", miembrosIds?: string[]) => void
}

export default function CrearAccionDialog({ open, onClose, tipo, miembros, onGuardarAccion }: CrearAccionDialogProps) {
  const [descripcion, setDescripcion] = useState("")
  const [puntos, setPuntos] = useState(tipo === "positivo" ? "1" : "-1")
  const [mostrarSeleccion, setMostrarSeleccion] = useState(false)
  const [asignacion, setAsignacion] = useState<"todos" | "algunos">("todos")
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState<string[]>([])

  const handleSubmit = () => {
    if (!descripcion.trim()) {
      alert("Por favor, introduce una descripción para la acción")
      return
    }

    const puntosNum = Number.parseInt(puntos)
    if (isNaN(puntosNum)) {
      alert("Por favor, introduce un valor numérico válido para los puntos")
      return
    }

    // Validar que los puntos sean positivos para acciones positivas y negativos para acciones negativas
    if ((tipo === "positivo" && puntosNum <= 0) || (tipo === "negativo" && puntosNum >= 0)) {
      alert(
        tipo === "positivo"
          ? "Las acciones positivas deben tener puntos positivos"
          : "Las acciones negativas deben tener puntos negativos",
      )
      return
    }

    // Guardar la acción sin aplicarla a nadie
    onGuardarAccion(descripcion, puntosNum)

    // Resetear el estado
    setDescripcion("")
    setPuntos(tipo === "positivo" ? "1" : "-1")
    setMostrarSeleccion(false)
    setAsignacion("todos")
    setMiembrosSeleccionados([])

    // Cerrar el diálogo
    onClose()
  }

  const handleAplicarAccion = () => {
    if (!descripcion.trim()) {
      alert("Por favor, introduce una descripción para la acción")
      return
    }

    const puntosNum = Number.parseInt(puntos)
    if (isNaN(puntosNum)) {
      alert("Por favor, introduce un valor numérico válido para los puntos")
      return
    }

    // Validar que los puntos sean positivos para acciones positivas y negativos para acciones negativas
    if ((tipo === "positivo" && puntosNum <= 0) || (tipo === "negativo" && puntosNum >= 0)) {
      alert(
        tipo === "positivo"
          ? "Las acciones positivas deben tener puntos positivos"
          : "Las acciones negativas deben tener puntos negativos",
      )
      return
    }

    // Determinar a qué miembros aplicar la acción
    if (asignacion === "algunos" && miembrosSeleccionados.length === 0) {
      alert("Por favor, selecciona al menos un miembro")
      return
    }

    // Guardar la acción y aplicarla a los miembros seleccionados
    onGuardarAccion(descripcion, puntosNum, asignacion, asignacion === "algunos" ? miembrosSeleccionados : undefined)

    // Resetear el estado
    setDescripcion("")
    setPuntos(tipo === "positivo" ? "1" : "-1")
    setMostrarSeleccion(false)
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
            {tipo === "positivo" ? "Crear Acción Positiva" : "Crear Acción Negativa"}
          </DialogTitle>
          <DialogDescription>
            {tipo === "positivo"
              ? "Define una nueva acción positiva para premiar comportamientos"
              : "Define una nueva acción negativa para corregir comportamientos"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción de la acción</Label>
            <Input
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={tipo === "positivo" ? "Ej: Ayudar a un compañero" : "Ej: Interrumpir la clase"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="puntos">Puntos {tipo === "positivo" ? "a sumar" : "a restar"}</Label>
            <Input
              id="puntos"
              type="number"
              value={puntos}
              onChange={(e) => setPuntos(e.target.value)}
              className={tipo === "positivo" ? "text-green-600" : "text-red-600"}
            />
          </div>

          {mostrarSeleccion && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Aplicar a:</h3>
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
        </div>

        <DialogFooter className="flex-col space-y-2 sm:space-y-0">
          {!mostrarSeleccion && (
            <div className="flex flex-col w-full space-y-2">
              <Button
                onClick={() => {
                  setMostrarSeleccion(true)
                  setAsignacion("todos")
                }}
                className={tipo === "positivo" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                Añadir para todos los miembros
              </Button>
              <Button
                onClick={() => {
                  setMostrarSeleccion(true)
                  setAsignacion("algunos")
                }}
                className={tipo === "positivo" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                Añadir acción a algunos miembros
              </Button>
            </div>
          )}

          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={mostrarSeleccion ? handleAplicarAccion : handleSubmit}
              className={tipo === "positivo" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {mostrarSeleccion ? "Aplicar y Guardar" : "Guardar Acción"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
