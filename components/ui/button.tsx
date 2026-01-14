import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "primary"
  size?: "sm" | "md" | "lg"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "glass-strong text-foreground hover:scale-105 shadow-lg hover:shadow-xl": variant === "default",
            "bg-shawarma hover:bg-shawarma-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105": variant === "primary",
            "bg-shawarma-50 hover:bg-shawarma-100 text-shawarma-800 border-2 border-shawarma-100 hover:border-shawarma-200 hover:scale-105 shadow-md": variant === "outline",
            "hover:bg-white/20 backdrop-blur-sm": variant === "ghost",
            "underline-offset-4 hover:underline": variant === "link",
            "h-9 px-4 text-sm": size === "sm",
            "h-11 px-6 text-base": size === "md",
            "h-14 px-8 text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
