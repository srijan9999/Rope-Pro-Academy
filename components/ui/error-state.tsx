import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
    title?: string
    message?: string
    onRetry?: () => void
}

export function ErrorState({
    title = "Something went wrong",
    message = "Failed to load data. Please try again.",
    onRetry
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">{message}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            )}
        </div>
    )
}
