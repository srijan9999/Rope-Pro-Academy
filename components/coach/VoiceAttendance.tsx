"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Student {
    id: string
    name: string
}

interface VoiceAttendanceProps {
    students: Student[]
    onMark: (studentId: string | 'all', status: 'PRESENT' | 'ABSENT' | 'LATE') => void
    onSave?: () => void
    onClear?: () => void
    disabled?: boolean
}

// Voice command patterns
const COMMANDS = {
    markPresent: /mark (\w+(?:\s+\w+)*) present/i,
    markAbsent: /mark (\w+(?:\s+\w+)*) absent/i,
    markLate: /mark (\w+(?:\s+\w+)*) late/i,
    markAllPresent: /mark all present/i,
    markAllAbsent: /mark all absent/i,
    clearAll: /clear all|reset/i,
    save: /save attendance|save/i,
}

export function VoiceAttendance({
    students,
    onMark,
    onSave,
    onClear,
    disabled = false
}: VoiceAttendanceProps) {
    const { toast } = useToast()
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [lastCommand, setLastCommand] = useState<string | null>(null)
    const [isSupported, setIsSupported] = useState(true)
    const recognitionRef = useRef<any>(null)

    // Check browser support
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            setIsSupported(false)
        }
    }, [])

    // Find student by name (fuzzy match)
    const findStudent = useCallback((name: string): Student | null => {
        const lowerName = name.toLowerCase().trim()

        // Exact match
        let match = students.find(s =>
            s.name.toLowerCase() === lowerName
        )

        // Partial match (first name or contains)
        if (!match) {
            match = students.find(s =>
                s.name.toLowerCase().startsWith(lowerName) ||
                s.name.toLowerCase().includes(lowerName)
            )
        }

        return match || null
    }, [students])

    // Parse and execute command
    const processCommand = useCallback((text: string) => {
        const lowerText = text.toLowerCase().trim()

        // Mark all present
        if (COMMANDS.markAllPresent.test(lowerText)) {
            onMark('all', 'PRESENT')
            setLastCommand("✓ Marked all present")
            speak("Marked all students present")
            return true
        }

        // Mark all absent
        if (COMMANDS.markAllAbsent.test(lowerText)) {
            onMark('all', 'ABSENT')
            setLastCommand("✗ Marked all absent")
            speak("Marked all students absent")
            return true
        }

        // Clear all
        if (COMMANDS.clearAll.test(lowerText)) {
            onClear?.()
            setLastCommand("⟲ Cleared all marks")
            speak("Cleared all marks")
            return true
        }

        // Save
        if (COMMANDS.save.test(lowerText)) {
            onSave?.()
            setLastCommand("💾 Saving attendance")
            speak("Saving attendance")
            return true
        }

        // Mark individual present
        const presentMatch = lowerText.match(COMMANDS.markPresent)
        if (presentMatch) {
            const studentName = presentMatch[1]
            const student = findStudent(studentName)
            if (student) {
                onMark(student.id, 'PRESENT')
                setLastCommand(`✓ ${student.name} present`)
                speak(`Marked ${student.name} present`)
                return true
            } else {
                setLastCommand(`? Student "${studentName}" not found`)
                speak(`Student ${studentName} not found`)
                return false
            }
        }

        // Mark individual absent
        const absentMatch = lowerText.match(COMMANDS.markAbsent)
        if (absentMatch) {
            const studentName = absentMatch[1]
            const student = findStudent(studentName)
            if (student) {
                onMark(student.id, 'ABSENT')
                setLastCommand(`✗ ${student.name} absent`)
                speak(`Marked ${student.name} absent`)
                return true
            } else {
                setLastCommand(`? Student "${studentName}" not found`)
                speak(`Student ${studentName} not found`)
                return false
            }
        }

        // Mark individual late
        const lateMatch = lowerText.match(COMMANDS.markLate)
        if (lateMatch) {
            const studentName = lateMatch[1]
            const student = findStudent(studentName)
            if (student) {
                onMark(student.id, 'LATE')
                setLastCommand(`🕐 ${student.name} late`)
                speak(`Marked ${student.name} late`)
                return true
            } else {
                setLastCommand(`? Student "${studentName}" not found`)
                speak(`Student ${studentName} not found`)
                return false
            }
        }

        return false
    }, [onMark, onSave, onClear, findStudent])

    // Text-to-speech feedback
    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 1.2
            utterance.lang = 'en-IN'
            speechSynthesis.speak(utterance)
        }
    }

    // Start/stop listening
    const toggleListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognition) {
            toast({
                title: "Voice Not Supported",
                description: "Your browser doesn't support voice commands",
                variant: "destructive"
            })
            return
        }

        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-IN'

        recognition.onstart = () => {
            setIsListening(true)
            toast({ title: "🎤 Listening...", description: 'Say "Mark [name] present/absent/late"' })
        }

        recognition.onresult = (event: any) => {
            const last = event.results.length - 1
            const text = event.results[last][0].transcript
            setTranscript(text)

            // Only process final results
            if (event.results[last].isFinal) {
                processCommand(text)
            }
        }

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error)
            if (event.error === 'not-allowed') {
                toast({
                    title: "Microphone Access Denied",
                    description: "Please allow microphone access to use voice commands",
                    variant: "destructive"
                })
            }
            setIsListening(false)
        }

        recognition.onend = () => {
            // Restart if still supposed to be listening
            if (isListening) {
                recognition.start()
            }
        }

        recognitionRef.current = recognition
        recognition.start()
    }, [isListening, processCommand, toast])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            recognitionRef.current?.stop()
        }
    }, [])

    if (!isSupported) {
        return (
            <Badge variant="outline" className="text-muted-foreground">
                <MicOff className="h-3 w-3 mr-1" />
                Voice not supported
            </Badge>
        )
    }

    return (
        <div className="flex items-center gap-3">
            <Button
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                onClick={toggleListening}
                disabled={disabled}
                className={cn(
                    "gap-2 transition-all",
                    isListening && "animate-pulse"
                )}
            >
                {isListening ? (
                    <>
                        <MicOff className="h-4 w-4" />
                        Stop Voice
                    </>
                ) : (
                    <>
                        <Mic className="h-4 w-4" />
                        Voice Commands
                    </>
                )}
            </Button>

            {isListening && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1 text-primary animate-pulse">
                        <Volume2 className="h-4 w-4" />
                        Listening...
                    </span>
                    {transcript && (
                        <span className="text-muted-foreground italic max-w-[200px] truncate">
                            "{transcript}"
                        </span>
                    )}
                </div>
            )}

            {lastCommand && !isListening && (
                <Badge variant="secondary" className="text-xs">
                    {lastCommand}
                </Badge>
            )}
        </div>
    )
}

// Voice Commands Help Card
export function VoiceCommandsHelp() {
    return (
        <Card className="border-dashed">
            <CardContent className="pt-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Voice Commands
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>"Mark Aarav present"</div>
                    <div>"Mark Vihaan absent"</div>
                    <div>"Mark Priya late"</div>
                    <div>"Mark all present"</div>
                    <div>"Clear all"</div>
                    <div>"Save attendance"</div>
                </div>
            </CardContent>
        </Card>
    )
}
