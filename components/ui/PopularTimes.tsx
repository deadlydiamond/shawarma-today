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

// Typical café busy times pattern
const popularTimesData: DayData[] = [
  {
    day: "Monday",
    times: [
      { hour: "8am", busyness: 40, label: "A little busy" },
      { hour: "9am", busyness: 70, label: "Busy" },
      { hour: "10am", busyness: 85, label: "Very busy" },
      { hour: "11am", busyness: 75, label: "Busy" },
      { hour: "12pm", busyness: 90, label: "Very busy" },
      { hour: "1pm", busyness: 95, label: "Very busy" },
      { hour: "2pm", busyness: 80, label: "Very busy" },
      { hour: "3pm", busyness: 60, label: "Busy" },
      { hour: "4pm", busyness: 50, label: "A little busy" },
      { hour: "5pm", busyness: 45, label: "A little busy" },
    ],
  },
  {
    day: "Tuesday",
    times: [
      { hour: "8am", busyness: 45, label: "A little busy" },
      { hour: "9am", busyness: 75, label: "Busy" },
      { hour: "10am", busyness: 88, label: "Very busy" },
      { hour: "11am", busyness: 78, label: "Busy" },
      { hour: "12pm", busyness: 92, label: "Very busy" },
      { hour: "1pm", busyness: 96, label: "Very busy" },
      { hour: "2pm", busyness: 82, label: "Very busy" },
      { hour: "3pm", busyness: 65, label: "Busy" },
      { hour: "4pm", busyness: 55, label: "A little busy" },
      { hour: "5pm", busyness: 48, label: "A little busy" },
    ],
  },
  {
    day: "Wednesday",
    times: [
      { hour: "8am", busyness: 42, label: "A little busy" },
      { hour: "9am", busyness: 72, label: "Busy" },
      { hour: "10am", busyness: 86, label: "Very busy" },
      { hour: "11am", busyness: 76, label: "Busy" },
      { hour: "12pm", busyness: 91, label: "Very busy" },
      { hour: "1pm", busyness: 94, label: "Very busy" },
      { hour: "2pm", busyness: 81, label: "Very busy" },
      { hour: "3pm", busyness: 62, label: "Busy" },
      { hour: "4pm", busyness: 52, label: "A little busy" },
      { hour: "5pm", busyness: 46, label: "A little busy" },
    ],
  },
  {
    day: "Thursday",
    times: [
      { hour: "8am", busyness: 48, label: "A little busy" },
      { hour: "9am", busyness: 78, label: "Busy" },
      { hour: "10am", busyness: 89, label: "Very busy" },
      { hour: "11am", busyness: 79, label: "Busy" },
      { hour: "12pm", busyness: 93, label: "Very busy" },
      { hour: "1pm", busyness: 97, label: "Very busy" },
      { hour: "2pm", busyness: 83, label: "Very busy" },
      { hour: "3pm", busyness: 68, label: "Busy" },
      { hour: "4pm", busyness: 58, label: "A little busy" },
      { hour: "5pm", busyness: 50, label: "A little busy" },
    ],
  },
  {
    day: "Friday",
    times: [
      { hour: "8am", busyness: 50, label: "A little busy" },
      { hour: "9am", busyness: 80, label: "Very busy" },
      { hour: "10am", busyness: 90, label: "Very busy" },
      { hour: "11am", busyness: 82, label: "Very busy" },
      { hour: "12pm", busyness: 95, label: "Very busy" },
      { hour: "1pm", busyness: 98, label: "Very busy" },
      { hour: "2pm", busyness: 85, label: "Very busy" },
      { hour: "3pm", busyness: 70, label: "Busy" },
      { hour: "4pm", busyness: 60, label: "Busy" },
      { hour: "5pm", busyness: 55, label: "A little busy" },
    ],
  },
  {
    day: "Saturday",
    times: [
      { hour: "9am", busyness: 60, label: "Busy" },
      { hour: "10am", busyness: 75, label: "Busy" },
      { hour: "11am", busyness: 85, label: "Very busy" },
      { hour: "12pm", busyness: 92, label: "Very busy" },
      { hour: "1pm", busyness: 96, label: "Very busy" },
      { hour: "2pm", busyness: 88, label: "Very busy" },
      { hour: "3pm", busyness: 80, label: "Very busy" },
      { hour: "4pm", busyness: 70, label: "Busy" },
      { hour: "5pm", busyness: 65, label: "Busy" },
    ],
  },
  {
    day: "Sunday",
    times: [
      { hour: "9am", busyness: 55, label: "A little busy" },
      { hour: "10am", busyness: 70, label: "Busy" },
      { hour: "11am", busyness: 80, label: "Very busy" },
      { hour: "12pm", busyness: 88, label: "Very busy" },
      { hour: "1pm", busyness: 92, label: "Very busy" },
      { hour: "2pm", busyness: 85, label: "Very busy" },
      { hour: "3pm", busyness: 75, label: "Busy" },
      { hour: "4pm", busyness: 65, label: "Busy" },
      { hour: "5pm", busyness: 58, label: "A little busy" },
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
  const currentTimeSlot = currentHour >= 8 && currentHour < 18 ? currentHour - 8 : null

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
            <span>Based on typical café patterns. Actual times may vary.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
