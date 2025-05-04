import { Card } from "@/components/ui/card"

export default function VideoSection() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h3 className="text-xl font-bold text-center mb-6">Featured Video</h3>
      <div className="max-w-3xl mx-auto">
        <Card className="overflow-hidden">
          <div className="aspect-video relative">
            <video
              className="w-full h-full"
              controls
              autoPlay
              muted
              loop
            >
              {/* Replace '/videos/your-video-file.mp4' with the actual path to your video file */}
              <source src="/videos/mm.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="p-4">
            <h4 className="font-semibold mb-2">Understanding Climate Patterns</h4>
            <p className="text-sm text-gray-600">
              Learn about the complex interactions between climate systems and their impact on climate.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}