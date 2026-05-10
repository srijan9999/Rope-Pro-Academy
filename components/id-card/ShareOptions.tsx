'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Check } from 'lucide-react'

interface ShareOptionsProps {
    data: {
        student_id?: string
        full_name?: string
        card_serial_number?: string | null
    }
}

export function ShareOptions({ data }: ShareOptionsProps) {
    const [copied, setCopied] = useState(false)

    const shareText = `🎫 Rope Pro Academy ID Card\n👤 ${data.full_name}\n🆔 ${data.student_id}\n🔢 Serial: ${data.card_serial_number || 'N/A'}\n\nVerify at: ${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${data.card_serial_number || ''}`

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${data.full_name} - Rope Pro Academy ID Card`,
                    text: shareText,
                })
            } catch {
                // User cancelled or error — fallback to copy
                handleCopy()
            }
        } else {
            handleCopy()
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback
            const textarea = document.createElement('textarea')
            textarea.value = shareText
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Button variant="outline" className="w-full" onClick={handleShare}>
            {copied ? (
                <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Copied!
                </>
            ) : (
                <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </>
            )}
        </Button>
    )
}
