'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'

interface UpdateDetailsFormProps {
    data: {
        blood_group?: string | null
        emergency_contact?: string | null
        emergency_phone?: string | null
        medical_conditions?: string | null
        phone?: string | null
        whatsapp?: string | null
    }
    onUpdate: () => void
}

const bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
]

export function UpdateDetailsForm({ data, onUpdate }: UpdateDetailsFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        blood_group: data.blood_group || '',
        emergency_contact: data.emergency_contact || '',
        emergency_phone: data.emergency_phone || '',
        medical_conditions: data.medical_conditions || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
    })

    const hasChanges = () => {
        return (
            formData.blood_group !== (data.blood_group || '') ||
            formData.emergency_contact !== (data.emergency_contact || '') ||
            formData.emergency_phone !== (data.emergency_phone || '') ||
            formData.medical_conditions !== (data.medical_conditions || '') ||
            formData.phone !== (data.phone || '') ||
            formData.whatsapp !== (data.whatsapp || '')
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!hasChanges()) return

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/player/id-card', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const result = await res.json()
            if (result.success) {
                onUpdate()
            } else {
                alert(result.error?.message || 'Failed to update')
            }
        } catch {
            alert('Failed to update. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Blood Group */}
            <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Blood Group</Label>
                <Select
                    value={formData.blood_group}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, blood_group: v }))}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                        {bloodGroups.map((bg) => (
                            <SelectItem key={bg} value={bg}>
                                {bg}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Emergency Contact Name</Label>
                <Input
                    placeholder="e.g. Father, Mother"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergency_contact: e.target.value }))}
                    className="h-9"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Emergency Phone</Label>
                <Input
                    placeholder="+91 98765 43210"
                    value={formData.emergency_phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergency_phone: e.target.value }))}
                    className="h-9"
                />
            </div>

            {/* Medical */}
            <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Medical Conditions / Allergies</Label>
                <Textarea
                    placeholder="Any conditions to note..."
                    value={formData.medical_conditions}
                    onChange={(e) => setFormData((prev) => ({ ...prev, medical_conditions: e.target.value }))}
                    rows={2}
                />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Phone Number</Label>
                <Input
                    placeholder="+91 12345 67890"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="h-9"
                />
            </div>

            <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isSubmitting || !hasChanges()}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </>
                )}
            </Button>
        </form>
    )
}
