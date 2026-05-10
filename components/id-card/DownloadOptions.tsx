'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileImage, FileText, Loader2 } from 'lucide-react'

interface DownloadOptionsProps {
    data: Record<string, unknown>
}

export function DownloadOptions({ data }: DownloadOptionsProps) {
    const [isDownloading, setIsDownloading] = useState<string | null>(null)
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const downloadAsPNG = async () => {
        setIsDownloading('png')
        try {
            const html2canvas = (await import('html2canvas')).default
            const frontEl = document.getElementById('id-card-front')
            if (!frontEl) {
                alert('Please switch to Flat View to download')
                return
            }
            const canvas = await html2canvas(frontEl, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: false,
            })
            const link = document.createElement('a')
            link.download = `ID-Card-${data.student_id || 'card'}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()

            // Track download
            fetch('/api/player/id-card', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _track_download: true }),
            }).catch(() => { })
        } catch (err) {
            console.error('PNG download failed:', err)
            alert('Download failed. Please try again.')
        } finally {
            setIsDownloading(null)
            setShowMenu(false)
        }
    }

    const downloadAsPDF = async () => {
        setIsDownloading('pdf')
        try {
            const html2canvas = (await import('html2canvas')).default
            const { jsPDF } = await import('jspdf')

            const frontEl = document.getElementById('id-card-front')
            const backEl = document.getElementById('id-card-back')

            if (!frontEl) {
                alert('Please switch to Flat View to download PDF')
                return
            }

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [86, 125], // ID card size in mm (roughly)
            })

            // Front side
            const frontCanvas = await html2canvas(frontEl, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
                logging: false,
            })
            const frontImg = frontCanvas.toDataURL('image/png')
            pdf.addImage(frontImg, 'PNG', 0, 0, 86, 125)

            // Back side (if visible)
            if (backEl) {
                pdf.addPage([86, 125])
                const backCanvas = await html2canvas(backEl, {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: null,
                    logging: false,
                })
                const backImg = backCanvas.toDataURL('image/png')
                pdf.addImage(backImg, 'PNG', 0, 0, 86, 125)
            }

            pdf.save(`ID-Card-${data.student_id || 'card'}.pdf`)
        } catch (err) {
            console.error('PDF download failed:', err)
            alert('PDF download failed. Please try again.')
        } finally {
            setIsDownloading(null)
            setShowMenu(false)
        }
    }

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowMenu(!showMenu)}
            >
                <Download className="h-4 w-4 mr-2" />
                Download
            </Button>

            {showMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        onClick={downloadAsPNG}
                        disabled={!!isDownloading}
                    >
                        {isDownloading === 'png' ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                            <FileImage className="h-4 w-4 text-blue-600" />
                        )}
                        <div>
                            <p className="text-sm font-medium">PNG Image</p>
                            <p className="text-xs text-gray-500">High-resolution image</p>
                        </div>
                    </button>
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t"
                        onClick={downloadAsPDF}
                        disabled={!!isDownloading}
                    >
                        {isDownloading === 'pdf' ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        ) : (
                            <FileText className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                            <p className="text-sm font-medium">PDF Document</p>
                            <p className="text-xs text-gray-500">Print-ready format</p>
                        </div>
                    </button>
                </div>
            )}
        </div>
    )
}
