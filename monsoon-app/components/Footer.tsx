import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#FBF8EF] text-black py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">About Climate Patterns Explorer</h3>
            <p className="text-sm">
              Dedicated to providing comprehensive information on global weather patterns,
              including El Niño, La Niña, the Indian Ocean Dipole, and monsoon systems.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/data-visualizations">Climate Modes</Link></li>
              <li><Link href="/monsoon-monitor">Monsoon Monitor</Link></li>
              <li><Link href="/news">News & Insights</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Connect</h3>
            <p className="text-sm mb-4">Stay updated with the latest weather pattern research and analysis.</p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-blue-300 transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-blue-300 transition-colors">Facebook</Link>
              <Link href="#" className="hover:text-blue-300 transition-colors">YouTube</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-blue-800 text-center text-sm">
          <p>&copy; 2024 Climate Patterns Explorer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

