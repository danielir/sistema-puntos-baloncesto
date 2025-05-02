"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Users, Edit, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
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
import MonsterAvatar from "@/components/monster-avatar"

interface Miembro {
  id: string
  nombre: string
  puntos: number
}

interface Grupo {
  id: string
  nombre: string
  miembros: Miembro[]
  historial?: Array<{
    fecha: string
    miembroId: string
    accion: string
    puntos: number
  }>
}

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [grupoAEliminar, setGrupoAEliminar] = useState<string | null>(null)

  // Cargar grupos desde localStorage
  useEffect(() => {
    const gruposGuardados = JSON.parse(localStorage.getItem("puntosGrupos") || "[]")
    setGrupos(gruposGuardados)
  }, [])

  const handleEliminarGrupo = () => {
    if (!grupoAEliminar) return

    // Filtrar el grupo a eliminar
    const nuevosGrupos = grupos.filter((grupo) => grupo.id !== grupoAEliminar)
    setGrupos(nuevosGrupos)

    // Guardar en localStorage
    localStorage.setItem("puntosGrupos", JSON.stringify(nuevosGrupos))

    // Cerrar el diálogo
    setGrupoAEliminar(null)
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
          Mis Grupos
        </motion.h1>

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
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-indigo-700">{grupo.nombre}</h2>
                        <p className="text-gray-500 flex items-center mt-1">
                          <Users className="h-4 w-4 mr-1" />
                          {grupo.miembros.length} miembros
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/creacion/grupo/${grupo.id}`}>
                          <Button className="bg-indigo-500 hover:bg-indigo-600">Ver Grupo</Button>
                        </Link>
                        <Link href={`/creacion/editar?id=${grupo.id}`}>
                          <Button variant="outline" size="sm" className="border-indigo-300 text-indigo-600">
                            <Edit className="h-4 w-4 mr-1" /> Editar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => setGrupoAEliminar(grupo.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 font-medium mb-2">Miembros:</p>
                      <div className="flex flex-wrap gap-3">
                        {grupo.miembros.slice(0, 5).map((miembro) => (
                          <MonsterAvatar
                            key={miembro.id}
                            seed={miembro.id + miembro.nombre}
                            name={miembro.nombre}
                            size="sm"
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

        <div className="mt-8 flex justify-center">
          <Link href="/creacion/crear">
            <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
              Crear Nuevo Grupo
            </Button>
          </Link>
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
    </div>
  )
}
