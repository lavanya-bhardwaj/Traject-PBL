// Role checks for pages and actions. The server decides; the UI only hides links.
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser, type UserRole } from "@/lib/auth";

const LOGIN_FOR: Record<UserRole, string> = {
  student: "/login",
  employer: "/employer/login",
  admin: "/admin/login",
};

// Signed out: send to that role's login. Signed in with another role: 404, so the area is not revealed.
export async function requireRole(role: UserRole): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_FOR[role]);
  if (user.role !== role) notFound();
  return user;
}
