import Link from 'next/link'

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4">Current Weather Patterns</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">El Niño Status:</h3>
        <p>Moderate El Niño conditions present</p>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">La Niña Status:</h3>
        <p>No La Niña conditions present</p>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">IOD Status:</h3>
        <p>Neutral IOD conditions</p>
      </div>
      <h3 className="font-semibold mb-2">Recent Articles:</h3>
      <ul className="space-y-2">
        <li><Link href="#" className="text-blue-600 hover:underline">Impact of El Niño on Global Temperatures</Link></li>
        <li><Link href="#" className="text-blue-600 hover:underline">Predicting the Next La Niña Event</Link></li>
        <li><Link href="#" className="text-blue-600 hover:underline">IOD's Influence on Australian Rainfall</Link></li>
      </ul>
    </aside>
  )
}

export default Sidebar

