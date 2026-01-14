import Image from "next/image"
import { Info } from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center bg-white">
        <div className="absolute inset-0 opacity-5">
          <Image
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&q=80"
            alt="Leaf & Bean Café"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <Info className="h-8 w-8 md:h-10 md:w-10 text-coffee-dark/60" strokeWidth={1.5} />
            <h1 className="text-5xl md:text-6xl font-heading font-light mb-6 text-coffee-dark tracking-tight">
            About Us
          </h1>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-8 text-coffee-dark/80">
            <p className="text-base font-body leading-relaxed">
                  Leaf & Bean Café is an independent neighbourhood café located in the heart of Morningside, Edinburgh. 
                  We are a family-run business dedicated to serving quality coffee, fresh food, and warm hospitality to our community.
                </p>
            <p className="text-base font-body leading-relaxed">
                  Since opening our doors, we have been committed to creating a welcoming space where neighbours can gather, 
                  work, and enjoy delicious food and drink. Our menu features traditional breakfast favourites, freshly prepared 
                  sandwiches, and a selection of quality coffee and teas.
                </p>
            <p className="text-base font-body leading-relaxed">
                  We take pride in being part of the Morningside community and look forward to serving you. Whether you&apos;re 
                  stopping by for your morning coffee, meeting friends for brunch, or grabbing a quick lunch, we&apos;re here to 
                  make your visit enjoyable.
                </p>
            <p className="text-base font-body leading-relaxed text-coffee-dark">
                  We look forward to welcoming you to Leaf & Bean Café.
                </p>
              </div>
        </div>
      </section>
    </div>
  )
}
