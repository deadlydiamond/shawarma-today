"use client"

import { Clock, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface TimeSlot {
  hour: string
  busyness: number // 0-100
  label: "Not busy" | "A little busy" | "Busy" | "Very busy" | "Usually busy"
}

interface DayData {
  day: string
  times: TimeSlot[]
}

// Today Shawarma restaurant busy times (based on typical fast food/takeaway patterns)
const popularTimesData: DayData[] = [
  {
    day: "Monday",
    times: [
      { hour: "11am", busyness: 25, label: "Not busy" },
      { hour: "12pm", busyness: 65, label: "Busy" },
      { hour: "1pm", busyness: 85, label: "Very busy" },
      { hour: "2pm", busyness: 60, label: "Busy" },
      { hour: "3pm", busyness: 35, label: "A little busy" },
      { hour: "4pm", busyness: 30, label: "A little busy" },
      { hour: "5pm", busyness: 45, label: "A little busy" },
      { hour: "6pm", busyness: 70, label: "Busy" },
      { hour: "7pm", busyness: 85, label: "Very busy" },
      { hour: "8pm", busyness: 75, label: "Busy" },
      { hour: "9pm", busyness: 50, label: "A little busy" },
    ],
  },
  {
    day: "Tuesday",
    times: [
      { hour: "11am", busyness: 25, label: "Not busy" },
      { hour: "12pm", busyness: 70, label: "Busy" },
      { hour: "1pm", busyness: 88, label: "Very busy" },
      { hour: "2pm", busyness: 55, label: "A little busy" },
      { hour: "3pm", busyness: 30, label: "A little busy" },
      { hour: "4pm", busyness: 28, label: "Not busy" },
      { hour: "5pm", busyness: 50, label: "A little busy" },
      { hour: "6pm", busyness: 75, label: "Busy" },
      { hour: "7pm", busyness: 90, label: "Very busy" },
      { hour: "8pm", busyness: 78, label: "Busy" },
      { hour: "9pm", busyness: 55, label: "A little busy" },
    ],
  },
  {
    day: "Wednesday",
    times: [
      { hour: "11am", busyness: 28, label: "Not busy" },
      { hour: "12pm", busyness: 68, label: "Busy" },
      { hour: "1pm", busyness: 85, label: "Very busy" },
      { hour: "2pm", busyness: 52, label: "A little busy" },
      { hour: "3pm", busyness: 32, label: "A little busy" },
      { hour: "4pm", busyness: 30, label: "A little busy" },
      { hour: "5pm", busyness: 48, label: "A little busy" },
      { hour: "6pm", busyness: 72, label: "Busy" },
      { hour: "7pm", busyness: 88, label: "Very busy" },
      { hour: "8pm", busyness: 75, label: "Busy" },
      { hour: "9pm", busyness: 52, label: "A little busy" },
    ],
  },
  {
    day: "Thursday",
    times: [
      { hour: "11am", busyness: 30, label: "A little busy" },
      { hour: "12pm", busyness: 72, label: "Busy" },
      { hour: "1pm", busyness: 90, label: "Very busy" },
      { hour: "2pm", busyness: 58, label: "A little busy" },
      { hour: "3pm", busyness: 35, label: "A little busy" },
      { hour: "4pm", busyness: 32, label: "A little busy" },
      { hour: "5pm", busyness: 55, label: "A little busy" },
      { hour: "6pm", busyness: 78, label: "Busy" },
      { hour: "7pm", busyness: 92, label: "Very busy" },
      { hour: "8pm", busyness: 82, label: "Very busy" },
      { hour: "9pm", busyness: 60, label: "Busy" },
    ],
  },
  {
    day: "Friday",
    times: [
      { hour: "11am", busyness: 35, label: "A little busy" },
      { hour: "12pm", busyness: 80, label: "Very busy" },
      { hour: "1pm", busyness: 95, label: "Very busy" },
      { hour: "2pm", busyness: 65, label: "Busy" },
      { hour: "3pm", busyness: 40, label: "A little busy" },
      { hour: "4pm", busyness: 38, label: "A little busy" },
      { hour: "5pm", busyness: 60, label: "Busy" },
      { hour: "6pm", busyness: 85, label: "Very busy" },
      { hour: "7pm", busyness: 98, label: "Very busy" },
      { hour: "8pm", busyness: 92, label: "Very busy" },
      { hour: "9pm", busyness: 78, label: "Busy" },
      { hour: "10pm", busyness: 55, label: "A little busy" },
    ],
  },
  {
    day: "Saturday",
    times: [
      { hour: "11am", busyness: 45, label: "A little busy" },
      { hour: "12pm", busyness: 82, label: "Very busy" },
      { hour: "1pm", busyness: 95, label: "Very busy" },
      { hour: "2pm", busyness: 75, label: "Busy" },
      { hour: "3pm", busyness: 55, label: "A little busy" },
      { hour: "4pm", busyness: 45, label: "A little busy" },
      { hour: "5pm", busyness: 65, label: "Busy" },
      { hour: "6pm", busyness: 88, label: "Very busy" },
      { hour: "7pm", busyness: 98, label: "Very busy" },
      { hour: "8pm", busyness: 95, label: "Very busy" },
      { hour: "9pm", busyness: 82, label: "Very busy" },
      { hour: "10pm", busyness: 60, label: "Busy" },
    ],
  },
  {
    day: "Sunday",
    times: [
      { hour: "12pm", busyness: 55, label: "A little busy" },
      { hour: "1pm", busyness: 78, label: "Busy" },
      { hour: "2pm", busyness: 88, label: "Very busy" },
      { hour: "3pm", busyness: 72, label: "Busy" },
      { hour: "4pm", busyness: 50, label: "A little busy" },
      { hour: "5pm", busyness: 55, label: "A little busy" },
      { hour: "6pm", busyness: 75, label: "Busy" },
      { hour: "7pm", busyness: 90, label: "Very busy" },
      { hour: "8pm", busyness: 80, label: "Very busy" },
      { hour: "9pm", busyness: 55, label: "A little busy" },
    ],
  },
]

function getBusynessColor(busyness: number): string {
  if (busyness < 40) return "bg-green-500"
  if (busyness < 60) return "bg-yellow-500"
  if (busyness < 80) return "bg-orange-500"
  return "bg-red-500"
}

function getBusynessHeight(busyness: number): string {
  return `${busyness}%`
}

export default function PopularTimes() {
  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" })
  const currentHour = new Date().getHours()
  
  // Get today's data
  const todayData = popularTimesData.find((d) => d.day === currentDay) || popularTimesData[0]
  
  // Find current time slot index
  const currentTimeIndex = todayData.times.findIndex((slot) => {
    const slotHour = parseInt(slot.hour.replace(/[ap]m/, ""))
    const isPM = slot.hour.includes("pm")
    const hour24 = isPM && slotHour !== 12 ? slotHour + 12 : slotHour === 12 && !isPM ? 0 : slotHour
    return hour24 === currentHour
  })

  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-shawarma">
            <TrendingUp className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Popular Times</h3>
            <p className="text-sm text-gray-500">{currentDay}</p>
          </div>
        </div>

        <div className="flex items-end gap-1 h-20">
          {todayData.times.map((timeSlot, index) => {
            const isCurrentTime = currentTimeIndex === index
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full h-16 flex items-end">
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${getBusynessColor(
                      timeSlot.busyness
                    )} ${isCurrentTime ? "ring-2 ring-shawarma ring-offset-1" : ""}`}
                    style={{ height: getBusynessHeight(timeSlot.busyness) }}
                    title={`${timeSlot.hour}: ${timeSlot.label}`}
                  />
                </div>
                <span className={`text-xs mt-1 ${isCurrentTime ? "text-shawarma font-semibold" : "text-gray-400"}`}>
                  {timeSlot.hour.replace("am", "").replace("pm", "")}
                </span>
              </div>
            )
          })}
        </div>

        {currentTimeIndex >= 0 && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-shawarma/10 rounded-full text-sm text-shawarma font-medium">
              <span className="w-2 h-2 bg-shawarma rounded-full animate-pulse" />
              {todayData.times[currentTimeIndex].label} right now
            </span>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Clock className="h-3 w-3" strokeWidth={2} />
            <span>Typical busy times</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
