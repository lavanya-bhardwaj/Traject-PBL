"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./nav-data";

// Highlights the link for the current page. Rendered behind a Suspense boundary in the header.
export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="nav-links" aria-label="Main">
      {NAV_LINKS.map((link) => (
        <Link key={link.label} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
