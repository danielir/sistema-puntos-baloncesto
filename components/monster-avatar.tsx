"use client"

import { useState, useEffect } from "react"

// Definimos los monstruos disponibles de Class Dojo
const monstruos = [
  { id: "monster1", color: "green", tipo: "cyclops" },
  { id: "monster2", color: "blue", tipo: "fluffy" },
  { id: "monster3", color: "pink", tipo: "horned" },
  { id: "monster4", color: "orange", tipo: "round" },
  { id: "monster5", color: "purple", tipo: "tentacle" },
  { id: "monster6", color: "red", tipo: "toothy" },
  { id: "monster7", color: "teal", tipo: "multi-eye" },
  { id: "monster8", color: "yellow", tipo: "square" },
]

interface MonsterAvatarProps {
  seed: string
  name: string
  puntos?: number
  size?: "sm" | "md" | "lg"
  showName?: boolean
  onClick?: () => void
}

export default function MonsterAvatar({
  seed,
  name,
  puntos = 0,
  size = "md",
  showName = true,
  onClick,
}: MonsterAvatarProps) {
  const [monstruoIndex, setMonstruoIndex] = useState(0)

  // Generar un índice pseudoaleatorio basado en el seed
  useEffect(() => {
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i)
      hash = hash & hash // Convertir a entero de 32 bits
    }
    setMonstruoIndex(Math.abs(hash) % monstruos.length)
  }, [seed])

  // Determinar el tamaño del avatar
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  }

  // Emoji para representar el monstruo (en una implementación real, usarías imágenes)
  const emojis = ["👾", "👹", "👻", "👽", "🤖", "👺", "😈", "👿"]

  return (
    <div
      className={`flex flex-col items-center ${showName ? "gap-2" : ""} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Contenedor del monstruo con fondo de color */}
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden`}
          style={{
            backgroundColor: ["#a3e635", "#38bdf8", "#fb7185", "#fb923c", "#c084fc", "#f87171", "#2dd4bf", "#facc15"][
              monstruoIndex % 8
            ],
          }}
        >
          {/* Emoji del monstruo (en una implementación real, usarías imágenes) */}
          <div className="text-3xl">{emojis[monstruoIndex]}</div>
        </div>

        {/* Círculo con puntos */}
        {puntos !== undefined && (
          <div
            className={`absolute -top-1 -right-1 ${
              puntos >= 0 ? "bg-green-500" : "bg-red-500"
            } text-white rounded-full flex items-center justify-center font-bold
              ${size === "lg" ? "w-8 h-8 text-sm" : "w-6 h-6 text-xs"}`}
          >
            {puntos > 0 ? `+${puntos}` : puntos}
          </div>
        )}
      </div>

      {showName && (
        <div className="text-center">
          <p className="font-medium text-gray-800 text-sm">{name}</p>
        </div>
      )}
    </div>
  )
}
