"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Trophy, Users, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import FireVS from "@/components/fire-vs"
import ConfettiEffect from "@/components/confetti-effect"

interface Grupo {
  id: string
  nombre: string
  equipos: string[]
  fechaCreacion: string
  partidos?: Partido[]
}

interface Partido {
  id: string
  local: string
  visitante: string
  jornada: number
  resultado?: {
    puntosLocal: number
    puntosVisitante: number
  }
  jugado: boolean
}

interface EstadisticasEquipo {
  nombre: string
  jugados: number
  ganados: number
  perdidos: number
  puntosAFavor: number
  puntosEnContra: number
}

export default function GrupoPage() {
  const [grupo, setGrupo] = useState<Grupo | null>(null)
  const [activeTab, setActiveTab] = useState("partidos")
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [calendarioGenerado, setCalendarioGenerado] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [partidoEditando, setPartidoEditando] = useState<Partido | null>(null)
  const [puntosLocal, setPuntosLocal] = useState("")
  const [puntosVisitante, setPuntosVisitante] = useState("")
  const [clasificacion, setClasificacion] = useState<EstadisticasEquipo[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Obtener el ID del grupo actual
    const grupoActualId = localStorage.getItem("grupoActualId")
    const edicion = localStorage.getItem("modoEdicion") === "true"

    setModoEdicion(edicion)

    // Limpiar el modo edición después de cargarlo
    localStorage.removeItem("modoEdicion")

    if (!grupoActualId) {
      router.push("/")
      return
    }

    // Obtener todos los grupos
    const gruposGuardados = JSON.parse(localStorage.getItem("gruposBasketball") || "[]")

    // Encontrar el grupo actual por ID
    const grupoActual = gruposGuardados.find((g: Grupo) => g.id === grupoActualId)

    if (grupoActual) {
      setGrupo(grupoActual)

      // Si el grupo tiene partidos guardados, cargarlos
      if (grupoActual.partidos && grupoActual.partidos.length > 0) {
        setPartidos(grupoActual.partidos)
        setCalendarioGenerado(true)

        // Calcular clasificación
        calcularClasificacion(grupoActual.partidos, grupoActual.equipos)
      }
    } else {
      router.push("/")
    }
  }, [router])

  // Función para generar el calendario de partidos
  const generarCalendario = () => {
    if (!grupo || !grupo.equipos || grupo.equipos.length < 2) return

    const equipos = [...grupo.equipos]
    const nuevosPartidos: Partido[] = []

    // Generar partidos de ida (cada equipo juega como local una vez contra cada otro equipo)
    for (let i = 0; i < equipos.length; i++) {
      for (let j = 0; j < equipos.length; j++) {
        if (i !== j) {
          // Un equipo no puede jugar contra sí mismo
          nuevosPartidos.push({
            id: `${Date.now()}-${i}-${j}`,
            local: equipos[i],
            visitante: equipos[j],
            jornada: nuevosPartidos.length + 1,
            jugado: false,
          })
        }
      }
    }

    // Mezclar los partidos para que sea aleatorio pero manteniendo que todos jueguen contra todos
    const partidosMezclados = nuevosPartidos.sort(() => Math.random() - 0.5)

    // Organizar en jornadas (cada equipo juega una vez por jornada)
    const numEquipos = equipos.length
    const numJornadas = numEquipos * 2 - 2 // Fórmula para liga a doble vuelta
    const partidosPorJornada = Math.floor(numEquipos / 2)

    const calendarioFinal: Partido[] = []
    let jornadaActual = 1

    // Asignar jornadas a los partidos
    for (let i = 0; i < partidosMezclados.length; i++) {
      const partido = partidosMezclados[i]
      partido.jornada = jornadaActual
      calendarioFinal.push(partido)

      // Cambiar de jornada cuando se completa
      if ((i + 1) % partidosPorJornada === 0) {
        jornadaActual++
        if (jornadaActual > numJornadas) jornadaActual = 1
      }
    }

    setPartidos(calendarioFinal)
    setCalendarioGenerado(true)

    // Guardar el calendario en el grupo
    guardarPartidos(calendarioFinal)
  }

  // Función para guardar los partidos en localStorage
  const guardarPartidos = (partidosActualizados: Partido[]) => {
    if (!grupo) return

    // Obtener todos los grupos
    const gruposGuardados = JSON.parse(localStorage.getItem("gruposBasketball") || "[]")

    // Encontrar y actualizar el grupo actual
    const gruposActualizados = gruposGuardados.map((g: Grupo) => {
      if (g.id === grupo.id) {
        return {
          ...g,
          partidos: partidosActualizados,
        }
      }
      return g
    })

    // Guardar en localStorage
    localStorage.setItem("gruposBasketball", JSON.stringify(gruposActualizados))

    // Actualizar el grupo actual
    setGrupo({
      ...grupo,
      partidos: partidosActualizados,
    })

    // Calcular clasificación
    calcularClasificacion(partidosActualizados, grupo.equipos)
  }

  // Función para abrir el diálogo de edición de resultado
  const abrirEdicionResultado = (partido: Partido) => {
    setPartidoEditando(partido)
    setPuntosLocal(partido.resultado?.puntosLocal?.toString() || "")
    setPuntosVisitante(partido.resultado?.puntosVisitante?.toString() || "")
  }

  // Función para guardar el resultado de un partido
  const guardarResultado = () => {
    if (!partidoEditando) return

    const puntosLocalNum = Number.parseInt(puntosLocal)
    const puntosVisitanteNum = Number.parseInt(puntosVisitante)

    if (isNaN(puntosLocalNum) || isNaN(puntosVisitanteNum)) {
      alert("Por favor, introduce valores numéricos válidos")
      return
    }

    // Actualizar el partido con el resultado
    const partidosActualizados = partidos.map((p) => {
      if (p.id === partidoEditando.id) {
        return {
          ...p,
          resultado: {
            puntosLocal: puntosLocalNum,
            puntosVisitante: puntosVisitanteNum,
          },
          jugado: true,
        }
      }
      return p
    })

    // Actualizar estado
    setPartidos(partidosActualizados)

    // Guardar en localStorage
    guardarPartidos(partidosActualizados)

    // Cerrar diálogo
    setPartidoEditando(null)

    // Mostrar confeti
    setShowConfetti(true)
  }

  // Función para calcular la clasificación
  const calcularClasificacion = (partidosCalculo: Partido[], equipos: string[]) => {
    // Inicializar estadísticas para cada equipo
    const estadisticas: Record<string, EstadisticasEquipo> = {}

    equipos.forEach((equipo) => {
      estadisticas[equipo] = {
        nombre: equipo,
        jugados: 0,
        ganados: 0,
        perdidos: 0,
        puntosAFavor: 0,
        puntosEnContra: 0,
      }
    })

    // Calcular estadísticas basadas en los partidos jugados
    partidosCalculo.forEach((partido) => {
      if (partido.jugado && partido.resultado) {
        const { local, visitante, resultado } = partido

        // Actualizar partidos jugados
        estadisticas[local].jugados++
        estadisticas[visitante].jugados++

        // Actualizar puntos a favor y en contra
        estadisticas[local].puntosAFavor += resultado.puntosLocal
        estadisticas[local].puntosEnContra += resultado.puntosVisitante
        estadisticas[visitante].puntosAFavor += resultado.puntosVisitante
        estadisticas[visitante].puntosEnContra += resultado.puntosLocal

        // Actualizar victorias y derrotas
        if (resultado.puntosLocal > resultado.puntosVisitante) {
          estadisticas[local].ganados++
          estadisticas[visitante].perdidos++
        } else if (resultado.puntosLocal < resultado.puntosVisitante) {
          estadisticas[visitante].ganados++
          estadisticas[local].perdidos++
        } else {
          // En caso de empate (aunque en baloncesto es raro)
          estadisticas[local].ganados += 0.5
          estadisticas[visitante].ganados += 0.5
          estadisticas[local].perdidos += 0.5
          estadisticas[visitante].perdidos += 0.5
        }
      }
    })

    // Convertir a array y ordenar según los criterios especificados
    const clasificacionArray = Object.values(estadisticas).sort((a, b) => {
      // 1. Primero por partidos jugados (descendente)
      if (b.jugados !== a.jugados) return b.jugados - a.jugados

      // 2. Después por partidos ganados (descendente)
      if (b.ganados !== a.ganados) return b.ganados - a.ganados

      // 3. Después por partidos perdidos (ascendente)
      if (a.perdidos !== b.perdidos) return a.perdidos - b.perdidos

      // 4. Después por puntos a favor (descendente)
      if (b.puntosAFavor !== a.puntosAFavor) return b.puntosAFavor - a.puntosAFavor

      // 5. Finalmente por puntos en contra (ascendente)
      return a.puntosEnContra - b.puntosEnContra
    })

    setClasificacion(clasificacionArray)
  }

  // Agrupar partidos por jornada para mostrarlos
  const partidosPorJornada = partidos.reduce(
    (acc, partido) => {
      if (!acc[partido.jornada]) {
        acc[partido.jornada] = []
      }
      acc[partido.jornada].push(partido)
      return acc
    },
    {} as Record<number, Partido[]>,
  )

  if (!grupo) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/basketball-background.png"
            alt="Basketball court"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <Card className="p-6 bg-white/90 backdrop-blur-sm relative z-10">
          <p>Cargando datos del grupo...</p>
          <Link href="/">
            <Button className="mt-4 bg-cyan-600 hover:bg-cyan-700">Volver al inicio</Button>
          </Link>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col relative">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/basketball-background.png"
          alt="Basketball court with dramatic lighting"
          fill
          priority
          className="object-cover object-center"
          style={{ objectPosition: "center 40%" }} // Ajustar posición para evitar marcas de agua
        />
        {/* Overlay to ensure text is readable and hide watermarks */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Confetti effect */}
      <ConfettiEffect active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="relative z-10 w-full">
        {/* Header with group name */}
        <header className="bg-cyan-800/90 backdrop-blur-sm text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">{grupo.nombre}</h1>
            <div className="flex gap-2">
              {/* Reemplazar botón por icono de casa */}
              <Link href="/">
                <Button variant="outline" size="icon" className="border-white text-white hover:bg-cyan-700 w-10 h-10">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Navigation tabs */}
        <div className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0">
          <div className="container mx-auto">
            <Tabs defaultValue="partidos" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="partidos" className="text-lg py-4 font-medium">
                  <Calendar className="mr-2 h-5 w-5" /> PARTIDOS
                </TabsTrigger>
                <TabsTrigger value="clasificacion" className="text-lg py-4 font-medium">
                  <Trophy className="mr-2 h-5 w-5" /> CLASIFICACIÓN
                </TabsTrigger>
                <TabsTrigger value="equipos" className="text-lg py-4 font-medium">
                  <Users className="mr-2 h-5 w-5" /> EQUIPOS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="partidos" className="p-4">
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">Calendario de Partidos</h2>

                  {!calendarioGenerado ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-6">
                        Genera el calendario para que todos los equipos se enfrenten entre sí en formato ida y vuelta.
                      </p>
                      <Button
                        onClick={generarCalendario}
                        className="bg-cyan-600 hover:bg-cyan-700 text-lg py-6 px-8"
                        disabled={grupo.equipos.length < 2}
                      >
                        Generar Calendario
                      </Button>
                      {grupo.equipos.length < 2 && (
                        <p className="text-red-500 mt-2">Necesitas al menos 2 equipos para generar un calendario</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(partidosPorJornada).map(([jornada, partidosJornada]) => (
                        <div key={jornada} className="border rounded-lg overflow-hidden">
                          <div className="bg-cyan-100 p-3 font-bold">Jornada {jornada}</div>
                          <div className="divide-y">
                            {partidosJornada.map((partido) => (
                              <div key={partido.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 font-medium text-right">
                                  {partido.local}
                                </div>
                                <div className="mx-4 flex items-center">
                                  <span
                                    className={`${partido.jugado ? "bg-cyan-700" : "bg-gray-400"} text-white px-3 py-1 rounded-l-md`}
                                  >
                                    {partido.resultado?.puntosLocal ?? "-"}
                                  </span>
                                  <FireVS />
                                  <span
                                    className={`${partido.jugado ? "bg-cyan-700" : "bg-gray-400"} text-white px-3 py-1 rounded-r-md`}
                                  >
                                    {partido.resultado?.puntosVisitante ?? "-"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 flex-1">{partido.visitante}</div>

                                {modoEdicion && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="ml-2 border-cyan-300 text-cyan-700"
                                    onClick={() => abrirEdicionResultado(partido)}
                                  >
                                    Editar
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-center mt-6">
                        <Button
                          onClick={() => {
                            if (
                              confirm(
                                "¿Estás seguro de que quieres reiniciar el calendario? Se perderán todos los resultados.",
                              )
                            ) {
                              setCalendarioGenerado(false)
                              setPartidos([])
                              guardarPartidos([])
                            }
                          }}
                          variant="outline"
                          className="mr-2"
                        >
                          Reiniciar Calendario
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="clasificacion" className="p-4">
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">Tabla de Clasificación</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-cyan-100">
                          <th className="border p-2 text-left">POSICIÓN</th>
                          <th className="border p-2 text-left">EQUIPO</th>
                          <th className="border p-2 text-center">JUGADOS</th>
                          <th className="border p-2 text-center">GANADOS</th>
                          <th className="border p-2 text-center">PERDIDOS</th>
                          <th className="border p-2 text-center">PF</th>
                          <th className="border p-2 text-center">PC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clasificacion.map((equipo, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border p-2">{index + 1}</td>
                            <td className="border p-2 font-medium">{equipo.nombre}</td>
                            <td className="border p-2 text-center">{equipo.jugados}</td>
                            <td className="border p-2 text-center">{equipo.ganados}</td>
                            <td className="border p-2 text-center">{equipo.perdidos}</td>
                            <td className="border p-2 text-center">{equipo.puntosAFavor}</td>
                            <td className="border p-2 text-center">{equipo.puntosEnContra}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="equipos" className="p-4">
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">Equipos del Grupo</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {grupo.equipos.map((equipo, index) => {
                      // Encontrar estadísticas del equipo
                      const stats = clasificacion.find((e) => e.nombre === equipo) || {
                        jugados: 0,
                        ganados: 0,
                        perdidos: 0,
                        puntosAFavor: 0,
                        puntosEnContra: 0,
                      }

                      return (
                        <Card key={index} className="p-4 bg-cyan-50 border-cyan-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-cyan-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {equipo.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-medium">{equipo}</h3>
                              <p className="text-sm text-gray-500">
                                {stats.jugados} partidos jugados ({stats.ganados} ganados)
                              </p>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Diálogo para editar resultado */}
      <Dialog open={!!partidoEditando} onOpenChange={() => setPartidoEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Resultado</DialogTitle>
            <DialogDescription>
              {partidoEditando && (
                <p className="text-center my-2">
                  {partidoEditando.local} vs {partidoEditando.visitante}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 items-center gap-4 py-4">
            <div className="text-right font-medium">{partidoEditando?.local}</div>
            <Input
              type="number"
              min="0"
              value={puntosLocal}
              onChange={(e) => setPuntosLocal(e.target.value)}
              className="text-center"
            />
            <div></div>

            <div className="text-right font-medium">{partidoEditando?.visitante}</div>
            <Input
              type="number"
              min="0"
              value={puntosVisitante}
              onChange={(e) => setPuntosVisitante(e.target.value)}
              className="text-center"
            />
            <div></div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPartidoEditando(null)}>
              Cancelar
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={guardarResultado}>
              Guardar Resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
