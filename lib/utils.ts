import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DASHBOARD_PATHS, isRole } from "./roles"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the dashboard link based on user role
 * @param role - User role (ADMIN, COACH, STUDENT)
 * @returns Dashboard path
 */
export function getDashboardLink(role: string | undefined): string {
  if (role && isRole(role)) {
    return DASHBOARD_PATHS[role]
  }
  return "/"
}
