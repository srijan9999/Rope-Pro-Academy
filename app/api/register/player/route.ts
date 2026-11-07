import { NextRequest } from "next/server"
import { POST as registerPost } from "@/app/api/register/route"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
    return registerPost(request)
}
