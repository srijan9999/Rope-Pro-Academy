import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonProgress() {
    return (
        <div className="space-y-8">
            {/* Header Skeleton */}
            <div>
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Current Level Card Skeleton */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 border rounded-lg space-y-2">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Skill Proficiency Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-10" />
                            </div>
                            <Skeleton className="h-3 w-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Chart Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>

        </div>
    )
}
