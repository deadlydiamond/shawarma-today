"use client"

import { useScrollAnimation } from '@/lib/useScrollAnimation'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'zoom' | 'rotate'
  delay?: number
  threshold?: number
}

export function AnimatedSection({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1
}: AnimatedSectionProps) {
  const { ref, isInView } = useScrollAnimation<HTMLDivElement>({ threshold })

  const animationClasses = {
    'fade-up': 'scroll-animate',
    'fade-in': 'opacity-0 transition-opacity duration-700',
    'slide-left': 'opacity-0 -translate-x-12 transition-all duration-700',
    'slide-right': 'opacity-0 translate-x-12 transition-all duration-700',
    'zoom': 'opacity-0 scale-95 transition-all duration-500',
    'rotate': 'opacity-0 -rotate-3 scale-95 transition-all duration-500'
  }

  const inViewClasses = {
    'fade-up': 'in-view',
    'fade-in': 'opacity-100',
    'slide-left': 'opacity-100 translate-x-0',
    'slide-right': 'opacity-100 translate-x-0',
    'zoom': 'opacity-100 scale-100',
    'rotate': 'opacity-100 rotate-0 scale-100'
  }

  return (
    <div
      ref={ref}
      className={cn(
        animationClasses[animation],
        isInView && inViewClasses[animation],
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Staggered children animation wrapper
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  threshold?: number
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 100,
  threshold = 0.1
}: StaggerContainerProps) {
  const { ref, isInView } = useScrollAnimation<HTMLDivElement>({ threshold })

  return (
    <div
      ref={ref}
      className={cn('stagger-children', isInView && 'in-view', className)}
      style={{ '--stagger-delay': `${staggerDelay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

// Animated counter component
interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  className?: string
  duration?: number
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  className,
  duration = 2000
}: AnimatedCounterProps) {
  const { ref, isInView } = useScrollAnimation<HTMLSpanElement>()
  
  return (
    <span ref={ref} className={cn('inline-block', className)}>
      {isInView ? (
        <CountUp end={value} duration={duration} prefix={prefix} suffix={suffix} />
      ) : (
        `${prefix}0${suffix}`
      )}
    </span>
  )
}

// Simple count up animation
function CountUp({ 
  end, 
  duration, 
  prefix, 
  suffix 
}: { 
  end: number
  duration: number
  prefix: string
  suffix: string 
}) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])
  
  return <>{prefix}{count}{suffix}</>
}

import { useState, useEffect } from 'react'
