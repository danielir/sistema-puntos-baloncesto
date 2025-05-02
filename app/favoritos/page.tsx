"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Trophy, Calendar, Users, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Grupo {
  id: string
  nombre: string
  equipos: string[]
  fechaCreacion: string
}

export default function FavoritosPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [grupoAEliminar, setGrupoAEliminar] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Cargar grupos guardados
    const gruposGuardados = JSON.parse(localStorage.getItem("gruposBasketball") || "[]")
    setGrupos(gruposGuardados)
  }, [])

  const handleVerGrupo = (grupoId: string) => {
    // Guardar el ID del grupo seleccionado
    localStorage.setItem("grupoActualId", grupoId)
    // Navegar a la página del grupo
    router.push("/grupo")
  }

  const handleEliminarGrupo = () => {
    if (!grupoAEliminar) return

    // Filtrar el grupo a eliminar
    const nuevosGrupos = grupos.filter((grupo) => grupo.id !== grupoAEliminar)

    // Actualizar el estado
    setGrupos(nuevosGrupos)

    // Guardar en localStorage
    localStorage.setItem("gruposBasketball", JSON.stringify(nuevosGrupos))

    // Cerrar el diálogo
    setGrupoAEliminar(null)
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

      <div className="relative z-10 w-full">
        {/* Header */}
        <header className="bg-cyan-800/90 backdrop-blur-sm text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Mis Grupos</h1>
            <Link href="/">
              <Button variant="outline" size="icon" className="border-white text-white hover:bg-cyan-700 w-10 h-10">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto p-4">
          <Card className="bg-white/90 backdrop-blur-sm p-6">
            <h2 className="text-xl font-bold mb-6 text-cyan-800">Grupos Favoritos</h2>

            {grupos.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No tienes grupos guardados</p>
                <Link href="/crear">
                  <Button className="bg-cyan-600 hover:bg-cyan-700">Crear Nuevo Grupo</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {grupos.map((grupo) => (
                  <Card key={grupo.id} className="p-4 border-cyan-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-cyan-800">{grupo.nombre}</h3>
                        <p className="text-sm text-gray-500">{grupo.equipos.length} equipos</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                          onClick={() => handleVerGrupo(grupo.id)}
                        >
                          <Trophy className="mr-1 h-4 w-4" />
                          CLASIFICACIÓN
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                          onClick={() => handleVerGrupo(grupo.id)}
                        >
                          <Calendar className="mr-1 h-4 w-4" />
                          PARTIDOS
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                          onClick={() => handleVerGrupo(grupo.id)}
                        >
                          <Users className="mr-1 h-4 w-4" />
                          EQUIPOS
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setGrupoAEliminar(grupo.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Link href="/crear">
                <Button className="bg-cyan-600 hover:bg-cyan-700">Crear Nuevo Grupo</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!grupoAEliminar} onOpenChange={() => setGrupoAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este grupo y todos sus datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminarGrupo} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
