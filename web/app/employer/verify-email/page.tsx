import Link from "next/link";
import { Suspense } from "react";
import { confirmEmail } from "@/app/actions/employer";

// Verifies the work email from the link. The token is checked on the server and used once.
export default function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  return (
    <Suspense fallback={<p className="page container">Checking your link…</p>}>
      <VerifyEmail searchParams={searchParams} />
    </Suspense>
  );
}

async function VerifyEmail({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const result = await confirmEmail(token);

  return (
    <main className="page page-narrow">
      <div className="card form-card">
        <h1>{result.ok ? "Email confirmed" : "Could not confirm email"}</h1>
        <p className="hint" style={{ marginTop: 8 }}>{result.message}</p>
        <p className="form-footer">
          <Link href="/employer">Go to the employer portal</Link>
        </p>
      </div>
    </main>
  );
}
