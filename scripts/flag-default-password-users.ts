import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"

async function main() {
    const def = process.env.DEFAULT_TEMP_PASSWORD || "Ropepro@112"

    console.log("🔍 Scanning for users on the default temporary password...")

    const users = await prisma.user.findMany({
        where: { mustChangePassword: false },
        select: { id: true, email: true, password: true },
    })

    let flagged = 0
    for (const u of users) {
        if (u.password && (await bcrypt.compare(def, u.password))) {
            await prisma.user.update({
                where: { id: u.id },
                data: { mustChangePassword: true },
            })
            console.log("🚩 Flagged account for mandatory password change:", u.email)
            flagged++
        }
    }

    console.log(`✅ Scan complete. ${flagged} account(s) flagged with mustChangePassword = true.`)
}

main()
    .catch((err) => {
        console.error("❌ Error in flag script:", err)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
