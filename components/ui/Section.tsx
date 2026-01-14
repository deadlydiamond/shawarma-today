import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
}

export function Section({ children, className, ...props }: SectionProps) {
  return (
    <section
      className={cn("py-10 md:py-12 lg:py-16", className)}
      {...props}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {children}
      </div>
    </section>
  )
}
