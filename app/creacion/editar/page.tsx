"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, Plus, Minus, Trash2, UserPlus, UserMinus, Users } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import MonsterAvatar from "@/components/monster-avatar"
import CrearAccionDialog from "@/components/crear-accion-dialog"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

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

interface GrupoInterno {
  id: string
  nombre: string
  miembrosIds: string[]
}

interface Grupo {
  id: string
  nombre: string
  miembros: Miembro[]
  historial: Array<{
    fecha: string
    miembroId: string
    accionId: string
  }>
  gruposInternos?: GrupoInterno[]
}

export default function EditarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const grupoId = searchParams.get("id")

  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<Grupo | null>(null)
  const [acciones, setAcciones] = useState<Accion[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTipo, setDialogTipo] = useState<"positivo" | "negativo">("positivo")
  const [loading, setLoading] = useState(true)
  const [nuevoMiembro, setNuevoMiembro] = useState("")
  const [dialogAnadirMiembroOpen, setDialogAnadirMiembroOpen] = useState(false)
  const [dialogQuitarMiembroOpen, setDialogQuitarMiembroOpen] = useState(false)
  const [miembrosAEliminar, setMiembrosAEliminar] = useState<string[]>([])

  useEffect(() => {
    // Cargar grupos desde localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    setGrupos(gruposGuardados)

    // Cargar acciones predefinidas
    const accionesGuardadas = JSON.parse(localStorage.getItem("puntosAcciones") || "[]")
    setAcciones(accionesGuardadas)

    // Si hay un ID de grupo en la URL, seleccionarlo
    if (grupoId) {
      const grupo = gruposGuardados.find((g: Grupo) => g.id === grupoId)
      if (grupo) {
        // Asegurarse de que el grupo tiene la propiedad gruposInternos
        if (!grupo.gruposInternos) {
          grupo.gruposInternos = []
        }
        setGrupoSeleccionado(grupo)
      }
    }

    setLoading(false)
  }, [grupoId])

  const handleSeleccionarGrupo = (grupo: Grupo) => {
    setGrupoSeleccionado(grupo)
  }

  const openDialog = (tipo: "positivo" | "negativo") => {
    setDialogTipo(tipo)
    setDialogOpen(true)
  }

  const handleGuardarAccion = (
    descripcion: string,
    puntos: number,
    aplicarA?: "todos" | "algunos",
    miembrosIds?: string[],
  ) => {
    // Crear nueva acción
    const nuevaAccion: Accion = {
      id: Date.now().toString(),
      tipo: dialogTipo,
      descripcion,
      puntos,
    }

    // Actualizar estado local de acciones
    const nuevasAcciones = [...acciones, nuevaAccion]
    setAcciones(nuevasAcciones)

    // Guardar en localStorage
    localStorage.setItem("puntosAcciones", JSON.stringify(nuevasAcciones))

    // Si se debe aplicar a miembros específicos
    if (grupoSeleccionado && aplicarA) {
      // Determinar a qué miembros aplicar la acción
      const idsAplicar = aplicarA === "todos" ? grupoSeleccionado.miembros.map((m) => m.id) : miembrosIds || []

      // Crear nuevas entradas en el historial
      const nuevasEntradas = idsAplicar.map((miembroId) => ({
        fecha: new Date().toISOString(),
        miembroId,
        accionId: nuevaAccion.id,
      }))

      // Actualizar puntos de los miembros
      const miembrosActualizados = grupoSeleccionado.miembros.map((miembro) => {
        if (idsAplicar.includes(miembro.id)) {
          return {
            ...miembro,
            puntos: miembro.puntos + puntos,
          }
        }
        return miembro
      })

      // Crear grupo actualizado
      const grupoActualizado = {
        ...grupoSeleccionado,
        miembros: miembrosActualizados,
        historial: [...grupoSeleccionado.historial, ...nuevasEntradas],
      }

      // Actualizar estado local
      setGrupoSeleccionado(grupoActualizado)

      // Actualizar en localStorage
      const gruposActualizados = grupos.map((g) => (g.id === grupoActualizado.id ? grupoActualizado : g))
      setGrupos(gruposActualizados)
      localStorage.setItem("puntosGrupos", JSON.stringify(gruposActualizados))
    }
  }

  const handleEliminarAccion = (accionId: string) => {
    // Filtrar la acción a eliminar
    const nuevasAcciones = acciones.filter((accion) => accion.id !== accionId)

    // Actualizar estado local
    setAcciones(nuevasAcciones)

    // Guardar en localStorage
    localStorage.setItem("puntosAcciones", JSON.stringify(nuevasAcciones))
  }

  const handleAnadirMiembro = () => {
    if (!grupoSeleccionado || !nuevoMiembro.trim()) return

    // Crear nuevo miembro
    const nuevoMiembroObj: Miembro = {
      id: Date.now().toString(),
      nombre: nuevoMiembro.trim(),
      puntos: 0,
      logros: [],
    }

    // Actualizar miembros del grupo
    const grupoActualizado = {
      ...grupoSeleccionado,
      miembros: [...grupoSeleccionado.miembros, nuevoMiembroObj],
    }

    // Actualizar estado local
    setGrupoSeleccionado(grupoActualizado)

    // Actualizar en localStorage
    const gruposActualizados = grupos.map((g) => (g.id === grupoActualizado.id ? grupoActualizado : g))
    setGrupos(gruposActualizados)
    localStorage.setItem("puntosGrupos", JSON.stringify(gruposActualizados))

    // Limpiar campo y cerrar diálogo
    setNuevoMiembro("")
    setDialogAnadirMiembroOpen(false)
  }

  const handleQuitarMiembros = () => {
    if (!grupoSeleccionado || miembrosAEliminar.length === 0) return

    // Filtrar miembros a eliminar
    const miembrosActualizados = grupoSeleccionado.miembros.filter((miembro) => !miembrosAEliminar.includes(miembro.id))

    // Actualizar grupo
    const grupoActualizado = {
      ...grupoSeleccionado,
      miembros: miembrosActualizados,
    }

    // Actualizar estado local
    setGrupoSeleccionado(grupoActualizado)

    // Actualizar en localStorage
    const gruposActualizados = grupos.map((g) => (g.id === grupoActualizado.id ? grupoActualizado : g))
    setGrupos(gruposActualizados)
    localStorage.setItem("puntosGrupos", JSON.stringify(gruposActualizados))

    // Limpiar selección y cerrar diálogo
    setMiembrosAEliminar([])
    setDialogQuitarMiembroOpen(false)
  }

  const toggleMiembroAEliminar = (id: string) => {
    setMiembrosAEliminar((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center">
        <div className="text-indigo-700 text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-4 relative">
      {/* Botón para volver */}
      <Link href="/creacion" className="absolute top-4 left-4 z-20">
        <Button
          variant="outline"
          size="icon"
          className="border-indigo-400 text-indigo-700 hover:bg-indigo-200 w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>

      <div className="max-w-4xl mx-auto pt-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-8 text-indigo-800"
        >
          Editar Grupos y Acciones
        </motion.h1>

        {grupoSeleccionado ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="outline"
                onClick={() => setGrupoSeleccionado(null)}
                className="border-indigo-400 text-indigo-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver a grupos
              </Button>
              <h2 className="text-2xl font-bold text-indigo-700">{grupoSeleccionado.nombre}</h2>
            </div>

            {/* Sección de acciones */}
            <Card className="mb-6">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-xl">Gestionar Acciones</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    className="bg-green-600 hover:bg-green-700 px-6 py-6 text-lg"
                    onClick={() => openDialog("positivo")}
                  >
                    <Plus className="mr-2 h-5 w-5" /> NUEVA ACCIÓN POSITIVA
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 px-6 py-6 text-lg"
                    onClick={() => openDialog("negativo")}
                  >
                    <Minus className="mr-2 h-5 w-5" /> NUEVA ACCIÓN NEGATIVA
                  </Button>
                </div>

                {/* Lista de acciones positivas */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Acciones Positivas</h3>
                  <div className="space-y-2">
                    {acciones.filter((a) => a.tipo === "positivo").length === 0 ? (
                      <p className="text-gray-500 italic">No hay acciones positivas definidas</p>
                    ) : (
                      acciones
                        .filter((a) => a.tipo === "positivo")
                        .map((accion) => (
                          <div
                            key={accion.id}
                            className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
                          >
                            <div className="flex items-center">
                              <span className="bg-green-100 text-green-600 font-bold px-2 py-1 rounded-full mr-3">
                                +{accion.puntos}
                              </span>
                              <span>{accion.descripcion}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleEliminarAccion(accion.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Lista de acciones negativas */}
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Acciones Negativas</h3>
                  <div className="space-y-2">
                    {acciones.filter((a) => a.tipo === "negativo").length === 0 ? (
                      <p className="text-gray-500 italic">No hay acciones negativas definidas</p>
                    ) : (
                      acciones
                        .filter((a) => a.tipo === "negativo")
                        .map((accion) => (
                          <div
                            key={accion.id}
                            className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
                          >
                            <div className="flex items-center">
                              <span className="bg-red-100 text-red-600 font-bold px-2 py-1 rounded-full mr-3">
                                {accion.puntos}
                              </span>
                              <span>{accion.descripcion}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleEliminarAccion(accion.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sección de miembros */}
            <Card>
              <CardHeader className="bg-gray-50 flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Miembros del Grupo</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-green-400 text-green-700 hover:bg-green-50"
                    onClick={() => setDialogAnadirMiembroOpen(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> Añadir miembro
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-400 text-red-700 hover:bg-red-50"
                    onClick={() => setDialogQuitarMiembroOpen(true)}
                    disabled={grupoSeleccionado.miembros.length === 0}
                  >
                    <UserMinus className="mr-2 h-4 w-4" /> Quitar miembro
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {grupoSeleccionado.miembros.length === 0 ? (
                    <p className="text-gray-500 italic col-span-full text-center py-4">No hay miembros en este grupo</p>
                  ) : (
                    grupoSeleccionado.miembros.map((miembro) => (
                      <div key={miembro.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                        <MonsterAvatar
                          seed={miembro.id + miembro.nombre}
                          name={miembro.nombre}
                          size="md"
                          puntos={miembro.puntos}
                        />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sección de grupos internos */}
            {grupoSeleccionado.gruposInternos && grupoSeleccionado.gruposInternos.length > 0 && (
              <Card className="mt-6">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-xl flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Grupos Creados
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {grupoSeleccionado.gruposInternos.map((grupoInterno) => (
                      <div key={grupoInterno.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-indigo-700">{grupoInterno.nombre}</h3>
                          <Badge className="bg-indigo-100 text-indigo-700">
                            {grupoInterno.miembrosIds.length} miembros
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {grupoInterno.miembrosIds.map((miembroId) => {
                            const miembro = grupoSeleccionado.miembros.find((m) => m.id === miembroId)
                            return miembro ? (
                              <Badge key={miembroId} variant="outline" className="text-xs">
                                {miembro.nombre}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {grupos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center py-10"
              >
                <p className="text-gray-500 mb-4">No tienes grupos creados</p>
                <Link href="/creacion/crear">
                  <Button className="bg-indigo-500 hover:bg-indigo-600">Crear Nuevo Grupo</Button>
                </Link>
              </motion.div>
            ) : (
              grupos.map((grupo, index) => (
                <motion.div
                  key={grupo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleSeleccionarGrupo(grupo)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-indigo-700">{grupo.nombre}</h2>
                          <p className="text-gray-500 mt-1">{grupo.miembros.length} miembros</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button className="bg-indigo-500 hover:bg-indigo-600">Seleccionar</Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-3">
                          {grupo.miembros.slice(0, 5).map((miembro) => (
                            <MonsterAvatar
                              key={miembro.id}
                              seed={miembro.id + miembro.nombre}
                              name=""
                              size="sm"
                              showName={false}
                              puntos={miembro.puntos}
                            />
                          ))}
                          {grupo.miembros.length > 5 && (
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                              <span className="text-xs font-medium text-gray-600">+{grupo.miembros.length - 5}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Diálogo para crear acciones */}
      <CrearAccionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        tipo={dialogTipo}
        miembros={grupoSeleccionado?.miembros || []}
        onGuardarAccion={handleGuardarAccion}
      />

      {/* Diálogo para añadir miembro */}
      <Dialog open={dialogAnadirMiembroOpen} onOpenChange={setDialogAnadirMiembroOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir Miembro</DialogTitle>
            <DialogDescription>Introduce el nombre del nuevo miembro para el grupo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombreMiembro">Nombre del miembro</Label>
              <Input
                id="nombreMiembro"
                value={nuevoMiembro}
                onChange={(e) => setNuevoMiembro(e.target.value)}
                placeholder="Ej: Juan Pérez"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAnadirMiembro()
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAnadirMiembroOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAnadirMiembro} className="bg-green-600 hover:bg-green-700">
              Añadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para quitar miembros */}
      <Dialog open={dialogQuitarMiembroOpen} onOpenChange={setDialogQuitarMiembroOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quitar Miembros</DialogTitle>
            <DialogDescription>Selecciona los miembros que deseas eliminar del grupo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2 border rounded-md p-3 max-h-60 overflow-y-auto">
              {grupoSeleccionado?.miembros.map((miembro) => (
                <div key={miembro.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`eliminar-${miembro.id}`}
                    checked={miembrosAEliminar.includes(miembro.id)}
                    onCheckedChange={() => toggleMiembroAEliminar(miembro.id)}
                  />
                  <div className="flex items-center space-x-2">
                    <MonsterAvatar seed={miembro.id + miembro.nombre} name="" size="sm" showName={false} />
                    <Label htmlFor={`eliminar-${miembro.id}`}>{miembro.nombre}</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogQuitarMiembroOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuitarMiembros} className="bg-red-600 hover:bg-red-700">
              Eliminar Seleccionados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
