import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Sidebar from "@/components/Sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Monsoon Monitor",
  description: "Explore climate patterns and climate phenomena with the Indian Meteorological Department",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-b from-blue-50 to-white min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <Header />

          <main className="flex-1 pt-16 md:pt-20">{children}</main>


          <Footer />
        </div>
      </body>
    </html>
  )
}

