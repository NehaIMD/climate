"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from "next/image"

const resources = [
  {
    id: 1,
    title: "El Niño's Global Impact",
    image: "/images/el-nino-impact.jpg",
    description: "Explore how El Niño affects weather patterns across the globe."
  },
  {
    id: 2,
    title: "Monsoon Patterns in South Asia",
    image: "/images/monsoon-patterns.jpg",
    description: "Analyze the changing monsoon patterns and their effects on agriculture."
  },
  {
    id: 3,
    title: "Indian Ocean Dipole and Australian Climate",
    image: "/images/iod-australia.jpg",
    description: "Discover the relationship between the IOD and Australian weather extremes."
  }
]

export default function FeaturedResources() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % resources.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + resources.length) % resources.length)
  }

  return (
    <div className="relative">
      <Card className="bg-gradient-to-r from-blue-900 to-purple-900 text-white overflow-hidden">
        <div className="relative aspect-[16/9]">
          <Image
            src={resources[currentSlide].image}
            alt={resources[currentSlide].title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 p-6 flex flex-col justify-end">
            <h3 className="text-2xl font-bold mb-2">{resources[currentSlide].title}</h3>
            <p>{resources[currentSlide].description}</p>
          </div>
        </div>
      </Card>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {resources.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}

