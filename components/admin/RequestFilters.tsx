'use client'

import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Filter, X } from 'lucide-react'

interface RequestFiltersProps {
    type: string
    priority: string
    onTypeChange: (type: string) => void
    onPriorityChange: (priority: string) => void
    onClear: () => void
}

export function RequestFilters({
    type,
    priority,
    onTypeChange,
    onPriorityChange,
    onClear
}: RequestFiltersProps) {
    const hasFilters = type || priority

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={type || 'ALL'} onValueChange={(val) => onTypeChange(val === 'ALL' ? '' : val)}>
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="LEAVE">Leave</SelectItem>
                    <SelectItem value="MEDICAL_LEAVE">Medical Leave</SelectItem>
                    <SelectItem value="PROFILE_UPDATE">Profile Update</SelectItem>
                    <SelectItem value="ACADEMY_TRANSFER">Academy Transfer</SelectItem>
                    <SelectItem value="BATCH_TRANSFER">Batch Transfer</SelectItem>
                    <SelectItem value="COMPLAINT">Complaint</SelectItem>
                    <SelectItem value="QUERY">Query</SelectItem>
                </SelectContent>
            </Select>

            <Select value={priority || 'ALL'} onValueChange={(val) => onPriorityChange(val === 'ALL' ? '' : val)}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Priorities</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
            </Select>

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={onClear} className="gap-1 h-9">
                    <X className="h-4 w-4" />
                    Clear
                </Button>
            )}
        </div>
    )
}
