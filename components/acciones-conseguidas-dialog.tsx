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
import { Award, Check, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Miembro {
  id: string
  nombre: string
  puntos: number
  logros?: string[]
}

interface AccionesConseguidasDialogProps {
  open: boolean
  onClose: () => void
  miembro: Miembro
  onAsignarLogro: (miembroId: string, logro: string) => void
}

// Lista de logros predefinidos
const logrosDisponibles = [
  "Ayudante de clase",
  "Mejor comportamiento",
  "Trabajo en equipo",
  "Esfuerzo constante",
  "Superación personal",
  "Compañerismo",
  "Participación activa",
  "Creatividad",
  "Puntualidad",
  "Responsabilidad",
]

export default function AccionesConseguidasDialog({
  open,
  onClose,
  miembro,
  onAsignarLogro,
}: AccionesConseguidasDialogProps) {
  const [nuevoLogro, setNuevoLogro] = useState("")
  const [mostrarPersonalizado, setMostrarPersonalizado] = useState(false)

  const handleAsignarLogro = (logro: string) => {
    onAsignarLogro(miembro.id, logro)
  }

  const handleAsignarLogroPersonalizado = () => {
    if (nuevoLogro.trim()) {
      onAsignarLogro(miembro.id, nuevoLogro.trim())
      setNuevoLogro("")
      setMostrarPersonalizado(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-amber-500" />
            Acciones Conseguidas: {miembro.nombre}
          </DialogTitle>
          <DialogDescription>Logros y acciones destacadas conseguidas por este miembro.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Logros actuales */}
          <div className="space-y-2">
            <Label>Logros conseguidos:</Label>
            <div className="border rounded-md p-3 min-h-[60px]">
              {miembro.logros && miembro.logros.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {miembro.logros.map((logro, index) => (
                    <Badge key={index} className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                      {logro}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No hay logros conseguidos todavía</p>
              )}
            </div>
          </div>

          {/* Logros disponibles */}
          <div className="space-y-2">
            <Label>Asignar nuevo logro:</Label>
            <div className="grid grid-cols-2 gap-2">
              {logrosDisponibles.map((logro) => {
                const yaConseguido = miembro.logros?.includes(logro) || false
                return (
                  <Button
                    key={logro}
                    variant={yaConseguido ? "default" : "outline"}
                    className={`justify-start ${
                      yaConseguido ? "bg-amber-500 hover:bg-amber-600" : "hover:bg-amber-50"
                    }`}
                    onClick={() => !yaConseguido && handleAsignarLogro(logro)}
                    disabled={yaConseguido}
                  >
                    {yaConseguido ? <Check className="mr-2 h-4 w-4" /> : <Award className="mr-2 h-4 w-4" />}
                    {logro}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Logro personalizado */}
          {mostrarPersonalizado ? (
            <div className="space-y-2">
              <Label htmlFor="nuevoLogro">Logro personalizado:</Label>
              <div className="flex gap-2">
                <Input
                  id="nuevoLogro"
                  value={nuevoLogro}
                  onChange={(e) => setNuevoLogro(e.target.value)}
                  placeholder="Ej: Mejor proyecto de ciencias"
                  className="flex-1"
                />
                <Button onClick={handleAsignarLogroPersonalizado} className="bg-amber-500 hover:bg-amber-600">
                  Añadir
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full border-dashed border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={() => setMostrarPersonalizado(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Añadir logro personalizado
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
