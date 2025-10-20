"use client"

import * as React from "react"
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts"

import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart"

const chartData = [
    { date: "2024-04-01", stocks: 222, mobile: 150 },
    { date: "2024-04-02", stocks: 97, mobile: 180 },
    { date: "2024-04-03", stocks: 167, mobile: 120 },
    { date: "2024-04-04", stocks: 242, mobile: 260 },
    { date: "2024-04-05", stocks: 373, mobile: 290 },
    { date: "2024-04-06", stocks: 301, mobile: 340 },
    { date: "2024-04-07", stocks: 245, mobile: 180 },
    { date: "2024-04-08", stocks: 409, mobile: 320 },
    { date: "2024-04-09", stocks: 59, mobile: 110 },
    { date: "2024-04-10", stocks: 261, mobile: 190 },
    { date: "2024-04-11", stocks: 327, mobile: 350 },
    { date: "2024-04-12", stocks: 292, mobile: 210 },
    { date: "2024-04-13", stocks: 342, mobile: 380 },
    { date: "2024-04-14", stocks: 137, mobile: 220 },
    { date: "2024-04-15", stocks: 120, mobile: 170 },
    { date: "2024-04-16", stocks: 138, mobile: 190 },
    { date: "2024-04-17", stocks: 446, mobile: 360 },
    { date: "2024-04-18", stocks: 364, mobile: 410 },
    { date: "2024-04-19", stocks: 243, mobile: 180 },
    { date: "2024-04-20", stocks: 89, mobile: 150 },
    { date: "2024-04-21", stocks: 137, mobile: 200 },
    { date: "2024-04-22", stocks: 224, mobile: 170 },
    { date: "2024-04-23", stocks: 138, mobile: 230 },
    { date: "2024-04-24", stocks: 387, mobile: 290 },
    { date: "2024-04-25", stocks: 215, mobile: 250 },
    { date: "2024-04-26", stocks: 75, mobile: 130 },
    { date: "2024-04-27", stocks: 383, mobile: 420 },
    { date: "2024-04-28", stocks: 122, mobile: 180 },
    { date: "2024-04-29", stocks: 315, mobile: 240 },
    { date: "2024-04-30", stocks: 454, mobile: 380 },
    { date: "2024-05-01", stocks: 165, mobile: 220 },
    { date: "2024-05-02", stocks: 293, mobile: 310 },
    { date: "2024-05-03", stocks: 247, mobile: 190 },
    { date: "2024-05-04", stocks: 385, mobile: 420 },
    { date: "2024-05-05", stocks: 481, mobile: 390 },
    { date: "2024-05-06", stocks: 498, mobile: 520 },
    { date: "2024-05-07", stocks: 388, mobile: 300 },
    { date: "2024-05-08", stocks: 149, mobile: 210 },
    { date: "2024-05-09", stocks: 227, mobile: 180 },
    { date: "2024-05-10", stocks: 293, mobile: 330 },
    { date: "2024-05-11", stocks: 335, mobile: 270 },
    { date: "2024-05-12", stocks: 197, mobile: 240 },
    { date: "2024-05-13", stocks: 197, mobile: 160 },
    { date: "2024-05-14", stocks: 448, mobile: 490 },
    { date: "2024-05-15", stocks: 473, mobile: 380 },
    { date: "2024-05-16", stocks: 338, mobile: 400 },
    { date: "2024-05-17", stocks: 499, mobile: 420 },
    { date: "2024-05-18", stocks: 315, mobile: 350 },
    { date: "2024-05-19", stocks: 235, mobile: 180 },
    { date: "2024-05-20", stocks: 177, mobile: 230 },
    { date: "2024-05-21", stocks: 82, mobile: 140 },
    { date: "2024-05-22", stocks: 81, mobile: 120 },
    { date: "2024-05-23", stocks: 252, mobile: 290 },
    { date: "2024-05-24", stocks: 294, mobile: 220 },
    { date: "2024-05-25", stocks: 201, mobile: 250 },
    { date: "2024-05-26", stocks: 213, mobile: 170 },
    { date: "2024-05-27", stocks: 420, mobile: 460 },
    { date: "2024-05-28", stocks: 233, mobile: 190 },
    { date: "2024-05-29", stocks: 78, mobile: 130 },
    { date: "2024-05-30", stocks: 340, mobile: 280 },
    { date: "2024-05-31", stocks: 178, mobile: 230 },
    { date: "2024-06-01", stocks: 178, mobile: 200 },
    { date: "2024-06-02", stocks: 470, mobile: 410 },
    { date: "2024-06-03", stocks: 103, mobile: 160 },
    { date: "2024-06-04", stocks: 439, mobile: 380 },
    { date: "2024-06-05", stocks: 88, mobile: 140 },
    { date: "2024-06-06", stocks: 294, mobile: 250 },
    { date: "2024-06-07", stocks: 323, mobile: 370 },
    { date: "2024-06-08", stocks: 385, mobile: 320 },
    { date: "2024-06-09", stocks: 438, mobile: 480 },
    { date: "2024-06-10", stocks: 155, mobile: 200 },
    { date: "2024-06-11", stocks: 92, mobile: 150 },
    { date: "2024-06-12", stocks: 492, mobile: 420 },
    { date: "2024-06-13", stocks: 81, mobile: 130 },
    { date: "2024-06-14", stocks: 426, mobile: 380 },
    { date: "2024-06-15", stocks: 307, mobile: 350 },
    { date: "2024-06-16", stocks: 371, mobile: 310 },
    { date: "2024-06-17", stocks: 475, mobile: 520 },
    { date: "2024-06-18", stocks: 107, mobile: 170 },
    { date: "2024-06-19", stocks: 341, mobile: 290 },
    { date: "2024-06-20", stocks: 408, mobile: 450 },
    { date: "2024-06-21", stocks: 169, mobile: 210 },
    { date: "2024-06-22", stocks: 317, mobile: 270 },
    { date: "2024-06-23", stocks: 480, mobile: 530 },
    { date: "2024-06-24", stocks: 132, mobile: 180 },
    { date: "2024-06-25", stocks: 141, mobile: 190 },
    { date: "2024-06-26", stocks: 434, mobile: 380 },
    { date: "2024-06-27", stocks: 448, mobile: 490 },
    { date: "2024-06-28", stocks: 149, mobile: 200 },
    { date: "2024-06-29", stocks: 103, mobile: 160 },
    { date: "2024-06-30", stocks: 446, mobile: 400 },
]

const chartConfig = {
    product: {
        label: "Produit",
    },
    stocks: {
        label: "Stocks",
        color: "var(--chart-2)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function ChartBarInteractive() {
    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>("stocks")

    const total = React.useMemo(
        () => ({
            stocks: chartData.reduce((acc, curr) => acc + curr.stocks, 0),
            mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
        }),
        []
    )

    return (
        <Card className="py-0">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
                    <CardTitle>Bar Chart - Interactive</CardTitle>
                    <CardDescription>
                        Showing total visitors for the last 3 months
                    </CardDescription>
                </div>
                <div className="flex">
                    {["stocks"].map((key) => {
                        const chart = key as keyof typeof chartConfig
                        return (
                            <button
                                key={chart}
                                data-active={activeChart === chart}
                                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                                onClick={() => setActiveChart(chart)}
                            >
                                <span className="text-muted-foreground text-xs">
                                  {chartConfig[chart].label}
                                </span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                                  {total[key as keyof typeof total].toLocaleString()}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={true}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("fr-FR", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <YAxis
                            dataKey="stocks"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={40}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="product"
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("fr-FR", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }}
                                />
                            }
                        />
                        <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
