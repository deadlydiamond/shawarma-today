import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock } from "lucide-react"
import contentData from "@/src/content/content.json"

export default function Visit() {
  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center gap-4 mb-20">
          <MapPin className="h-8 w-8 md:h-10 md:w-10 text-coffee-dark/60" strokeWidth={1.5} />
          <h1 className="text-5xl md:text-6xl font-heading font-light text-center text-coffee-dark tracking-tight">
          Visit Us
        </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
          {/* Address */}
          <div>
            <div className="flex items-center gap-2 mb-8">
              <MapPin className="h-5 w-5 text-coffee-dark/50" strokeWidth={1.5} />
              <h2 className="text-xs font-heading uppercase tracking-widest text-coffee-dark/50">Address</h2>
              </div>
            <address className="text-coffee-dark/80 not-italic space-y-2 font-body">
              <p className="text-base">{contentData.address.line1}</p>
              <p className="text-base">{contentData.address.city}</p>
              <p className="text-base">{contentData.address.postcode}</p>
              <p className="mt-6 flex items-center gap-2">
                <Phone className="h-5 w-5 text-coffee-dark/50" strokeWidth={1.5} />
                  <a
                    href={`tel:${contentData.phone.replace(/\s/g, "")}`}
                  className="text-base font-body text-coffee-dark/80 hover:text-coffee-dark transition-colors"
                  >
                    {contentData.phone}
                  </a>
                </p>
              </address>
          </div>

          {/* Hours */}
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Clock className="h-5 w-5 text-coffee-dark/50" strokeWidth={1.5} />
              <h2 className="text-xs font-heading uppercase tracking-widest text-coffee-dark/50">Opening Hours</h2>
              </div>
            <div className="space-y-3 text-coffee-dark/80 font-body">
                {contentData.hours.items.map((item) => (
                <div key={item.day} className="flex justify-between text-base">
                  <span className="font-light">{item.day}</span>
                  <span className="font-light">
                      {item.open} - {item.close}
                    </span>
                  </div>
                ))}
              </div>
            <p className="mt-6 text-xs font-body text-coffee-medium/50">
                {contentData.hours.note}
              </p>
          </div>
        </div>

        {/* Map Embed */}
        <div className="mb-16">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2233.123456789!2d-3.2099549!3d55.924805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTXCsDU1JzI5LjMiTiAzwrAxMiczNS44Ilc!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            className="w-full"
              ></iframe>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-coffee-dark text-white hover:bg-coffee-medium transition-all rounded-sm px-10 py-7 text-base font-medium shadow-lg hover:shadow-xl">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=12-14+Comiston+Rd,+Edinburgh+EH10+5QE"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-2 border-coffee-dark text-coffee-dark hover:bg-coffee-dark hover:text-white transition-all rounded-sm px-10 py-7 text-base font-medium">
            <a href={`tel:${contentData.phone.replace(/\s/g, "")}`}>
              Call Us
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
