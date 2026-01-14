"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import contentData from "@/src/content/content.json"
import { Phone, Facebook, Instagram, MapPin } from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement form submission
    console.log("Form submitted:", formData)
    alert("Thank you for your message. We'll get back to you soon!")
    setFormData({ name: "", email: "", phone: "", message: "" })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center gap-4 mb-20">
          <Phone className="h-8 w-8 md:h-10 md:w-10 text-coffee-dark/60" strokeWidth={1.5} />
          <h1 className="text-5xl md:text-6xl font-heading font-light text-center text-coffee-dark tracking-tight">
          Contact Us
        </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-xs font-heading uppercase tracking-widest text-coffee-dark/50 mb-6">
                Get in Touch
              </h2>
              <div className="space-y-8">
              <div>
                  <h3 className="text-xs font-heading uppercase tracking-widest text-coffee-dark/50 mb-3">
                  Phone
                </h3>
                <a
                  href={`tel:${contentData.phone.replace(/\s/g, "")}`}
                    className="text-base font-body text-coffee-dark/80 hover:text-coffee-dark transition-colors flex items-center gap-2"
                >
                    <Phone className="h-4 w-4" strokeWidth={1.5} />
                  {contentData.phone}
                </a>
              </div>
              <div>
                  <h3 className="text-xs font-heading uppercase tracking-widest text-coffee-dark/50 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" strokeWidth={1.5} />
                  Address
                </h3>
                  <address className="text-base font-body text-coffee-dark/80 not-italic space-y-1">
                  <p>{contentData.address.line1}</p>
                  <p>
                    {contentData.address.city} {contentData.address.postcode}
                  </p>
                </address>
              </div>
              <div>
                  <h3 className="text-xs font-heading uppercase tracking-widest text-coffee-dark/50 mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  <a
                    href={contentData.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                      className="text-coffee-medium/60 hover:text-coffee-dark transition-colors"
                    aria-label="Facebook"
                  >
                      <Facebook className="h-5 w-5" strokeWidth={1.5} />
                  </a>
                  <a
                    href={contentData.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                      className="text-coffee-medium/60 hover:text-coffee-dark transition-colors"
                    aria-label="Instagram"
                  >
                      <Instagram className="h-5 w-5" strokeWidth={1.5} />
                  </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-xs font-heading uppercase tracking-widest text-coffee-dark/50 mb-6">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                  className="block text-xs font-heading uppercase tracking-widest text-coffee-dark/50 mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  className="w-full px-4 py-3 bg-white border border-coffee-dark/20 text-coffee-dark focus:outline-none focus:border-coffee-dark transition-colors font-body text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                  className="block text-xs font-heading uppercase tracking-widest text-coffee-dark/50 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  className="w-full px-4 py-3 bg-white border border-coffee-dark/20 text-coffee-dark focus:outline-none focus:border-coffee-dark transition-colors font-body text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                  className="block text-xs font-heading uppercase tracking-widest text-coffee-dark/50 mb-2"
                  >
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-coffee-dark/20 text-coffee-dark focus:outline-none focus:border-coffee-dark transition-colors font-body text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                  className="block text-xs font-heading uppercase tracking-widest text-coffee-dark/50 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                  className="w-full px-4 py-3 bg-white border border-coffee-dark/20 text-coffee-dark focus:outline-none focus:border-coffee-dark transition-colors font-body text-sm resize-none"
                  />
                </div>
              <Button type="submit" size="lg" className="w-full bg-coffee-dark text-white hover:bg-coffee-medium transition-all rounded-sm py-7 text-base font-medium shadow-lg hover:shadow-xl">
                  Send Message
                </Button>
              </form>
          </div>
        </div>

        {/* Phone CTA */}
        <div className="text-center pt-8">
          <p className="text-sm font-body text-coffee-medium/60 mb-6">
            Prefer to call? We&apos;re here to help.
          </p>
          <Button asChild size="lg" className="bg-coffee-dark text-white hover:bg-coffee-medium transition-all rounded-sm px-10 py-7 text-base font-medium shadow-lg hover:shadow-xl">
            <a href={`tel:${contentData.phone.replace(/\s/g, "")}`}>
              Call {contentData.phone}
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
