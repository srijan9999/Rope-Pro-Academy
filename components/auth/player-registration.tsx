"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { LOCATIONS, PROGRAMS } from "@/lib/data"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"

const steps = [
    "Basic Info", "Contact", "Guardian", "Health", "Preferences", "Experience", "Program", "Docs", "Consent", "Payment"
]

// Form data interface
interface FormData {
    fullName: string
    dob: string
    gender: string
    schoolName: string
    email: string
    password: string
    phone: string
    address: string
    parentName: string
    parentRelation: string
    parentPhone: string
    parentEmail: string
    bloodGroup: string
    medicalConditions: string
    emergencyContact: string
    preferredLocation: string
    preferredTiming: string
    experienceLevel: string
    goals: string
    selectedProgram: string
    termsAccepted: boolean
    mediaConsent: boolean
    medicalConsent: boolean
    paymentMode: string
}

// Field errors interface
interface FieldErrors {
    [key: string]: string
}

// Validation rules per step
const stepValidation: { [step: number]: { field: keyof FormData; message: string; validate?: (value: string | boolean, formData: FormData) => boolean }[] } = {
    0: [ // Basic Info
        { field: "fullName", message: "Full Name is required" },
        { field: "dob", message: "Date of Birth is required" },
        { field: "gender", message: "Please select your Gender" },
        { field: "schoolName", message: "School Name is required" },
    ],
    1: [ // Contact
        { field: "email", message: "Email is required" },
        {
            field: "email",
            message: "Please enter a valid email address",
            validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)
        },
        { field: "password", message: "Password is required" },
        {
            field: "password",
            message: "Password must be at least 6 characters",
            validate: (value) => (value as string).length >= 6
        },
        { field: "phone", message: "Phone number is required" },
        // Custom validation for verification status handled in component
        { field: "address", message: "Address is required" },
    ],
    2: [ // Guardian
        { field: "parentName", message: "Parent/Guardian Name is required" },
        { field: "parentRelation", message: "Relationship is required" },
        { field: "parentPhone", message: "Parent Phone is required" },
        { field: "parentEmail", message: "Parent Email is required" },
    ],
    3: [ // Health
        { field: "bloodGroup", message: "Blood Group is required" },
        { field: "emergencyContact", message: "Emergency Contact is required" },
    ],
    4: [ // Preferences
        { field: "preferredLocation", message: "Please select a Location" },
        { field: "preferredTiming", message: "Please select a Batch Timing" },
    ],
    5: [ // Experience
        { field: "experienceLevel", message: "Please select your Experience Level" },
    ],
    6: [ // Program
        { field: "selectedProgram", message: "Please select a Program" },
    ],
    7: [ // Docs - No strict validation, optional uploads
    ],
    8: [ // Consent
        {
            field: "termsAccepted",
            message: "You must accept the Terms & Conditions",
            validate: (value) => value === true
        },
        {
            field: "medicalConsent",
            message: "You must authorize medical emergency treatment",
            validate: (value) => value === true
        },
    ],
    9: [ // Payment
        { field: "paymentMode", message: "Please select a Payment Mode" },
    ],
}

const initialFormData: FormData = {
    fullName: "",
    dob: "",
    gender: "",
    schoolName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    parentName: "",
    parentRelation: "",
    parentPhone: "",
    parentEmail: "",
    bloodGroup: "",
    medicalConditions: "",
    emergencyContact: "",
    preferredLocation: "",
    preferredTiming: "",
    experienceLevel: "",
    goals: "",
    selectedProgram: "",
    termsAccepted: false,
    mediaConsent: false,
    medicalConsent: false,
    paymentMode: "",
}

export function PlayerRegistrationForm() {
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submittedId, setSubmittedId] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    // Phone Verification State
    const [isPhoneVerified, setIsPhoneVerified] = useState(false)
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [otp, setOtp] = useState("")
    const [otpTimer, setOtpTimer] = useState(0)
    const [isVerifyingPhone, setIsVerifyingPhone] = useState(false)

    // Phone Verification Timer
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (otpTimer > 0) {
            interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000)
        }
        return () => clearInterval(interval)
    }, [otpTimer])

    // Update form data and clear field error
    const updateField = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setFieldErrors(prev => ({ ...prev, [field]: "" }))
        setSubmitError(null)
    }

    // Validate current step fields
    const validateStep = (step: number): boolean => {
        const rules = stepValidation[step] || []
        const errors: FieldErrors = {}
        let isValid = true

        for (const rule of rules) {
            const value = formData[rule.field]

            // Check if field has a custom validator
            if (rule.validate) {
                if (!rule.validate(value, formData)) {
                    if (!errors[rule.field]) { // Only set first error for field
                        errors[rule.field] = rule.message
                        isValid = false
                    }
                }
            } else {
                // Default: check if value is empty
                const isEmpty = value === "" || value === false || value === null || value === undefined
                if (isEmpty) {
                    if (!errors[rule.field]) {
                        errors[rule.field] = rule.message
                        isValid = false
                    }
                }
            }
        }

        setFieldErrors(errors)
        return isValid
    }

    // Handle Next with validation
    const handleNext = () => {
        // Special check for Step 1 (Contact) - Phone Verified
        if (currentStep === 1 && !isPhoneVerified) {
            setFieldErrors(prev => ({ ...prev, phone: "Please verify your phone number to proceed" }))
            return
        }

        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
        }
    }

    const prevStep = () => {
        setFieldErrors({}) // Clear errors when going back
        setCurrentStep(prev => Math.max(prev - 1, 0))
    }

    // Helper component for error message
    const FieldError = ({ field }: { field: keyof FormData }) => {
        const error = fieldErrors[field]
        if (!error) return null
        return <p className="text-sm text-red-500 mt-1">{error}</p>
    }

    // Submit form to API
    const requestOtp = async () => {
        if (!formData.phone || formData.phone.length < 10) {
            setFieldErrors(prev => ({ ...prev, phone: "Please enter a valid phone number" }))
            return
        }

        setIsVerifyingPhone(true)
        try {
            const res = await fetch("/api/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: formData.phone, type: "PHONE_VERIFY" })
            })

            if (!res.ok) throw new Error("Failed to send OTP")

            setShowOtpInput(true)
            setOtpTimer(30)
            setFieldErrors(prev => ({ ...prev, phone: "" })) // Clear errors
        } catch (error) {
            console.error("OTP Send Error:", error)
            setFieldErrors(prev => ({ ...prev, phone: "Failed to send verification code" }))
        } finally {
            setIsVerifyingPhone(false)
        }
    }

    const verifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setFieldErrors(prev => ({ ...prev, otp: "Enter 6-digit code" }))
            return
        }

        setIsVerifyingPhone(true)
        try {
            const res = await fetch("/api/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: formData.phone, token: otp, type: "PHONE_VERIFY" })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Invalid OTP")

            setIsPhoneVerified(true)
            setShowOtpInput(false)
            setFieldErrors(prev => ({ ...prev, phone: "", otp: "" }))
        } catch (error) {
            console.error("OTP Verify Error:", error)
            setFieldErrors(prev => ({ ...prev, otp: "Invalid code. Please try again." }))
        } finally {
            setIsVerifyingPhone(false)
        }
    }

    // Submit form to API
    const handleSubmit = async () => {
        // Final validation of current step
        if (!validateStep(currentStep)) {
            return
        }

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            console.log("📤 Submitting form data:", formData)

            const response = await fetch("/api/register/player", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    dob: formData.dob,
                    gender: formData.gender,
                    phone: formData.phone,
                    schoolName: formData.schoolName,
                    parentName: formData.parentName,
                    parentPhone: formData.parentPhone,
                    parentEmail: formData.parentEmail,
                    bloodGroup: formData.bloodGroup,
                    medicalConditions: formData.medicalConditions,
                    emergencyContact: formData.emergencyContact,
                    preferredLocation: formData.preferredLocation,
                    skillLevel: formData.experienceLevel === "advanced" ? "ADVANCED"
                        : formData.experienceLevel === "intermediate" ? "INTERMEDIATE"
                            : "BEGINNER",
                }),
            })

            const data = await response.json()
            console.log("📥 API Response:", data)

            if (!response.ok) {
                console.error("❌ API returned error:", data.error)
                if (response.status === 409 || data.error?.includes("already exists")) {
                    setSubmitError("This email is already registered. Please use a different email or login to your existing account.")
                    setCurrentStep(1)
                } else {
                    setSubmitError(data.error || "Registration failed. Please try again.")
                }
                return
            }

            console.log("✅ Registration successful! ID:", data.data?.studentId)
            setSubmittedId(data.data?.studentId || "Unknown")
            setIsSuccess(true)

        } catch (error) {
            console.error("❌ Network error:", error)
            setSubmitError("Network error. Please check your connection and try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Success Screen
    if (isSuccess) {
        return (
            <Card className="mx-auto max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl font-bold uppercase text-primary">Application Submitted!</CardTitle>
                    <CardDescription>
                        Your application ID is <span className="font-mono font-bold text-foreground">{submittedId}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Thank you for registering. Your application is pending admin approval.
                        Our team will review your application and contact you within 24-48 hours.
                    </p>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button asChild>
                        <a href="/">Return to Home</a>
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="pb-0">
                <div className="mb-6 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">Step {currentStep + 1} of {steps.length}</span>
                    <span className="text-sm text-muted-foreground">{steps[currentStep]}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
                {/* <CardTitle className="pt-6 text-3xl font-bold uppercase">Player Registration</CardTitle>
                <CardDescription className="text-lg">Join Rope Pro Academy to Jump Into Excellence</CardDescription> */}
            </div>

            <div className="space-y-6">
                {/* Error Alert */}
                {submitError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <p className="whitespace-pre-line">{submitError}</p>
                                {submitError.includes("already registered") && (
                                    <a
                                        href="/login"
                                        className="inline-block text-sm font-medium text-primary underline hover:text-red-800"
                                    >
                                        Go to Login →
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 0: Basic Info */}
                {currentStep === 0 && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Full Name <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="As per school records"
                                value={formData.fullName}
                                onChange={(e) => updateField("fullName", e.target.value)}
                                className={fieldErrors.fullName ? "border-red-500" : ""}
                            />
                            <FieldError field="fullName" />
                        </div>
                        <div className="space-y-2">
                            <Label>Date of Birth <span className="text-red-500">*</span></Label>
                            <Input
                                type="date"
                                value={formData.dob}
                                onChange={(e) => updateField("dob", e.target.value)}
                                className={fieldErrors.dob ? "border-red-500" : ""}
                            />
                            <FieldError field="dob" />
                        </div>
                        <div className="space-y-2">
                            <Label>Gender <span className="text-red-500">*</span></Label>
                            <Select value={formData.gender} onValueChange={(v) => updateField("gender", v)}>
                                <SelectTrigger className={fieldErrors.gender ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError field="gender" />
                        </div>
                        <div className="space-y-2">
                            <Label>School Name <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Current School"
                                value={formData.schoolName}
                                onChange={(e) => updateField("schoolName", e.target.value)}
                                className={fieldErrors.schoolName ? "border-red-500" : ""}
                            />
                            <FieldError field="schoolName" />
                        </div>
                    </div>
                )}

                {/* Step 1: Contact */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Email <span className="text-red-500">*</span></Label>
                                <Input
                                    type="email"
                                    placeholder="student@example.com"
                                    value={formData.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    className={fieldErrors.email ? "border-red-500" : ""}
                                />
                                <FieldError field="email" />
                            </div>
                            <div className="space-y-2">
                                <Label>Password <span className="text-red-500">*</span></Label>
                                <Input
                                    type="password"
                                    placeholder="Min 6 characters"
                                    value={formData.password}
                                    onChange={(e) => updateField("password", e.target.value)}
                                    className={fieldErrors.password ? "border-red-500" : ""}
                                />
                                <FieldError field="password" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone <span className="text-red-500">*</span></Label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            type="tel"
                                            placeholder="+91"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                updateField("phone", e.target.value)
                                                if (isPhoneVerified) setIsPhoneVerified(false) // Reset verification on change
                                            }}
                                            className={fieldErrors.phone ? "border-red-500" : ""}
                                            disabled={isPhoneVerified}
                                        />
                                        {!isPhoneVerified ? (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={requestOtp}
                                                disabled={isVerifyingPhone || !formData.phone || formData.phone.length < 10 || showOtpInput}
                                            >
                                                {isVerifyingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                                            </Button>
                                        ) : (
                                            <Button type="button" variant="ghost" className="text-green-600 cursor-default hover:text-green-600 hover:bg-transparent">
                                                <CheckCircle2 className="h-5 w-5 mr-1" /> Verified
                                            </Button>
                                        )}
                                    </div>
                                    <FieldError field="phone" />

                                    {/* OTP Input Section */}
                                    {showOtpInput && !isPhoneVerified && (
                                        <div className="flex gap-2 items-start animate-in fade-in slide-in-from-top-1">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="Enter 6-digit code"
                                                    value={otp}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                                                        setOtp(val)
                                                        setFieldErrors(prev => ({ ...prev, otp: "" }))
                                                    }}
                                                    className={`text-center tracking-widest ${fieldErrors.otp ? "border-red-500" : ""}`}
                                                    maxLength={6}
                                                />
                                                {fieldErrors.otp && (
                                                    <p className="text-sm text-red-500 mt-1">{fieldErrors.otp}</p>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={verifyOtp}
                                                disabled={otp.length !== 6 || isVerifyingPhone}
                                            >
                                                {isVerifyingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                                            </Button>
                                        </div>
                                    )}
                                    {showOtpInput && !isPhoneVerified && (
                                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                                            <span>Enter code sent to {formData.phone}</span>
                                            {otpTimer > 0 ? (
                                                <span>Resend in {otpTimer}s</span>
                                            ) : (
                                                <button type="button" onClick={requestOtp} className="text-primary hover:underline">
                                                    Resend Code
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Address <span className="text-red-500">*</span></Label>
                            <Textarea
                                placeholder="Full residential address"
                                value={formData.address}
                                onChange={(e) => updateField("address", e.target.value)}
                                className={fieldErrors.address ? "border-red-500" : ""}
                            />
                            <FieldError field="address" />
                        </div>
                    </div>
                )}

                {/* Step 2: Guardian */}
                {currentStep === 2 && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Parent/Guardian Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={formData.parentName}
                                onChange={(e) => updateField("parentName", e.target.value)}
                                className={fieldErrors.parentName ? "border-red-500" : ""}
                            />
                            <FieldError field="parentName" />
                        </div>
                        <div className="space-y-2">
                            <Label>Relationship <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Father/Mother"
                                value={formData.parentRelation}
                                onChange={(e) => updateField("parentRelation", e.target.value)}
                                className={fieldErrors.parentRelation ? "border-red-500" : ""}
                            />
                            <FieldError field="parentRelation" />
                        </div>
                        <div className="space-y-2">
                            <Label>Parent Phone <span className="text-red-500">*</span></Label>
                            <Input
                                type="tel"
                                value={formData.parentPhone}
                                onChange={(e) => updateField("parentPhone", e.target.value)}
                                className={fieldErrors.parentPhone ? "border-red-500" : ""}
                            />
                            <FieldError field="parentPhone" />
                        </div>
                        <div className="space-y-2">
                            <Label>Parent Email <span className="text-red-500">*</span></Label>
                            <Input
                                type="email"
                                value={formData.parentEmail}
                                onChange={(e) => updateField("parentEmail", e.target.value)}
                                className={fieldErrors.parentEmail ? "border-red-500" : ""}
                            />
                            <FieldError field="parentEmail" />
                        </div>
                    </div>
                )}

                {/* Step 3: Health */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Blood Group <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="O+"
                                value={formData.bloodGroup}
                                onChange={(e) => updateField("bloodGroup", e.target.value)}
                                className={fieldErrors.bloodGroup ? "border-red-500" : ""}
                            />
                            <FieldError field="bloodGroup" />
                        </div>
                        <div className="space-y-2">
                            <Label>Any Medical Conditions? (Optional)</Label>
                            <Textarea
                                placeholder="Please list any conditions, allergies, or medications..."
                                value={formData.medicalConditions}
                                onChange={(e) => updateField("medicalConditions", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Emergency Contact <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Name & Number"
                                value={formData.emergencyContact}
                                onChange={(e) => updateField("emergencyContact", e.target.value)}
                                className={fieldErrors.emergencyContact ? "border-red-500" : ""}
                            />
                            <FieldError field="emergencyContact" />
                        </div>
                    </div>
                )}

                {/* Step 4: Preferences */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Preferred Location <span className="text-red-500">*</span></Label>
                            <Select value={formData.preferredLocation} onValueChange={(v) => updateField("preferredLocation", v)}>
                                <SelectTrigger className={fieldErrors.preferredLocation ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select Location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LOCATIONS.map((loc) => (
                                        <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError field="preferredLocation" />
                        </div>
                        <div className="space-y-2">
                            <Label>Preferred Batch Timing <span className="text-red-500">*</span></Label>
                            <Select value={formData.preferredTiming} onValueChange={(v) => updateField("preferredTiming", v)}>
                                <SelectTrigger className={fieldErrors.preferredTiming ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select Timing" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Morning (6-8 AM)</SelectItem>
                                    <SelectItem value="evening">Evening (5-7 PM)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError field="preferredTiming" />
                        </div>
                    </div>
                )}

                {/* Step 5: Experience */}
                {currentStep === 5 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Previous Experience? <span className="text-red-500">*</span></Label>
                            <Select value={formData.experienceLevel} onValueChange={(v) => updateField("experienceLevel", v)}>
                                <SelectTrigger className={fieldErrors.experienceLevel ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no">None</SelectItem>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError field="experienceLevel" />
                        </div>
                        <div className="space-y-2">
                            <Label>Goals (Optional)</Label>
                            <Textarea
                                placeholder="Fitness, Competition, Recreation..."
                                value={formData.goals}
                                onChange={(e) => updateField("goals", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Step 6: Program */}
                {currentStep === 6 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Select Program <span className="text-red-500">*</span></Label>
                            <Select value={formData.selectedProgram} onValueChange={(v) => updateField("selectedProgram", v)}>
                                <SelectTrigger className={fieldErrors.selectedProgram ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select Program" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROGRAMS.map((prog, i) => (
                                        <SelectItem key={i} value={prog.title}>
                                            {prog.title} ({prog.price})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError field="selectedProgram" />
                        </div>
                    </div>
                )}

                {/* Step 7: Docs */}
                {currentStep === 7 && (
                    <div className="space-y-6">
                        <p className="text-sm text-muted-foreground">
                            Document upload is optional. You can submit documents later at the academy.
                        </p>
                        <div className="space-y-2">
                            <Label>Student Photo (Optional)</Label>
                            <Input type="file" accept="image/*" />
                        </div>
                        <div className="space-y-2">
                            <Label>ID Proof - Birth Cert/Aadhar (Optional)</Label>
                            <Input type="file" accept="image/*,.pdf" />
                        </div>
                    </div>
                )}

                {/* Step 8: Consent */}
                {currentStep === 8 && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="terms"
                                    checked={formData.termsAccepted}
                                    onCheckedChange={(checked) => updateField("termsAccepted", !!checked)}
                                    className={fieldErrors.termsAccepted ? "border-red-500" : ""}
                                />
                                <div>
                                    <Label htmlFor="terms" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        I agree to Terms and Conditions and Privacy Policy <span className="text-red-500">*</span>
                                    </Label>
                                    <FieldError field="termsAccepted" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="media"
                                checked={formData.mediaConsent}
                                onCheckedChange={(checked) => updateField("mediaConsent", !!checked)}
                            />
                            <Label htmlFor="media" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I consent to use of photographs/videos for promotional purposes (Optional)
                            </Label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="medical"
                                    checked={formData.medicalConsent}
                                    onCheckedChange={(checked) => updateField("medicalConsent", !!checked)}
                                    className={fieldErrors.medicalConsent ? "border-red-500" : ""}
                                />
                                <div>
                                    <Label htmlFor="medical" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        I authorize medical emergency treatment if required <span className="text-red-500">*</span>
                                    </Label>
                                    <FieldError field="medicalConsent" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 9: Payment */}
                {currentStep === 9 && (
                    <div className="space-y-6">
                        <div className="rounded-lg border bg-zinc-50 p-4 dark:bg-zinc-900">
                            <div className="flex justify-between font-bold">
                                <span>Registration Fee</span>
                                <span>₹500.00</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Mode <span className="text-red-500">*</span></Label>
                            <Select value={formData.paymentMode} onValueChange={(v) => updateField("paymentMode", v)}>
                                <SelectTrigger className={fieldErrors.paymentMode ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="online">Online (UPI/Card)</SelectItem>
                                    <SelectItem value="offline">Offline (Cash at Academy)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError field="paymentMode" />
                        </div>
                    </div>
                )}

            </div>
            <div className="flex justify-between p-8 pt-0">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
                    Previous
                </Button>

                {currentStep === steps.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        className="bg-primary hover:bg-red-700"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit & Pay"
                        )}
                    </Button>
                ) : (
                    <Button onClick={handleNext} className="bg-primary hover:bg-red-700">
                        Next
                    </Button>
                )}
            </div>
        </div>
    )
}
