import { prisma } from '@/lib/prisma'

export async function generateInvoiceNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    // Format: INV-YYYY-MM-XXXX
    const prefix = `INV-${year}-${month}-`

    // Find the last invoice number for this month
    const lastInvoice = await prisma.payment.findFirst({
        where: {
            invoiceNumber: {
                startsWith: prefix
            }
        },
        orderBy: {
            invoiceNumber: 'desc'
        },
        select: {
            invoiceNumber: true
        }
    })

    let sequence = 1
    if (lastInvoice) {
        const parts = lastInvoice.invoiceNumber.split('-')
        const lastSequence = parseInt(parts[parts.length - 1] || '0')
        if (!isNaN(lastSequence)) {
            sequence = lastSequence + 1
        }
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`
}

export async function generateReceiptNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    // Format: REC-YYYY-MM-XXXX
    const prefix = `REC-${year}-${month}-`

    const lastReceipt = await prisma.payment.findFirst({
        where: {
            receiptNumber: {
                startsWith: prefix
            }
        },
        orderBy: {
            receiptNumber: 'desc'
        },
        select: {
            receiptNumber: true
        }
    })

    let sequence = 1
    if (lastReceipt && lastReceipt.receiptNumber) {
        const parts = lastReceipt.receiptNumber.split('-')
        const lastSequence = parseInt(parts[parts.length - 1] || '0')
        if (!isNaN(lastSequence)) {
            sequence = lastSequence + 1
        }
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`
}
