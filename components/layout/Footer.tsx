import { MapPin, Phone, Instagram, Facebook } from "lucide-react"
import contentData from "@/src/content/content.json"

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Leaf & Bean Café</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {contentData.tagline}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Visit Us</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div>
              <p>{contentData.address.line1}</p>
              <p>
                {contentData.address.city} {contentData.address.postcode}
              </p>
                </div>
              </div>
                <a
                  href={`tel:${contentData.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                >
                <Phone className="h-4 w-4" strokeWidth={1.5} />
                  {contentData.phone}
                </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href={contentData.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a
                href={contentData.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} Leaf & Bean Café, Edinburgh, UK. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
