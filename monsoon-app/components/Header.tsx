"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Menu, X, ImportIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import imdLogo from '../app/images/imdlogo.png'
import logo1 from '../app/images/logo1.png'
import logo2 from '../app/images/logo2.png'
import logo3 from '../app/images/logo3.jpeg'


const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Climate Modes', href: '/data-visualizations' },
  { name: 'Monsoon Monitor', href: '/monsoon-monitor' },
  { name: 'News & Insights', href: '/news' },
  { name: 'Contact Us', href: '/contact' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed w-full z-50 bg-white/95 shadow pt-1 pb-1">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Left Side: Main Logo */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center">
              <Image
                src={logo1}
                alt="IMD 150 Years Logo"
                width={150} // Increased size
                height={75} // Increased size
                className="h-16 w-auto" // Adjusted height
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side: Mobile Menu Button and Additional Logos */}
          <div className="flex items-center space-x-6">
            {/* Additional Logos */}
            <div className="hidden md:flex items-center space-x-6">
              {/* <Image
                src={imdLogo}
                alt="Logo 1"
                width={120} // Increased size
                height={60} // Increased size
                className="h-14 w-auto" // Adjusted height
              /> */}
              <Image
                src={logo2}
                alt="Logo 2"
                width={120} // Increased size
                height={60} // Increased size
                className="h-14 w-auto" // Adjusted height
              />
              <Image
                src={logo3}
                alt="Logo 3"
                width={120} // Increased size
                height={60} // Increased size
                className="h-14 w-auto" // Adjusted height
              />
              {/* Uncomment this line if Logo 4 is needed */}
              {/* <Image src={logo4} alt="Logo 4" width={120} height={60} className="h-14 w-auto" /> */}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white shadow-lg"
          >
            <nav className="container mx-auto px-4 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>


  );

}