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
import { Award, Search, Trophy, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import MonsterAvatar from "./monster-avatar"
import { useRouter } from "next/navigation"

interface Miembro {
  id: string
  nombre: string
  puntos: number
  logros?: string[]
}

interface Grupo {
  id: string
  nombre: string
  miembros: Miembro[]
}

interface LogrosDialogProps {
  open: boolean
  onClose: () => void
  miembros: Miembro[]
  onAsignarLogro: (miembroId: string, logro: string) => void
  grupos: Grupo[]
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

export default function LogrosDialog({ open, onClose, miembros, onAsignarLogro, grupos }: LogrosDialogProps) {
  const [busqueda, setBusqueda] = useState("")
  const [logroSeleccionado, setLogroSeleccionado] = useState<string | null>(null)
  const [nuevoLogro, setNuevoLogro] = useState("")
  const [mostrarPersonalizado, setMostrarPersonalizado] = useState(false)
  const [activeTab, setActiveTab] = useState<"logros" | "objetivos">("logros")
  const router = useRouter()

  const miembrosFiltrados = busqueda
    ? miembros.filter((m) => m.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : miembros

  const handleAsignarLogroATodos = (logro: string) => {
    miembros.forEach((miembro) => {
      if (!miembro.logros?.includes(logro)) {
        onAsignarLogro(miembro.id, logro)
      }
    })
  }

  const handleIrAObjetivos = (grupoId: string) => {
    router.push(`/creacion/objetivos/${grupoId}`)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-amber-500" />
            Gestión de Logros
          </DialogTitle>
          <DialogDescription>Visualiza y asigna logros a los miembros del grupo.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center border-b mb-4">
          <Button
            variant="ghost"
            className={`${activeTab === "logros" ? "border-b-2 border-amber-500 text-amber-700" : "text-gray-500"}`}
            onClick={() => setActiveTab("logros")}
          >
            <Award className="mr-2 h-4 w-4" />
            Logros Manuales
          </Button>
          <Button
            variant="ghost"
            className={`${activeTab === "objetivos" ? "border-b-2 border-amber-500 text-amber-700" : "text-gray-500"}`}
            onClick={() => setActiveTab("objetivos")}
          >
            <Trophy className="mr-2 h-4 w-4" />
            Objetivos de Puntos
          </Button>
        </div>

        {activeTab === "logros" ? (
          <div className="space-y-4 py-2">
            {/* Buscador de miembros */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar miembro..."
                className="pl-8"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Logros disponibles */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Logros disponibles:</h3>
              <div className="flex flex-wrap gap-2">
                {logrosDisponibles.map((logro) => (
                  <Badge
                    key={logro}
                    className={`cursor-pointer ${
                      logroSeleccionado === logro
                        ? "bg-amber-500 text-white"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    }`}
                    onClick={() => setLogroSeleccionado(logro === logroSeleccionado ? null : logro)}
                  >
                    {logro}
                  </Badge>
                ))}
                {mostrarPersonalizado ? (
                  <div className="flex gap-1 items-center">
                    <Input
                      value={nuevoLogro}
                      onChange={(e) => setNuevoLogro(e.target.value)}
                      placeholder="Nuevo logro..."
                      className="h-7 text-sm"
                    />
                    <Button
                      size="sm"
                      className="h-7 bg-amber-500 hover:bg-amber-600"
                      onClick={() => {
                        if (nuevoLogro.trim()) {
                          setLogroSeleccionado(nuevoLogro.trim())
                          setMostrarPersonalizado(false)
                          setNuevoLogro("")
                        }
                      }}
                    >
                      OK
                    </Button>
                  </div>
                ) : (
                  <Badge
                    className="bg-white border border-dashed border-amber-300 text-amber-700 hover:bg-amber-50 cursor-pointer"
                    onClick={() => setMostrarPersonalizado(true)}
                  >
                    + Personalizado
                  </Badge>
                )}
              </div>
            </div>

            {logroSeleccionado && (
              <Button
                className="w-full bg-amber-500 hover:bg-amber-600"
                onClick={() => handleAsignarLogroATodos(logroSeleccionado)}
              >
                Asignar "{logroSeleccionado}" a todos los miembros
              </Button>
            )}

            {/* Lista de miembros con sus logros */}
            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-4">
                {miembrosFiltrados.length === 0 ? (
                  <p className="text-center text-gray-500">No se encontraron miembros</p>
                ) : (
                  miembrosFiltrados.map((miembro) => (
                    <div key={miembro.id} className="flex flex-col gap-2 pb-4 border-b last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MonsterAvatar
                            seed={miembro.id + miembro.nombre}
                            name=""
                            size="sm"
                            showName={false}
                            puntos={miembro.puntos}
                          />
                          <span className="font-medium">{miembro.nombre}</span>
                        </div>
                        {logroSeleccionado && (
                          <Button
                            size="sm"
                            className="h-7 bg-amber-500 hover:bg-amber-600"
                            onClick={() => onAsignarLogro(miembro.id, logroSeleccionado)}
                            disabled={miembro.logros?.includes(logroSeleccionado)}
                          >
                            {miembro.logros?.includes(logroSeleccionado) ? "Ya asignado" : "Asignar logro"}
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 ml-10">
                        {miembro.logros && miembro.logros.length > 0 ? (
                          miembro.logros.map((logro, index) => (
                            <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 text-xs">
                              {logro}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">Sin logros</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Selecciona un grupo para configurar objetivos de puntos y recompensas para sus miembros:
            </p>

            <ScrollArea className="h-[350px] border rounded-md p-4">
              <div className="space-y-4">
                {grupos.length === 0 ? (
                  <p className="text-center text-gray-500">No hay grupos disponibles</p>
                ) : (
                  grupos.map((grupo) => (
                    <div
                      key={grupo.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-amber-50 cursor-pointer"
                      onClick={() => handleIrAObjetivos(grupo.id)}
                    >
                      <div>
                        <h3 className="font-medium text-amber-800">{grupo.nombre}</h3>
                        <p className="text-xs text-gray-500">{grupo.miembros.length} miembros</p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-amber-600">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
