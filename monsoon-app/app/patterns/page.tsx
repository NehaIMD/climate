'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const patternData = [
  { name: 'El Niño', description: 'Warm phase of the ENSO cycle', color: 'from-yellow-100 to-orange-200' },
  { name: 'La Niña', description: 'Cool phase of the ENSO cycle', color: 'from-blue-100 to-sky-300' },
  { name: 'IOD', description: 'Indian Ocean temperature oscillation', color: 'from-green-100 to-teal-300' },
]

const timelineData = [
  { year: 1950, elnino: 0.2, lanina: -0.1, iod: 0.1 },
  { year: 1960, elnino: 0.3, lanina: -0.2, iod: -0.1 },
  { year: 1970, elnino: 0.4, lanina: -0.3, iod: 0.2 },
  { year: 1980, elnino: 0.5, lanina: -0.4, iod: -0.2 },
  { year: 1990, elnino: 0.6, lanina: -0.5, iod: 0.3 },
  { year: 2000, elnino: 0.7, lanina: -0.6, iod: -0.3 },
  { year: 2010, elnino: 0.8, lanina: -0.7, iod: 0.4 },
  { year: 2020, elnino: 0.9, lanina: -0.8, iod: -0.4 },
]

const carouselImages = [
  { src: '/images/elnino-drought.jpg', alt: 'El Niño Drought' },
  { src: '/images/lanina-flood.jpg', alt: 'La Niña Flood' },
  { src: '/images/iod-cyclone.jpg', alt: 'IOD Cyclone' },
]

export default function Patterns() {
  const [currentImage, setCurrentImage] = useState(0)

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % carouselImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Weather Patterns</h1>

        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {patternData.map((pattern) => (
              <Card key={pattern.name} className={`bg-gradient-to-br ${pattern.color}`}>
                <CardHeader>
                  <CardTitle>{pattern.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{pattern.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <Tabs defaultValue="elnino">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="elnino">El Niño</TabsTrigger>
              <TabsTrigger value="lanina">La Niña</TabsTrigger>
              <TabsTrigger value="iod">IOD</TabsTrigger>
            </TabsList>
            <TabsContent value="elnino">
              <Card>
                <CardHeader>
                  <CardTitle>El Niño</CardTitle>
                  <CardDescription>The warm phase of the El Niño Southern Oscillation</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>El Niño is characterized by unusually warm ocean temperatures in the Equatorial Pacific. It can cause increased rainfall in the southern United States and Peru, and drought in the western Pacific, affecting countries like Indonesia and Australia.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="lanina">
              <Card>
                <CardHeader>
                  <CardTitle>La Niña</CardTitle>
                  <CardDescription>The cool phase of the El Niño Southern Oscillation</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>La Niña is characterized by unusually cool ocean temperatures in the Equatorial Pacific. It typically brings increased rainfall and flooding to Southeast Asia, and drier conditions to the southern United States.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="iod">
              <Card>
                <CardHeader>
                  <CardTitle>Indian Ocean Dipole (IOD)</CardTitle>
                  <CardDescription>An irregular oscillation of sea-surface temperatures in the Indian Ocean</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>The IOD involves temperature differences between the eastern and western Indian Ocean. A positive IOD can lead to increased rainfall in East Africa and droughts in Australia, while a negative IOD can have opposite effects.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-4">Historical Timeline</h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="elnino" stackId="1" stroke="#FFA500" fill="#FFD700" />
              <Area type="monotone" dataKey="lanina" stackId="1" stroke="#00BFFF" fill="#87CEFA" />
              <Area type="monotone" dataKey="iod" stackId="1" stroke="#32CD32" fill="#90EE90" />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-4">Extreme Weather Events</h2>
          <div className="relative">
            <Image
              src={carouselImages[currentImage].src}
              alt={carouselImages[currentImage].alt}
              width={1200}
              height={600}
              className="w-full h-96 object-cover rounded-lg"
            />
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              &#8592;
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              &#8594;
            </button>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-semibold mb-4">Explore Live Data</h2>
          <Link href="/monsoon-monitor" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Visit Monsoon Monitor
          </Link>
        </section>
      </div>
    </div>
  )
}

