"use client"

import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, MapPin, Users, TrendingUp, Building2, RefreshCw } from "lucide-react"
import { useAcademies, type Academy } from "@/hooks/useAcademies"
import { AcademyCard } from "@/components/admin/AcademyCard"
import { AcademyFormDialog } from "@/components/admin/AcademyFormDialog"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"

function LoadingSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-28" />
                ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-80" />
                ))}
            </div>
        </div>
    )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <Card className="p-12">
            <div className="text-center">
                <div className="mx-auto h-12 w-12 text-destructive opacity-50">⚠️</div>
                <h3 className="mt-4 text-lg font-semibold">Failed to load academies</h3>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
                <Button onClick={onRetry} className="mt-6">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            </div>
        </Card>
    )
}

export default function AdminAcademiesPage() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingAcademy, setEditingAcademy] = useState<Academy | null>(null)
    const [deletingAcademy, setDeletingAcademy] = useState<Academy | null>(null)

    const { academies, stats, isLoading, isError, errorMessage, refresh } = useAcademies()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {isLoading ? (
                <LoadingSkeleton />
            ) : isError ? (
                <ErrorState message={errorMessage || 'Unknown error'} onRetry={refresh} />
            ) : (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <h1 className="font-heading text-3xl font-bold uppercase">Academy Management</h1>
                            <p className="text-muted-foreground">Manage all your academies and branches.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => refresh()}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="h-4 w-4" />
                                Add Academy
                            </Button>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Academies</CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalAcademies ?? 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats?.activeAcademies ?? 0} active
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalCapacity ?? 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    students maximum
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalStudents ?? 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    across all locations
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.averageUtilization ?? 0}%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    capacity usage
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Academy Grid */}
                    {academies.length === 0 ? (
                        <Card className="p-12">
                            <div className="text-center">
                                <MapPin className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                                <h3 className="mt-4 text-lg font-semibold">No academies yet</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Get started by creating your first academy location
                                </p>
                                <Button onClick={() => setIsAddDialogOpen(true)} className="mt-6">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Academy
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {academies.map((academy) => (
                                <AcademyCard
                                    key={academy.id}
                                    academy={academy}
                                    onEdit={() => setEditingAcademy(academy)}
                                    onDelete={() => setDeletingAcademy(academy)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Dialogs */}
            <AcademyFormDialog
                open={isAddDialogOpen || !!editingAcademy}
                onClose={() => {
                    setIsAddDialogOpen(false)
                    setEditingAcademy(null)
                }}
                academy={editingAcademy}
                onSuccess={() => {
                    refresh()
                    setIsAddDialogOpen(false)
                    setEditingAcademy(null)
                }}
            />

            <DeleteConfirmDialog
                open={!!deletingAcademy}
                onClose={() => setDeletingAcademy(null)}
                academy={deletingAcademy}
                onSuccess={() => {
                    refresh()
                    setDeletingAcademy(null)
                }}
            />
        </div>
    )
}
