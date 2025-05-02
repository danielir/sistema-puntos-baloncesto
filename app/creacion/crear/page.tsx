"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Trash2, UserPlus, Users, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Miembro {
  id: string
  nombre: string
  puntos: number
}

interface Grupo {
  id: string
  nombre: string
  miembros: Miembro[]
  historial: Array<{
    fecha: string
    miembroId: string
    accion: string
    puntos: number
  }>
}

export default function CrearPage() {
  const router = useRouter()
  const [groupName, setGroupName] = useState("")
  const [nuevoMiembro, setNuevoMiembro] = useState("")
  const [miembros, setMiembros] = useState<Miembro[]>([])

  const agregarMiembro = () => {
    if (nuevoMiembro.trim() !== "") {
      setMiembros([
        ...miembros,
        {
          id: Date.now().toString(),
          nombre: nuevoMiembro.trim(),
          puntos: 0,
        },
      ])
      setNuevoMiembro("")
    }
  }

  const eliminarMiembro = (id: string) => {
    const nuevosMiembros = miembros.filter((miembro) => miembro.id !== id)
    setMiembros(nuevosMiembros)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (groupName.trim() === "") {
      alert("Por favor, introduce un nombre para el grupo")
      return
    }

    if (miembros.length === 0) {
      alert("Por favor, añade al menos un miembro al grupo")
      return
    }

    // Crear un nuevo grupo
    const nuevoGrupo: Grupo = {
      id: Date.now().toString(),
      nombre: groupName.trim(),
      miembros: miembros,
      historial: [],
    }

    // Guardar en localStorage
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    localStorage.setItem("puntosGrupos", JSON.stringify([...gruposGuardados, nuevoGrupo]))

    // Navegar a la página de visualización del grupo
    router.push(`/creacion/grupo/${nuevoGrupo.id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      agregarMiembro()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4 relative">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="w-full shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center">CREACIÓN DE GRUPO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del grupo
              </label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Escribe el nombre del grupo"
                className="border-2 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="mr-2" /> Añadir miembros
              </h3>
              <div className="flex gap-2">
                <Input
                  value={nuevoMiembro}
                  onChange={(e) => setNuevoMiembro(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nombre del miembro"
                  className="border-2 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                />
                <Button onClick={agregarMiembro} className="bg-indigo-500 hover:bg-indigo-600">
                  <UserPlus size={20} />
                </Button>
              </div>
              <AnimatePresence>
                {miembros.map((miembro) => (
                  <motion.div
                    key={miembro.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between bg-indigo-50 p-2 rounded-md border border-indigo-200 mt-2"
                  >
                    <span>{miembro.nombre}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarMiembro(miembro.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 rounded-b-lg">
            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-300"
            >
              Crear Grupo
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
