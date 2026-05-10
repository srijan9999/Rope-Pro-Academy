"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle } from "lucide-react"

interface FieldErrors {
    email: string
    password: string
    otp?: string
}

export default function LoginPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("player")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState<FieldErrors>({ email: "", password: "" })
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password")
    const [otp, setOtp] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [timer, setTimer] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    // Clear field error when user types
    const handleEmailChange = (value: string) => {
        setEmail(value)
        setErrors(prev => ({ ...prev, email: "" }))
        setSubmitError(null)
    }

    // Countdown timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000)
        }
        return () => clearInterval(interval)
    }, [timer])

    const requestOtp = async () => {
        // Basic email validation
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrors(prev => ({ ...prev, email: "Please enter a valid email" }))
            return
        }

        setIsLoading(true)
        setSubmitError(null)

        try {
            const res = await fetch("/api/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: email, type: "LOGIN" })
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Failed to send OTP")

            setOtpSent(true)
            setTimer(30) // 30 seconds cooldown
            setSubmitError(null)
        } catch (err) {
            console.error("OTP Error:", err)
            setSubmitError(err instanceof Error ? err.message : "Failed to send code")
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordChange = (value: string) => {
        setPassword(value)
        setErrors(prev => ({ ...prev, password: "" }))
        setSubmitError(null)
    }

    // Validate form before submission
    const validateForm = (): boolean => {
        const newErrors: FieldErrors = { email: "", password: "" }
        let isValid = true

        // Email validation
        if (!email.trim()) {
            newErrors.email = "Email is required"
            isValid = false
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address"
            isValid = false
        }

        // Password validation
        if (!password.trim()) {
            newErrors.password = "Password is required"
            isValid = false
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    // Handle login submission
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form logic
        if (loginMethod === "password") {
            if (!validateForm()) return
        } else {
            // OTP Validation
            if (!otp || otp.length !== 6) {
                setErrors(prev => ({ ...prev, otp: "Enter a valid 6-digit code" }))
                return
            }
        }

        setIsLoading(true)
        setSubmitError(null)

        try {
            console.log(`🔐 Attempting ${loginMethod} login for:`, email)

            const signInOptions: any = {
                redirect: false,
                email: email.toLowerCase(),
            }

            if (loginMethod === "password") {
                signInOptions.password = password
            } else {
                signInOptions.otp = otp
            }

            const result = await signIn("credentials", signInOptions)

            console.log("📥 Login result:", result)

            if (result?.error) {
                console.error("❌ Login error:", result.error)
                if (result.error === "CredentialsSignin") {
                    setSubmitError(loginMethod === "password" ? "Invalid email or password." : "Invalid OTP code.")
                } else {
                    setSubmitError(result.error)
                }
                return
            }

            if (result?.ok) {
                console.log("✅ Login successful! Redirecting to dashboard...")
                // Redirect based on selected tab/role
                router.push(`/dashboard/${activeTab}`)
                router.refresh()
            }

        } catch (error) {
            console.error("❌ Network error:", error)
            setSubmitError("Network error. Please check your connection and try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // Error display component
    const FieldError = ({ message }: { message: string }) => {
        if (!message) return null
        return <p className="text-sm text-red-500 mt-1">{message}</p>
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 py-12 dark:bg-black px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold uppercase text-center">Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="player">Player</TabsTrigger>
                            <TabsTrigger value="coach">Coach</TabsTrigger>
                            <TabsTrigger value="admin">Admin</TabsTrigger>
                        </TabsList>

                        {["player", "coach", "admin"].map((role) => (
                            <TabsContent key={role} value={role}>
                                <div className="space-y-4">
                                    {/* Method Toggle */}
                                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLoginMethod("password")
                                                setOtpSent(false)
                                            }}
                                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${loginMethod === "password"
                                                ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                                                }`}
                                        >
                                            Password
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLoginMethod("otp")
                                                setOtpSent(false)
                                                setErrors({ email: "", password: "", otp: "" })
                                            }}
                                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${loginMethod === "otp"
                                                ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                                                }`}
                                        >
                                            One-Time Password
                                        </button>
                                    </div>

                                    <form onSubmit={handleLogin} className="space-y-4">
                                        {/* Error Alert */}
                                        {submitError && (
                                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p>{submitError}</p>
                                                        {submitError.includes("Invalid email or password") && loginMethod === "password" && (
                                                            <p className="text-sm opacity-80">
                                                                Forgot your password?{" "}
                                                                <Link href="#" className="underline">
                                                                    Reset it here
                                                                </Link>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label>Email <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="email"
                                                placeholder={role === "admin" ? "admin@roproacademy.com" : "user@example.com"}
                                                value={email}
                                                onChange={(e) => handleEmailChange(e.target.value)}
                                                className={errors.email ? "border-red-500" : ""}
                                                disabled={isLoading || (otpSent && loginMethod === "otp")}
                                            />
                                            <FieldError message={errors.email} />
                                        </div>

                                        {loginMethod === "password" ? (
                                            <div className="space-y-2">
                                                <Label>Password <span className="text-red-500">*</span></Label>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                                    className={errors.password ? "border-red-500" : ""}
                                                    disabled={isLoading}
                                                />
                                                <FieldError message={errors.password} />
                                            </div>
                                        ) : (
                                            // OTP FLOW UI
                                            <div className="space-y-4">
                                                {!otpSent ? (
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300 flex gap-2">
                                                        <AlertCircle className="h-4 w-4 mt-0.5" />
                                                        <p>We'll send a 6-digit code to your email for secure access without a password.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                        <div className="flex justify-between items-center">
                                                            <Label>Enter 6-digit Code</Label>
                                                            {timer > 0 ? (
                                                                <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                                                    <Loader2 className="h-3 w-3 animate-spin" /> Resend in {timer}s
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={requestOtp}
                                                                    className="text-xs text-primary hover:underline font-medium"
                                                                    disabled={isLoading}
                                                                >
                                                                    Resend Code
                                                                </button>
                                                            )}
                                                        </div>
                                                        <Input
                                                            type="text"
                                                            placeholder="Example: 123456"
                                                            value={otp}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                                                                setOtp(val)
                                                                setErrors(prev => ({ ...prev, otp: "" }))
                                                            }}
                                                            className={`text-center font-mono text-lg tracking-widest ${errors.otp ? "border-red-500" : ""}`}
                                                            disabled={isLoading}
                                                            maxLength={6}
                                                        />
                                                        <FieldError message={errors.otp || ""} />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {loginMethod === "password" ? (
                                            <Button
                                                type="submit"
                                                className="w-full bg-primary hover:bg-red-700 font-bold uppercase"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Logging in...
                                                    </>
                                                ) : (
                                                    `Login as ${role}`
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={otpSent ? handleLogin : requestOtp}
                                                className="w-full bg-primary hover:bg-red-700 font-bold uppercase"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        {otpSent ? "Verifying..." : "Sending Code..."}
                                                    </>
                                                ) : (
                                                    otpSent ? "Login Securely" : "Request OTP"
                                                )}
                                            </Button>
                                        )}
                                    </form>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>

                    {/* Demo Credentials */}
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-sm">
                        <p className="font-medium text-blue-700 dark:text-blue-300">
                            Demo {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Credentials:
                        </p>
                        <p className="text-blue-600 dark:text-blue-400 font-mono text-xs mt-1">
                            {activeTab === "player" && (
                                <>
                                    Email: student@roproacademy.com<br />
                                    Password: Student@123
                                </>
                            )}
                            {activeTab === "coach" && (
                                <>
                                    Email: coach@roproacademy.com<br />
                                    Password: Coach@123
                                </>
                            )}
                            {activeTab === "admin" && (
                                <>
                                    Email: admin@roproacademy.com<br />
                                    Password: Admin@123
                                </>
                            )}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 text-center text-sm">
                    <Link href="/register/player" className="text-primary hover:underline">
                        Don&apos;t have an account? Register Now
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:underline">
                        Forgot Password?
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
