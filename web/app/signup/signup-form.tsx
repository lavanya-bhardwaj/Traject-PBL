"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action}>
      {state?.message && <p className="alert" role="alert">{state.message}</p>}

      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" autoComplete="name" required />
        {state?.errors?.name && <p className="field-error" role="alert">{state.errors.name[0]}</p>}
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
        {state?.errors?.email && <p className="field-error" role="alert">{state.errors.email[0]}</p>}
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required />
        {state?.errors?.password && (
          <div className="field-error" role="alert">
            <p>Password must:</p>
            <ul>
              {state.errors.password.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
