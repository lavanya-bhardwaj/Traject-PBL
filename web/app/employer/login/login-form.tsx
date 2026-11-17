"use client";

import { useActionState } from "react";
import { employerLogin } from "@/app/actions/auth";

export function EmployerLoginForm() {
  const [state, action, pending] = useActionState(employerLogin, undefined);

  return (
    <form action={action}>
      {state?.message && <p className="alert" role="alert">{state.message}</p>}

      <div className="field">
        <label htmlFor="email">Work email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Logging in..." : "Employer log in"}
      </button>
    </form>
  );
}
