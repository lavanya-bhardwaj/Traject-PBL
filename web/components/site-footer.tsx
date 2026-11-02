import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer" id="about">
      <div className="container">
        <span>© Traject. Competency-based career guidance.</span>
        <span>
          <Link href="/signup">Sign up</Link> · <Link href="/login">Log in</Link> ·{" "}
          <Link href="/skills">Skill checks</Link>
        </span>
      </div>
    </footer>
  );
}
