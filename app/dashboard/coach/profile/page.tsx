"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, User, Shield, Phone, Eye, EyeOff, CheckCircle2, Award, Briefcase } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

interface CoachProfileData {
    email: string
    coachId: string
    fullName: string
    phone: string
    specialization: string | null
    experience: string | null
    certifications: string | null
    bio: string | null
    status: string
    memberSince: string
}

export default function CoachProfilePage() {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Profile data state
    const [profile, setProfile] = useState<CoachProfileData | null>(null)

    // Editable fields
    const [fullName, setFullName] = useState("")
    const [phone, setPhone] = useState("")
    const [specialization, setSpecialization] = useState("")
    const [experience, setExperience] = useState("")
    const [certifications, setCertifications] = useState("")
    const [bio, setBio] = useState("")

    // Password change
    const [showPasswordSection, setShowPasswordSection] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [passwordError, setPasswordError] = useState<string | null>(null)

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true)
                const response = await fetch("/api/coach/profile")
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch profile")
                }

                const profileData = data.data
                setProfile(profileData)

                // Populate form fields
                setFullName(profileData.fullName || "")
                setPhone(profileData.phone || "")
                setSpecialization(profileData.specialization || "")
                setExperience(profileData.experience || "")
                setCertifications(profileData.certifications || "")
                setBio(profileData.bio || "")

            } catch (err) {
                console.error("Error fetching profile:", err)
                setError(err instanceof Error ? err.message : "Failed to load profile")
            } finally {
                setIsLoading(false)
            }
        }

        if (session?.user) {
            fetchProfile()
        }
    }, [session])

    // Handle save
    const handleSave = async () => {
        setSaveSuccess(false)
        setError(null)

        // Password validation
        setPasswordError(null)
        if (showPasswordSection && newPassword) {
            if (!currentPassword) {
                setPasswordError("Current password is required")
                return
            }
            if (newPassword.length < 6) {
                setError("New password must be at least 6 characters")
                return
            }
            if (newPassword !== confirmPassword) {
                setError("Passwords do not match")
                return
            }
        }

        setIsSaving(true)

        try {
            const updateData: Record<string, string> = {
                fullName,
                phone,
                specialization,
                experience,
                certifications,
                bio,
            }

            // Include password if changing
            if (showPasswordSection && newPassword) {
                updateData.currentPassword = currentPassword
                updateData.newPassword = newPassword
            }

            const response = await fetch("/api/coach/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to update profile")
            }

            setSaveSuccess(true)
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setShowPasswordSection(false)

            // Hide success after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000)

        } catch (err) {
            console.error("Error saving profile:", err)
            const errorMessage = err instanceof Error ? err.message : "Failed to save changes"
            if (errorMessage.includes("current password") || errorMessage.includes("Incorrect")) {
                setPasswordError(errorMessage)
            } else {
                setError(errorMessage)
            }
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex">
                <DashboardSidebar role="coach" />
                <div className="flex-1 flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex">
            <DashboardSidebar role="coach" />
            <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Coach Profile</h1>
                    <p className="text-muted-foreground">Manage your coach information and credentials</p>
                </div>

                {/* Success Message */}
                {saveSuccess && (
                    <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Profile updated successfully!</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Section 1: Account Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Account Information
                            </CardTitle>
                            <CardDescription>Your coach account details (read-only)</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={profile?.email || ""}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Coach ID</Label>
                                <Input
                                    value={profile?.coachId || ""}
                                    disabled
                                    className="bg-muted font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Account Status</Label>
                                <Input
                                    value={profile?.status || ""}
                                    disabled
                                    className="bg-muted capitalize"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Member Since</Label>
                                <Input
                                    value={profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString() : ""}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Personal Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Details
                            </CardTitle>
                            <CardDescription>Your personal information</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Professional Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Professional Details
                            </CardTitle>
                            <CardDescription>Your coaching credentials and expertise</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Specialization</Label>
                                <Select value={specialization} onValueChange={setSpecialization}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select specialization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Speed Skipping">Speed Skipping</SelectItem>
                                        <SelectItem value="Freestyle">Freestyle</SelectItem>
                                        <SelectItem value="Double Dutch">Double Dutch</SelectItem>
                                        <SelectItem value="Fitness Training">Fitness Training</SelectItem>
                                        <SelectItem value="Competition Prep">Competition Prep</SelectItem>
                                        <SelectItem value="All-Round">All-Round</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Experience</Label>
                                <Select value={experience} onValueChange={setExperience}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Years of experience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-2 years">1-2 years</SelectItem>
                                        <SelectItem value="3-5 years">3-5 years</SelectItem>
                                        <SelectItem value="5-10 years">5-10 years</SelectItem>
                                        <SelectItem value="10+ years">10+ years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    Certifications
                                </Label>
                                <Textarea
                                    value={certifications}
                                    onChange={(e) => setCertifications(e.target.value)}
                                    placeholder="List your certifications, awards, and qualifications..."
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Bio / About Me</Label>
                                <Textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell students about yourself, your teaching style, achievements..."
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Security */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Security
                            </CardTitle>
                            <CardDescription>Manage your password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!showPasswordSection ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPasswordSection(true)}
                                >
                                    Change Password
                                </Button>
                            ) : (
                                <div className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label>Current Password <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => {
                                                    setCurrentPassword(e.target.value)
                                                    setPasswordError(null)
                                                }}
                                                placeholder="Enter your current password"
                                                className={passwordError ? "border-red-500" : ""}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        {passwordError && (
                                            <p className="text-sm text-red-500">{passwordError}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Password <span className="text-red-500">*</span></Label>
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min 6 characters"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm New Password</Label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setShowPasswordSection(false)
                                            setCurrentPassword("")
                                            setNewPassword("")
                                            setConfirmPassword("")
                                            setPasswordError(null)
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary hover:bg-red-700"
                            size="lg"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
