import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UploadThingError } from "uploadthing/server"

const f = createUploadthing()

export const ourFileRouter = {
    // Phase 1: Coach Resume / CV upload
    // Allowed formats: PDF, DOC, DOCX up to 8 MB, exactly 1 file
    coachResume: f({
        "application/pdf": { maxFileSize: "8MB", maxFileCount: 1 },
        "application/msword": { maxFileSize: "8MB", maxFileCount: 1 },
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
            maxFileSize: "8MB",
            maxFileCount: 1,
        },
    })
        .middleware(async () => {
            // Unauthenticated registration upload: returns server timestamp
            return {
                uploadedAt: new Date().toISOString(),
                purpose: "COACH_RESUME_APPLICATION",
            }
        })
        .onUploadComplete(async ({ file }) => {
            // Returns file metadata to client
            return {
                uploadedBy: "applicant",
                fileKey: file.key,
                fileName: file.name,
                fileSize: file.size,
                fileUrl: file.ufsUrl || file.url,
            }
        }),

    // Phase 3: Profile Photo Upload (Student & Coach ID Card Portraits)
    // Allowed formats: JPG, PNG, WebP up to 4 MB, exactly 1 file
    profilePhoto: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
    })
        .middleware(async () => {
            const session = await getServerSession(authOptions)
            if (!session?.user) {
                throw new UploadThingError("Authentication required to upload profile photo")
            }
            return {
                userId: session.user.id,
                userEmail: session.user.email,
                userRole: session.user.role,
            }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return {
                uploadedBy: metadata.userId,
                fileKey: file.key,
                fileName: file.name,
                fileSize: file.size,
                fileUrl: file.ufsUrl || file.url,
            }
        }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
