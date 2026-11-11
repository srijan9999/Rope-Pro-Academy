"use client"

import React from "react"
import {
    CornerBrackets,
    JumpRopeBeadsTopLeft,
    JumpRopeBeadsTopRight,
    JumpRopeBeadsBottomArc,
    WatermarkSilhouette,
} from "./TwoSidedCardArt"

export interface PhysicalIdCardFrontProps {
    idNumber: string // e.g. RPA-PL26001
    fullName: string
    branchName: string // e.g. Bal Bharati Public School, Rohini
    photoUrl?: string | null
    gender?: string | null
    dateOfBirth?: string | null
    weightKg?: number | string | null
    heightCm?: number | string | null
    contactNo?: string | null
    email?: string | null
    role?: "STUDENT" | "COACH"
}

export function PhysicalIdCardFront({
    idNumber,
    fullName,
    branchName,
    photoUrl,
    gender = "Male",
    dateOfBirth,
    weightKg,
    heightCm,
    contactNo,
    email,
    role = "STUDENT",
}: PhysicalIdCardFrontProps) {
    // Format date of birth nicely as DD-MM-YYYY
    const formattedDob = React.useMemo(() => {
        if (!dateOfBirth) return "—"
        try {
            const d = new Date(dateOfBirth)
            if (isNaN(d.getTime())) return dateOfBirth
            const day = String(d.getDate()).padStart(2, "0")
            const month = String(d.getMonth() + 1).padStart(2, "0")
            const year = d.getFullYear()
            return `${day}-${month}-${year}`
        } catch {
            return dateOfBirth
        }
    }, [dateOfBirth])

    return (
        <div
            id="id-card-front"
            className="relative w-[400px] h-[560px] bg-white rounded-xl shadow-2xl overflow-hidden border border-zinc-300 select-none flex flex-col justify-between"
            style={{ width: "400px", height: "560px" }}
        >
            {/* Corner Alignment Brackets & Beaded Jump Rope Curves */}
            <CornerBrackets />
            <JumpRopeBeadsTopLeft />
            <JumpRopeBeadsTopRight />
            <JumpRopeBeadsBottomArc />
            <WatermarkSilhouette />

            {/* Top Section */}
            <div className="relative z-10 pt-3">
                {/* Academy Logo Header */}
                <div className="flex justify-center items-center px-6 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/full-logo.png"
                        alt="Rope Pro Academy"
                        crossOrigin="anonymous"
                        className="h-14 w-auto object-contain max-w-[210px]"
                    />
                </div>

                {/* Black Branch Bar */}
                <div className="w-full bg-[#111111] text-white py-1.5 px-4 text-center">
                    <p className="text-[11px] font-bold tracking-wide uppercase truncate">
                        Branch: {branchName || "Bal Bharati Public School, Rohini"}
                    </p>
                </div>
            </div>

            {/* Middle Section: Photo & Red Name Banner */}
            <div className="relative z-10 flex flex-col items-center -mt-1">
                {/* Side Athletic Chevron Accent Panels */}
                <div className="absolute left-7 top-1 w-11 h-44 pointer-events-none">
                    <svg viewBox="0 0 44 160" className="w-full h-full" fill="none">
                        <polygon points="8,0 44,0 44,140 8,160" fill="#18181b" />
                        <polygon points="22,10 42,10 42,122 22,136" fill="#E63946" />
                    </svg>
                </div>
                <div className="absolute right-7 top-1 w-11 h-44 pointer-events-none">
                    <svg viewBox="0 0 44 160" className="w-full h-full" fill="none">
                        <polygon points="0,0 36,0 36,160 0,140" fill="#18181b" />
                        <polygon points="2,10 22,10 22,136 2,122" fill="#E63946" />
                    </svg>
                </div>

                {/* Central Photo Frame */}
                <div className="relative w-[138px] h-[168px] bg-zinc-100 border-[3px] border-[#111111] shadow-md overflow-hidden flex items-center justify-center">
                    {photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={photoUrl}
                            alt={fullName}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-zinc-400 p-2 text-center">
                            <span className="text-3xl font-black text-zinc-700">
                                {fullName
                                    ?.trim()
                                    .split(/\s+/)
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase() || "RP"}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-zinc-500 mt-1">
                                No Photo
                            </span>
                        </div>
                    )}
                </div>

                {/* ID Number */}
                <div className="mt-1.5 mb-1 text-center">
                    <p className="text-[14px] font-black tracking-widest text-[#111111] font-mono">
                        ID: {idNumber || (role === "COACH" ? "RPA-CH26001" : "RPA-PL26001")}
                    </p>
                </div>

                {/* Red Name Banner */}
                <div className="w-full bg-[#E63946] text-white py-1 px-4 text-center shadow-sm">
                    <h2 className="text-[17px] font-black uppercase tracking-wider truncate">
                        {fullName || "ATHLETE NAME"}
                    </h2>
                </div>
            </div>

            {/* Bottom Section: Dotted Details & Disclaimer */}
            <div className="relative z-10 px-7 pb-4">
                <div className="space-y-1.5 text-[11px] font-medium text-zinc-900">
                    {/* Row 1: Gender & DOB */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-baseline">
                            <span className="shrink-0 text-zinc-800 font-semibold">Gender</span>
                            <span className="flex-1 mx-1 border-b-2 border-dotted border-zinc-400 min-w-[12px]" />
                            <span className="shrink-0 font-bold text-zinc-950 capitalize">{gender || "—"}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="shrink-0 text-zinc-800 font-semibold">D.O.B</span>
                            <span className="flex-1 mx-1 border-b-2 border-dotted border-zinc-400 min-w-[12px]" />
                            <span className="shrink-0 font-bold text-zinc-950">{formattedDob}</span>
                        </div>
                    </div>

                    {/* Row 2: Weight & Height */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-baseline">
                            <span className="shrink-0 text-zinc-800 font-semibold">Weight (kg)</span>
                            <span className="flex-1 mx-1 border-b-2 border-dotted border-zinc-400 min-w-[12px]" />
                            <span className="shrink-0 font-bold text-zinc-950">{weightKg ? String(weightKg) : "—"}</span>
                        </div>
                        <div className="flex items-baseline">
                            <span className="shrink-0 text-zinc-800 font-semibold">Height (cm)</span>
                            <span className="flex-1 mx-1 border-b-2 border-dotted border-zinc-400 min-w-[12px]" />
                            <span className="shrink-0 font-bold text-zinc-950">{heightCm ? String(heightCm) : "—"}</span>
                        </div>
                    </div>

                    {/* Row 3: Contact No */}
                    <div className="flex items-baseline">
                        <span className="shrink-0 text-zinc-800 font-semibold">Contact No.</span>
                        <span className="flex-1 mx-1 border-b-2 border-dotted border-zinc-400 min-w-[12px]" />
                        <span className="shrink-0 font-bold text-zinc-950">{contactNo || "—"}</span>
                    </div>

                    {/* Row 4: Email Id */}
                    <div className="flex items-baseline">
                        <span className="shrink-0 text-zinc-800 font-semibold">Email Id</span>
                        <span className="flex-1 mx-1 border-b-2 border-dotted border-zinc-400 min-w-[12px]" />
                        <span className="shrink-0 font-bold text-zinc-950 truncate max-w-[210px]">{email || "—"}</span>
                    </div>
                </div>

                {/* Bottom Divider Line */}
                <div className="w-[320px] mx-auto border-b border-[#111111] mt-2 mb-1" />

                {/* Disclaimer */}
                <div className="text-center text-[9px] font-semibold text-zinc-800 leading-tight">
                    <p>ID card is to be carried during every session.</p>
                    <p>Loss of card must be reported immediatly.</p>
                </div>
            </div>
        </div>
    )
}
