"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Trophy } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import MonsterAvatar from "@/components/monster-avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Miembro {
  id: string
  nombre: string
  puntos: number
  logros?: string[]
  logrosConseguidos?: {
    id: string
    mostrado: boolean
  }[]
}

interface ObjetivoPuntos {
  id: string
  puntos: number
  recompensa: string
}

interface Grupo {
  id: string
  nombre: string
  miembros: Miembro[]
  objetivosPuntos?: ObjetivoPuntos[]
}

export default function ObjetivosPage() {
  const params = useParams()
  const grupoId = params.id as string

  const [grupo, setGrupo] = useState<Grupo | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [puntos, setPuntos] = useState("")
  const [recompensa, setRecompensa] = useState("")
  const [objetivoAEliminar, setObjetivoAEliminar] = useState<string | null>(null)
  const [dialogConfirmacionOpen, setDialogConfirmacionOpen] = useState(false)

  useEffect(() => {
    // Cargar datos del grupo desde localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    const grupoEncontrado = gruposGuardados.find((g: Grupo) => g.id === grupoId)

    if (grupoEncontrado) {
      // Asegurarse de que el grupo tiene la propiedad objetivosPuntos
      if (!grupoEncontrado.objetivosPuntos) {
        grupoEncontrado.objetivosPuntos = []
      }

      // Asegurarse de que cada miembro tiene la propiedad logrosConseguidos
      const miembrosActualizados = grupoEncontrado.miembros.map((miembro) => {
        if (!miembro.logrosConseguidos) {
          return { ...miembro, logrosConseguidos: [] }
        }
        return miembro
      })

      grupoEncontrado.miembros = miembrosActualizados
      setGrupo(grupoEncontrado)
    }

    setLoading(false)
  }, [grupoId])

  const handleGuardarObjetivo = () => {
    if (!grupo) return

    const puntosNum = Number.parseInt(puntos)
    if (isNaN(puntosNum) || puntosNum <= 0) {
      alert("Por favor, introduce un valor válido para los puntos")
      return
    }

    if (!recompensa.trim()) {
      alert("Por favor, introduce una recompensa")
      return
    }

    // Crear nuevo objetivo
    const nuevoObjetivo: ObjetivoPuntos = {
      id: Date.now().toString(),
      puntos: puntosNum,
      recompensa: recompensa.trim(),
    }

    // Actualizar grupo
    const objetivosActualizados = [...(grupo.objetivosPuntos || []), nuevoObjetivo]
    const grupoActualizado = {
      ...grupo,
      objetivosPuntos: objetivosActualizados,
    }

    // Actualizar estado local
    setGrupo(grupoActualizado)

    // Actualizar en localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    const gruposActualizados = gruposGuardados.map((g: Grupo) => (g.id === grupoId ? grupoActualizado : g))
    localStorage.setItem("puntosGrupos", JSON.stringify(gruposActualizados))

    // Limpiar campos y cerrar diálogo
    setPuntos("")
    setRecompensa("")
    setDialogOpen(false)
  }

  const handleEliminarObjetivo = () => {
    if (!grupo || !objetivoAEliminar) return

    // Filtrar el objetivo a eliminar
    const objetivosActualizados = (grupo.objetivosPuntos || []).filter((obj) => obj.id !== objetivoAEliminar)

    // Actualizar grupo
    const grupoActualizado = {
      ...grupo,
      objetivosPuntos: objetivosActualizados,
    }

    // Actualizar estado local
    setGrupo(grupoActualizado)

    // Actualizar en localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    const gruposActualizados = gruposGuardados.map((g: Grupo) => (g.id === grupoId ? grupoActualizado : g))
    localStorage.setItem("puntosGrupos", JSON.stringify(gruposActualizados))

    // Cerrar diálogo
    setObjetivoAEliminar(null)
    setDialogConfirmacionOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
        <div className="text-amber-700 text-xl">Cargando...</div>
      </div>
    )
  }

  if (!grupo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 flex flex-col items-center justify-center p-4">
        <div className="text-amber-700 text-xl mb-4">Grupo no encontrado</div>
        <Link href="/creacion">
          <Button className="bg-amber-500 hover:bg-amber-600">Volver a Inicio</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto pt-4">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/creacion/grupo/${grupoId}`}>
            <Button variant="outline" className="border-amber-400 text-amber-700">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al grupo
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-amber-800">Objetivos de Puntos: {grupo.nombre}</h1>
        </div>

        {/* Sección de objetivos */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Objetivos y Recompensas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-end mb-4">
              <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Añadir Objetivo
              </Button>
            </div>

            {(grupo.objetivosPuntos || []).length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-amber-300 rounded-lg">
                <Trophy className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                <p className="text-amber-700">No hay objetivos definidos</p>
                <p className="text-sm text-amber-600 mt-1">
                  Añade objetivos de puntos y recompensas para motivar a los miembros
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {(grupo.objetivosPuntos || []).map((objetivo) => (
                  <Card key={objetivo.id} className="overflow-hidden border-amber-200">
                    <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 text-amber-600 mr-2" />
                        <span className="font-bold text-amber-800">{objetivo.puntos} puntos</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        onClick={() => {
                          setObjetivoAEliminar(objetivo.id)
                          setDialogConfirmacionOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-amber-600">Recompensa:</Label>
                          <p className="font-medium">{objetivo.recompensa}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección de miembros */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <CardTitle>Progreso de Miembros</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {grupo.miembros.map((miembro) => {
                // Encontrar el próximo objetivo para este miembro
                const proximoObjetivo = (grupo.objetivosPuntos || [])
                  .filter((obj) => obj.puntos > miembro.puntos)
                  .sort((a, b) => a.puntos - b.puntos)[0]

                // Encontrar el último objetivo conseguido
                const objetivosConseguidos = (grupo.objetivosPuntos || []).filter((obj) => obj.puntos <= miembro.puntos)
                const ultimoObjetivoConseguido =
                  objetivosConseguidos.length > 0 ? objetivosConseguidos.sort((a, b) => b.puntos - a.puntos)[0] : null

                return (
                  <Card key={miembro.id} className="overflow-hidden border-amber-200">
                    <div className="p-4 flex flex-col items-center">
                      <MonsterAvatar
                        seed={miembro.id + miembro.nombre}
                        name={miembro.nombre}
                        size="md"
                        puntos={miembro.puntos}
                      />

                      {ultimoObjetivoConseguido && (
                        <div className="mt-3 flex flex-col items-center">
                          <Trophy className="h-5 w-5 text-amber-500" />
                          <p className="text-xs text-amber-700 font-medium mt-1">
                            ¡Logro conseguido: {ultimoObjetivoConseguido.puntos} puntos!
                          </p>
                        </div>
                      )}

                      {proximoObjetivo && (
                        <div className="mt-3 w-full">
                          <div className="flex justify-between text-xs text-amber-600 mb-1">
                            <span>Progreso hacia {proximoObjetivo.puntos} puntos</span>
                            <span>
                              {miembro.puntos}/{proximoObjetivo.puntos}
                            </span>
                          </div>
                          <div className="w-full bg-amber-100 rounded-full h-2.5">
                            <div
                              className="bg-amber-500 h-2.5 rounded-full"
                              style={{
                                width: `${Math.min(100, (miembro.puntos / proximoObjetivo.puntos) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para añadir objetivo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir Objetivo de Puntos</DialogTitle>
            <DialogDescription>
              Define un objetivo de puntos y la recompensa que obtendrán los miembros al alcanzarlo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="puntos">Puntos necesarios</Label>
              <Input
                id="puntos"
                type="number"
                min="1"
                value={puntos}
                onChange={(e) => setPuntos(e.target.value)}
                placeholder="Ej: 100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recompensa">Recompensa</Label>
              <Input
                id="recompensa"
                value={recompensa}
                onChange={(e) => setRecompensa(e.target.value)}
                placeholder="Ej: Tiempo libre extra"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarObjetivo} className="bg-amber-500 hover:bg-amber-600">
              Guardar Objetivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={dialogConfirmacionOpen} onOpenChange={setDialogConfirmacionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Objetivo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este objetivo? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogConfirmacionOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEliminarObjetivo} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
