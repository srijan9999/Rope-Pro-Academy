'use client'

import { QRCodeSVG } from 'qrcode.react'
import Barcode from 'react-barcode'

interface IDCardBackProps {
    data: {
        student_id: string
        full_name: string
        card_serial_number: string
        qr_code: string
        barcode: string
        emergency_contact?: string | null
        emergency_phone?: string | null
        parent_name?: string | null
        parent_phone?: string | null
        blood_group?: string | null
        medical_conditions?: string | null
        member_since: string
        valid_until?: string | null
        card_version: number
        academy?: { name: string; address?: string | null } | null
    }
}

export function IDCardBack({ data }: IDCardBackProps) {
    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'N/A'
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    return (
        <div
            id="id-card-back"
            className="relative w-[400px] h-[580px] rounded-2xl overflow-hidden shadow-2xl"
            style={{
                background: 'linear-gradient(160deg, #1a1a1a 0%, #2d1010 50%, #1a1a1a 100%)',
            }}
        >
            {/* Top Stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

            {/* Header */}
            <div className="px-5 pt-4 pb-3">
                <p className="text-red-400 text-[10px] font-bold tracking-[3px] uppercase text-center">
                    Rope Pro Academy — Verification
                </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-3">
                <div className="bg-white rounded-xl p-3 shadow-lg">
                    <QRCodeSVG
                        value={data.qr_code || data.student_id}
                        size={120}
                        level="H"
                        includeMargin={false}
                        bgColor="#ffffff"
                        fgColor="#1a1a1a"
                    />
                </div>
            </div>

            <p className="text-gray-500 text-[9px] text-center mb-3 tracking-wider">
                SCAN TO VERIFY IDENTITY
            </p>

            {/* Barcode */}
            <div className="flex justify-center mb-3">
                <div className="bg-white rounded-lg px-3 py-1.5">
                    <Barcode
                        value={data.barcode || '000000000000'}
                        width={1.2}
                        height={35}
                        fontSize={8}
                        margin={0}
                        displayValue={true}
                        background="#ffffff"
                        lineColor="#1a1a1a"
                    />
                </div>
            </div>

            {/* Emergency Info */}
            <div className="px-5 space-y-2">
                {/* Emergency Contact */}
                <div className="bg-red-900/30 border border-red-800/50 rounded-lg px-3 py-2">
                    <p className="text-red-400 text-[9px] font-bold tracking-wider uppercase mb-1">
                        ⚠ Emergency Contact
                    </p>
                    <div className="flex justify-between items-center">
                        <span className="text-white text-xs font-medium">
                            {data.emergency_contact || data.parent_name || 'Not Set'}
                        </span>
                        <span className="text-gray-300 text-[11px]">
                            {data.emergency_phone || data.parent_phone || '—'}
                        </span>
                    </div>
                </div>

                {/* Medical Info */}
                {(data.blood_group || data.medical_conditions) && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2">
                        <p className="text-gray-400 text-[9px] font-bold tracking-wider uppercase mb-1">
                            Medical
                        </p>
                        <div className="flex gap-4 text-xs">
                            {data.blood_group && (
                                <div>
                                    <span className="text-gray-500 text-[9px]">Blood: </span>
                                    <span className="text-white font-bold">{data.blood_group}</span>
                                </div>
                            )}
                            {data.medical_conditions && (
                                <div className="flex-1">
                                    <span className="text-gray-500 text-[9px]">Conditions: </span>
                                    <span className="text-gray-300 text-[10px]">{data.medical_conditions}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Validity */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                            <span className="text-gray-500">Issued:</span>
                            <span className="text-white ml-1">{formatDate(data.member_since)}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Valid Until:</span>
                            <span className="text-green-400 ml-1 font-semibold">{formatDate(data.valid_until)}</span>
                        </div>
                    </div>
                </div>

                {/* Serial */}
                <div className="text-center mt-2">
                    <p className="text-gray-600 text-[8px] tracking-[3px] uppercase">Serial Number</p>
                    <p className="text-gray-400 text-[11px] font-mono tracking-wider">
                        {data.card_serial_number || 'GENERATING...'}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-5 py-3">
                <div className="flex justify-between items-center text-[8px] text-gray-600">
                    <span>v{data.card_version}</span>
                    <span>This card is property of Rope Pro Academy</span>
                    <span>If found, return to academy</span>
                </div>
            </div>

            {/* Bottom Stripe */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-700 via-red-500 to-red-700" />
        </div>
    )
}
