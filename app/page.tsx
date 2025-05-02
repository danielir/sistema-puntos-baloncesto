"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [hoverLeft, setHoverLeft] = useState(false)
  const [hoverRight, setHoverRight] = useState(false)

  const navigateToBasketball = () => {
    router.push("/basketball")
  }

  const navigateToCreacion = () => {
    router.push("/creacion")
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Mitad izquierda - Aplicación de Baloncesto */}
      <motion.div
        className="relative w-full md:w-1/2 h-1/2 md:h-full cursor-pointer overflow-hidden"
        onClick={navigateToBasketball}
        onHoverStart={() => setHoverLeft(true)}
        onHoverEnd={() => setHoverLeft(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/basketball-background.png"
            alt="Basketball court"
            fill
            priority
            className="object-cover object-center"
            style={{ objectPosition: "center 40%" }}
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">BALONCESTO</h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hoverLeft ? 1 : 0, y: hoverLeft ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <span className="text-white mr-2">Entrar</span>
            <ArrowRight className="h-5 w-5 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Mitad derecha - Aplicación de Puntos */}
      <motion.div
        className="relative w-full md:w-1/2 h-1/2 md:h-full cursor-pointer overflow-hidden"
        onClick={navigateToCreacion}
        onHoverStart={() => setHoverRight(true)}
        onHoverEnd={() => setHoverRight(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/monsters-background.png"
            alt="Colorful cartoon monsters"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 drop-shadow-lg">
            PUNTOS
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hoverRight ? 1 : 0, y: hoverRight ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <span className="text-purple-800 mr-2">Entrar</span>
            <ArrowRight className="h-5 w-5 text-purple-800" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
