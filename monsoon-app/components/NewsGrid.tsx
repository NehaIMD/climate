import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import elninonews from '../app/images/elnino_home.jpg'
import iodnews from '../app/images/iod_home.png'
import laninanews from '../app/images/lanina_home.jpeg'
const newsItems = [
  {
    title: "El Niño's Impact on Indian Monsoon",
    excerpt: "Recent studies show significant correlation between El Niño strength and monsoon patterns.",
    image: elninonews,
    date: "2024-01-15",
    category: "Research",
    href: "/news"
  },
  {
    title: "New IOD Monitoring System",
    excerpt: "IMD implements advanced monitoring system for Indian Ocean Dipole variations.",
    image: iodnews,
    date: "2024-01-10",
    category: "Technology",
    href: "/news"
  },
  {
    title: "La Niña Forecast Update",
    excerpt: "Latest predictions suggest potential La Niña development by mid-2024.",
    image: laninanews,
    date: "2024-01-05",
    category: "Forecast",
    href: "/news"
  }
]

export default function NewsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {newsItems.map((item) => (
        <Card key={item.title} className="overflow-hidden">
          <div className="relative h-48">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover pt-2 pl-1 pr-1"
            />
          </div>
          <div className="p-4 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-600">{item.category}</span>
              <span className="text-sm text-gray-500">{item.date}</span>
            </div>
            <h3 className="font-bold mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{item.excerpt}</p>
            <Link href={item.href} className="text-blue-600 hover:underline">
              Read more →
            </Link>
          </div>
        </Card>
      ))}
    </div>
  )
}

