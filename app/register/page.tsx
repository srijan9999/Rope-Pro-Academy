"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import {
    studentRegistrationSchema,
    type StudentRegistrationInput,
} from "@/lib/validations/registration"
import {
    SCHOOLS,
    PLANS,
    getFee,
    formatINR,
    FEES,
    type SchoolKey,
    type PlanKey,
} from "@/lib/pricing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Loader2,
    AlertCircle,
    Building2,
    Sparkles,
    ShieldCheck,
    ArrowRight,
    User,
    Lock,
    HeartPulse,
} from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const form = useForm<StudentRegistrationInput>({
        resolver: zodResolver(studentRegistrationSchema),
        defaultValues: {
            fullName: "",
            dob: "",
            gender: "",
            schoolName: "",
            grade: "",
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
            emergencyPhone: "",
            school: "" as unknown as SchoolKey,
            plan: "" as unknown as PlanKey,
            preferredTiming: "",
            experienceLevel: "BEGINNER",
            termsAccepted: false,
            mediaConsent: false,
            medicalConsent: false,
        },
    })

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = form

    const selectedSchool = useWatch({ control, name: "school" })
    const selectedPlan = useWatch({ control, name: "plan" })

    // Compute live fee
    const currentFee = selectedSchool && selectedPlan ? getFee(selectedSchool, selectedPlan) : null

    // Compute savings compared to monthly
    let savings = 0
    if (selectedSchool && selectedPlan && selectedPlan !== "monthly") {
        const monthlyRate = FEES[selectedSchool as SchoolKey]?.monthly ?? 0
        if (selectedPlan === "quarterly") {
            const threeMonths = monthlyRate * 3
            savings = Math.max(0, threeMonths - (currentFee ?? 0))
        } else if (selectedPlan === "half-yearly") {
            const sixMonths = monthlyRate * 6
            savings = Math.max(0, sixMonths - (currentFee ?? 0))
        }
    }

    async function onSubmit(values: StudentRegistrationInput) {
        setSubmitting(true)
        setServerError(null)

        try {
            // Note: feeAmount is NEVER passed in the request body (Section 2.1)
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            const data = await res.json()
            if (!res.ok) {
                setServerError(data.message ?? "Registration failed. Please check the form and try again.")
                return
            }

            if (data.userId) {
                router.push(`/payment?userId=${encodeURIComponent(data.userId)}`)
            }
        } catch {
            setServerError("Network error. Please check your internet connection and try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#E63946]">
                        Rope Pro Academy
                    </span>
                    <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
                        Athlete <span className="text-[#E63946]">Registration</span>
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                        Choose your training centre, select a plan, and register to begin professional jump rope training.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
                    {/* SECTION 1: Academy Centre & Training Plan (Location-Based Pricing) */}
                    <Card className="border-2 border-[#E63946]/30 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden">
                        <CardHeader className="bg-[#E63946]/5 border-b border-[#E63946]/20">
                            <CardTitle className="text-lg font-black uppercase tracking-wide flex items-center gap-2 text-foreground">
                                <Building2 className="w-5 h-5 text-[#E63946]" />
                                1. Training Centre & Membership Plan
                            </CardTitle>
                            <CardDescription>
                                Pricing is customized by training facility. Select your centre first to see plan fees.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Academy Centre */}
                            <div className="space-y-2">
                                <Label htmlFor="school" className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Academy Centre (Training Location) *
                                </Label>
                                <select
                                    id="school"
                                    {...register("school")}
                                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-background px-4 py-3 text-sm text-foreground font-semibold focus:border-[#E63946] focus:outline-none focus:ring-2 focus:ring-[#E63946]/30"
                                >
                                    <option value="">-- Choose Academy Centre --</option>
                                    {SCHOOLS.map((s) => (
                                        <option key={s.key} value={s.key}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.school && (
                                    <p className="text-xs font-bold text-red-500 mt-1">{errors.school.message}</p>
                                )}
                            </div>

                            {/* Plan Selection */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Membership Duration & Plan *
                                </Label>
                                {!selectedSchool ? (
                                    <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 text-center text-xs text-muted-foreground bg-zinc-50 dark:bg-zinc-900/40">
                                        Please select an academy centre above to view available membership fees.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {PLANS.map((plan) => {
                                            const fee = getFee(selectedSchool, plan.key)
                                            const isSelected = selectedPlan === plan.key

                                            return (
                                                <button
                                                    key={plan.key}
                                                    type="button"
                                                    onClick={() => setValue("plan", plan.key, { shouldValidate: true })}
                                                    suppressHydrationWarning
                                                    className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                                                        isSelected
                                                            ? "border-[#E63946] bg-[#E63946]/10 ring-2 ring-[#E63946] shadow-md shadow-[#E63946]/20"
                                                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-background"
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-heading text-sm font-bold uppercase tracking-wide">
                                                                {plan.label}
                                                            </span>
                                                            <span className="text-[10px] font-mono text-muted-foreground">
                                                                {plan.months} {plan.months === 1 ? "Mo" : "Mos"}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-xl font-black text-[#E63946]">
                                                            {fee ? formatINR(fee) : "—"}
                                                        </p>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                                {errors.plan && (
                                    <p className="text-xs font-bold text-red-500 mt-1">{errors.plan.message}</p>
                                )}
                            </div>

                            {/* Live Fee Display Card */}
                            {currentFee != null && (
                                <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                            Total Amount Payable:
                                        </span>
                                        <div className="text-2xl sm:text-3xl font-black text-[#E63946] font-heading">
                                            {formatINR(currentFee)}
                                        </div>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            Includes all coaching and equipment access. No separate admission fee.
                                        </p>
                                    </div>
                                    {savings > 0 && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-950/80 border border-green-800 text-green-400 text-xs font-bold shrink-0">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Save {formatINR(savings)} vs Monthly
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Preferred Timing & Skill Level */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="preferredTiming" className="text-xs font-bold uppercase tracking-wider">
                                        Preferred Batch Timing *
                                    </Label>
                                    <select
                                        id="preferredTiming"
                                        {...register("preferredTiming")}
                                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-background px-4 py-2.5 text-sm"
                                    >
                                        <option value="">-- Select Timing --</option>
                                        <option value="Morning (6:30 AM - 8:00 AM)">Morning (6:30 AM - 8:00 AM)</option>
                                        <option value="Evening (4:30 PM - 6:00 PM)">Evening (4:30 PM - 6:00 PM)</option>
                                        <option value="Evening (6:00 PM - 7:30 PM)">Evening (6:00 PM - 7:30 PM)</option>
                                        <option value="Weekend Special">Weekend Special</option>
                                    </select>
                                    {errors.preferredTiming && (
                                        <p className="text-xs font-bold text-red-500">{errors.preferredTiming.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="experienceLevel" className="text-xs font-bold uppercase tracking-wider">
                                        Current Skill Level *
                                    </Label>
                                    <select
                                        id="experienceLevel"
                                        {...register("experienceLevel")}
                                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-background px-4 py-2.5 text-sm"
                                    >
                                        <option value="BEGINNER">Beginner (First time skipping)</option>
                                        <option value="INTERMEDIATE">Intermediate (Basic tricks / speed)</option>
                                        <option value="ADVANCED">Advanced (Double unders / freestyle)</option>
                                        <option value="COMPETITIVE">Competitive / National Level</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECTION 2: Athlete Personal Information */}
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-base font-bold uppercase tracking-wide flex items-center gap-2">
                                <User className="w-4 h-4 text-[#E63946]" />
                                2. Athlete Personal Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-xs font-bold uppercase">Athlete Full Name *</Label>
                                    <Input id="fullName" placeholder="Rahul Sharma" {...register("fullName")} />
                                    {errors.fullName && <p className="text-xs font-bold text-red-500">{errors.fullName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dob" className="text-xs font-bold uppercase">Date of Birth *</Label>
                                    <Input id="dob" type="date" {...register("dob")} />
                                    {errors.dob && <p className="text-xs font-bold text-red-500">{errors.dob.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gender" className="text-xs font-bold uppercase">Gender *</Label>
                                    <select id="gender" {...register("gender")} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-background px-3 py-2 text-sm">
                                        <option value="">Select</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-xs font-bold text-red-500">{errors.gender.message}</p>}
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="schoolName" className="text-xs font-bold uppercase">Student&apos;s Regular School Name *</Label>
                                    <Input id="schoolName" placeholder="Delhi Public School" {...register("schoolName")} />
                                    {errors.schoolName && <p className="text-xs font-bold text-red-500">{errors.schoolName.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="grade" className="text-xs font-bold uppercase">Current Grade / Class</Label>
                                    <Input id="grade" placeholder="Class 8" {...register("grade")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address" className="text-xs font-bold uppercase">Residential Address *</Label>
                                    <Input id="address" placeholder="Rohini Sector 9, Delhi" {...register("address")} />
                                    {errors.address && <p className="text-xs font-bold text-red-500">{errors.address.message}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECTION 3: Account Credentials & Contact */}
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-base font-bold uppercase tracking-wide flex items-center gap-2">
                                <Lock className="w-4 h-4 text-[#E63946]" />
                                3. Login Credentials & Athlete Contact
                            </CardTitle>
                            <CardDescription>
                                These credentials will be used to log in to your Athlete Dashboard once approved.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase">Email Address (Login Username) *</Label>
                                    <Input id="email" type="email" placeholder="athlete@example.com" {...register("email")} />
                                    {errors.email && <p className="text-xs font-bold text-red-500">{errors.email.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-xs font-bold uppercase">Password *</Label>
                                    <Input id="password" type="password" placeholder="At least 6 characters" {...register("password")} />
                                    {errors.password && <p className="text-xs font-bold text-red-500">{errors.password.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-bold uppercase">Athlete Phone Number *</Label>
                                <Input id="phone" type="tel" placeholder="9876543210" {...register("phone")} />
                                {errors.phone && <p className="text-xs font-bold text-red-500">{errors.phone.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECTION 4: Parent / Guardian & Emergency */}
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-base font-bold uppercase tracking-wide flex items-center gap-2">
                                <HeartPulse className="w-4 h-4 text-[#E63946]" />
                                4. Parent / Guardian & Medical Safety
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="parentName" className="text-xs font-bold uppercase">Parent / Guardian Name *</Label>
                                    <Input id="parentName" placeholder="Father or Mother's name" {...register("parentName")} />
                                    {errors.parentName && <p className="text-xs font-bold text-red-500">{errors.parentName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="parentRelation" className="text-xs font-bold uppercase">Relationship *</Label>
                                    <Input id="parentRelation" placeholder="Father / Mother / Guardian" {...register("parentRelation")} />
                                    {errors.parentRelation && <p className="text-xs font-bold text-red-500">{errors.parentRelation.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="parentPhone" className="text-xs font-bold uppercase">Parent Phone Number *</Label>
                                    <Input id="parentPhone" type="tel" placeholder="9876543210" {...register("parentPhone")} />
                                    {errors.parentPhone && <p className="text-xs font-bold text-red-500">{errors.parentPhone.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="parentEmail" className="text-xs font-bold uppercase">Parent Email (Optional)</Label>
                                    <Input id="parentEmail" type="email" placeholder="parent@example.com" {...register("parentEmail")} />
                                </div>
                            </div>

                            <Separator className="my-2" />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bloodGroup" className="text-xs font-bold uppercase">Blood Group *</Label>
                                    <select id="bloodGroup" {...register("bloodGroup")} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-background px-3 py-2 text-sm">
                                        <option value="">Select</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                    {errors.bloodGroup && <p className="text-xs font-bold text-red-500">{errors.bloodGroup.message}</p>}
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="medicalConditions" className="text-xs font-bold uppercase">Medical Notes or Allergies (Optional)</Label>
                                    <Input id="medicalConditions" placeholder="Asthma, past injuries, etc." {...register("medicalConditions")} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emergencyContact" className="text-xs font-bold uppercase">Emergency Contact Name *</Label>
                                    <Input id="emergencyContact" placeholder="Contact person" {...register("emergencyContact")} />
                                    {errors.emergencyContact && <p className="text-xs font-bold text-red-500">{errors.emergencyContact.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergencyPhone" className="text-xs font-bold uppercase">Emergency Contact Phone *</Label>
                                    <Input id="emergencyPhone" type="tel" placeholder="9876543210" {...register("emergencyPhone")} />
                                    {errors.emergencyPhone && <p className="text-xs font-bold text-red-500">{errors.emergencyPhone.message}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECTION 5: Authorizations & Consents */}
                    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-base font-bold uppercase tracking-wide flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#E63946]" />
                                5. Declarations & Consents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("termsAccepted")}
                                    className="mt-1 h-4 w-4 rounded text-[#E63946] focus:ring-[#E63946]"
                                />
                                <span className="text-xs text-muted-foreground leading-relaxed">
                                    I agree to the Academy rules, safety protocols, attendance guidelines, and code of conduct. *
                                </span>
                            </label>
                            {errors.termsAccepted && (
                                <p className="text-xs font-bold text-red-500">{errors.termsAccepted.message}</p>
                            )}

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("medicalConsent")}
                                    className="mt-1 h-4 w-4 rounded text-[#E63946] focus:ring-[#E63946]"
                                />
                                <span className="text-xs text-muted-foreground leading-relaxed">
                                    I authorize certified academy personnel to administer emergency first-aid treatment if required during training sessions. *
                                </span>
                            </label>
                            {errors.medicalConsent && (
                                <p className="text-xs font-bold text-red-500">{errors.medicalConsent.message}</p>
                            )}

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("mediaConsent")}
                                    className="mt-1 h-4 w-4 rounded text-[#E63946] focus:ring-[#E63946]"
                                />
                                <span className="text-xs text-muted-foreground leading-relaxed">
                                    (Optional) I consent to competition and training photography being shared on academy media channels.
                                </span>
                            </label>
                        </CardContent>
                    </Card>

                    {/* Server Error Alert */}
                    {serverError && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{serverError}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
                        <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground">
                            Already registered? <span className="text-[#E63946] font-bold underline underline-offset-4">Sign in here</span>
                        </Link>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-[#E63946] hover:bg-red-700 text-white font-black uppercase tracking-wider text-xs px-8 py-3.5 h-auto rounded-xl shadow-lg shadow-[#E63946]/30 gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving Details...
                                </>
                            ) : (
                                <>
                                    Save & Continue to Payment
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
