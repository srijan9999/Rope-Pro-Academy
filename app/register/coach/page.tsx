import { CoachRegistrationForm } from "@/components/auth/coach-registration"

export default function RegisterCoachPage() {
    return (
        <div className="min-h-screen bg-zinc-50 py-12 dark:bg-black">
            <div className="container mx-auto max-w-4xl px-4">
                <div className="mb-8 text-center">
                    <h1 className="font-heading text-3xl font-black uppercase text-primary md:text-5xl">Career Application</h1>
                    <p className="mt-2 text-muted-foreground">Join the best team of Rope Skipping professionals</p>
                </div>
                <CoachRegistrationForm />
            </div>
        </div>
    )
}
