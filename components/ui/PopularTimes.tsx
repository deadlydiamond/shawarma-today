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
  // Restaurant hours: 11am - 10pm (11-22), map to index 0-11
  const currentTimeSlot = currentHour >= 11 && currentHour < 22 ? currentHour - 11 : null

  return (
    <Card className="p-10">
      <CardContent className="p-0">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-shawarma">
            <TrendingUp className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold">Popular Times</h3>
        </div>

        <div className="space-y-6">
          {popularTimesData.map((dayData) => {
            const isToday = dayData.day === currentDay
            return (
              <div key={dayData.day} className={isToday ? "border-l-2 border-gray-900 pl-4" : ""}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isToday ? "text-gray-900" : "text-gray-600"}`}>
                    {dayData.day}
                    {isToday && <span className="ml-2 text-xs text-gray-500">(Today)</span>}
                  </span>
                </div>
                <div className="flex items-end gap-1 h-12">
                  {dayData.times.map((timeSlot, index) => {
                    const isCurrentTime = isToday && currentTimeSlot !== null && index === currentTimeSlot
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="relative w-full h-10 flex items-end">
                          <div
                            className={`w-full rounded-t transition-all duration-300 ${getBusynessColor(
                              timeSlot.busyness
                            )} ${isCurrentTime ? "ring-2 ring-gray-900 ring-offset-1" : ""}`}
                            style={{ height: getBusynessHeight(timeSlot.busyness) }}
                            title={`${timeSlot.hour}: ${timeSlot.label}`}
                          />
                        </div>
                        <span className="text-xs text-gray-400 mt-1">{timeSlot.hour}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" strokeWidth={2} />
            <span>Based on typical restaurant patterns. Actual times may vary.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
