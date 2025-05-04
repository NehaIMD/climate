"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Card } from "@/components/ui/card"
import VideoSection from '../components/VideoSection'
import NewsGrid from '../components/NewsGrid'
import { motion } from 'framer-motion'
import cloudHomeimage from './images/lightbluesky.jpg'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import monsoon from './images/mm.jpg'
import climate from './images/cm.jpg'
const topics = [
  {
    title: "Understanding Earth's Climate Patterns",
    description:
      "Exploring the intricate relationships between El Niño, La Niña, and the Indian Ocean Dipole",
  },
  {
    title: "El Niño's Global Impact",
    description: "Understanding how El Niño events influence weather patterns worldwide.",
  },
  {
    title: "La Niña: Cooling the Pacific",
    description:
      "Discover the effects of La Niña on agriculture, precipitation, and oceanic circulation.",
  },
  {
    title: "Indian Ocean Dipole Phenomena",
    description:
      "Analyzing the role of the IOD in monsoons and its interactions with global climate systems.",
  },
];

export default function Home() {
  const [currentTopic, setCurrentTopic] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTopic((prev) => (prev + 1) % topics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-sky-200">
      {/* Hero Section */}
      <section className="relative h-[100vh] w-full overflow-hidden">
        <Image
          src={cloudHomeimage}
          alt="Dramatic monsoon clouds over landscape"
          fill
          className="object-cover w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center">
          <div className="container mx-auto px-4 flex flex-col justify-center items-center text-center text-white">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-16">
              Climate Chronicles
            </h2>
            <motion.h1
              key={topics[currentTopic].title}
              className="text-4xl md:text-5xl lg:text-7xl font-bold mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {topics[currentTopic].title}
            </motion.h1>
            <motion.p
              key={topics[currentTopic].description}
              className="text-xl md:text-2xl lg:text-3xl mb-10 max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {topics[currentTopic].description}
            </motion.p>
            <a
              href="/monsoon-monitor"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
            >
              Explore
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold mb-8">Dive Into Interactive Trends</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-2xl font-bold mb-6">Monsoon Trends</h3>
                    <div className="bg-gray-200 w-full h-56 mb-6 rounded-lg flex items-center justify-center">
                      <Image
                        src={monsoon}
                        alt="Map placeholder"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <a
                      href="/monsoon-monitor"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
                    >
                      Explore
                    </a>
                  </Card>
                  <Card className="p-8 shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-2xl font-bold mb-6">Climate Modes</h3>
                    <div className="bg-gray-200 w-full h-56 mb-6 rounded-lg flex items-center justify-center">
                      <Image
                        src={climate}
                        alt="Map placeholder"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <a
              href="/data-visualizations"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
            >
              Explore
            </a>
                  </Card>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="pt-8"
              >
                <h2 className="text-4xl font-bold mb-8">Latest Insights</h2>
                <NewsGrid />
              </motion.div>
            </div>

            {/* Sidebar with Videos */}
            <motion.div
              className="space-y-10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <VideoSection />

              <Card className="p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-6">Quick Links</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="/data-visualizations" className="text-blue-600 hover:underline text-lg">
                      Climate Modes
                    </Link>
                  </li>
                  <li>
                    <Link href="/monsoon-monitor" className="text-blue-600 hover:underline text-lg">
                      Monsoon Monitor
                    </Link>
                  </li>
                  {/* <li>
                    <Link href="/research" className="text-blue-600 hover:underline text-lg">
                      Research Publications
                    </Link>
                  </li> */}
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}