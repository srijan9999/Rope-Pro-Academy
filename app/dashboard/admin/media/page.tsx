"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
    Upload, 
    Trash2, 
    Calendar, 
    ExternalLink, 
    Loader2, 
    Image as ImageIcon, 
    AlertCircle, 
    CheckCircle2, 
    Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MediaItem {
    id: string
    url: string
    year: string | null
    title: string | null
    caption: string | null
    category: string | null
    createdAt: string
}

export default function AdminMediaPage() {
    const [mediaList, setMediaList] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Form state
    const [mode, setMode] = useState<"file" | "url">("file")
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [directUrl, setDirectUrl] = useState("")
    const [year, setYear] = useState(new Date().getFullYear().toString())
    const [title, setTitle] = useState("")
    const [caption, setCaption] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const fetchMedia = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/admin/media")
            const data = await res.json()
            if (data.success) {
                setMediaList(data.media || [])
            } else {
                setError(data.error || "Failed to load media")
            }
        } catch {
            setError("Network error loading media")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMedia()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) {
            setFile(selected)
            setPreviewUrl(URL.createObjectURL(selected))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (mode === "file" && !file) {
            setError("Please select an image file to upload.")
            return
        }
        if (mode === "url" && !directUrl.trim()) {
            setError("Please enter a valid image URL.")
            return
        }

        setSubmitting(true)
        try {
            let res: Response

            if (mode === "file" && file) {
                const formData = new FormData()
                formData.append("file", file)
                formData.append("year", year.trim())
                formData.append("title", title.trim())
                formData.append("caption", caption.trim())
                formData.append("category", "GALLERY")

                res = await fetch("/api/admin/media", {
                    method: "POST",
                    body: formData,
                })
            } else {
                res = await fetch("/api/admin/media", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url: directUrl.trim(),
                        year: year.trim() || null,
                        title: title.trim() || null,
                        caption: caption.trim() || null,
                        category: "GALLERY",
                    }),
                })
            }

            const data = await res.json()
            if (data.success) {
                setSuccess("Photo successfully added! It is now live on the public Hall of Fame.")
                // Reset form
                setFile(null)
                setPreviewUrl(null)
                setDirectUrl("")
                setTitle("")
                setCaption("")
                if (fileInputRef.current) fileInputRef.current.value = ""
                // Refresh list
                fetchMedia()
            } else {
                setError(data.error || "Could not save photo.")
            }
        } catch {
            setError("Network error while uploading photo.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this photo from the gallery?")) return

        setDeletingId(id)
        try {
            const res = await fetch(`/api/admin/media?id=${id}`, {
                method: "DELETE",
            })
            const data = await res.json()
            if (data.success) {
                setMediaList((prev) => prev.filter((m) => m.id !== id))
            } else {
                alert(data.error || "Failed to delete photo")
            }
        } catch {
            alert("Network error while deleting photo")
        } finally {
            setDeletingId(null)
        }
    }

    const suggestedYears = ["2026", "2025", "2024", "2023", "2022"]

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-foreground flex items-center gap-2.5">
                        <ImageIcon className="w-7 h-7 text-[#E63946]" />
                        Media Gallery Portal
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Upload and tag tournament photos with year tags. Uploaded items immediately appear in the public Hall of Fame.
                    </p>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-2 shrink-0 border-[#E63946] text-[#E63946] hover:bg-[#E63946] hover:text-white">
                    <Link href="/achievements#photo-gallery" target="_blank">
                        <span>View Public Gallery</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </Button>
            </div>

            {/* Upload Card */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                        <Plus className="w-5 h-5 text-[#E63946]" />
                        Add New Photo
                    </CardTitle>
                    <CardDescription>
                        Upload a photo from your computer or paste an UploadThing URL.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mode Switcher */}
                        <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl max-w-xs">
                            <button
                                type="button"
                                onClick={() => setMode("file")}
                                suppressHydrationWarning
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase transition ${
                                    mode === "file"
                                        ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                File Upload
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("url")}
                                suppressHydrationWarning
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase transition ${
                                    mode === "url"
                                        ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                URL / UploadThing
                            </button>
                        </div>

                        {/* File or URL input */}
                        {mode === "file" ? (
                            <div className="space-y-2">
                                <Label htmlFor="photoFile" className="text-xs font-bold uppercase tracking-wider">
                                    Choose Image File (JPG, PNG, WEBP, GIF up to 10MB) *
                                </Label>
                                <Input
                                    id="photoFile"
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="cursor-pointer file:cursor-pointer"
                                    required
                                />
                                {previewUrl && (
                                    <div className="relative aspect-[4/3] w-48 overflow-hidden rounded-xl border mt-3 bg-zinc-900">
                                        <Image
                                            src={previewUrl}
                                            alt="Upload preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="photoUrl" className="text-xs font-bold uppercase tracking-wider">
                                    Image URL (e.g. UploadThing https://utfs.io/f/...) *
                                </Label>
                                <Input
                                    id="photoUrl"
                                    type="url"
                                    placeholder="https://utfs.io/f/... or https://*.ufs.sh/f/..."
                                    value={directUrl}
                                    onChange={(e) => setDirectUrl(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {/* Year & Title Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="year" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-[#E63946]" />
                                    Year Tag (e.g. 2026) *
                                </Label>
                                <Input
                                    id="year"
                                    type="text"
                                    placeholder="2026"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    required
                                />
                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Quick:</span>
                                    {suggestedYears.map((yr) => (
                                        <button
                                            key={yr}
                                            type="button"
                                            onClick={() => setYear(yr)}
                                            suppressHydrationWarning
                                            className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-[#E63946] hover:text-white transition"
                                        >
                                            {yr}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider">
                                    Title / Athlete / Tournament Label
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="e.g. National Championship Speed Sprint"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Optional Caption */}
                        <div className="space-y-2">
                            <Label htmlFor="caption" className="text-xs font-bold uppercase tracking-wider">
                                Description / Ceremony Details (Optional)
                            </Label>
                            <Input
                                id="caption"
                                type="text"
                                placeholder="e.g. Gold medal ceremony at Asian Championship"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                        </div>

                        {/* Notifications */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-900/50">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-900/50">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{success}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:w-auto bg-[#E63946] hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs px-6 py-2.5 shadow-md shadow-[#E63946]/30"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Publishing Photo...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Publish to Gallery
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Existing Media Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                        Published Gallery Photos
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-muted-foreground">
                            {mediaList.length}
                        </span>
                    </h2>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#E63946]" />
                        <p className="text-xs">Loading media gallery...</p>
                    </div>
                ) : mediaList.length === 0 ? (
                    <Card className="border-dashed py-12 text-center">
                        <CardContent>
                            <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-bold uppercase text-foreground">No photos uploaded yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Use the form above to upload your first championship photo.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {mediaList.map((item) => (
                            <Card key={item.id} className="overflow-hidden group border border-zinc-200 dark:border-zinc-800">
                                <div className="relative aspect-[4/3] bg-zinc-900">
                                    <Image
                                        src={item.url}
                                        alt={item.title || "Gallery photo"}
                                        fill
                                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                                        className="object-cover"
                                    />
                                    {item.year && (
                                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#E63946] text-white font-mono text-[10px] font-bold shadow">
                                            {item.year}
                                        </span>
                                    )}
                                </div>
                                <CardContent className="p-3 space-y-2">
                                    <div>
                                        <p className="text-xs font-bold text-foreground truncate" title={item.title || "Untitled"}>
                                            {item.title || "Untitled Photo"}
                                        </p>
                                        {item.caption && (
                                            <p className="text-[11px] text-muted-foreground line-clamp-1" title={item.caption}>
                                                {item.caption}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={deletingId === item.id}
                                            onClick={() => handleDelete(item.id)}
                                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                            title="Delete photo"
                                        >
                                            {deletingId === item.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
