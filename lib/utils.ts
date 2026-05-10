import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the dashboard link based on user role
 * @param role - User role (ADMIN, COACH, STUDENT)
 * @returns Dashboard path
 */
export function getDashboardLink(role: string | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin"
    case "COACH":
      return "/dashboard/coach"
    case "STUDENT":
      return "/dashboard/player"
    default:
      return "/"
  }
}
