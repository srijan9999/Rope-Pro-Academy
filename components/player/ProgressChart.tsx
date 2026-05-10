'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

interface ProgressChartProps {
    history: Array<{
        date: string
        proficiency: {
            speed: number
            endurance: number
            freestyle: number
            doubleUnders: number
            overall: number
        }
    }>
}

export function ProgressChart({ history }: ProgressChartProps) {
    // Process data: sort chronologically (oldest first)
    const data = history
        .slice()
        .reverse()
        .map(report => ({
            date: format(parseISO(report.date), 'MMM d'),
            Speed: report.proficiency.speed,
            Endurance: report.proficiency.endurance,
            Freestyle: report.proficiency.freestyle,
            'Double Unders': report.proficiency.doubleUnders,
            Overall: report.proficiency.overall
        }))

    if (history.length === 0) {
        return (
            <div className="flex h-[350px] items-center justify-center text-muted-foreground bg-muted/20 rounded-lg">
                Not enough data to display trends.
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    domain={[0, 100]}
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />

                <Line type="monotone" dataKey="Speed" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Endurance" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Freestyle" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Double Unders" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Overall" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    )
}
