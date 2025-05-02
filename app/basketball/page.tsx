"use client"

import BasketballButton from "@/components/basketball-button"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function BasketballPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/basketball-background.png"
          alt="Basketball court with dramatic lighting"
          fill
          priority
          className="object-cover object-center"
          style={{ objectPosition: "center 40%" }}
        />
        {/* Overlay to ensure text is readable */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Home button */}
      <Link href="/" className="absolute top-4 left-4 z-20">
        <Button variant="outline" size="icon" className="border-white text-white hover:bg-cyan-700/50 w-10 h-10">
          <Home className="h-5 w-5" />
        </Button>
      </Link>

      {/* Page title */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-6xl font-bold text-white mb-12 relative z-10 drop-shadow-lg"
      >
        BALONCESTO
      </motion.h1>

      {/* Main button component */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10"
      >
        <BasketballButton />
      </motion.div>
    </main>
  )
}
