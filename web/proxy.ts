import { NextResponse, type NextRequest } from "next/server";
import { QUESTIONS } from "@/lib/assessments/questions";

// Unknown skill IDs get a real 404 status. Pages stream a 200 status before a
// notFound() call inside the page can run, so the check happens here instead.
const STATIC_SKILL_PAGES = new Set(["describe"]);

export function proxy(request: NextRequest) {
  const skillId = request.nextUrl.pathname.split("/")[2];
  if (STATIC_SKILL_PAGES.has(skillId) || Object.hasOwn(QUESTIONS, skillId)) {
    return NextResponse.next();
  }
  return NextResponse.rewrite(new URL("/not-found-check", request.url), { status: 404 });
}

export const config = {
  matcher: "/skills/:skillId",
};
