"use client"

import { useEffect, useRef } from "react"

export default function FireVS() {
  const vsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = vsRef.current
    if (!element) return

    // Añadir animación de fuego
    const animate = () => {
      if (!element) return
      element.style.textShadow = `
        0 0 5px rgba(255,100,0,0.8),
        0 0 10px rgba(255,100,0,0.6),
        0 0 15px rgba(255,100,0,0.4),
        0 0 20px rgba(255,50,0,0.2)
      `
    }

    const interval = setInterval(animate, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={vsRef}
      className="font-bold text-xl px-3 py-1 text-white"
      style={{
        background: "linear-gradient(to bottom, #ff4500, #ff8c00)",
        borderRadius: "4px",
        animation: "pulse 1.5s infinite alternate",
      }}
    >
      VS
    </div>
  )
}
