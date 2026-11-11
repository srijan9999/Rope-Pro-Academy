import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
    return NextResponse.json(
        {
            success: false,
            error: "This local-disk upload endpoint has been retired. Please upload documents via UploadThing.",
        },
        { status: 410 }
    )
}
