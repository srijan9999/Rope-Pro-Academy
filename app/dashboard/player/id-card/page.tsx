'use client'

import { useState, Suspense, lazy } from 'react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Loader2,
    CreditCard,
    RotateCcw,
    Printer,
    Eye,
    EyeOff,
    Fingerprint,
    Download,
    AlertCircle,
    Box,
    Layers,
    Award,
    BarChart3,
    Settings,
} from 'lucide-react'
import { IDCardFront } from '@/components/id-card/IDCardFront'
import { IDCardBack } from '@/components/id-card/IDCardBack'
import { UpdateDetailsForm } from '@/components/id-card/UpdateDetailsForm'
import { RequestReplacementDialog } from '@/components/id-card/RequestReplacementDialog'
import { DownloadOptions } from '@/components/id-card/DownloadOptions'
import { ShareOptions } from '@/components/id-card/ShareOptions'
import { SecurityFeatures } from '@/components/id-card/SecurityFeatures'
import { IDCardHistory } from '@/components/id-card/IDCardHistory'

// Lazy load the 3D component (it's heavy)
const VirtualIDCard3D = lazy(() =>
    import('@/components/id-card/VirtualIDCard3D').then((mod) => ({
        default: mod.VirtualIDCard3D,
    }))
)

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ViewMode = '3d' | 'flat'
type CardSide = 'front' | 'back'

function StatusBadge({ label, variant }: { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }) {
    const styles = {
        success: 'bg-green-100 text-green-800 border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        danger: 'bg-red-100 text-red-800 border-red-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200',
    }
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
            {label}
        </span>
    )
}

export default function IDCardPage() {
    const { data: session } = useSession()
    const { data, isLoading, error, mutate } = useSWR('/api/player/id-card', fetcher)

    const [viewMode, setViewMode] = useState<ViewMode>('flat')
    const [cardSide, setCardSide] = useState<CardSide>('front')
    const [showReplacementDialog, setShowReplacementDialog] = useState(false)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Loading your ID Card...</p>
                    <p className="text-gray-400 text-sm mt-1">Generating security features</p>
                </div>
            </div>
        )
    }

    if (error || !data?.success) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load ID Card</h2>
                    <p className="text-gray-500 mb-4">
                        {data?.error?.message || 'Something went wrong. Please try again.'}
                    </p>
                    <Button onClick={() => mutate()} variant="outline">
                        Retry
                    </Button>
                </Card>
            </div>
        )
    }

    const cardData = data.data

    // Status indicators
    const feeStatusVariant = cardData.fee_status === 'PAID' ? 'success' : cardData.fee_status === 'OVERDUE' ? 'danger' : 'warning'
    const attendanceVariant = cardData.attendance_rate >= 80 ? 'success' : cardData.attendance_rate >= 60 ? 'warning' : 'danger'

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="container py-8 space-y-6 max-w-6xl mx-auto px-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-red-600" />
                        Virtual ID Card
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Your digital identity at Rope Pro Academy
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge
                        label={cardData.is_active ? 'Active' : 'Inactive'}
                        variant={cardData.is_active ? 'success' : 'danger'}
                    />
                    <StatusBadge label={cardData.membership_tier} variant="info" />
                    <StatusBadge label={`Fees: ${cardData.fee_status}`} variant={feeStatusVariant} />
                    <StatusBadge label={`${cardData.attendance_rate}% Attendance`} variant={attendanceVariant} />
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Card Display */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Your ID Card
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    {/* View Toggle */}
                                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                                        <button
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === '3d'
                                                    ? 'bg-white shadow text-red-700'
                                                    : 'text-gray-600 hover:text-gray-800'
                                                }`}
                                            onClick={() => setViewMode('3d')}
                                        >
                                            <Box className="h-3.5 w-3.5" />
                                            3D View
                                        </button>
                                        <button
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'flat'
                                                    ? 'bg-white shadow text-red-700'
                                                    : 'text-gray-600 hover:text-gray-800'
                                                }`}
                                            onClick={() => setViewMode('flat')}
                                        >
                                            <Layers className="h-3.5 w-3.5" />
                                            Flat View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {viewMode === '3d' ? (
                                <Suspense
                                    fallback={
                                        <div className="flex items-center justify-center h-[600px]">
                                            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                                        </div>
                                    }
                                >
                                    <VirtualIDCard3D data={cardData} />
                                </Suspense>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    {/* Flip Toggle */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setCardSide(cardSide === 'front' ? 'back' : 'front')}
                                            className="text-gray-600"
                                        >
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            {cardSide === 'front' ? 'Show Back' : 'Show Front'}
                                        </Button>
                                    </div>

                                    {/* Card */}
                                    <div
                                        className="transition-all duration-500 ease-in-out"
                                        style={{
                                            transform: cardSide === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                            transformStyle: 'preserve-3d',
                                        }}
                                    >
                                        {cardSide === 'front' ? (
                                            <IDCardFront data={cardData} />
                                        ) : (
                                            <div style={{ transform: 'rotateY(180deg)' }}>
                                                <IDCardBack data={cardData} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right - Quick Actions & Info */}
                <div className="space-y-4">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <DownloadOptions data={cardData} />
                            <ShareOptions data={cardData} />
                            <Button variant="outline" className="w-full" onClick={handlePrint}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Card
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => setShowReplacementDialog(true)}
                            >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Request Replacement
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Card Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Card Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-red-600">{cardData.card_views}</p>
                                    <p className="text-xs text-gray-500">Views</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{cardData.card_downloads}</p>
                                    <p className="text-xs text-gray-500">Downloads</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">{cardData.card_shares}</p>
                                    <p className="text-xs text-gray-500">Shares</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{cardData.total_scans}</p>
                                    <p className="text-xs text-gray-500">Scans</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Version</span>
                                    <span className="font-mono font-medium">v{cardData.card_version}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Serial</span>
                                    <span className="font-mono text-xs">{cardData.card_serial_number}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Issued</span>
                                    <span>{new Date(cardData.card_issued_date).toLocaleDateString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Expires</span>
                                    <span className="text-green-600 font-medium">
                                        {cardData.valid_until
                                            ? new Date(cardData.valid_until).toLocaleDateString('en-IN')
                                            : '—'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Achievements */}
                    {(cardData.total_medals > 0 || cardData.guinness_records > 0) && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Award className="h-4 w-4 text-yellow-600" />
                                    Achievements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {cardData.guinness_records > 0 && (
                                        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                                            <span className="text-sm">🏅 Guinness Records</span>
                                            <Badge className="bg-yellow-200 text-yellow-800">{cardData.guinness_records}</Badge>
                                        </div>
                                    )}
                                    {cardData.national_medals > 0 && (
                                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                                            <span className="text-sm">🥇 National Medals</span>
                                            <Badge className="bg-blue-200 text-blue-800">{cardData.national_medals}</Badge>
                                        </div>
                                    )}
                                    {cardData.state_medals > 0 && (
                                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                                            <span className="text-sm">🏆 State Medals</span>
                                            <Badge className="bg-green-200 text-green-800">{cardData.state_medals}</Badge>
                                        </div>
                                    )}
                                    {cardData.total_medals > 0 && (
                                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                                            <span className="text-sm">🎖️ Total Medals</span>
                                            <Badge variant="outline">{cardData.total_medals}</Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Bottom Sections - Tabs */}
            <Tabs defaultValue="manage" className="mt-6">
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="manage" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Manage
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Fingerprint className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2">
                        <Eye className="h-4 w-4" />
                        History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="manage" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Update Card Details</CardTitle>
                                <p className="text-sm text-gray-500">
                                    Edit your personal details shown on the ID card.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <UpdateDetailsForm data={cardData} onUpdate={() => mutate()} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Card Information</CardTitle>
                                <p className="text-sm text-gray-500">
                                    Important details about your digital ID card.
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-1">🔒 Your card is secure</h4>
                                    <p className="text-xs text-blue-700">
                                        Protected with QR verification, NFC signature, and blockchain hash technology.
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <h4 className="text-sm font-semibold text-green-800 mb-1">📱 Always accessible</h4>
                                    <p className="text-xs text-green-700">
                                        Access your ID card anytime from your dashboard. Download for offline use.
                                    </p>
                                </div>
                                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                    <h4 className="text-sm font-semibold text-yellow-800 mb-1">🔄 Auto-updated</h4>
                                    <p className="text-xs text-yellow-700">
                                        Changes to your profile automatically reflect on your ID card.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="security" className="mt-4">
                    <SecurityFeatures data={cardData} />
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    <IDCardHistory studentId={cardData.student_id} />
                </TabsContent>
            </Tabs>

            {/* Replacement Dialog */}
            <RequestReplacementDialog
                open={showReplacementDialog}
                onClose={() => setShowReplacementDialog(false)}
                studentId={cardData.student_id}
            />
        </div>
    )
}
