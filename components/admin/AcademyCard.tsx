"use client"

import { MapPin, Users, Layers, Edit, Trash2, Phone, Mail, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Academy } from "@/hooks/useAcademies"

interface AcademyCardProps {
    academy: Academy
    onEdit: () => void
    onDelete: () => void
}

export function AcademyCard({ academy, onEdit, onDelete }: AcademyCardProps) {
    const utilization = academy.capacity > 0
        ? Math.round((academy._count.students / academy.capacity) * 100)
        : 0

    const getUtilizationColor = (util: number) => {
        if (util >= 90) return 'text-red-500'
        if (util >= 70) return 'text-yellow-500'
        return 'text-green-500'
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
            case 'INACTIVE':
                return <Badge variant="secondary">Inactive</Badge>
            case 'UNDER_MAINTENANCE':
                return <Badge className="bg-yellow-500/10 text-yellow-600 shadow-none border-yellow-200">Maintenance</Badge>
            case 'PLANNED':
                return <Badge variant="outline">Planned</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'PARTNER_SCHOOL':
                return 'Partner School'
            case 'TRAINING_CENTER':
                return 'Training Center'
            case 'FRANCHISE':
                return 'Franchise'
            default:
                return type
        }
    }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all">
            {/* Header Image Area */}
            <div className="h-40 bg-muted w-full relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <MapPin className="h-12 w-12 opacity-20" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-white font-bold text-lg">{academy.name}</h3>
                            <p className="text-white/80 text-xs flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {academy.location}
                            </p>
                        </div>
                        {getStatusBadge(academy.status)}
                    </div>
                </div>
            </div>

            <CardContent className="p-5 space-y-4">
                {/* Head Coach */}
                <div className="flex items-center gap-3">
                    {academy.headCoach ? (
                        <>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {academy.headCoach.fullName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {academy.headCoach.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Head Coach • {academy.headCoach.primarySpecialization}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <UserCheck className="h-5 w-5 opacity-30" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">No Head Coach</p>
                                <p className="text-xs text-muted-foreground">Click edit to assign</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" />
                        </div>
                        <p className="text-lg font-bold">{academy._count.students}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Layers className="h-3 w-3" />
                        </div>
                        <p className="text-lg font-bold">{academy._count.batches}</p>
                        <p className="text-xs text-muted-foreground">Batches</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" />
                        </div>
                        <p className="text-lg font-bold">{academy.capacity}</p>
                        <p className="text-xs text-muted-foreground">Capacity</p>
                    </div>
                </div>

                {/* Capacity Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className={`font-bold ${getUtilizationColor(utilization)}`}>
                            {utilization}%
                        </span>
                    </div>
                    <Progress value={utilization} className="h-2" />
                </div>

                {/* Type & Contact */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                        {getTypeBadge(academy.academyType)}
                    </Badge>
                    <div className="flex items-center gap-3">
                        {academy.contactPhone && (
                            <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                            </span>
                        )}
                        {academy.contactEmail && (
                            <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={onEdit}>
                        <Edit className="h-3 w-3" /> Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={onDelete}
                        disabled={academy._count.students > 0}
                    >
                        <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
