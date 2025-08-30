
"use client"

import { Line, LineChart, CartesianGrid, XAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"

const chartData = [
  { day: "Monday", users: 280 },
  { day: "Tuesday", users: 310 },
  { day: "Wednesday", users: 290 },
  { day: "Thursday", users: 320 },
  { day: "Friday", users: 350 },
  { day: "Saturday", users: 380 },
  { day: "Sunday", users: 342 },
]

const chartConfig = {
  users: {
    label: "Active Users",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function UserActivityChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <Tooltip content={<ChartTooltipContent hideLabel />} />
        <Line
          dataKey="users"
          type="monotone"
          stroke="var(--color-users)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
