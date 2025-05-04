import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { Phone, Mail, MapPin } from 'lucide-react'
import contactimg from '../images/contact.png'

export default function Contact() {
  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-4xl font-bold text-center mb-12">Contact Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Postal Address</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold">Head,</p>
                    <p>Regional Meteorological Centre,</p>
                    <p>Near R. C. Church,</p>
                    <p>Next to Ashwini Naval Hospital</p>
                    <p>Colaba, MUMBAI - 400005</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <div>
                    <p><span className="font-semibold">Office Tel:</span> 22150517/22174707</p>
                    <p className="text-red-600"><span className="font-semibold">Weather Enquiry:</span> 022-22150431/22174719</p>
                    <p><span className="font-semibold">Mobile Number:</span> 8655308473</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              {/* <h2 className="text-2xl font-bold mb-6">Location Map</h2> */}
              <div className="relative h-[650px] rounded-lg overflow-hidden">
                <Image
                  src={contactimg}
                  alt="Map showing location of Regional Meteorological Centre, Colaba"
                  fill
                  className="object-cover"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

