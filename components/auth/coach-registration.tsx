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
    User, MapPin, Briefcase, Star, Calendar, FileText, ClipboardCheck
} from "lucide-react"

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
    documents: { resume: "", idProof: "", certificates: [] },
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
            <Card className="mx-auto max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <CardTitle className="text-2xl font-bold uppercase text-primary">
                        Application Submitted! 🎉
                    </CardTitle>
                    <CardDescription>
                        Coach ID: <span className="font-mono font-bold">{resultData.coachId}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Your application has been submitted successfully. Our team will review your profile
                        and contact you at <strong>{resultData.email}</strong> within 3-5 business days.
                    </p>
                    <div className="rounded-lg border bg-zinc-50 p-4 text-left dark:bg-zinc-900">
                        <h4 className="mb-2 font-semibold">What happens next?</h4>
                        <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                            <li>Our team reviews your application</li>
                            <li>Document verification (if uploaded)</li>
                            <li>Interview scheduling</li>
                            <li>Background check</li>
                            <li>Approval & onboarding</li>
                        </ol>
                    </div>
                </CardContent>
                <CardFooter className="justify-center gap-4">
                    <Button variant="outline" asChild>
                        <a href="/">Return to Home</a>
                    </Button>
                    <Button asChild className="bg-primary hover:bg-red-700">
                        <a href="/login">Login</a>
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    // ============================================
    // STEP CONTENT RENDERERS
    // ============================================

    const progressPercentage = (currentStep / STEPS.length) * 100

    return (
        <div className="mx-auto max-w-3xl px-4">
            {/* Draft Restored Toast */}
            <AnimatePresence>
                {draftRestored && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                        💾 Your previous draft has been restored!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="mb-2 flex justify-between text-sm">
                    <span className="font-bold text-primary">Step {currentStep} of {STEPS.length}</span>
                    <span className="text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
            </div>

            {/* Step Indicators */}
            <div className="mb-6 flex justify-between">
                {STEPS.map((step) => {
                    const StepIcon = step.icon
                    const isActive = currentStep === step.id
                    const isCompleted = currentStep > step.id

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-1">
                            <div className={`
                                flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300
                                ${isActive ? "bg-primary text-white scale-110 shadow-lg" :
                                    isCompleted ? "bg-green-500 text-white" :
                                        "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"}
                            `}>
                                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-4 w-4" />}
                            </div>
                            <span className={`hidden text-xs font-medium sm:block ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                                {step.title}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Form Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold uppercase">
                        {STEPS[currentStep - 1].title}
                    </CardTitle>
                    <CardDescription>
                        {currentStep === 1 && "Tell us about yourself"}
                        {currentStep === 2 && "Where are you located?"}
                        {currentStep === 3 && "Your coaching expertise"}
                        {currentStep === 4 && "Rate your skills & preferences"}
                        {currentStep === 5 && "When can you coach?"}
                        {currentStep === 6 && "Upload your documents (optional)"}
                        {currentStep === 7 && "Review and submit your application"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Error Display */}
                    {errors.length > 0 && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                            <div className="flex items-center gap-2 font-medium text-red-700 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" /> Please fix the following:
                            </div>
                            <ul className="ml-6 mt-2 list-disc space-y-1 text-sm text-red-600 dark:text-red-400">
                                {errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* STEP 1: Personal Info */}
                            {currentStep === 1 && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                                        <Input id="fullName" value={formData.fullName} onChange={e => updateField("fullName", e.target.value)} placeholder="Rahul Sharma" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                        <Input id="email" type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} placeholder="rahul@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground">(min 8 chars)</span></Label>
                                        <Input id="password" type="password" value={formData.password} onChange={e => updateField("password", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                                        <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={e => updateField("confirmPassword", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                                        <Input id="phone" type="tel" value={formData.phone} onChange={e => updateField("phone", e.target.value)} placeholder="9876543210" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
                                        <Input id="dob" type="date" value={formData.dateOfBirth} onChange={e => updateField("dateOfBirth", e.target.value)} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Gender <span className="text-red-500">*</span></Label>
                                        <Select value={formData.gender} onValueChange={v => updateField("gender", v)}>
                                            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MALE">Male</SelectItem>
                                                <SelectItem value="FEMALE">Female</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                                <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Address */}
                            {currentStep === 2 && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="addr1">Address Line 1 <span className="text-red-500">*</span></Label>
                                        <Input id="addr1" value={formData.addressLine1} onChange={e => updateField("addressLine1", e.target.value)} placeholder="House/Flat No, Street Name" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="addr2">Address Line 2</Label>
                                        <Input id="addr2" value={formData.addressLine2} onChange={e => updateField("addressLine2", e.target.value)} placeholder="Landmark, Area (optional)" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                                        <Input id="city" value={formData.city} onChange={e => updateField("city", e.target.value)} placeholder="Mumbai" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>State <span className="text-red-500">*</span></Label>
                                        <Select value={formData.state} onValueChange={v => updateField("state", v)}>
                                            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                                            <SelectContent>
                                                {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pin">PIN Code <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground">(6 digits)</span></Label>
                                        <Input id="pin" value={formData.postalCode} onChange={e => updateField("postalCode", e.target.value)} placeholder="400001" maxLength={6} />
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Professional */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <Label className="mb-3 block">Specializations <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground">(select all that apply)</span></Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {SPECIALIZATIONS.map(spec => (
                                                <label key={spec.value} className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                                    <Checkbox
                                                        checked={formData.specializations.includes(spec.value)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                updateField("specializations", [...formData.specializations, spec.value])
                                                            } else {
                                                                updateField("specializations", formData.specializations.filter(s => s !== spec.value))
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm">{spec.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="exp">Years of Experience</Label>
                                            <Input id="exp" type="number" min={0} max={50} value={formData.experienceYears} onChange={e => updateField("experienceYears", parseInt(e.target.value) || 0)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="education">Education Background</Label>
                                            <Input id="education" value={formData.education} onChange={e => updateField("education", e.target.value)} placeholder="e.g., B.P.Ed, M.Sc Sports Science" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">
                                            Bio / Coaching Philosophy <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground">({formData.bio.length}/1000)</span>
                                        </Label>
                                        <Textarea id="bio" rows={5} value={formData.bio} onChange={e => updateField("bio", e.target.value.slice(0, 1000))} placeholder="Tell us about your coaching style, achievements, and what makes you unique..." className="resize-none" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="prevExp">Previous Coaching Experience</Label>
                                        <Textarea id="prevExp" rows={3} value={formData.previousExperience} onChange={e => updateField("previousExperience", e.target.value)} placeholder="List your previous coaching roles, organizations, achievements..." className="resize-none" />
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: Skills */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <Label className="mb-4 block text-base font-semibold">Self-Assessment <span className="text-xs font-normal text-muted-foreground">(1 = Beginner, 10 = Master)</span></Label>
                                        <div className="space-y-4">
                                            {(["speed", "freestyle", "endurance", "technique"] as const).map(skill => (
                                                <div key={skill} className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="capitalize">{skill}</Label>
                                                        <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-bold text-primary">{formData.skillLevels[skill]}</span>
                                                    </div>
                                                    <input
                                                        type="range" min={1} max={10} value={formData.skillLevels[skill]}
                                                        onChange={e => updateField("skillLevels", { ...formData.skillLevels, [skill]: parseInt(e.target.value) })}
                                                        className="w-full accent-red-600"
                                                    />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Beginner</span><span>Advanced</span><span>Master</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="mb-3 block">Languages <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground">(teaching languages)</span></Label>
                                        <div className="flex flex-wrap gap-2">
                                            {LANGUAGES.map(lang => {
                                                const isSelected = formData.languages.includes(lang)
                                                return (
                                                    <button key={lang} type="button" onClick={() => {
                                                        if (isSelected) {
                                                            updateField("languages", formData.languages.filter(l => l !== lang))
                                                        } else {
                                                            updateField("languages", [...formData.languages, lang])
                                                        }
                                                    }} className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${isSelected ? "border-primary bg-primary text-white" : "border-zinc-300 hover:border-primary dark:border-zinc-700"}`}>
                                                        {lang}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="mb-3 block">Age Groups <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground">(you can teach)</span></Label>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            {AGE_GROUPS.map(ag => (
                                                <label key={ag.value} className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                                    <Checkbox
                                                        checked={formData.ageGroups.includes(ag.value)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                updateField("ageGroups", [...formData.ageGroups, ag.value])
                                                            } else {
                                                                updateField("ageGroups", formData.ageGroups.filter(g => g !== ag.value))
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm">{ag.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5: Availability */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div>
                                        <Label className="mb-3 block">Available Days <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground">(select all)</span></Label>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS_OF_WEEK.map(day => {
                                                const isSelected = formData.availableDays.includes(day)
                                                return (
                                                    <button key={day} type="button" onClick={() => {
                                                        if (isSelected) {
                                                            updateField("availableDays", formData.availableDays.filter(d => d !== day))
                                                        } else {
                                                            updateField("availableDays", [...formData.availableDays, day])
                                                        }
                                                    }} className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${isSelected ? "border-primary bg-primary text-white" : "border-zinc-300 hover:border-primary dark:border-zinc-700"}`}>
                                                        {day.charAt(0) + day.slice(1).toLowerCase()}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Time slots for selected days */}
                                    {formData.availableDays.length > 0 && (
                                        <div>
                                            <Label className="mb-3 block">Preferred Time Slots</Label>
                                            <div className="space-y-3">
                                                {formData.availableDays.map(day => (
                                                    <div key={day} className="flex items-center gap-3 rounded-lg border p-3">
                                                        <span className="w-24 text-sm font-medium">{day.charAt(0) + day.slice(1).toLowerCase()}</span>
                                                        <Input
                                                            type="text"
                                                            placeholder="e.g. 17:00-19:00"
                                                            value={(formData.availableTimes[day] || []).join(", ")}
                                                            onChange={e => {
                                                                const slots = e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                                                                updateField("availableTimes", { ...formData.availableTimes, [day]: slots })
                                                            }}
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Employment Type <span className="text-red-500">*</span></Label>
                                            <Select value={formData.employmentType} onValueChange={v => updateField("employmentType", v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                                                    <SelectItem value="CONTRACT">Contract</SelectItem>
                                                    <SelectItem value="FREELANCE">Freelance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxBatches">Max Batches <span className="text-xs text-muted-foreground">(you can handle)</span></Label>
                                            <Input id="maxBatches" type="number" min={1} max={10} value={formData.maxBatches} onChange={e => updateField("maxBatches", parseInt(e.target.value) || 3)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 6: Documents */}
                            {currentStep === 6 && (
                                <div className="space-y-6">
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            📁 Document upload is optional at this stage. You can upload documents later from your dashboard after your initial application is reviewed.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="resume">Resume / CV</Label>
                                            <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={e => {
                                                const file = e.target.files?.[0]
                                                if (file) updateField("documents", { ...formData.documents, resume: file.name })
                                            }} />
                                            {formData.documents.resume && <p className="text-xs text-green-600">✓ {formData.documents.resume}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="idProof">ID Proof <span className="text-xs text-muted-foreground">(Aadhaar/PAN/Passport)</span></Label>
                                            <Input id="idProof" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => {
                                                const file = e.target.files?.[0]
                                                if (file) updateField("documents", { ...formData.documents, idProof: file.name })
                                            }} />
                                            {formData.documents.idProof && <p className="text-xs text-green-600">✓ {formData.documents.idProof}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="certs">Coaching Certificates</Label>
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
                                        <ReviewRow label="Date of Birth" value={formData.dateOfBirth} />
                                        <ReviewRow label="Gender" value={formData.gender} />
                                    </ReviewSection>

                                    {/* Address */}
                                    <ReviewSection title="📍 Address">
                                        <ReviewRow label="Address" value={`${formData.addressLine1}${formData.addressLine2 ? ", " + formData.addressLine2 : ""}`} />
                                        <ReviewRow label="City" value={formData.city} />
                                        <ReviewRow label="State" value={formData.state} />
                                        <ReviewRow label="PIN Code" value={formData.postalCode} />
                                    </ReviewSection>

                                    {/* Professional */}
                                    <ReviewSection title="💼 Professional">
                                        <ReviewRow label="Specializations" value={formData.specializations.join(", ")} />
                                        <ReviewRow label="Experience" value={`${formData.experienceYears} years`} />
                                        <ReviewRow label="Education" value={formData.education || "—"} />
                                        <ReviewRow label="Bio" value={formData.bio.slice(0, 100) + (formData.bio.length > 100 ? "..." : "")} />
                                    </ReviewSection>

                                    {/* Skills */}
                                    <ReviewSection title="⭐ Skills">
                                        <ReviewRow label="Speed" value={`${formData.skillLevels.speed}/10`} />
                                        <ReviewRow label="Freestyle" value={`${formData.skillLevels.freestyle}/10`} />
                                        <ReviewRow label="Endurance" value={`${formData.skillLevels.endurance}/10`} />
                                        <ReviewRow label="Technique" value={`${formData.skillLevels.technique}/10`} />
                                        <ReviewRow label="Languages" value={formData.languages.join(", ")} />
                                        <ReviewRow label="Age Groups" value={formData.ageGroups.join(", ")} />
                                    </ReviewSection>

                                    {/* Availability */}
                                    <ReviewSection title="📅 Availability">
                                        <ReviewRow label="Days" value={formData.availableDays.map(d => d.charAt(0) + d.slice(1).toLowerCase()).join(", ")} />
                                        <ReviewRow label="Employment" value={formData.employmentType.replace("_", " ")} />
                                        <ReviewRow label="Max Batches" value={String(formData.maxBatches)} />
                                    </ReviewSection>

                                    {/* Documents */}
                                    <ReviewSection title="📄 Documents">
                                        <ReviewRow label="Resume" value={formData.documents.resume || "Not uploaded"} />
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
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
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
