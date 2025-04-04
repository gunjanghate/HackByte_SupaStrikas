import { Button } from "@/components/ui/button"
import { OrbitalGraphic } from "@/components/orbital-graphic"
import Link from "next/link"

export function Hero() {
  return (
    <section className="py-16 md:py-0 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#191A23] mb-6">
              File and Track Your Complaints Securely
            </h1>
            <p className="text-lg text-[#191A23]/80 mb-8">
              Our decentralized platform provides a secure and transparent way for citizens to register complaints and track their progress. With our system, you can be confident that your information is protected and the process is fair.
            </p>
            <Link href="/complaints/new">
            <Button className="bg-[#191A23] text-white hover:bg-[#B9FF66] hover:text-[#191A23] transition-colors">
              File a Complaint
              
            </Button></Link>
          </div>
          <div className="relative">
            <OrbitalGraphic />
          </div>
        </div>
      </div>
    </section>
  )
}