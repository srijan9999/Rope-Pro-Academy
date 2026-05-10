'use client'

import { Card } from '@/components/ui/card'
import { Clock, History } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface IDCardHistoryProps {
    studentId: string
}

export function IDCardHistory({ studentId }: IDCardHistoryProps) {
    const { data, isLoading } = useSWR(
        studentId ? '/api/player/id-card/history' : null,
        fetcher
    )

    const history = data?.data || []

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-gray-600" />
                Card History
            </h3>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : history.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                    No previous versions yet. Changes to your card will appear here.
                </p>
            ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {history.map(
                        (item: {
                            id: string
                            version: number
                            change_reason?: string | null
                            issued_at: string
                            is_revoked: boolean
                        }) => (
                            <div
                                key={item.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border ${item.is_revoked ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600">
                                    v{item.version}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">
                                        {item.change_reason || `Version ${item.version}`}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {new Date(item.issued_at).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                    {item.is_revoked && (
                                        <span className="text-[10px] text-red-600 font-medium">Revoked</span>
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </Card>
    )
}
