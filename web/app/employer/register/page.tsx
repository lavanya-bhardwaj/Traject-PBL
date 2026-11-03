import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function EmployerRegisterPage() {
  return (
    <main className="page container" style={{ width: "min(760px, 100% - 32px)" }}>
      <div className="card form-card">
        <span className="eyebrow">For employers</span>
        <h1 style={{ marginTop: 14 }}>Register your company on Traject</h1>
        <p className="hint" style={{ marginTop: 8 }}>
          Discover skilled students, connect with emerging talent, and recruit based on demonstrated competencies.
        </p>
        <RegisterForm />
        <p className="form-footer">
          Already registered? <Link href="/employer/login">Employer login</Link>
        </p>
      </div>
    </main>
  );
}
