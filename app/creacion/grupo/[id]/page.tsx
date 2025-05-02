"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, Plus, UserPlus, Trash2, Award, Star } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import MiembroCard from "@/components/miembro-card"
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
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import PuntosGrupoDialog from "@/components/puntos-grupo-dialog"
import LogrosDialog from "@/components/logros-dialog"
import LogroConseguidoDialog from "@/components/logro-conseguido-dialog"

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

interface ObjetivoPuntos {
  id: string
  puntos: number
  recompensa: string
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
  objetivosPuntos?: ObjetivoPuntos[]
}

export default function GrupoPage() {
  const params = useParams()
  const router = useRouter()
  const grupoId = params.id as string

  const [grupo, setGrupo] = useState<Grupo | null>(null)
  const [acciones, setAcciones] = useState<Accion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("miembros")
  const [dialogCrearGrupoOpen, setDialogCrearGrupoOpen] = useState(false)
  const [nuevoGrupoNombre, setNuevoGrupoNombre] = useState("")
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState<string[]>([])
  const [dialogEliminarGrupoOpen, setDialogEliminarGrupoOpen] = useState(false)
  const [grupoAEliminar, setGrupoAEliminar] = useState<string | null>(null)
  const [dialogEditarGrupoOpen, setDialogEditarGrupoOpen] = useState(false)
  const [grupoEditando, setGrupoEditando] = useState<GrupoInterno | null>(null)
  const [miembrosGrupoEditando, setMiembrosGrupoEditando] = useState<string[]>([])
  const [dialogPuntosGrupoOpen, setDialogPuntosGrupoOpen] = useState(false)
  const [grupoSeleccionadoPuntos, setGrupoSeleccionadoPuntos] = useState<GrupoInterno | null>(null)
  const [dialogLogrosOpen, setDialogLogrosOpen] = useState(false)
  const [logroConseguidoOpen, setLogroConseguidoOpen] = useState(false)
  const [logroConseguido, setLogroConseguido] = useState<{ miembro: Miembro; objetivo: ObjetivoPuntos } | null>(null)

  useEffect(() => {
    // Cargar datos del grupo desde localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    const grupoEncontrado = gruposGuardados.find((g: Grupo) => g.id === grupoId)

    // Cargar acciones predefinidas
    const accionesGuardadas = JSON.parse(localStorage.getItem("puntosAcciones") || "[]")

    if (grupoEncontrado) {
      // Asegurarse de que el grupo tiene la propiedad gruposInternos
      if (!grupoEncontrado.gruposInternos) {
        grupoEncontrado.gruposInternos = []
      }

      // Asegurarse de que el grupo tiene la propiedad objetivosPuntos
      if (!grupoEncontrado.objetivosPuntos) {
        grupoEncontrado.objetivosPuntos = []
      }

      // Asegurarse de que cada miembro tiene la propiedad logros y logrosConseguidos
      const miembrosConLogros = grupoEncontrado.miembros.map((miembro) => {
        if (!miembro.logros) {
          miembro.logros = []
        }
        if (!miembro.logrosConseguidos) {
          miembro.logrosConseguidos = []
        }
        return miembro
      })

      grupoEncontrado.miembros = miembrosConLogros
      setGrupo(grupoEncontrado)
    }

    setAcciones(accionesGuardadas)
    setLoading(false)
  }, [grupoId])

  const handleAsignarAccion = (accionId: string, miembrosIds: string[]) => {
    if (!grupo) return

    // Encontrar la acción seleccionada
    const accion = acciones.find((a) => a.id === accionId)
    if (!accion) return

    // Crear nuevas entradas en el historial
    const nuevasEntradas = miembrosIds.map((miembroId) => ({
      fecha: new Date().toISOString(),
      miembroId,
      accionId,
    }))

    // Actualizar puntos de los miembros y verificar logros
    const miembrosActualizados = grupo.miembros.map((miembro) => {
      if (miembrosIds.includes(miembro.id)) {
        const nuevosPuntos = miembro.puntos + accion.puntos

        // Verificar si ha alcanzado algún objetivo de puntos
        const objetivosAlcanzados = (grupo.objetivosPuntos || []).filter(
          (objetivo) =>
            nuevosPuntos >= objetivo.puntos &&
            miembro.puntos < objetivo.puntos &&
            !miembro.logrosConseguidos?.some((l) => l.id === objetivo.id),
        )

        // Si hay objetivos alcanzados, registrarlos
        const logrosConseguidos = [...(miembro.logrosConseguidos || [])]
        objetivosAlcanzados.forEach((objetivo) => {
          logrosConseguidos.push({
            id: objetivo.id,
            mostrado: false,
          })
        })

        // Si hay un nuevo objetivo alcanzado, mostrar notificación
        if (objetivosAlcanzados.length > 0) {
          setLogroConseguido({
            miembro: { ...miembro, puntos: nuevosPuntos },
            objetivo: objetivosAlcanzados[0],
          })
          setLogroConseguidoOpen(true)
        }

        return {
          ...miembro,
          puntos: nuevosPuntos,
          logrosConseguidos,
        }
      }
      return miembro
    })

    // Crear grupo actualizado
    const grupoActualizado = {
      ...grupo,
      miembros: miembrosActualizados,
      historial: [...grupo.historial, ...nuevasEntradas],
    }

    // Actualizar estado local
    setGrupo(grupoActualizado)

    // Actualizar en localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    const gruposActualizados = gruposGuardados.map((g: Grupo) => (g.id === grupoId ? grupoActualizado : g))
    localStorage.setItem("puntosGrupos", JSON.stringify(gruposActualizados))
  }

  const handleCrearGrupo = () => {
    if (!grupo) return
    if (!nuevoGrupoNombre.trim()) {
      alert("Por favor, introduce un nombre para el grupo")
      return
    }
    if (miembrosSeleccionados.length === 0) {
      alert("Por favor, selecciona al menos un miembro para el grupo")
      return
    }

    // Crear nuevo grupo interno
    const nuevoGrupoInterno: GrupoInterno = {
      id: Date.now().toString(),
      nombre: nuevoGrupoNombre.trim(),
      miembrosIds: miembrosSeleccionados,
    }

    // Actualizar grupo principal
    const grupoActualizado = {
      ...grupo,
      gruposInternos: [...(grupo.gruposInternos || []), nuevoGrupoInterno],
    }

    // Actualizar estado local
    setGrupo(grupoActualizado)

    // Actualizar en localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    const gruposActualizados = gruposGuardados.map((g: Grupo) => (g.id === grupoId ? grupoActualizado : g))
    localStorage.setItem("puntosGrupos", JSON.stringify(gruposActualizados))

    // Limpiar y cerrar diálogo
    setNuevoGrupoNombre("")
    setMiembrosSeleccionados([])
    setDialogCrearGrupoOpen(false)
  }

  const handleEliminarGrupo = () => {
    if (!grupo || !grupoAEliminar) return

    // Filtrar el grupo a eliminar
    const gruposInternosActualizados = (grupo.gruposInternos || []).filter((g) => g.id !== grupoAEliminar)

    // Actualizar grupo principal
    const grupoActualizado = {
      ...grupo,
      gruposInternos: gruposInternosActualizados,
    }

    // Actualizar estado local
    setGrupo(grupoActualizado)

    // Actualizar en localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    const gruposActualizados = gruposGuardados.map((g: Grupo) => (g.id === grupoId ? grupoActualizado : g))
    localStorage.setItem("puntosGrupos", JSON.stringify(gruposActualizados))

    // Cerrar diálogo
    setGrupoAEliminar(null)
    setDialogEliminarGrupoOpen(false)
  }

  const handleEditarGrupo = () => {
    if (!grupo || !grupoEditando) return

    // Actualizar el grupo que se está editando
    const grupoActualizado: GrupoInterno = {
      ...grupoEditando,
      miembrosIds: miembrosGrupoEditando,
    }

    // Actualizar la lista de grupos internos
    const gruposInternosActualizados = (grupo.gruposInternos || []).map((g) =>
      g.id === grupoActualizado.id ? grupoActualizado : g,
    )

    // Actualizar grupo principal
    const grupoPrincipalActualizado = {
      ...grupo,
      gruposInternos: gruposInternosActualizados,
    }

    // Actualizar estado local
    setGrupo(grupoPrincipalActualizado)

    // Actualizar en localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    const gruposActualizados = gruposGuardados.map((g: Grupo) => (g.id === grupoId ? grupoPrincipalActualizado : g))
    localStorage.setItem("puntosGrupos", JSON.stringify(gruposActualizados))

    // Cerrar diálogo
    setGrupoEditando(null)
    setMiembrosGrupoEditando([])
    setDialogEditarGrupoOpen(false)
  }

  const handleAsignarPuntosGrupo = (accionId: string) => {
    if (!grupo || !grupoSeleccionadoPuntos) return

    // Encontrar la acción seleccionada
    const accion = acciones.find((a) => a.id === accionId)
    if (!accion) return

    // Obtener los IDs de los miembros del grupo
    const miembrosIds = grupoSeleccionadoPuntos.miembrosIds

    // Crear nuevas entradas en el historial
    const nuevasEntradas = miembrosIds.map((miembroId) => ({
      fecha: new Date().toISOString(),
      miembroId,
      accionId,
    }))

    // Actualizar puntos de los miembros y verificar logros
    const miembrosActualizados = grupo.miembros.map((miembro) => {
      if (miembrosIds.includes(miembro.id)) {
        const nuevosPuntos = miembro.puntos + accion.puntos

        // Verificar si ha alcanzado algún objetivo de puntos
        const objetivosAlcanzados = (grupo.objetivosPuntos || []).filter(
          (objetivo) =>
            nuevosPuntos >= objetivo.puntos &&
            miembro.puntos < objetivo.puntos &&
            !miembro.logrosConseguidos?.some((l) => l.id === objetivo.id),
        )

        // Si hay objetivos alcanzados, registrarlos
        const logrosConseguidos = [...(miembro.logrosConseguidos || [])]
        objetivosAlcanzados.forEach((objetivo) => {
          logrosConseguidos.push({
            id: objetivo.id,
            mostrado: false,
          })
        })

        return {
          ...miembro,
          puntos: nuevosPuntos,
          logrosConseguidos,
        }
      }
      return miembro
    })

    // Crear grupo actualizado
    const grupoActualizado = {
      ...grupo,
      miembros: miembrosActualizados,
      historial: [...grupo.historial, ...nuevasEntradas],
    }

    // Actualizar estado local
    setGrupo(grupoActualizado)

    // Actualizar en localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    const gruposActualizados = gruposGuardados.map((g: Grupo) => (g.id === grupoId ? grupoActualizado : g))
    localStorage.setItem("puntosGrupos", JSON.stringify(gruposActualizados))

    // Cerrar diálogo
    setDialogPuntosGrupoOpen(false)
    setGrupoSeleccionadoPuntos(null)
  }

  const handleAsignarLogro = (miembroId: string, logro: string) => {
    if (!grupo) return

    // Actualizar logros del miembro
    const miembrosActualizados = grupo.miembros.map((miembro) => {
      if (miembro.id === miembroId) {
        const logrosActuales = miembro.logros || []
        if (!logrosActuales.includes(logro)) {
          return {
            ...miembro,
            logros: [...logrosActuales, logro],
          }
        }
      }
      return miembro
    })

    // Crear grupo actualizado
    const grupoActualizado = {
      ...grupo,
      miembros: miembrosActualizados,
    }

    // Actualizar estado local
    setGrupo(grupoActualizado)

    // Actualizar en localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    const gruposActualizados = gruposGuardados.map((g: Grupo) => (g.id === grupoId ? grupoActualizado : g))
    localStorage.setItem("puntosGrupos", JSON.stringify(gruposActualizados))
  }

  const handleMarcarLogroComoMostrado = () => {
    if (!grupo || !logroConseguido) return

    // Marcar el logro como mostrado
    const miembrosActualizados = grupo.miembros.map((miembro) => {
      if (miembro.id === logroConseguido.miembro.id) {
        const logrosConseguidos = (miembro.logrosConseguidos || []).map((logro) => {
          if (logro.id === logroConseguido.objetivo.id) {
            return { ...logro, mostrado: true }
          }
          return logro
        })

        return {
          ...miembro,
          logrosConseguidos,
        }
      }
      return miembro
    })

    // Actualizar grupo
    const grupoActualizado = {
      ...grupo,
      miembros: miembrosActualizados,
    }

    // Actualizar estado local
    setGrupo(grupoActualizado)

    // Actualizar en localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    const gruposActualizados = gruposGuardados.map((g: Grupo) => (g.id === grupoId ? grupoActualizado : g))
    localStorage.setItem("puntosGrupos", JSON.stringify(gruposActualizados))

    // Cerrar diálogo
    setLogroConseguidoOpen(false)
    setLogroConseguido(null)
  }

  const toggleMiembro = (id: string) => {
    setMiembrosSeleccionados((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  const toggleMiembroEditando = (id: string) => {
    setMiembrosGrupoEditando((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  const abrirDialogoEditarGrupo = (grupo: GrupoInterno) => {
    setGrupoEditando(grupo)
    setMiembrosGrupoEditando([...grupo.miembrosIds])
    setDialogEditarGrupoOpen(true)
  }

  const abrirDialogoPuntosGrupo = (grupo: GrupoInterno) => {
    setGrupoSeleccionadoPuntos(grupo)
    setDialogPuntosGrupoOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center">
        <div className="text-indigo-700 text-xl">Cargando...</div>
      </div>
    )
  }

  if (!grupo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex flex-col items-center justify-center p-4">
        <div className="text-indigo-700 text-xl mb-4">Grupo no encontrado</div>
        <Link href="/creacion">
          <Button className="bg-indigo-500 hover:bg-indigo-600">Volver a Inicio</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header con el nombre del grupo */}
      <header className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/creacion/grupos">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{grupo.nombre}</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20 flex items-center gap-1"
              onClick={() => setDialogLogrosOpen(true)}
            >
              <Award className="h-5 w-5 mr-1" />
              Logros
            </Button>
            <Link href={`/creacion/editar?id=${grupoId}`}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Pestañas de navegación */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="miembros" className="text-lg py-3">
                Miembros
              </TabsTrigger>
              <TabsTrigger value="grupos" className="text-lg py-3 relative">
                Grupos
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDialogCrearGrupoOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir
                </Button>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="miembros" className="p-4">
              {/* Grid de miembros con monstruos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {grupo.miembros.map((miembro) => (
                  <motion.div
                    key={miembro.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MiembroCard
                      miembro={miembro}
                      acciones={acciones}
                      onAsignarAccion={handleAsignarAccion}
                      miembros={grupo.miembros}
                      onAsignarLogro={handleAsignarLogro}
                    />
                  </motion.div>
                ))}

                {/* Botón para añadir nuevo miembro */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white rounded-lg border-2 border-dashed border-indigo-300 p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-colors shadow-sm"
                  onClick={() => router.push(`/creacion/editar?id=${grupoId}`)}
                >
                  <div className="bg-indigo-100 rounded-full p-3 mb-2">
                    <UserPlus className="h-8 w-8 text-indigo-600" />
                  </div>
                  <p className="text-sm text-indigo-600 font-medium">Añadir miembro</p>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="grupos" className="p-4">
              {(grupo.gruposInternos || []).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No hay grupos creados</p>
                  <Button className="bg-indigo-500 hover:bg-indigo-600" onClick={() => setDialogCrearGrupoOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Grupo
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(grupo.gruposInternos || []).map((grupoInterno) => (
                    <Card key={grupoInterno.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 flex justify-between items-center">
                          <h3 className="font-bold text-white">{grupoInterno.nombre}</h3>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/20 h-8 w-8 p-0"
                              onClick={() => abrirDialogoPuntosGrupo(grupoInterno)}
                              title="Asignar puntos al grupo"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/20 h-8 w-8 p-0"
                              onClick={() => abrirDialogoEditarGrupo(grupoInterno)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/20 h-8 w-8 p-0"
                              onClick={() => {
                                setGrupoAEliminar(grupoInterno.id)
                                setDialogEliminarGrupoOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 bg-white">
                          <div className="flex flex-wrap gap-2">
                            {grupoInterno.miembrosIds.map((miembroId) => {
                              const miembro = grupo.miembros.find((m) => m.id === miembroId)
                              return miembro ? (
                                <Badge key={miembroId} variant="outline" className="bg-indigo-50 text-indigo-700">
                                  {miembro.nombre}
                                </Badge>
                              ) : null
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Diálogo para crear grupo */}
      <Dialog open={dialogCrearGrupoOpen} onOpenChange={setDialogCrearGrupoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Grupo</DialogTitle>
            <DialogDescription>
              Introduce un nombre para el grupo y selecciona los miembros que quieres incluir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombreGrupo">Nombre del grupo</Label>
              <Input
                id="nombreGrupo"
                value={nuevoGrupoNombre}
                onChange={(e) => setNuevoGrupoNombre(e.target.value)}
                placeholder="Ej: Grupo A"
              />
            </div>

            <div className="space-y-2">
              <Label>Selecciona los miembros:</Label>
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
                {grupo.miembros.map((miembro) => (
                  <div key={miembro.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`miembro-${miembro.id}`}
                      checked={miembrosSeleccionados.includes(miembro.id)}
                      onCheckedChange={() => toggleMiembro(miembro.id)}
                    />
                    <Label htmlFor={`miembro-${miembro.id}`} className="cursor-pointer">
                      {miembro.nombre}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogCrearGrupoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearGrupo} className="bg-indigo-600 hover:bg-indigo-700">
              Crear Grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para eliminar grupo */}
      <Dialog open={dialogEliminarGrupoOpen} onOpenChange={setDialogEliminarGrupoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Grupo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEliminarGrupoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEliminarGrupo} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar grupo */}
      <Dialog open={dialogEditarGrupoOpen} onOpenChange={setDialogEditarGrupoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Grupo: {grupoEditando?.nombre}</DialogTitle>
            <DialogDescription>Modifica los miembros que pertenecen a este grupo.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Selecciona los miembros:</Label>
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
                {grupo.miembros.map((miembro) => (
                  <div key={miembro.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`editar-miembro-${miembro.id}`}
                      checked={miembrosGrupoEditando.includes(miembro.id)}
                      onCheckedChange={() => toggleMiembroEditando(miembro.id)}
                    />
                    <Label htmlFor={`editar-miembro-${miembro.id}`} className="cursor-pointer">
                      {miembro.nombre}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarGrupoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditarGrupo} className="bg-indigo-600 hover:bg-indigo-700">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para asignar puntos a un grupo */}
      {grupoSeleccionadoPuntos && (
        <PuntosGrupoDialog
          open={dialogPuntosGrupoOpen}
          onClose={() => {
            setDialogPuntosGrupoOpen(false)
            setGrupoSeleccionadoPuntos(null)
          }}
          grupo={grupoSeleccionadoPuntos}
          acciones={acciones}
          onAsignarPuntos={handleAsignarPuntosGrupo}
        />
      )}

      {/* Diálogo para gestionar logros */}
      <LogrosDialog
        open={dialogLogrosOpen}
        onClose={() => setDialogLogrosOpen(false)}
        miembros={grupo.miembros}
        onAsignarLogro={handleAsignarLogro}
        grupos={[grupo]}
      />

      {/* Diálogo para mostrar logro conseguido */}
      {logroConseguido && (
        <LogroConseguidoDialog
          open={logroConseguidoOpen}
          onClose={handleMarcarLogroComoMostrado}
          miembro={logroConseguido.miembro}
          objetivo={logroConseguido.objetivo}
        />
      )}
    </div>
  )
}
