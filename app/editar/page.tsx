"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface Grupo {
  id: string
  nombre: string
  equipos: string[]
  fechaCreacion: string
}

export default function EditarPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const router = useRouter()

  useEffect(() => {
    // Cargar grupos guardados
    const gruposGuardados = JSON.parse(localStorage.getItem("gruposBasketball") || "[]")
    setGrupos(gruposGuardados)
  }, [])

  const handleEditarPartidos = (grupoId: string) => {
    // Guardar el ID del grupo seleccionado
    localStorage.setItem("grupoActualId", grupoId)
    localStorage.setItem("modoEdicion", "true")
    // Navegar a la página del grupo
    router.push("/grupo")
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
          className="object-cover"
        />
        {/* Overlay to ensure text is readable */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 w-full">
        {/* Header */}
        <header className="bg-cyan-800/90 backdrop-blur-sm text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Editar Resultados</h1>
            <Link href="/">
              <Button variant="outline" className="border-white text-white hover:bg-cyan-700">
                Inicio
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto p-4">
          <Card className="bg-white/90 backdrop-blur-sm p-6">
            <h2 className="text-xl font-bold mb-6 text-cyan-800">Selecciona un grupo para editar resultados</h2>

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
                  <Card key={grupo.id} className="p-4 border-cyan-200 hover:bg-cyan-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-cyan-800">{grupo.nombre}</h3>
                        <p className="text-sm text-gray-500">{grupo.equipos.length} equipos</p>
                      </div>

                      <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => handleEditarPartidos(grupo.id)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Editar Resultados
                      </Button>
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
    </main>
  )
}
