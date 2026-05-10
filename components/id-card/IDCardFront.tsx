'use client'

/* eslint-disable @next/next/no-img-element */

interface IDCardFrontProps {
    data: {
        student_id: string
        full_name: string
        photo_url?: string | null
        skill_level?: string
        membership_tier: string
        is_active: boolean
        fee_status: string
        attendance_rate: number
        batch?: { name: string; time_slot?: string | null; skill_level?: string } | null
        academy?: { name: string; location?: string } | null
        coach?: { name: string; photo?: string | null } | null
        card_serial_number?: string | null
        total_medals: number
        guinness_records: number
        national_medals: number
        state_medals: number
        gender?: string | null
    }
}

const tierColors: Record<string, { bg: string; text: string; glow: string }> = {
    BASIC: { bg: 'from-gray-600 to-gray-700', text: 'text-gray-300', glow: 'shadow-gray-600/30' },
    BRONZE: { bg: 'from-amber-700 to-amber-800', text: 'text-amber-300', glow: 'shadow-amber-600/30' },
    SILVER: { bg: 'from-slate-400 to-slate-500', text: 'text-slate-200', glow: 'shadow-slate-400/30' },
    GOLD: { bg: 'from-yellow-500 to-yellow-600', text: 'text-yellow-200', glow: 'shadow-yellow-500/30' },
    PLATINUM: { bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-200', glow: 'shadow-emerald-500/30' },
    VIP: { bg: 'from-purple-600 to-pink-600', text: 'text-purple-200', glow: 'shadow-purple-500/30' },
}

export function IDCardFront({ data }: IDCardFrontProps) {
    const tier = tierColors[data.membership_tier] || tierColors.BASIC
    const initials = data.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const totalAchievements = data.total_medals + data.guinness_records + data.national_medals + data.state_medals

    return (
        <div
            id="id-card-front"
            className="relative w-[400px] h-[580px] rounded-2xl overflow-hidden shadow-2xl select-none"
            style={{
                background: 'linear-gradient(160deg, #1a1a1a 0%, #300a0a 40%, #1a1a1a 100%)',
            }}
        >
            {/* Holographic Shimmer Overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background:
                        'linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.03) 30%, transparent 40%, rgba(220,38,38,0.05) 50%, transparent 60%, rgba(255,255,255,0.03) 70%, transparent 80%)',
                    backgroundSize: '200% 200%',
                    animation: 'shimmer 4s ease-in-out infinite',
                }}
            />

            {/* Top Red Stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

            {/* Header - Academy Name */}
            <div className="relative z-20 px-5 pt-5 pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-white text-lg font-black tracking-wider uppercase">
                            Rope Pro
                        </h2>
                        <p className="text-red-500 text-[10px] font-bold tracking-[4px] uppercase -mt-0.5">
                            Academy
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span
                            className={`w-2.5 h-2.5 rounded-full ${data.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                }`}
                        />
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                            {data.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Divider Line */}
            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

            {/* Photo Section */}
            <div className="relative z-20 flex justify-center py-5">
                <div className="relative">
                    {/* Outer glow ring */}
                    <div className={`absolute -inset-1 rounded-full bg-gradient-to-br ${tier.bg} opacity-60 blur-sm`} />
                    {/* Photo container */}
                    <div className="relative w-[110px] h-[110px] rounded-full overflow-hidden border-2 border-red-600/60 bg-gray-800">
                        {data.photo_url ? (
                            <img
                                src={data.photo_url}
                                alt={data.full_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900 to-red-950">
                                <span className="text-3xl font-bold text-white/80">{initials}</span>
                            </div>
                        )}
                    </div>
                    {/* Tier Badge */}
                    <div
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r ${tier.bg} shadow-lg ${tier.glow}`}
                    >
                        <span className={`text-[9px] font-bold tracking-wider ${tier.text}`}>
                            {data.membership_tier}
                        </span>
                    </div>
                </div>
            </div>

            {/* Name & ID */}
            <div className="relative z-20 text-center px-5 mt-1">
                <h3 className="text-white text-xl font-bold tracking-wide uppercase">
                    {data.full_name}
                </h3>
                <p className="text-red-400 text-sm font-mono tracking-widest mt-0.5">
                    {data.student_id}
                </p>
            </div>

            {/* Skill Level Tag */}
            <div className="flex justify-center mt-3">
                <span className="px-4 py-1 rounded-full bg-red-900/40 border border-red-700/40 text-red-300 text-[10px] font-semibold tracking-wider uppercase">
                    {data.skill_level || data.batch?.skill_level || 'Beginner'}
                </span>
            </div>

            {/* Info Grid */}
            <div className="relative z-20 mx-5 mt-4 grid grid-cols-2 gap-2">
                {/* Academy */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5">
                    <p className="text-gray-500 text-[8px] uppercase tracking-wider">Academy</p>
                    <p className="text-white text-[11px] font-medium truncate">
                        {data.academy?.name || '—'}
                    </p>
                </div>
                {/* Batch */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5">
                    <p className="text-gray-500 text-[8px] uppercase tracking-wider">Batch</p>
                    <p className="text-white text-[11px] font-medium truncate">
                        {data.batch?.name || '—'}
                    </p>
                </div>
                {/* Coach */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5">
                    <p className="text-gray-500 text-[8px] uppercase tracking-wider">Coach</p>
                    <p className="text-white text-[11px] font-medium truncate">
                        {data.coach?.name || '—'}
                    </p>
                </div>
                {/* Attendance */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5">
                    <p className="text-gray-500 text-[8px] uppercase tracking-wider">Attendance</p>
                    <p className="text-white text-[11px] font-bold">
                        {data.attendance_rate}%
                    </p>
                </div>
            </div>

            {/* Achievement Badges */}
            {totalAchievements > 0 && (
                <div className="relative z-20 mx-5 mt-3 flex items-center gap-2">
                    <div className="flex gap-1 flex-wrap">
                        {data.guinness_records > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-900/40 border border-yellow-700/40 text-yellow-300">
                                🏅 {data.guinness_records} GWR
                            </span>
                        )}
                        {data.national_medals > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/40 border border-blue-700/40 text-blue-300">
                                🥇 {data.national_medals} National
                            </span>
                        )}
                        {data.state_medals > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/40 border border-green-700/40 text-green-300">
                                🏆 {data.state_medals} State
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Bottom Stripe */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

            {/* Shimmer CSS */}
            <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 200%;
          }
          50% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 200% 200%;
          }
        }
      `}</style>
        </div>
    )
}
