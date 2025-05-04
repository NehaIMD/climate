"use client";

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion'; // Import for animations
import image1 from '../images/satyabansir.jpg'

// Dynamically import the ChartComponent with SSR disabled
const ChartWithNoSSR = dynamic(() => import('./ChartComponent'), { ssr: false });

const teamMembers = [
  { name: 'Dr. Satyaban Bishoyi Ratna', role: 'Climate Scientist', image: image1 },
  { name: 'John Smith', role: 'Data Analyst', image: '/team/john-smith.jpg' },
  { name: 'Emily Brown', role: 'Meteorologist', image: '/team/emily-brown.jpg' },
];

const impactData = [
  { name: 'Agriculture', value: 75 },
  { name: 'Energy', value: 60 },
  { name: 'Water Resources', value: 85 },
  { name: 'Public Health', value: 70 },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-sky-200">
      <motion.header
        className="py-16 text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl font-bold mb-4">About Climate Patterns Explorer</h1>
        <p className="text-xl text-gray-600">
          Unraveling the complexities of global weather phenomena
        </p>
      </motion.header>

      <main className="container mx-auto px-4">
        {/* Mission Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg mb-4">
            At Climate Patterns Explorer, we aim to make climate phenomena understandable, empowering communities to prepare for their impacts. By simplifying complex concepts, we strive to bridge the gap between scientific research and practical application.
          </p>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Did You Know?</h3>
            <ul className="list-disc list-inside">
              <li>El Niño events have caused droughts in some regions and floods in others.</li>
              <li>La Niña's cooling effect can influence global temperature trends.</li>
              <li>The Indian Ocean Dipole (IOD) significantly affects monsoons and crop yields.</li>
            </ul>
          </div>
        </motion.section>


        {/* Impact Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-semibold mb-4">Global Impact</h2>
          <p className="text-lg mb-4">
            Weather phenomena have far-reaching effects on global systems, influencing everything from food security to disaster preparedness.
          </p>
          <div className="bg-white rounded-lg shadow-md p-6">
            <ChartWithNoSSR data={impactData} />
          </div>
        </motion.section>

        {/* History & Facts Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-semibold mb-4">History of Weather Patterns</h2>
          <p className="text-lg mb-4">
            Did you know that the earliest recorded El Niño event dates back to the 1500s? Explore how these phenomena have shaped history:
          </p>
          <ul className="list-disc list-inside">
            <li><strong>1500s:</strong> El Niño contributed to global weather anomalies, leading to food shortages in South America.</li>
            <li><strong>2009:</strong> A significant El Niño event caused widespread droughts in Australia.</li>
            <li><strong>2010-2012:</strong> La Niña events led to record rainfall in parts of Southeast Asia.</li>
          </ul>
        </motion.section>

        {/* Team Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-semibold mb-4">Meet the Team</h2>
          <p className="text-lg mb-4">
            Our team is composed of passionate experts dedicated to exploring and interpreting climate data for a better tomorrow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                className=" rounded-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                {/* Image Section - Circular */}
                <div className="flex justify-center items-center p-4">
                  <Image
                    src={member.image} // Ensure you have a different image for each team member
                    alt={member.name}
                    width={120}
                    height={120}
                    className="w-32 h-32 object-cover rounded-full" // This makes the image circular
                  />
                </div>

                {/* Text Section - Below Image */}
                <div className="text-center p-4">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
        {/* Call-to-Action Section */}
        <motion.section
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* <h2 className="text-3xl font-semibold mb-4">Ready to Explore?</h2>
          <Link
            href="/patterns"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Discover Weather Patterns
          </Link> */}
        </motion.section>
      </main>
    </div>
  );
}
