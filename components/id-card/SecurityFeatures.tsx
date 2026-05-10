'use client'

import { Card } from '@/components/ui/card'
import { Shield, Fingerprint, Link2, Cpu, FileKey, CheckCircle2 } from 'lucide-react'

interface SecurityFeaturesProps {
    data: {
        card_serial_number?: string | null
        nfc_signature?: string | null
        blockchain_hash?: string | null
        digital_signature?: string | null
        qr_code?: string | null
        barcode?: string | null
    }
}

export function SecurityFeatures({ data }: SecurityFeaturesProps) {
    const features = [
        {
            icon: Shield,
            label: 'QR Verification',
            status: !!data.qr_code,
            detail: data.qr_code ? 'Encrypted QR Active' : 'Generating...',
            color: 'text-green-600',
        },
        {
            icon: Cpu,
            label: 'NFC Signature',
            status: !!data.nfc_signature,
            detail: data.nfc_signature ? `${data.nfc_signature.slice(0, 12)}...` : 'Not Generated',
            color: 'text-blue-600',
        },
        {
            icon: Link2,
            label: 'Blockchain Hash',
            status: !!data.blockchain_hash,
            detail: data.blockchain_hash ? `0x${data.blockchain_hash.slice(0, 10)}...` : 'Not Generated',
            color: 'text-purple-600',
        },
        {
            icon: FileKey,
            label: 'Digital Signature',
            status: !!data.digital_signature,
            detail: data.digital_signature ? `${data.digital_signature.slice(0, 12)}...` : 'Not Generated',
            color: 'text-orange-600',
        },
        {
            icon: Fingerprint,
            label: 'Barcode',
            status: !!data.barcode,
            detail: data.barcode ? `CODE128: ${data.barcode}` : 'Generating...',
            color: 'text-teal-600',
        },
    ]

    return (
        <Card className="p-6 mt-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Security Features
            </h3>
            <div className="space-y-3">
                {features.map((feature) => (
                    <div
                        key={feature.label}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                    >
                        <feature.icon className={`h-5 w-5 ${feature.color}`} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{feature.label}</p>
                            <p className="text-xs text-gray-500 truncate font-mono">
                                {feature.detail}
                            </p>
                        </div>
                        {feature.status ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        )}
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
                All security features are automatically generated and verified
            </p>
        </Card>
    )
}
