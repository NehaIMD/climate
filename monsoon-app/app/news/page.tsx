"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from 'framer-motion'
import elninonews from '../images/elnino_news.jpeg'
import iodnews from '../images/iod_news.png'
import elninoimpact from '../images/elnino_impact.jpg'
import laninaimpact from '../images/lanina_impact.png'
import iodimpact from '../images/iod_impact.jpg'
import ensocycle from '../images/enso_cycle.jpg'
import sstanomally from '../images/sst_anomaly.jpg'
import rainfall from '../images/rainfall.jpg'

const newsItems = [
  {
    type: "RESEARCH",
    title: "El Niño and Its Impact on Indian Monsoon",
    image: elninoimpact,
    author: "DR. AARAV SHARMA",
    date: "November 24, 2024",
    excerpt: "Understanding the link between El Niño events and monsoon anomalies in India.",
    href: "/news/el-nino-impact"
  },
  {
    type: "INSIGHTS",
    title: "La Niña's Role in Shaping Global Rainfall Patterns",
    image: laninaimpact,
    author: "PROF. ISHA GUPTA",
    date: "November 22, 2024",
    excerpt: "Analyzing the impact of La Niña on global weather and its regional effects.",
    href: "/news/la-nina-patterns"
  },
  {
    type: "BLOG",
    title: "Indian Ocean Dipole (IOD) and Its Effect on Rainfall",
    image: iodimpact,
    author: "RESEARCH TEAM",
    date: "November 21, 2024",
    excerpt: "A detailed study on how positive and negative IOD phases affect rainfall patterns.",
    href: "/news/iod-rainfall-effects"
  },
  {
    type: "RESEARCH",
    title: "ENSO Cycle: The Key Driver of Climate Variability",
    image: ensocycle,
    author: "DR. KARAN MEHRA",
    date: "October 31, 2024",
    excerpt: "Exploring the ENSO cycle and its influence on global climate systems.",
    href: "/news/enso-cycle"
  },
  {
    type: "BLOG",
    title: "Sea Surface Temperature Anomalies and Their Impacts",
    image: sstanomally,
    author: "DR. PRIYA AGARWAL",
    date: "September 30, 2024",
    excerpt: "How SST anomalies drive changes in weather patterns worldwide.",
    href: "/news/sst-anomalies"
  },
  {
    type: "INSIGHTS",
    title: "Decoding Rainfall Anomalies During Extreme ENSO Events",
    image: rainfall,
    author: "RESEARCH TEAM",
    date: "September 26, 2024",
    excerpt: "Investigating rainfall variability during extreme El Niño and La Niña events.",
    href: "/news/rainfall-anomalies"
  }
]

export default function NewsAndInsights() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-sky-200">
      <div className="container mx-auto px-4 py-12">
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          News & Insights
        </motion.h1>

        {/* Featured Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={elninonews}
                  alt="Elnino Global Rainfall"
                  fill
                  className="object-cover pt-2 pr-1 pl-1"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                  Unraveling the Impacts of El Niño on Global Rainfall
                </h2>
                <p className="text-gray-600">
                  Researchers are exploring the intricate relationship between El Niño events and global rainfall patterns, aiming to uncover insights that can improve climate predictions, inform water resource management, and support communities worldwide in adapting to climate variability.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={iodnews}
                  alt="Indain Ocean Dipole"
                  fill
                  className="object-cover pt-2 pl-1 pr-1"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* <div className="bg-white/90 rounded-full p-4">
                    <svg className="w-12 h-12" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M8 5v14l11-7z" />
                    </svg>
                  </div> */}
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                  Indian Ocean Dipole and Monsoon Variability
                </h2>
                <p className="text-gray-600">
                  Scientists are investigating the Indian Ocean Dipole's influence on monsoon variability, seeking to enhance understanding of seasonal rainfall patterns, improve forecasting accuracy, and support agriculture and water resource planning in affected regions.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white"
            />
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="climate">Climate Change</SelectItem>
                <SelectItem value="water">Water Resources</SelectItem>
                <SelectItem value="biodiversity">Biodiversity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="research">Research Review</SelectItem>
                <SelectItem value="news">News</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => {
              setSearchQuery("")
              setSelectedTopic("all")
              setSelectedYear("all")
              setSelectedType("all")
            }}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden h-full flex flex-col">
                <div className="relative h-48">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-2 py-1 text-sm rounded">
                      {item.type}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4 flex-1">{item.excerpt}</p>
                  <div className="mt-auto">
                    <div className="text-sm text-gray-500">{item.author}</div>
                    <div className="text-sm text-gray-500">{item.date}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12 space-x-2">
          {[1, 2, 3, 4, 5].map((page) => (
            <Button
              key={page}
              variant={page === 1 ? "default" : "outline"}
              className="w-10 h-10"
            >
              {page}
            </Button>
          ))}
        </div>

        {/* Email Subscription */}
        <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Subscribe to our mailing list</h2>
          <p className="mb-4">Stay updated with the latest news and insights.</p>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="First Name" className="bg-gray-50" />
            <Input placeholder="Last Name" className="bg-gray-50" />
            <Input placeholder="Email" className="md:col-span-2 bg-gray-50" />
            <Select>
              <SelectTrigger className="bg-gray-50">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="bg-gray-50">
                <SelectValue placeholder="State/Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ny">New York</SelectItem>
                <SelectItem value="ca">California</SelectItem>
                <SelectItem value="tx">Texas</SelectItem>
              </SelectContent>
            </Select>
            <Button className="md:col-span-2">Subscribe</Button>
          </form>
        </div>
      </div>
    </div>
  )
}

