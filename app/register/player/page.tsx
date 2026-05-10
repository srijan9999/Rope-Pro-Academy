import { PlayerRegistrationForm } from "@/components/auth/player-registration"

export default function RegisterPlayerPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white border border-gray-200 shadow-lg rounded-xl p-8">
                <div className="mb-8 text-center">
                    <h1 className="font-heading text-3xl font-black uppercase text-primary md:text-5xl">Student Registration</h1>
                    <p className="mt-2 text-muted-foreground">Join the champions at Rope Pro Academy</p>
                </div>
                <PlayerRegistrationForm />
            </div>
        </div>
    )
}
