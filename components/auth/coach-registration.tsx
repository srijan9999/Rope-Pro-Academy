"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    CheckCircle2, Loader2, AlertCircle, ArrowLeft, ArrowRight,
    User, MapPin, Briefcase, Star, Calendar, FileText, ClipboardCheck, Trash2
} from "lucide-react"
import { useUploadThing } from "@/lib/uploadthing"

// ============================================
// CONSTANTS
// ============================================

const STEPS = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Address", icon: MapPin },
    { id: 3, title: "Professional", icon: Briefcase },
    { id: 4, title: "Skills", icon: Star },
    { id: 5, title: "Availability", icon: Calendar },
    { id: 6, title: "Documents", icon: FileText },
    { id: 7, title: "Review", icon: ClipboardCheck },
]

const SPECIALIZATIONS = [
    { value: "SPEED", label: "⚡ Speed Training" },
    { value: "FREESTYLE", label: "🎨 Freestyle Tricks" },
    { value: "DOUBLE_DUTCH", label: "🔄 Double Dutch" },
    { value: "TEAM_DEMO", label: "👥 Team Demo" },
    { value: "FITNESS", label: "💪 Fitness & Conditioning" },
    { value: "ENDURANCE", label: "❤️ Endurance Building" },
    { value: "TECHNIQUE", label: "🎯 Technique Refinement" },
]

const LANGUAGES = ["English", "Hindi", "Marathi", "Punjabi", "Tamil", "Telugu", "Bengali", "Kannada", "Gujarati"]

const AGE_GROUPS = [
    { value: "KIDS_5_7", label: "Kids (5-7 yrs)" },
    { value: "KIDS_8_11", label: "Kids (8-11 yrs)" },
    { value: "TEENS_12_15", label: "Teens (12-15 yrs)" },
    { value: "YOUTH_16_PLUS", label: "Youth (16+ yrs)" },
    { value: "ADULTS", label: "Adults" },
    { value: "SENIORS", label: "Seniors" },
]

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh",
]

// ============================================
// FORM DATA INTERFACE
// ============================================

interface CoachFormData {
    // Step 1: Personal
    fullName: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    dateOfBirth: string
    gender: string

    // Step 2: Address
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    postalCode: string

    // Step 3: Professional
    specializations: string[]
    experienceYears: number
    bio: string
    education: string
    previousExperience: string

    // Step 4: Skills
    skillLevels: {
        speed: number
        freestyle: number
        endurance: number
        technique: number
    }
    languages: string[]
    ageGroups: string[]

    // Step 5: Availability
    availableDays: string[]
    availableTimes: Record<string, string[]>
    employmentType: string
    maxBatches: number

    // Step 6: Documents
    documents: {
        resume: string
        resumeKey: string
        resumeUrl: string
        idProof: string
        certificates: string[]
    }
}

const DEFAULT_FORM_DATA: CoachFormData = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    specializations: [],
    experienceYears: 0,
    bio: "",
    education: "",
    previousExperience: "",
    skillLevels: { speed: 5, freestyle: 5, endurance: 5, technique: 5 },
    languages: [],
    ageGroups: [],
    availableDays: [],
    availableTimes: {},
    employmentType: "PART_TIME",
    maxBatches: 3,
    documents: { resume: "", resumeKey: "", resumeUrl: "", idProof: "", certificates: [] },
}

const STORAGE_KEY = "rpa_coach_registration_draft"

// ============================================
// STEP VALIDATION
// ============================================

function validateStep(step: number, data: CoachFormData): string[] {
    const errors: string[] = []

    switch (step) {
        case 1:
            if (!data.fullName || data.fullName.length < 3) errors.push("Name must be at least 3 characters")
            if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("Valid email is required")
            if (!data.password || data.password.length < 8) errors.push("Password must be at least 8 characters")
            if (data.password !== data.confirmPassword) errors.push("Passwords do not match")
            if (!data.phone || data.phone.length < 10) errors.push("Valid phone number is required")
            if (!data.dateOfBirth) errors.push("Date of birth is required")
            if (!data.gender) errors.push("Gender is required")
            break
        case 2:
            if (!data.addressLine1 || data.addressLine1.length < 5) errors.push("Address is required")
            if (!data.city || data.city.length < 2) errors.push("City is required")
            if (!data.state) errors.push("State is required")
            if (!data.postalCode || !/^\d{6}$/.test(data.postalCode)) errors.push("Valid 6-digit PIN code is required")
            break
        case 3:
            if (data.specializations.length === 0) errors.push("Select at least one specialization")
            if (!data.bio || data.bio.length < 20) errors.push("Bio must be at least 20 characters")
            break
        case 4:
            if (data.languages.length === 0) errors.push("Select at least one language")
            if (data.ageGroups.length === 0) errors.push("Select at least one age group")
            break
        case 5:
            if (data.availableDays.length === 0) errors.push("Select at least one available day")
            if (!data.employmentType) errors.push("Employment type is required")
            break
        case 6:
            if (
                (!data.documents.resumeKey || data.documents.resumeKey.trim() === "") &&
                (!data.documents.resumeUrl || data.documents.resumeUrl.trim() === "")
            ) {
                errors.push("Resume / CV upload is required (PDF, DOC, DOCX up to 8 MB)")
            }
            break
    }

    return errors
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CoachRegistrationForm() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<CoachFormData>(DEFAULT_FORM_DATA)
    const [errors, setErrors] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const [resultData, setResultData] = useState<{ coachId: string; email: string } | null>(null)
    const [draftRestored, setDraftRestored] = useState(false)
    const [isUploadingResume, setIsUploadingResume] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [resumeUploadError, setResumeUploadError] = useState<string | null>(null)

    // Direct browser-to-UploadThing upload for coach resumes (bypasses Vercel 4.5 MB limit)
    const { startUpload, isUploading } = useUploadThing("coachResume", {
        onUploadProgress: (p) => {
            setUploadProgress(p)
        },
        onClientUploadComplete: (res) => {
            if (res && res[0]) {
                const file = res[0]
                updateField("documents", {
                    ...formData.documents,
                    resume: file.name,
                    resumeKey: file.key,
                    resumeUrl: (file as any).ufsUrl || file.url || file.key,
                })
                setResumeUploadError(null)
            }
            setIsUploadingResume(false)
        },
        onUploadError: (err) => {
            setResumeUploadError(err.message || "Failed to upload resume to storage")
            setIsUploadingResume(false)
        },
    })

    // Load draft from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                // Don't restore passwords
                parsed.password = ""
                parsed.confirmPassword = ""
                setFormData(parsed)
                setDraftRestored(true)
                setTimeout(() => setDraftRestored(false), 3000)
            }
        } catch {
            // Ignore parse errors
        }
    }, [])

    // Auto-save to localStorage on changes (debounced)
    const autoSave = useCallback((data: CoachFormData) => {
        try {
            const toSave = { ...data, password: "", confirmPassword: "" }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
        } catch {
            // Ignore storage errors
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => autoSave(formData), 500)
        return () => clearTimeout(timer)
    }, [formData, autoSave])

    const updateField = <K extends keyof CoachFormData>(field: K, value: CoachFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setErrors([])
    }

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setResumeUploadError(null)
        setUploadProgress(0)

        // Client-side extension validation
        const allowedExtensions = [".pdf", ".doc", ".docx"]
        const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
        if (!allowedExtensions.includes(ext)) {
            setResumeUploadError("Invalid file type. Please upload a PDF, DOC, or DOCX document.")
            return
        }

        // Client-side size validation (max 8 MB)
        if (file.size > 8 * 1024 * 1024) {
            setResumeUploadError("File size exceeds 8 MB limit. Please select a smaller file.")
            return
        }

        setIsUploadingResume(true)
        try {
            await startUpload([file])
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to upload resume"
            setResumeUploadError(msg)
            setIsUploadingResume(false)
        }
    }

    const handleRemoveResume = () => {
        updateField("documents", {
            ...formData.documents,
            resume: "",
            resumeKey: "",
            resumeUrl: "",
        })
        setResumeUploadError(null)
        setUploadProgress(0)
    }

    const handleNext = () => {
        const stepErrors = validateStep(currentStep, formData)
        if (stepErrors.length > 0) {
            setErrors(stepErrors)
            return
        }
        setErrors([])
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1)
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    const handleBack = () => {
        setErrors([])
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setErrors([])

        try {
            const response = await fetch("/api/register/coach", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    dateOfBirth: formData.dateOfBirth,
                    gender: formData.gender,
                    addressLine1: formData.addressLine1,
                    addressLine2: formData.addressLine2,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    specializations: formData.specializations,
                    experienceYears: formData.experienceYears,
                    bio: formData.bio,
                    education: formData.education,
                    previousExperience: formData.previousExperience,
                    skillLevels: formData.skillLevels,
                    languages: formData.languages,
                    ageGroups: formData.ageGroups,
                    availableDays: formData.availableDays,
                    availableTimes: formData.availableTimes,
                    employmentType: formData.employmentType,
                    maxBatches: formData.maxBatches,
                    resumeKey: formData.documents.resumeKey,
                    resumeUrl: formData.documents.resumeKey || formData.documents.resumeUrl,
                    documents: formData.documents,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error?.message || "Registration failed")
            }

            // Clear draft
            localStorage.removeItem(STORAGE_KEY)

            setResultData({
                coachId: result.data.coachId,
                email: result.data.email,
            })
            setIsComplete(true)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Registration failed. Please try again."
            setErrors([message])
        } finally {
            setIsSubmitting(false)
        }
    }

    // ============================================
    // SUCCESS SCREEN
    // ============================================

    if (isComplete && resultData) {
        return (
            <div className="flex min-h-[600px] items-center justify-center p-4">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl text-green-700 dark:text-green-400">
                            Application Submitted!
                        </CardTitle>
                        <CardDescription>
                            Your coach application has been received and is under review.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-muted p-4 text-left">
                            <div className="flex justify-between py-1 text-sm">
                                <span className="text-muted-foreground">Application ID:</span>
                                <span className="font-mono font-semibold">{resultData.coachId}</span>
                            </div>
                            <div className="flex justify-between py-1 text-sm">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-semibold">{resultData.email}</span>
                            </div>
                            <div className="flex justify-between py-1 text-sm">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="font-semibold text-yellow-600">Pending Review</span>
                            </div>
                        </div>

                        <div className="rounded-lg border p-4 text-left text-sm text-muted-foreground space-y-2">
                            <p className="font-semibold text-foreground">What happens next?</p>
                            <ol className="list-inside list-decimal space-y-1">
                                <li>Application review by head coach (1-2 business days)</li>
                                <li>Resume and credentials verification</li>
                                <li>Interview invitation via email/phone</li>
                                <li>Background check & onboarding</li>
                            </ol>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => router.push("/")}>
                            Return Home
                        </Button>
                        <Button onClick={() => router.push("/login")} className="bg-primary hover:bg-red-700">
                            Go to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    // ============================================
    // STEP RENDERER
    // ============================================

    const progressValue = ((currentStep - 1) / (STEPS.length - 1)) * 100

    return (
        <div className="mx-auto max-w-3xl p-4">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
                    <span>Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}</span>
                    <span>{Math.round(progressValue)}% Completed</span>
                </div>
                <Progress value={progressValue} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="mb-8 hidden sm:flex justify-between">
                {STEPS.map((s) => {
                    const Icon = s.icon
                    const isDone = s.id < currentStep
                    const isCurrent = s.id === currentStep
                    return (
                        <div key={s.id} className="flex flex-col items-center">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                                isDone
                                    ? "border-green-600 bg-green-600 text-white"
                                    : isCurrent
                                        ? "border-primary bg-primary text-white"
                                        : "border-muted-foreground/30 text-muted-foreground"
                            }`}>
                                {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                            </div>
                            <span className={`mt-1 text-xs ${isCurrent ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                                {s.title}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Draft notice */}
            {draftRestored && (
                <div className="mb-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    ℹ️ Restored your previous draft application.
                </div>
            )}

            {/* Error alerts */}
            {errors.length > 0 && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold mb-1">
                        <AlertCircle className="h-4 w-4" /> Please fix the following:
                    </div>
                    <ul className="list-inside list-disc text-sm text-red-600 dark:text-red-300">
                        {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Main Form Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {(() => {
                            const Icon = STEPS[currentStep - 1].icon
                            return <Icon className="h-6 w-6 text-primary" />
                        })()}
                        {STEPS[currentStep - 1].title}
                    </CardTitle>
                    <CardDescription>
                        {currentStep === 1 && "Basic information to create your coach account"}
                        {currentStep === 2 && "Your residential address in India"}
                        {currentStep === 3 && "Your coaching background and specialization"}
                        {currentStep === 4 && "Self-assess your skipping skills and preferences"}
                        {currentStep === 5 && "When and how you are available to coach"}
                        {currentStep === 6 && "Upload your Resume / CV (mandatory) and optional documents"}
                        {currentStep === 7 && "Review all information before submitting"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* STEP 1: Personal */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name *</Label>
                                        <Input id="fullName" value={formData.fullName} onChange={e => updateField("fullName", e.target.value)} placeholder="e.g. John Doe" />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input id="email" type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} placeholder="coach@example.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input id="phone" value={formData.phone} onChange={e => updateField("phone", e.target.value)} placeholder="10-digit mobile number" maxLength={10} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password *</Label>
                                            <Input id="password" type="password" value={formData.password} onChange={e => updateField("password", e.target.value)} placeholder="Min 8 characters" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                            <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={e => updateField("confirmPassword", e.target.value)} placeholder="Re-enter password" />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="dob">Date of Birth *</Label>
                                            <Input id="dob" type="date" value={formData.dateOfBirth} onChange={e => updateField("dateOfBirth", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender *</Label>
                                            <Select value={formData.gender} onValueChange={v => updateField("gender", v)}>
                                                <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MALE">Male</SelectItem>
                                                    <SelectItem value="FEMALE">Female</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Address */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="addr1">Address Line 1 *</Label>
                                        <Input id="addr1" value={formData.addressLine1} onChange={e => updateField("addressLine1", e.target.value)} placeholder="Flat/House No., Building, Street" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="addr2">Address Line 2</Label>
                                        <Input id="addr2" value={formData.addressLine2} onChange={e => updateField("addressLine2", e.target.value)} placeholder="Locality, Landmark (optional)" />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City *</Label>
                                            <Input id="city" value={formData.city} onChange={e => updateField("city", e.target.value)} placeholder="e.g. New Delhi" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State *</Label>
                                            <Select value={formData.state} onValueChange={v => updateField("state", v)}>
                                                <SelectTrigger id="state"><SelectValue placeholder="Select state" /></SelectTrigger>
                                                <SelectContent>
                                                    {INDIAN_STATES.map(st => (
                                                        <SelectItem key={st} value={st}>{st}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pin">PIN Code *</Label>
                                            <Input id="pin" value={formData.postalCode} onChange={e => updateField("postalCode", e.target.value)} placeholder="6-digit PIN" maxLength={6} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Professional */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Specializations * (Select at least one)</Label>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {SPECIALIZATIONS.map(s => {
                                                const checked = formData.specializations.includes(s.value)
                                                return (
                                                    <div
                                                        key={s.value}
                                                        onClick={() => {
                                                            const updated = checked
                                                                ? formData.specializations.filter(x => x !== s.value)
                                                                : [...formData.specializations, s.value]
                                                            updateField("specializations", updated)
                                                        }}
                                                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                                                            checked ? "border-primary bg-primary/5 font-semibold text-primary" : "border-border hover:bg-muted"
                                                        }`}
                                                    >
                                                        <Checkbox checked={checked} />
                                                        <span>{s.label}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="exp">Total Skipping Experience (Years) *</Label>
                                        <Input id="exp" type="number" min={0} max={50} value={formData.experienceYears} onChange={e => updateField("experienceYears", parseInt(e.target.value) || 0)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio & Coaching Philosophy * (min 20 characters)</Label>
                                        <Textarea id="bio" rows={4} value={formData.bio} onChange={e => updateField("bio", e.target.value)} placeholder="Tell us about your rope skipping journey and why you want to coach..." />
                                        <p className="text-xs text-muted-foreground">{formData.bio.length}/1000 characters (min 20)</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edu">Education / Academic Background</Label>
                                        <Input id="edu" value={formData.education} onChange={e => updateField("education", e.target.value)} placeholder="e.g. B.P.Ed / Graduation" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="prevExp">Previous Coaching Experience</Label>
                                        <Textarea id="prevExp" rows={2} value={formData.previousExperience} onChange={e => updateField("previousExperience", e.target.value)} placeholder="Any previous academies, schools, or clubs you've coached with..." />
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: Skills */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <Label>Self-Assessed Skill Levels (1-10)</Label>
                                        {(["speed", "freestyle", "endurance", "technique"] as const).map(skill => (
                                            <div key={skill} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="capitalize">{skill}</span>
                                                    <span className="font-semibold text-primary">{formData.skillLevels[skill]}/10</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min={1}
                                                    max={10}
                                                    value={formData.skillLevels[skill]}
                                                    onChange={e => updateField("skillLevels", {
                                                        ...formData.skillLevels,
                                                        [skill]: parseInt(e.target.value),
                                                    })}
                                                    className="w-full accent-primary"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Languages Spoken * (Select at least one)</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {LANGUAGES.map(lang => {
                                                const checked = formData.languages.includes(lang)
                                                return (
                                                    <button
                                                        type="button"
                                                        key={lang}
                                                        onClick={() => {
                                                            const updated = checked
                                                                ? formData.languages.filter(l => l !== lang)
                                                                : [...formData.languages, lang]
                                                            updateField("languages", updated)
                                                        }}
                                                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                                            checked ? "border-primary bg-primary text-white" : "border-border hover:bg-muted"
                                                        }`}
                                                    >
                                                        {lang}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Preferred Age Groups * (Select at least one)</Label>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                            {AGE_GROUPS.map(ag => {
                                                const checked = formData.ageGroups.includes(ag.value)
                                                return (
                                                    <div
                                                        key={ag.value}
                                                        onClick={() => {
                                                            const updated = checked
                                                                ? formData.ageGroups.filter(x => x !== ag.value)
                                                                : [...formData.ageGroups, ag.value]
                                                            updateField("ageGroups", updated)
                                                        }}
                                                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-xs transition-colors ${
                                                            checked ? "border-primary bg-primary/5 font-semibold text-primary" : "border-border hover:bg-muted"
                                                        }`}
                                                    >
                                                        <Checkbox checked={checked} />
                                                        <span>{ag.label}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5: Availability */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Available Days * (Select all that apply)</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS_OF_WEEK.map(d => {
                                                const checked = formData.availableDays.includes(d)
                                                return (
                                                    <button
                                                        type="button"
                                                        key={d}
                                                        onClick={() => {
                                                            const updated = checked
                                                                ? formData.availableDays.filter(x => x !== d)
                                                                : [...formData.availableDays, d]
                                                            updateField("availableDays", updated)
                                                        }}
                                                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                                                            checked ? "border-primary bg-primary text-white" : "border-border hover:bg-muted"
                                                        }`}
                                                    >
                                                        {d.slice(0, 3)}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="empType">Employment Type *</Label>
                                            <Select value={formData.employmentType} onValueChange={v => updateField("employmentType", v)}>
                                                <SelectTrigger id="empType"><SelectValue placeholder="Select type" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                                                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                                    <SelectItem value="CONTRACT">Contract</SelectItem>
                                                    <SelectItem value="FREELANCE">Freelance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="maxBatches">Max Batches Preferred</Label>
                                            <Input id="maxBatches" type="number" min={1} max={10} value={formData.maxBatches} onChange={e => updateField("maxBatches", parseInt(e.target.value) || 3)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 6: Documents */}
                            {currentStep === 6 && (
                                <div className="space-y-6">
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                            📄 Resume / CV upload is mandatory. Accepted formats: PDF, DOC, DOCX (up to 8 MB).
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2" aria-live="polite">
                                            <Label htmlFor="resume">
                                                Resume / CV <span className="text-red-600 font-bold">*</span>
                                            </Label>
                                            
                                            {!formData.documents.resumeKey && !formData.documents.resumeUrl ? (
                                                <>
                                                    <Input
                                                        id="resume"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        disabled={isUploadingResume || isUploading}
                                                        onChange={handleResumeUpload}
                                                    />
                                                    {(isUploadingResume || isUploading) && (
                                                        <div className="space-y-1.5 mt-2">
                                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                                                    Uploading and validating CV...
                                                                </span>
                                                                <span className="font-semibold">{uploadProgress}%</span>
                                                            </div>
                                                            <Progress value={uploadProgress} className="h-1.5" />
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50/70 p-3.5 dark:border-green-900/50 dark:bg-green-950/20">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                                                                CV uploaded successfully
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                                                                {formData.documents.resume || "Resume Document"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleRemoveResume}
                                                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 h-8 gap-1 shrink-0"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}

                                            {resumeUploadError && (
                                                <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1.5">
                                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {resumeUploadError}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="idProof">ID Proof <span className="text-xs text-muted-foreground">(Aadhaar/PAN/Passport - Optional)</span></Label>
                                            <Input id="idProof" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => {
                                                const file = e.target.files?.[0]
                                                if (file) updateField("documents", { ...formData.documents, idProof: file.name })
                                            }} />
                                            {formData.documents.idProof && <p className="text-xs text-green-600">✓ {formData.documents.idProof}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="certs">Coaching Certificates <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                                            <Input id="certs" type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={e => {
                                                const files = e.target.files
                                                if (files) {
                                                    const names = Array.from(files).map(f => f.name)
                                                    updateField("documents", { ...formData.documents, certificates: names })
                                                }
                                            }} />
                                            {formData.documents.certificates.length > 0 && (
                                                <div className="text-xs text-green-600">
                                                    {formData.documents.certificates.map((c, i) => <p key={i}>✓ {c}</p>)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 7: Review */}
                            {currentStep === 7 && (
                                <div className="space-y-6">
                                    {/* Personal */}
                                    <ReviewSection title="👤 Personal Information">
                                        <ReviewRow label="Name" value={formData.fullName} />
                                        <ReviewRow label="Email" value={formData.email} />
                                        <ReviewRow label="Phone" value={formData.phone} />
                                        <ReviewRow label="DOB" value={formData.dateOfBirth} />
                                        <ReviewRow label="Gender" value={formData.gender} />
                                    </ReviewSection>

                                    {/* Address */}
                                    <ReviewSection title="📍 Address">
                                        <ReviewRow label="Line 1" value={formData.addressLine1} />
                                        <ReviewRow label="Line 2" value={formData.addressLine2 || "—"} />
                                        <ReviewRow label="City, State" value={`${formData.city}, ${formData.state}`} />
                                        <ReviewRow label="PIN" value={formData.postalCode} />
                                    </ReviewSection>

                                    {/* Professional */}
                                    <ReviewSection title="💼 Professional">
                                        <ReviewRow label="Specializations" value={formData.specializations.map(s => s.replace("_", " ")).join(", ")} />
                                        <ReviewRow label="Experience" value={`${formData.experienceYears} years`} />
                                        <ReviewRow label="Education" value={formData.education || "—"} />
                                    </ReviewSection>

                                    {/* Availability */}
                                    <ReviewSection title="📅 Availability">
                                        <ReviewRow label="Days" value={formData.availableDays.map(d => d.charAt(0) + d.slice(1).toLowerCase()).join(", ")} />
                                        <ReviewRow label="Employment" value={formData.employmentType.replace("_", " ")} />
                                        <ReviewRow label="Max Batches" value={String(formData.maxBatches)} />
                                    </ReviewSection>

                                    {/* Documents */}
                                    <ReviewSection title="📄 Documents">
                                        <ReviewRow label="Resume" value={formData.documents.resumeUrl ? `${formData.documents.resume} (Uploaded)` : "Not uploaded"} />
                                        <ReviewRow label="ID Proof" value={formData.documents.idProof || "Not uploaded"} />
                                        <ReviewRow label="Certificates" value={formData.documents.certificates.length > 0 ? formData.documents.certificates.join(", ") : "Not uploaded"} />
                                    </ReviewSection>

                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                                        ⚠️ Please review all information carefully. Once submitted, you can update your profile through the dashboard.
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>

                {/* Navigation */}
                <CardFooter className="flex justify-between border-t pt-6">
                    <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>

                    {currentStep < STEPS.length ? (
                        <Button onClick={handleNext} className="bg-primary hover:bg-red-700">
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting || isUploadingResume || isUploading} className="bg-green-600 hover:bg-green-700">
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                            ) : (
                                <><CheckCircle2 className="mr-2 h-4 w-4" /> Submit Application</>
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {/* Auto-save indicator */}
            <p className="mt-4 text-center text-xs text-muted-foreground">
                💾 Your progress is automatically saved
            </p>
        </div>
    )
}

// ============================================
// HELPER COMPONENTS
// ============================================

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">{title}</h3>
            <div className="grid gap-2 sm:grid-cols-2">{children}</div>
        </div>
    )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="text-sm">
            <span className="text-muted-foreground">{label}:</span>{" "}
            <span className="font-medium">{value || "—"}</span>
        </div>
    )
}
