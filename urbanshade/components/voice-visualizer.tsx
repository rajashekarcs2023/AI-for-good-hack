"use client"

import { useEffect, useRef } from "react"

interface VoiceVisualizerProps {
  isActive: boolean
}

export function VoiceVisualizer({ isActive }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const bars: number[] = []
    const barCount = 5
    const barWidth = 2
    const barSpacing = 2
    const barMaxHeight = height - 2

    // Initialize bars
    for (let i = 0; i < barCount; i++) {
      bars[i] = Math.random() * barMaxHeight * 0.3 + barMaxHeight * 0.2
    }

    const animate = () => {
      if (!isActive) {
        // Gradually reduce bar heights when inactive
        let allZero = true
        for (let i = 0; i < barCount; i++) {
          bars[i] = Math.max(0, bars[i] - 1)
          if (bars[i] > 0) allZero = false
        }

        if (allZero) {
          cancelAnimationFrame(animationRef.current!)
          return
        }
      } else {
        // Randomly adjust bar heights when active
        for (let i = 0; i < barCount; i++) {
          const targetHeight = Math.random() * barMaxHeight * 0.6 + barMaxHeight * 0.2
          bars[i] = bars[i] * 0.8 + targetHeight * 0.2
        }
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw bars
      ctx.fillStyle = "#6366f1"

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + barSpacing)
        const barHeight = bars[i]
        const y = (height - barHeight) / 2

        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, 1)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])

  return <canvas ref={canvasRef} width={20} height={12} className="opacity-70" />
}

