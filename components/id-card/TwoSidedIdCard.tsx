"use client"

import React, { useState, useRef } from "react"
import { PhysicalIdCardFront } from "./PhysicalIdCardFront"
import { PhysicalIdCardBack } from "./PhysicalIdCardBack"
import { EditCardDetailsModal } from "./EditCardDetailsModal"
import { PhotoUploadDialog } from "./PhotoUploadDialog"
import { Button } from "@/components/ui/button"
import {
    Download,
    Printer,
    Edit3,
    Camera,
    Loader2,
    Eye,
    RotateCw,
    FileText,
    Image as ImageIcon,
} from "lucide-react"

export interface TwoSidedIdCardProps {
    data: {
        idNumber: string
        fullName: string
        role: "STUDENT" | "COACH"
        photoUrl?: string | null
        branchName: string
        gender?: string | null
        dateOfBirth?: string | null
        weightKg?: number | string | null
        heightCm?: number | string | null
        contactNo?: string | null
        email?: string | null
        fatherName?: string | null
        fatherPhone?: string | null
        motherName?: string | null
        motherPhone?: string | null
        addressLine1?: string | null
        addressLine2?: string | null
        city?: string | null
        state?: string | null
        postalCode?: string | null
        websiteUrl?: string
        contactPhones?: string
        qrValue?: string
    }
    allowEdit?: boolean
    onRefresh?: () => void
    targetUserId?: string
}

export function TwoSidedIdCard({
    data: initialData,
    allowEdit = true,
    onRefresh,
    targetUserId,
}: TwoSidedIdCardProps) {
    const [cardData, setCardData] = useState(initialData)
    const [viewMode, setViewMode] = useState<"side-by-side" | "front" | "back" | "flip">("side-by-side")
    const [isFlipped, setIsFlipped] = useState(false)
    const [isDownloading, setIsDownloading] = useState<string | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isPhotoOpen, setIsPhotoOpen] = useState(false)

    // Sync if parent updates data
    React.useEffect(() => {
        setCardData(initialData)
    }, [initialData])

    // Compute formatted address string
    const formattedAddress = React.useMemo(() => {
        const parts = [
            cardData.addressLine1,
            cardData.addressLine2,
            cardData.city,
            cardData.state,
            cardData.postalCode,
        ].filter(Boolean)
        return parts.length > 0 ? parts.join(", ") : ""
    }, [
        cardData.addressLine1,
        cardData.addressLine2,
        cardData.city,
        cardData.state,
        cardData.postalCode,
    ])

    const handlePrint = () => {
        window.print()
    }

    const handleDownloadPdf = async () => {
        setIsDownloading("pdf")
        try {
            const html2canvas = (await import("html2canvas")).default
            const { jsPDF } = await import("jspdf")

            const frontEl = document.getElementById("id-card-front")
            const backEl = document.getElementById("id-card-back")

            if (!frontEl || !backEl) {
                alert("Please switch to 'Side-by-Side' view to generate PDF.")
                return
            }

            // High resolution render (scale 3 = 300+ DPI equivalent)
            const [frontCanvas, backCanvas] = await Promise.all([
                html2canvas(frontEl, {
                    scale: 3,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    logging: false,
                }),
                html2canvas(backEl, {
                    scale: 3,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    logging: false,
                }),
            ])

            // 100mm x 140mm page format (standard athletic / student badge size)
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [100, 140],
            })

            // Page 1: Front
            const frontImgData = frontCanvas.toDataURL("image/jpeg", 0.95)
            pdf.addImage(frontImgData, "JPEG", 0, 0, 100, 140)

            // Page 2: Back
            pdf.addPage([100, 140])
            const backImgData = backCanvas.toDataURL("image/jpeg", 0.95)
            pdf.addImage(backImgData, "JPEG", 0, 0, 100, 140)

            pdf.save(`RopePro-ID-Card-${cardData.idNumber || "card"}.pdf`)
        } catch (err) {
            console.error("PDF generation failed:", err)
            alert("Failed to export PDF. Please try again.")
        } finally {
            setIsDownloading(null)
        }
    }

    const handleDownloadPng = async (side: "front" | "back") => {
        setIsDownloading(side)
        try {
            const html2canvas = (await import("html2canvas")).default
            const elementId = side === "front" ? "id-card-front" : "id-card-back"
            const el = document.getElementById(elementId)

            if (!el) {
                alert(`Please ensure the ${side} of the card is visible.`)
                return
            }

            const canvas = await html2canvas(el, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: false,
            })

            const imageUri = canvas.toDataURL("image/png")
            const link = document.createElement("a")
            link.download = `RopePro-ID-${cardData.idNumber}-${side}.png`
            link.href = imageUri
            link.click()
        } catch (err) {
            console.error(`PNG ${side} download failed:`, err)
            alert("Failed to export image.")
        } finally {
            setIsDownloading(null)
        }
    }

    const handlePhotoSuccess = (newUrl: string) => {
        setCardData((prev) => ({ ...prev, photoUrl: newUrl }))
        if (onRefresh) onRefresh()
    }

    return (
        <div className="flex flex-col items-center w-full space-y-6">
            {/* Global Print Styles strictly isolating the card at 100mm x 140mm */}
            <style jsx global>{`
                @page {
                    size: 100mm 140mm;
                    margin: 0;
                }
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #print-container,
                    #print-container * {
                        visibility: visible !important;
                    }
                    #print-container {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100mm !important;
                        height: 140mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        z-index: 999999 !important;
                    }
                    .print-page-break {
                        page-break-after: always !important;
                        break-after: page !important;
                    }
                    #id-card-front,
                    #id-card-back {
                        width: 100mm !important;
                        height: 140mm !important;
                        border: none !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* Control Bar: View Toggle, Actions & Download */}
            <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-4xl bg-card border border-border p-3.5 rounded-2xl shadow-sm">
                {/* View Mode Pills */}
                <div className="inline-flex items-center rounded-xl bg-muted p-1 text-xs">
                    <button
                        type="button"
                        onClick={() => setViewMode("side-by-side")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                            viewMode === "side-by-side"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Side by Side
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("front")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                            viewMode === "front"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Front
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("back")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                            viewMode === "back"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("flip")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                            viewMode === "flip"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <RotateCw className="w-3 h-3" />
                        3D Flip
                    </button>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center flex-wrap gap-2">
                    {allowEdit && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsPhotoOpen(true)}
                                className="h-8 text-xs font-semibold gap-1.5"
                            >
                                <Camera className="w-3.5 h-3.5 text-[#E63946]" />
                                Change Photo
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditOpen(true)}
                                className="h-8 text-xs font-semibold gap-1.5"
                            >
                                <Edit3 className="w-3.5 h-3.5 text-[#E63946]" />
                                Edit Details
                            </Button>
                        </>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="h-8 text-xs font-semibold gap-1.5"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        Print
                    </Button>

                    <Button
                        size="sm"
                        disabled={!!isDownloading}
                        onClick={handleDownloadPdf}
                        className="h-8 text-xs font-bold gap-1.5 bg-[#E63946] hover:bg-[#D9232D] text-white"
                    >
                        {isDownloading === "pdf" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <FileText className="w-3.5 h-3.5" />
                        )}
                        Download 2-Page PDF
                    </Button>
                </div>
            </div>

            {/* Hidden Print Container for Isolated Native Printing */}
            <div id="print-container" className="hidden">
                <div className="print-page-break">
                    <PhysicalIdCardFront
                        idNumber={cardData.idNumber}
                        fullName={cardData.fullName}
                        branchName={cardData.branchName}
                        photoUrl={cardData.photoUrl}
                        gender={cardData.gender}
                        dateOfBirth={cardData.dateOfBirth}
                        weightKg={cardData.weightKg}
                        heightCm={cardData.heightCm}
                        contactNo={cardData.contactNo}
                        email={cardData.email}
                        role={cardData.role}
                    />
                </div>
                <div>
                    <PhysicalIdCardBack
                        fatherName={cardData.fatherName}
                        fatherPhone={cardData.fatherPhone}
                        motherName={cardData.motherName}
                        motherPhone={cardData.motherPhone}
                        homeAddress={formattedAddress}
                        websiteUrl={cardData.websiteUrl}
                        contactPhones={cardData.contactPhones}
                        qrValue={cardData.qrValue}
                    />
                </div>
            </div>

            {/* Display Canvas View */}
            <div className="py-2">
                {/* 1. Side by Side Mode */}
                {viewMode === "side-by-side" && (
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        {/* Front Card Container */}
                        <div className="flex flex-col items-center space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Front Side
                            </span>
                            <PhysicalIdCardFront
                                idNumber={cardData.idNumber}
                                fullName={cardData.fullName}
                                branchName={cardData.branchName}
                                photoUrl={cardData.photoUrl}
                                gender={cardData.gender}
                                dateOfBirth={cardData.dateOfBirth}
                                weightKg={cardData.weightKg}
                                heightCm={cardData.heightCm}
                                contactNo={cardData.contactNo}
                                email={cardData.email}
                                role={cardData.role}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={!!isDownloading}
                                onClick={() => handleDownloadPng("front")}
                                className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7"
                            >
                                <ImageIcon className="w-3 h-3" />
                                Export Front PNG
                            </Button>
                        </div>

                        {/* Back Card Container */}
                        <div className="flex flex-col items-center space-y-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Back Side
                            </span>
                            <PhysicalIdCardBack
                                fatherName={cardData.fatherName}
                                fatherPhone={cardData.fatherPhone}
                                motherName={cardData.motherName}
                                motherPhone={cardData.motherPhone}
                                homeAddress={formattedAddress}
                                websiteUrl={cardData.websiteUrl}
                                contactPhones={cardData.contactPhones}
                                qrValue={cardData.qrValue}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={!!isDownloading}
                                onClick={() => handleDownloadPng("back")}
                                className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7"
                            >
                                <ImageIcon className="w-3 h-3" />
                                Export Back PNG
                            </Button>
                        </div>
                    </div>
                )}

                {/* 2. Front Only Mode */}
                {viewMode === "front" && (
                    <div className="flex flex-col items-center space-y-2">
                        <PhysicalIdCardFront
                            idNumber={cardData.idNumber}
                            fullName={cardData.fullName}
                            branchName={cardData.branchName}
                            photoUrl={cardData.photoUrl}
                            gender={cardData.gender}
                            dateOfBirth={cardData.dateOfBirth}
                            weightKg={cardData.weightKg}
                            heightCm={cardData.heightCm}
                            contactNo={cardData.contactNo}
                            email={cardData.email}
                            role={cardData.role}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={!!isDownloading}
                            onClick={() => handleDownloadPng("front")}
                            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7"
                        >
                            <ImageIcon className="w-3 h-3" />
                            Export Front PNG
                        </Button>
                    </div>
                )}

                {/* 3. Back Only Mode */}
                {viewMode === "back" && (
                    <div className="flex flex-col items-center space-y-2">
                        <PhysicalIdCardBack
                            fatherName={cardData.fatherName}
                            fatherPhone={cardData.fatherPhone}
                            motherName={cardData.motherName}
                            motherPhone={cardData.motherPhone}
                            homeAddress={formattedAddress}
                            websiteUrl={cardData.websiteUrl}
                            contactPhones={cardData.contactPhones}
                            qrValue={cardData.qrValue}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={!!isDownloading}
                            onClick={() => handleDownloadPng("back")}
                            className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7"
                        >
                            <ImageIcon className="w-3 h-3" />
                            Export Back PNG
                        </Button>
                    </div>
                )}

                {/* 4. Interactive 3D Flip Mode */}
                {viewMode === "flip" && (
                    <div className="flex flex-col items-center space-y-4">
                        <div
                            className="cursor-pointer transition-transform duration-700 [perspective:1000px]"
                            onClick={() => setIsFlipped(!isFlipped)}
                            role="button"
                            tabIndex={0}
                            aria-label="Click to flip ID card"
                        >
                            <div
                                className={`relative w-[400px] h-[560px] transition-all duration-700 [transform-style:preserve-3d] ${
                                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                                }`}
                            >
                                {/* Front Face */}
                                <div className="absolute inset-0 [backface-visibility:hidden]">
                                    <PhysicalIdCardFront
                                        idNumber={cardData.idNumber}
                                        fullName={cardData.fullName}
                                        branchName={cardData.branchName}
                                        photoUrl={cardData.photoUrl}
                                        gender={cardData.gender}
                                        dateOfBirth={cardData.dateOfBirth}
                                        weightKg={cardData.weightKg}
                                        heightCm={cardData.heightCm}
                                        contactNo={cardData.contactNo}
                                        email={cardData.email}
                                        role={cardData.role}
                                    />
                                </div>

                                {/* Back Face */}
                                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                    <PhysicalIdCardBack
                                        fatherName={cardData.fatherName}
                                        fatherPhone={cardData.fatherPhone}
                                        motherName={cardData.motherName}
                                        motherPhone={cardData.motherPhone}
                                        homeAddress={formattedAddress}
                                        websiteUrl={cardData.websiteUrl}
                                        contactPhones={cardData.contactPhones}
                                        qrValue={cardData.qrValue}
                                    />
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            Click the card to flip between Front and Back sides
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <EditCardDetailsModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSuccess={() => {
                    if (onRefresh) onRefresh()
                }}
                role={cardData.role}
                initialData={{
                    idNumber: cardData.idNumber,
                    fullName: cardData.fullName,
                    gender: cardData.gender,
                    dateOfBirth: cardData.dateOfBirth,
                    branchName: cardData.branchName,
                    email: cardData.email,
                    phone: cardData.contactNo,
                    weightKg: cardData.weightKg,
                    heightCm: cardData.heightCm,
                    fatherName: cardData.fatherName,
                    fatherPhone: cardData.fatherPhone,
                    motherName: cardData.motherName,
                    motherPhone: cardData.motherPhone,
                    addressLine1: cardData.addressLine1,
                    addressLine2: cardData.addressLine2,
                    city: cardData.city,
                    state: cardData.state,
                    postalCode: cardData.postalCode,
                }}
            />

            <PhotoUploadDialog
                isOpen={isPhotoOpen}
                onClose={() => setIsPhotoOpen(false)}
                onSuccess={handlePhotoSuccess}
                targetUserId={targetUserId}
            />
        </div>
    )
}
