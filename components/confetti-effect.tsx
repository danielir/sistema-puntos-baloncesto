"use client"

import { useEffect, useState } from "react"
import Confetti from "react-confetti"
import { useWindowSize } from "@/hooks/use-window-size"

interface ConfettiEffectProps {
  active: boolean
  onComplete?: () => void
}

export default function ConfettiEffect({ active, onComplete }: ConfettiEffectProps) {
  const { width, height } = useWindowSize()
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (active) {
      setIsActive(true)
      const timer = setTimeout(() => {
        setIsActive(false)
        if (onComplete) onComplete()
      }, 5000) // Duración del confeti: 5 segundos

      return () => clearTimeout(timer)
    }
  }, [active, onComplete])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.2} />
    </div>
  )
}
