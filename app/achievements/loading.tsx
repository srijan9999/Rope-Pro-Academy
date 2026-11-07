export default function AchievementsLoading() {
    return (
        <div className="min-h-screen bg-black text-white pb-20 animate-pulse">
            {/* Header Hero Skeleton */}
            <div className="bg-zinc-950 py-16 sm:py-20 text-center border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                    <div className="h-3 w-28 bg-[#E63946]/30 rounded-full mb-4" />
                    <div className="h-10 sm:h-12 w-64 sm:w-80 bg-zinc-800 rounded-xl mb-4" />
                    <div className="h-4 w-96 max-w-full bg-zinc-800/60 rounded-md" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                {/* Year Tabs Skeleton */}
                <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
                    <div className="h-9 w-20 bg-zinc-900 rounded-xl shrink-0" />
                    <div className="h-9 w-24 bg-zinc-900 rounded-xl shrink-0" />
                    <div className="h-9 w-24 bg-zinc-900 rounded-xl shrink-0" />
                    <div className="h-9 w-24 bg-zinc-900 rounded-xl shrink-0" />
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="aspect-[4/3] rounded-2xl bg-zinc-900 border border-zinc-800"
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
