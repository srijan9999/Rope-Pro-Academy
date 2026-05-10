import crypto from 'crypto'

/**
 * Generate a unique 16-character card serial number
 * Format: RPA + YEAR(4) + RANDOM(9) = 16 chars
 */
export async function generateCardSerialNumber(): Promise<string> {
    const year = new Date().getFullYear().toString()
    const randomPart = crypto.randomBytes(5).toString('hex').toUpperCase().slice(0, 9)
    return `RPA${year}${randomPart}`
}

/**
 * Generate QR code payload - encrypted JSON data for verification
 */
export function generateQRPayload(data: {
    studentId: string
    serialNumber: string
    fullName: string
    expiry?: string
}): string {
    const payload = {
        type: 'RPA_ID_CARD',
        sid: data.studentId,
        sn: data.serialNumber,
        name: data.fullName,
        exp: data.expiry || '',
        ts: new Date().toISOString(),
        hash: crypto
            .createHash('sha256')
            .update(`${data.studentId}:${data.serialNumber}:${process.env.NEXTAUTH_SECRET || 'rpa-secret'}`)
            .digest('hex')
            .slice(0, 16),
    }
    return JSON.stringify(payload)
}

/**
 * Generate numeric barcode value from serial number
 * Converts serial to a 12-digit numeric string for CODE128
 */
export function generateBarcodeValue(serialNumber: string): string {
    const hash = crypto.createHash('md5').update(serialNumber).digest('hex')
    // Take first 12 numeric-equivalent digits
    const numeric = hash.replace(/[a-f]/gi, (c) => {
        return (c.charCodeAt(0) % 10).toString()
    })
    return numeric.slice(0, 12)
}

/**
 * Generate simulated NFC signature (SHA-256 hash)
 */
export function generateNFCSignature(studentId: string, serialNumber: string): string {
    return crypto
        .createHash('sha256')
        .update(`NFC:${studentId}:${serialNumber}:${Date.now()}`)
        .digest('hex')
}

/**
 * Generate simulated blockchain hash
 */
export function generateBlockchainHash(data: {
    studentId: string
    serialNumber: string
    issuedDate: string
}): string {
    const block = {
        index: Date.now(),
        timestamp: new Date().toISOString(),
        data: {
            studentId: data.studentId,
            serialNumber: data.serialNumber,
            issuedDate: data.issuedDate,
        },
        previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    }
    return crypto.createHash('sha256').update(JSON.stringify(block)).digest('hex')
}

/**
 * Generate digital signature for the card
 */
export function generateDigitalSignature(studentId: string, serialNumber: string): string {
    return crypto
        .createHash('sha512')
        .update(`SIGN:${studentId}:${serialNumber}:${process.env.NEXTAUTH_SECRET || 'rpa-secret'}`)
        .digest('hex')
        .slice(0, 64)
}

/**
 * Calculate card expiry date (1 year from issue)
 */
export function calculateCardExpiry(issuedDate?: Date): Date {
    const date = issuedDate || new Date()
    const expiry = new Date(date)
    expiry.setFullYear(expiry.getFullYear() + 1)
    return expiry
}

/**
 * Verify a QR code payload
 */
export function verifyQRPayload(payload: string): {
    valid: boolean
    data?: Record<string, unknown>
    error?: string
} {
    try {
        const parsed = JSON.parse(payload)
        if (parsed.type !== 'RPA_ID_CARD') {
            return { valid: false, error: 'Invalid card type' }
        }

        // Verify hash
        const expectedHash = crypto
            .createHash('sha256')
            .update(`${parsed.sid}:${parsed.sn}:${process.env.NEXTAUTH_SECRET || 'rpa-secret'}`)
            .digest('hex')
            .slice(0, 16)

        if (parsed.hash !== expectedHash) {
            return { valid: false, error: 'Hash verification failed' }
        }

        return { valid: true, data: parsed }
    } catch {
        return { valid: false, error: 'Invalid payload format' }
    }
}
