"use client"

import * as React from "react"
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"

interface BarChartCardProps<T extends Record<string, number | string>> {
    title: string
    description?: string
    data: T[]
    config: ChartConfig
    defaultKey: keyof ChartConfig
}

/**
 * Composant de graphique à barres générique et typé.
 */
export function BarChartCard<T extends { date: string } & Record<string, number | string>> ({
                                                                                                title,
                                                                                                description,
                                                                                                data,
                                                                                                config,
                                                                                                defaultKey,
                                                                                            }: BarChartCardProps<T>) {
    const [activeChart, setActiveChart] = React.useState<keyof typeof config>(defaultKey)

    // Calcul des totaux typés
    const totals = React.useMemo(() => {
        const result: Record<string, number> = {}
        for (const key of Object.keys(config)) {
            result[key] = data.reduce((acc, curr) => {
                const value = Number(curr[key as keyof T])
                return acc + (isNaN(value) ? 0 : value)
            }, 0)
        }
        return result
    }, [data, config])

    return (
        <Card className="py-0">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>

                <div className="flex">
                    {Object.keys(config).map((key) => {
                        const chart = key as keyof typeof config
                        return (
                            <button
                                key={chart}
                                data-active={activeChart === chart}
                                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                                onClick={() => setActiveChart(chart)}
                            >
                                <span className="text-muted-foreground text-xs">{config[chart].label}</span>
                                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {totals[chart].toLocaleString()}
                </span>
                            </button>
                        )
                    })}
                </div>
            </CardHeader>

            <CardContent className="px-2 sm:p-6">
                <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={data}
                        margin={{ left: 12, right: 12 }}
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
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    labelFormatter={(value) =>
                                        new Date(value).toLocaleDateString("fr-FR", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }
                                />
                            }
                        />
                        <Bar dataKey={activeChart as string} fill={`var(--color-${activeChart})`} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
