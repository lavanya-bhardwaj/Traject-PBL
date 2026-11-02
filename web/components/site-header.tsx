import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";
import { NAV_LINKS } from "./nav-data";
import { AuthNav } from "./auth-nav";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="logo" aria-label="Traject home">
          <Logo />
          Traject
        </Link>

        <Suspense
          fallback={
            <nav className="nav-links" aria-label="Main">
              {NAV_LINKS.map((link) => (
                <Link key={link.label} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          }
        >
          <NavLinks />
        </Suspense>

        <div className="nav-actions">
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
