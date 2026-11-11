"use client"

import React from "react"
import { QRCodeSVG } from "qrcode.react"
import {
    CornerBrackets,
    JumpRopeBeadsTopLeft,
    JumpRopeBeadsTopRight,
    WatermarkSilhouette,
    RaviPaswanSignature,
    AniketDhimanSignature,
    MukeshKumarSignature,
} from "./TwoSidedCardArt"

export interface PhysicalIdCardBackProps {
    fatherName?: string | null
    fatherPhone?: string | null
    motherName?: string | null
    motherPhone?: string | null
    homeAddress?: string | null
    websiteUrl?: string
    contactPhones?: string
    qrValue?: string
}

export function PhysicalIdCardBack({
    fatherName,
    fatherPhone,
    motherName,
    motherPhone,
    homeAddress,
    websiteUrl = "www.ropeproacademy.com",
    contactPhones = "8470039884, 9899908098",
    qrValue = "https://www.ropeproacademy.com",
}: PhysicalIdCardBackProps) {
    return (
        <div
            id="id-card-back"
            className="relative w-[400px] h-[560px] bg-white rounded-xl shadow-2xl overflow-hidden border border-zinc-300 select-none flex flex-col justify-between"
            style={{ width: "400px", height: "560px" }}
        >
            {/* Corner Alignment Brackets & Jump Rope Curves */}
            <CornerBrackets />
            <JumpRopeBeadsTopLeft />
            <JumpRopeBeadsTopRight />
            <WatermarkSilhouette />

            {/* Top Section: Logo Header */}
            <div className="relative z-10 pt-4 px-6 flex justify-center items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/full-logo.png"
                    alt="Rope Pro Academy"
                    crossOrigin="anonymous"
                    className="h-16 w-auto object-contain max-w-[230px]"
                />
            </div>

            {/* Middle Section: Guardian & Address Details */}
            <div className="relative z-10 px-8 py-2">
                <div className="space-y-3.5 text-[11.5px] font-medium text-zinc-900">
                    {/* Father's Name */}
                    <div className="flex items-baseline">
                        <span className="shrink-0 text-zinc-800 font-semibold">Father&apos;s Name</span>
                        <span className="flex-1 mx-1.5 border-b-2 border-dotted border-zinc-400 min-w-[12px]" />
                        <span className="shrink-0 font-bold text-zinc-950">{fatherName || "—"}</span>
                    </div>

                    {/* Father's Phone */}
                    <div className="flex items-baseline">
                        <span className="shrink-0 text-zinc-800 font-semibold">Father&apos;s Phone No.</span>
                        <span className="flex-1 mx-1.5 border-b-2 border-dotted border-zinc-400 min-w-[12px]" />
                        <span className="shrink-0 font-bold text-zinc-950">{fatherPhone || "—"}</span>
                    </div>

                    {/* Mother's Name */}
                    <div className="flex items-baseline">
                        <span className="shrink-0 text-zinc-800 font-semibold">Mother&apos;s Name</span>
                        <span className="flex-1 mx-1.5 border-b-2 border-dotted border-zinc-400 min-w-[12px]" />
                        <span className="shrink-0 font-bold text-zinc-950">{motherName || "—"}</span>
                    </div>

                    {/* Mother's Phone */}
                    <div className="flex items-baseline">
                        <span className="shrink-0 text-zinc-800 font-semibold">Mother&apos;s Phone No.</span>
                        <span className="flex-1 mx-1.5 border-b-2 border-dotted border-zinc-400 min-w-[12px]" />
                        <span className="shrink-0 font-bold text-zinc-950">{motherPhone || "—"}</span>
                    </div>

                    {/* Home Address */}
                    <div className="flex items-baseline">
                        <span className="shrink-0 text-zinc-800 font-semibold">Home Address</span>
                        <span className="flex-1 mx-1.5 border-b-2 border-dotted border-zinc-400 min-w-[12px]" />
                        <span className="shrink-0 font-bold text-zinc-950 truncate max-w-[190px]">{homeAddress || "—"}</span>
                    </div>
                </div>
            </div>

            {/* Signatures Section */}
            <div className="relative z-10 px-6 pb-2">
                <div className="grid grid-cols-3 gap-2 text-center items-end">
                    {/* Ravi Paswan */}
                    <div className="flex flex-col items-center">
                        <RaviPaswanSignature />
                        <p className="text-[10.5px] font-black uppercase text-[#E63946] tracking-wider mt-1">
                            RAVI PASWAN
                        </p>
                        <p className="text-[9.5px] font-semibold text-zinc-800">
                            (Founder)
                        </p>
                    </div>

                    {/* Aniket Dhiman */}
                    <div className="flex flex-col items-center">
                        <AniketDhimanSignature />
                        <p className="text-[10.5px] font-black uppercase text-[#E63946] tracking-wider mt-1">
                            ANIKET DHIMAN
                        </p>
                        <p className="text-[9.5px] font-semibold text-zinc-800">
                            (Technical Head)
                        </p>
                    </div>

                    {/* Mukesh Kumar */}
                    <div className="flex flex-col items-center">
                        <MukeshKumarSignature />
                        <p className="text-[10.5px] font-black uppercase text-[#E63946] tracking-wider mt-1">
                            MUKESH KUMAR
                        </p>
                        <p className="text-[9.5px] font-semibold text-zinc-800">
                            (Head Coach)
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Black Container: Social, Contacts & QR Code */}
            <div className="relative z-10 w-full bg-[#111111] text-white px-6 py-2.5 flex items-center justify-between">
                {/* Left: Social Icons & Phone Contacts */}
                <div className="flex flex-col justify-center space-y-1">
                    {/* Social Circle Icons */}
                    <div className="flex items-center space-x-2.5">
                        {/* Facebook */}
                        <a
                            href="https://facebook.com/ropeproacademy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 h-6 rounded-full border border-[#E63946] bg-zinc-900 flex items-center justify-center hover:bg-[#E63946] transition-colors"
                            aria-label="Facebook"
                        >
                            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
                            </svg>
                        </a>

                        {/* Instagram */}
                        <a
                            href="https://instagram.com/ropeproacademy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 h-6 rounded-full border border-[#E63946] bg-zinc-900 flex items-center justify-center hover:bg-[#E63946] transition-colors"
                            aria-label="Instagram"
                        >
                            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>

                        {/* YouTube */}
                        <a
                            href="https://youtube.com/@ropeproacademy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 h-6 rounded-full border border-[#E63946] bg-zinc-900 flex items-center justify-center hover:bg-[#E63946] transition-colors"
                            aria-label="YouTube"
                        >
                            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </a>
                    </div>

                    {/* Website & Phone Numbers */}
                    <div>
                        <p className="text-[11px] font-bold text-white tracking-wide">
                            {websiteUrl}
                        </p>
                        <p className="text-[10px] font-medium text-zinc-300 tracking-wider">
                            {contactPhones}
                        </p>
                    </div>
                </div>

                {/* Right: Square QR Code & Caption */}
                <div className="flex flex-col items-center">
                    <div className="bg-white p-1 rounded-md shadow-sm">
                        <QRCodeSVG
                            value={qrValue}
                            size={56}
                            level="M"
                            bgColor="#ffffff"
                            fgColor="#111111"
                        />
                    </div>
                    <span className="text-[7.5px] font-semibold text-zinc-300 tracking-tight mt-1">
                        Scan QR Code for Website
                    </span>
                </div>
            </div>
        </div>
    )
}
