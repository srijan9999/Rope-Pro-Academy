"use client"

import { useState } from "react"
import { Printer, Download, Loader2, ShieldCheck, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface IdCardProps {
    name: string
    role: "STUDENT" | "COACH"
    photoUrl?: string | null
    idNumber: string // existing studentId or coachId from DB
    location?: string | null
    validUntil?: string | null
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function IdCard({
    name,
    role,
    photoUrl,
    idNumber,
    location,
    validUntil,
}: IdCardProps) {
    const [isDownloading, setIsDownloading] = useState(false)
    const initials = getInitials(name || "Rope Pro")

    const handlePrint = () => {
        window.print()
    }

    const handleDownloadPng = async () => {
        const cardElement = document.getElementById("id-card-print")
        if (!cardElement) return

        setIsDownloading(true)
        try {
            const html2canvas = (await import("html2canvas")).default
            const canvas = await html2canvas(cardElement, {
                scale: 3, // Sharp high-resolution render (3x pixel ratio)
                useCORS: true, // Prevent tainted canvas on external photos
                allowTaint: true,
                backgroundColor: "#000000",
                logging: false,
            })

            const imageUri = canvas.toDataURL("image/png")
            const link = document.createElement("a")
            link.download = `${role.toLowerCase()}-${idNumber}-id-card.png`
            link.href = imageUri
            link.click()
        } catch (error) {
            console.error("Failed to render ID card PNG:", error)
        } finally {
            setIsDownloading(false)
        }
    }

    const isCoach = role === "COACH"

    return (
        <div className="flex flex-col items-center">
            {/* Global Print Styles strictly isolating the ID card at exact CR80 size (53.98mm x 85.6mm) */}
            <style jsx global>{`
                @page {
                    size: 53.98mm 85.6mm;
                    margin: 0;
                }
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #id-card-print,
                    #id-card-print * {
                        visibility: visible;
                    }
                    #id-card-print {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 53.98mm !important;
                        height: 85.6mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        overflow: hidden !important;
                        z-index: 999999;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* CR80 Card Container: Aspect ratio 53.98 / 85.6 mm (approx 320px x 508px) */}
            <div
                id="id-card-print"
                className="relative w-[320px] h-[508px] rounded-2xl bg-black border border-zinc-800 shadow-2xl overflow-hidden flex flex-col justify-between text-white select-none"
                style={{
                    aspectRatio: "53.98 / 85.6",
                }}
            >
                {/* Top Red Accent Band */}
                <div className="h-3 w-full bg-[#E63946]" />

                {/* Card Header: Official Academy Logo */}
                <div className="pt-4 px-6 flex flex-col items-center text-center">
                    {/* Using standard <img> with crossOrigin for clean canvas rendering */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/full-logo.png"
                        alt="Rope Pro Academy"
                        crossOrigin="anonymous"
                        className="h-10 w-auto object-contain max-w-[200px]"
                    />
                    <div className="mt-1 flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                        <ShieldCheck className="w-3 h-3 text-[#E63946]" />
                        <span>Official Digital Credential</span>
                    </div>
                </div>

                {/* Central Identity Section */}
                <div className="px-6 flex flex-col items-center text-center -mt-2">
                    {/* Photo with Initials Fallback */}
                    <div className="relative mb-3">
                        <div className="w-24 h-24 rounded-full border-2 border-[#E63946] p-1 bg-zinc-900 shadow-lg shadow-black/80 flex items-center justify-center overflow-hidden">
                            {photoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={photoUrl}
                                    alt={name}
                                    crossOrigin="anonymous"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-black text-white tracking-wider">
                                    {initials}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Member Name (wraps or truncates cleanly at 2 lines) */}
                    <h3
                        className="font-heading text-xl font-black uppercase tracking-tight text-white line-clamp-2 max-w-[270px] leading-snug"
                        title={name}
                    >
                        {name}
                    </h3>

                    {/* Role Badge (Red for COACH, white/gray for STUDENT) */}
                    <div className="mt-2">
                        {isCoach ? (
                            <span className="inline-block px-3.5 py-1 rounded-md bg-[#E63946] text-white text-[11px] font-black uppercase tracking-widest shadow-md">
                                Official Coach
                            </span>
                        ) : (
                            <span className="inline-block px-3 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] font-bold uppercase tracking-widest">
                                Student Athlete
                            </span>
                        )}
                    </div>

                    {/* Unique ID Number (Monospace) */}
                    <div className="mt-3 py-1 px-3 rounded bg-zinc-950 border border-zinc-800/80">
                        <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest block">
                            ID Number
                        </span>
                        <span className="font-mono text-sm font-bold tracking-widest text-[#E63946]">
                            {idNumber}
                        </span>
                    </div>

                    {/* Optional Location & Validity (only rendered if real data exists) */}
                    {(location || validUntil) && (
                        <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-zinc-400 font-medium">
                            {location && (
                                <span className="flex items-center gap-1 truncate max-w-[130px]">
                                    <MapPin className="w-3 h-3 text-[#E63946] shrink-0" />
                                    <span className="truncate">{location}</span>
                                </span>
                            )}
                            {validUntil && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-zinc-500 shrink-0" />
                                    <span>Exp: {validUntil}</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Card Footer Barcode & Security Strip */}
                <div className="px-6 pb-4 pt-2 border-t border-zinc-900 bg-zinc-950/70 text-center flex flex-col items-center">
                    {/* Stylized Barcode pattern */}
                    <div className="w-44 h-7 flex items-center justify-between opacity-80 mb-1" aria-hidden="true">
                        {[4, 2, 6, 2, 8, 4, 2, 6, 4, 8, 2, 4, 6, 2, 8, 4, 2, 4, 8, 2, 6, 4, 2].map((w, i) => (
                            <div
                                key={i}
                                className="h-full bg-zinc-300"
                                style={{ width: `${w}px` }}
                            />
                        ))}
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
                        ROPE PRO VERIFIED CREDENTIAL
                    </span>
                </div>

                {/* Bottom Red Accent Band */}
                <div className="h-1.5 w-full bg-[#E63946]" />
            </div>

            {/* Action Buttons: Print and Download PNG */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full max-w-[320px]">
                <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="flex-1 bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider h-10"
                >
                    <Printer className="w-4 h-4 mr-2 text-[#E63946]" />
                    Print ID
                </Button>

                <Button
                    onClick={handleDownloadPng}
                    disabled={isDownloading}
                    className="flex-1 bg-[#E63946] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider h-10 shadow-md shadow-[#E63946]/20"
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4 mr-2" />
                            Download PNG
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
