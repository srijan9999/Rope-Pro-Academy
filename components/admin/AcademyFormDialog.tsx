"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAvailableCoaches } from "@/hooks/useAvailableCoaches"
import { useToast } from "@/hooks/use-toast"
import type { Academy } from "@/hooks/useAcademies"

interface AcademyFormDialogProps {
    open: boolean
    onClose: () => void
    academy?: Academy | null
    onSuccess: () => void
}

export function AcademyFormDialog({
    open,
    onClose,
    academy,
    onSuccess
}: AcademyFormDialogProps) {
    const { toast } = useToast()
    const { coaches, isLoading: loadingCoaches } = useAvailableCoaches(academy?.id, true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        address: '',
        description: '',
        contactPhone: '',
        contactEmail: '',
        headCoachId: '',
        capacity: 50,
        academyType: 'TRAINING_CENTER' as 'PARTNER_SCHOOL' | 'TRAINING_CENTER' | 'FRANCHISE',
    })

    // Populate form when editing
    useEffect(() => {
        if (academy) {
            setFormData({
                name: academy.name || '',
                location: academy.location || '',
                address: academy.address || '',
                description: academy.description || '',
                contactPhone: academy.contactPhone || '',
                contactEmail: academy.contactEmail || '',
                headCoachId: academy.headCoachId || '',
                capacity: academy.capacity || 50,
                academyType: academy.academyType as 'PARTNER_SCHOOL' | 'TRAINING_CENTER' | 'FRANCHISE',
            })
        } else {
            setFormData({
                name: '',
                location: '',
                address: '',
                description: '',
                contactPhone: '',
                contactEmail: '',
                headCoachId: '',
                capacity: 50,
                academyType: 'TRAINING_CENTER',
            })
        }
    }, [academy, open])

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url = academy
                ? `/api/academies/${academy.id}`
                : '/api/academies'

            const method = academy ? 'PATCH' : 'POST'

            // Prepare data - remove empty strings for optional fields
            const submitData = {
                ...formData,
                headCoachId: formData.headCoachId || null,
                contactPhone: formData.contactPhone || null,
                contactEmail: formData.contactEmail || null,
                description: formData.description || null,
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error?.message || 'Operation failed')
            }

            toast({
                title: 'Success',
                description: result.data.message,
            })

            onSuccess()
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {academy ? 'Edit Academy' : 'Add New Academy'}
                    </DialogTitle>
                    <DialogDescription>
                        {academy
                            ? 'Update academy details and assignments'
                            : 'Create a new training location'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="name">Academy Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Dwarka Sports Complex"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                                minLength={3}
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                placeholder="e.g., Dwarka Sector 10"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                required
                            />
                        </div>

                        {/* Academy Type */}
                        <div className="space-y-2">
                            <Label htmlFor="academyType">Academy Type *</Label>
                            <Select
                                value={formData.academyType}
                                onValueChange={(value) => handleChange('academyType', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PARTNER_SCHOOL">Partner School</SelectItem>
                                    <SelectItem value="TRAINING_CENTER">Training Center</SelectItem>
                                    <SelectItem value="FRANCHISE">Franchise</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Address */}
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="address">Full Address *</Label>
                            <Textarea
                                id="address"
                                placeholder="Complete address with pincode"
                                rows={2}
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                required
                                minLength={10}
                            />
                        </div>

                        {/* Contact Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Contact Phone</Label>
                            <Input
                                id="contactPhone"
                                placeholder="+91-9876543210"
                                value={formData.contactPhone}
                                onChange={(e) => handleChange('contactPhone', e.target.value)}
                            />
                        </div>

                        {/* Contact Email */}
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                placeholder="academy@roproacademy.com"
                                value={formData.contactEmail}
                                onChange={(e) => handleChange('contactEmail', e.target.value)}
                            />
                        </div>

                        {/* Capacity */}
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Student Capacity *</Label>
                            <Input
                                id="capacity"
                                type="number"
                                min={10}
                                max={500}
                                value={formData.capacity}
                                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 50)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Maximum students (10-500)</p>
                        </div>

                        {/* Head Coach Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="headCoachId">Head Coach</Label>
                            <Select
                                value={formData.headCoachId}
                                onValueChange={(value) => handleChange('headCoachId', value === 'none' ? '' : value)}
                                disabled={loadingCoaches}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={
                                        loadingCoaches ? 'Loading coaches...' : 'Select head coach'
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Head Coach</SelectItem>
                                    {coaches.map((coach) => (
                                        <SelectItem key={coach.id} value={coach.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{coach.fullName}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({coach.specialization})
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Assign a head coach to manage this academy
                            </p>
                        </div>

                        {/* Description */}
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Additional details about this academy"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {academy ? 'Update Academy' : 'Create Academy'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
