"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { PlusCircle, X, Save, Home } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Grupo {
  id: string
  nombre: string
  equipos: string[]
  fechaCreacion: string
}

export default function CrearPage() {
  const [nombreGrupo, setNombreGrupo] = useState("")
  const [nuevoEquipo, setNuevoEquipo] = useState("")
  const [equipos, setEquipos] = useState<string[]>([])
  const router = useRouter()

  const agregarEquipo = () => {
    if (nuevoEquipo.trim() !== "") {
      setEquipos([...equipos, nuevoEquipo.trim()])
      setNuevoEquipo("")
    }
  }

  const eliminarEquipo = (index: number) => {
    const nuevosEquipos = [...equipos]
    nuevosEquipos.splice(index, 1)
    setEquipos(nuevosEquipos)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Crear un nuevo grupo
    const nuevoGrupo: Grupo = {
      id: Date.now().toString(), // ID único basado en timestamp
      nombre: nombreGrupo,
      equipos: equipos,
      fechaCreacion: new Date().toISOString(),
    }

    // Obtener grupos existentes o inicializar array vacío
    const gruposGuardados = JSON.parse(localStorage.getItem("gruposBasketball") || "[]")

    // Añadir el nuevo grupo
    const nuevosGrupos = [...gruposGuardados, nuevoGrupo]

    // Guardar en localStorage
    localStorage.setItem("gruposBasketball", JSON.stringify(nuevosGrupos))

    // Guardar el grupo actual para la navegación
    localStorage.setItem("grupoActualId", nuevoGrupo.id)

    // Redireccionar a la página del grupo
    router.push("/grupo")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      agregarEquipo()
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative py-10">
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

      <Card className="w-full max-w-md mx-auto p-6 bg-white/90 backdrop-blur-sm shadow-xl rounded-xl relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-cyan-800">Crear Nuevo Grupo</h1>
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-cyan-600 w-10 h-10">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nombreGrupo" className="text-lg font-medium">
              NOMBRE DEL GRUPO
            </Label>
            <Input
              id="nombreGrupo"
              value={nombreGrupo}
              onChange={(e) => setNombreGrupo(e.target.value)}
              className="border-cyan-300 focus:border-cyan-500"
              placeholder="Introduce el nombre del grupo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipos" className="text-lg font-medium">
              EQUIPOS:
            </Label>

            <div className="flex gap-2">
              <Input
                id="nuevoEquipo"
                value={nuevoEquipo}
                onChange={(e) => setNuevoEquipo(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-cyan-300 focus:border-cyan-500"
                placeholder="Añadir equipo"
              />
              <Button type="button" onClick={agregarEquipo} className="bg-cyan-600 hover:bg-cyan-700">
                <PlusCircle size={20} />
              </Button>
            </div>

            <div className="mt-2 space-y-2">
              {equipos.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay equipos añadidos</p>
              ) : (
                equipos.map((equipo, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-cyan-50 p-2 rounded-md border border-cyan-200"
                  >
                    <span>{equipo}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarEquipo(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-6 text-lg font-bold">
            <Save className="mr-2" /> CREAR
          </Button>
        </form>
      </Card>
    </main>
  )
}
