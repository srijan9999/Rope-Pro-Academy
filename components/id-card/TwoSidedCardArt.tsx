"use client"

import React from "react"

/**
 * 4 Corner L-bracket crop/alignment markers
 */
export function CornerBrackets() {
    return (
        <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 400 560"
            fill="none"
            stroke="#111111"
            strokeWidth="1.8"
        >
            {/* Top-Left */}
            <path d="M 8 32 L 8 8 L 32 8" />
            {/* Top-Right */}
            <path d="M 368 8 L 392 8 L 392 32" />
            {/* Bottom-Left */}
            <path d="M 8 528 L 8 552 L 32 552" />
            {/* Bottom-Right */}
            <path d="M 368 552 L 392 552 L 392 528" />
        </svg>
    )
}

/**
 * Curved skipping rope with alternating red and black beads
 */
export function JumpRopeBeadsTopLeft() {
    return (
        <svg
            className="absolute top-2 left-2 w-28 h-28 pointer-events-none z-10"
            viewBox="0 0 110 110"
            fill="none"
        >
            {/* Rope guide line */}
            <path
                d="M 12 95 C 18 55 45 20 95 12"
                stroke="#111111"
                strokeWidth="1.2"
            />
            {/* Beaded segments: alternating red and black capsules along the arc */}
            {/* Bead 1 (black) */}
            <rect x="10" y="82" width="5.5" height="11" rx="2" transform="rotate(-15 12 87)" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />
            {/* Bead 2 (red) */}
            <rect x="13" y="67" width="5.5" height="11" rx="2" transform="rotate(-25 15 72)" fill="#E63946" stroke="#ffffff" strokeWidth="0.5" />
            {/* Bead 3 (black) */}
            <rect x="19" y="52" width="5.5" height="11" rx="2" transform="rotate(-38 21 57)" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />
            {/* Bead 4 (red) */}
            <rect x="29" y="38" width="5.5" height="11" rx="2" transform="rotate(-50 31 43)" fill="#E63946" stroke="#ffffff" strokeWidth="0.5" />
            {/* Bead 5 (black) */}
            <rect x="42" y="27" width="5.5" height="11" rx="2" transform="rotate(-62 44 32)" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />
            {/* Bead 6 (red) */}
            <rect x="58" y="18" width="5.5" height="11" rx="2" transform="rotate(-72 60 23)" fill="#E63946" stroke="#ffffff" strokeWidth="0.5" />
            {/* Bead 7 (black) */}
            <rect x="75" y="12" width="5.5" height="11" rx="2" transform="rotate(-82 77 17)" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />
        </svg>
    )
}

export function JumpRopeBeadsTopRight() {
    return (
        <svg
            className="absolute top-2 right-2 w-28 h-28 pointer-events-none z-10"
            viewBox="0 0 110 110"
            fill="none"
        >
            {/* Rope guide line */}
            <path
                d="M 98 95 C 92 55 65 20 15 12"
                stroke="#111111"
                strokeWidth="1.2"
            />
            {/* Beaded segments: alternating red and black */}
            <rect x="94" y="82" width="5.5" height="11" rx="2" transform="rotate(15 97 87)" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />
            <rect x="91" y="67" width="5.5" height="11" rx="2" transform="rotate(25 94 72)" fill="#E63946" stroke="#ffffff" strokeWidth="0.5" />
            <rect x="85" y="52" width="5.5" height="11" rx="2" transform="rotate(38 88 57)" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />
            <rect x="75" y="38" width="5.5" height="11" rx="2" transform="rotate(50 78 43)" fill="#E63946" stroke="#ffffff" strokeWidth="0.5" />
            <rect x="62" y="27" width="5.5" height="11" rx="2" transform="rotate(62 65 32)" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />
            <rect x="46" y="18" width="5.5" height="11" rx="2" transform="rotate(72 49 23)" fill="#E63946" stroke="#ffffff" strokeWidth="0.5" />
            <rect x="29" y="12" width="5.5" height="11" rx="2" transform="rotate(82 32 17)" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />
        </svg>
    )
}

export function JumpRopeBeadsBottomArc() {
    return (
        <svg
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[370px] h-32 pointer-events-none z-10"
            viewBox="0 0 370 120"
            fill="none"
        >
            {/* Smooth wide arch curving up along the bottom perimeter */}
            <path
                d="M 20 10 C 35 95 335 95 350 10"
                stroke="#111111"
                strokeWidth="1.2"
            />
            {/* Beaded segments */}
            <rect x="23" y="18" width="5.5" height="11" rx="2" transform="rotate(20 26 23)" fill="#E63946" stroke="#ffffff" strokeWidth="0.5" />
            <rect x="36" y="38" width="5.5" height="11" rx="2" transform="rotate(35 39 43)" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />
            <rect x="54" y="58" width="5.5" height="11" rx="2" transform="rotate(50 57 63)" fill="#E63946" stroke="#ffffff" strokeWidth="0.5" />
            <rect x="78" y="74" width="5.5" height="11" rx="2" transform="rotate(65 81 79)" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />

            <rect x="286" y="74" width="5.5" height="11" rx="2" transform="rotate(-65 289 79)" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />
            <rect x="310" y="58" width="5.5" height="11" rx="2" transform="rotate(-50 313 63)" fill="#E63946" stroke="#ffffff" strokeWidth="0.5" />
            <rect x="328" y="38" width="5.5" height="11" rx="2" transform="rotate(-35 331 43)" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />
            <rect x="341" y="18" width="5.5" height="11" rx="2" transform="rotate(-20 344 23)" fill="#E63946" stroke="#ffffff" strokeWidth="0.5" />
        </svg>
    )
}

/**
 * Centered faint watermark silhouette of the Rope Pro athlete jumping over rope
 */
export function WatermarkSilhouette() {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] z-0 overflow-hidden">
            <svg viewBox="0 0 300 400" className="w-[320px] h-[380px]" fill="#111111">
                {/* Head */}
                <circle cx="150" cy="90" r="18" />
                {/* Torso & arms jumping */}
                <path d="M 140 115 L 160 115 L 175 165 L 155 190 L 135 155 Z" />
                {/* Athletic Legs bent mid-jump */}
                <path d="M 135 185 L 115 235 L 135 255 L 150 215 Z" />
                <path d="M 155 185 L 175 230 L 195 245 L 170 205 Z" />
                {/* Rope arc encircling body */}
                <path
                    d="M 90 270 C 60 180 80 70 150 50 C 220 70 240 180 210 270"
                    stroke="#111111"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    )
}

/**
 * High-fidelity vector signatures for the 3 official signatories
 */
export function RaviPaswanSignature() {
    return (
        <svg viewBox="0 0 110 40" className="h-8 w-auto text-zinc-900 mx-auto" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            {/* Cursive sweeping R and loop */}
            <path d="M 12 32 C 8 20 12 8 22 8 C 30 8 32 20 24 28 C 18 34 14 26 22 22 C 30 18 38 24 46 24 C 54 24 60 22 68 23 C 76 24 84 22 92 23" strokeWidth="1.6" />
            {/* Flourish underline */}
            <path d="M 16 34 C 40 31 75 31 96 34" strokeWidth="1.3" />
        </svg>
    )
}

export function AniketDhimanSignature() {
    return (
        <svg viewBox="0 0 110 40" className="h-8 w-auto text-zinc-900 mx-auto" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            {/* Crisp cursive Aniket */}
            <path d="M 22 28 L 34 8 L 46 28 M 27 20 L 41 20" strokeWidth="1.6" />
            <path d="M 48 22 C 51 18 55 18 58 22 C 62 26 66 18 72 23 C 76 26 80 20 86 22" strokeWidth="1.5" />
            {/* Stylized sharp underline slash */}
            <path d="M 14 32 L 96 28" strokeWidth="1.4" />
        </svg>
    )
}

export function MukeshKumarSignature() {
    return (
        <svg viewBox="0 0 110 40" className="h-8 w-auto text-zinc-900 mx-auto" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            {/* Dynamic M loop and flourish */}
            <path d="M 18 29 L 20 11 L 28 22 L 36 11 L 38 29" strokeWidth="1.6" />
            <path d="M 42 24 C 46 17 50 27 57 21 C 63 16 70 26 77 19 C 83 15 88 24 94 21" strokeWidth="1.5" />
            {/* Dynamic underline */}
            <path d="M 14 33 C 38 30 68 30 96 33" strokeWidth="1.3" />
        </svg>
    )
}
