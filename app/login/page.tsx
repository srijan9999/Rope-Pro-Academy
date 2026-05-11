"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle } from "lucide-react"

interface FieldErrors {
    email: string
    password: string
}

export default function LoginPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("player")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState<FieldErrors>({ email: "", password: "" })
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Clear field error when user types
    const handleEmailChange = (value: string) => {
        setEmail(value)
        setErrors(prev => ({ ...prev, email: "" }))
        setSubmitError(null)
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

        if (!validateForm()) return
        if (isLoading) return // Prevent duplicate submissions

        setIsLoading(true)
        setSubmitError(null)

        try {
            console.log(`🔐 Attempting login for:`, email)

            const result = await signIn("credentials", {
                redirect: false,
                email: email.toLowerCase(),
                password,
            })

            console.log("📥 Login result:", result)

            if (result?.error) {
                console.error("❌ Login error:", result.error)
                if (result.error === "CredentialsSignin") {
                    setSubmitError("Invalid email or password.")
                } else {
                    setSubmitError(result.error)
                }
                setIsLoading(false)
                return
            }

            if (result?.ok) {
                console.log("✅ Login successful! Fetching session for role-based redirect...")

                // Fetch the actual session to get the real user role
                const session = await getSession()
                console.log("📋 Session data:", session)

                if (!session?.user?.role) {
                    console.error("❌ Session missing role, falling back to tab-based redirect")
                    router.push(`/dashboard/${activeTab}`)
                    router.refresh()
                    return
                }

                // Role-based redirect using the actual authenticated user's role
                const role = session.user.role
                let dashboardUrl = "/dashboard/player" // default

                if (role === "STUDENT" || role === "PLAYER") {
                    dashboardUrl = "/dashboard/player"
                } else if (role === "COACH") {
                    dashboardUrl = "/dashboard/coach"
                } else if (role === "ADMIN") {
                    dashboardUrl = "/dashboard/admin"
                }

                console.log(`🚀 Redirecting to ${dashboardUrl} (role: ${role})`)

                // Refresh the router cache so layouts/navbar update with auth state
                router.refresh()
                router.push(dashboardUrl)
                // Keep isLoading=true during redirect to prevent UI flicker
                return
            }

            // If we get here, something unexpected happened
            setSubmitError("An unexpected error occurred. Please try again.")
            setIsLoading(false)

        } catch (error) {
            console.error("❌ Network error:", error)
            setSubmitError("Network error. Please check your connection and try again.")
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
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        {/* Error Alert */}
                                        {submitError && (
                                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p>{submitError}</p>
                                                        {submitError.includes("Invalid email or password") && (
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
                                                disabled={isLoading}
                                            />
                                            <FieldError message={errors.email} />
                                        </div>

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
