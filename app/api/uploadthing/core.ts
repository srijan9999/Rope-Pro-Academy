import { createUploadthing, type FileRouter } from "uploadthing/next"

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
        .onUploadComplete(async ({ metadata, file }) => {
            // Returns file metadata to client
            return {
                uploadedBy: "applicant",
                fileKey: file.key,
                fileName: file.name,
                fileSize: file.size,
                fileUrl: file.ufsUrl || file.url,
            }
        }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
