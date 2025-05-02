"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function CreacionPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Botón de menú hamburguesa */}
      <div className="absolute top-4 right-4 z-30">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMenu}
          className="bg-white/80 hover:bg-white border-2 border-purple-400 w-12 h-12"
        >
          <Menu className="h-6 w-6 text-purple-700" />
        </Button>
      </div>

      {/* Menú desplegable */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-20 flex flex-col p-6"
          >
            <div className="flex flex-col space-y-4 mt-16">
              <Link href="/creacion/crear">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg font-medium text-purple-700 hover:bg-purple-100"
                >
                  Creación
                </Button>
              </Link>
              <Link href="/creacion/grupos">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg font-medium text-purple-700 hover:bg-purple-100"
                >
                  Grupos
                </Button>
              </Link>
              <Link href="/creacion/editar">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg font-medium text-purple-700 hover:bg-purple-100"
                >
                  Editar
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Título central */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 drop-shadow-lg">
          PUNTOS
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Button
            className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl py-6 px-8 rounded-full hover:from-purple-600 hover:to-pink-600 shadow-lg"
            onClick={() => setMenuOpen(true)}
          >
            Comenzar
          </Button>
        </motion.div>
      </motion.div>

      {/* Botón para volver a la página principal */}
      <Link href="/" className="absolute bottom-4 left-4 z-10">
        <Button variant="outline" className="bg-white/80 hover:bg-white border-purple-400 text-purple-700">
          Volver al inicio
        </Button>
      </Link>
    </div>
  )
}
