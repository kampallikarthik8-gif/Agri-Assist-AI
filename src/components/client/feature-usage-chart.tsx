
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart"

const chartData = [
  { feature: "Market Insights", interactions: 2345, fill: "var(--color-market)" },
  { feature: "Govt. Schemes", interactions: 1890, fill: "var(--color-schemes)" },
  { feature: "Weather", interactions: 1700, fill: "var(--color-weather)" },
  { feature: "Crop Insurance", interactions: 1520, fill: "var(--color-insurance)" },
  { feature: "Plant Health", interactions: 1300, fill: "var(--color-health)" },
  { feature: "AI Assistant", interactions: 980, fill: "var(--color-assistant)" },
]

const chartConfig = {
  interactions: {
    label: "Interactions",
  },
  market: {
    label: "Market Insights",
    color: "hsl(var(--chart-1))",
  },
  schemes: {
    label: "Govt. Schemes",
    color: "hsl(var(--chart-2))",
  },
  weather: {
    label: "Weather",
    color: "hsl(var(--chart-3))",
  },
  insurance: {
    label: "Crop Insurance",
    color: "hsl(var(--chart-4))",
  },
  health: {
    label: "Plant Health",
    color: "hsl(var(--chart-5))",
  },
  assistant: {
      label: "AI Assistant",
      color: "hsl(var(--muted-foreground))"
  }
} satisfies ChartConfig

export function FeatureUsageChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="feature"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          className="text-xs"
        />
        <XAxis dataKey="interactions" type="number" hide />
        <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltipContent />} />
        <Bar dataKey="interactions" radius={5} />
      </BarChart>
    </ChartContainer>
  )
}
