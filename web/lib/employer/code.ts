// Traject Employer ID generation. Server-only: it uses the Node crypto module.
// The ID is an internal reference only. It is not a password and does not prove legal status.
import { randomBytes } from "node:crypto";

// e.g. TRAJ-EMP-8F42A91C, generated on the server with a random source.
export function newEmployerCode(): string {
  return `TRAJ-EMP-${randomBytes(4).toString("hex").toUpperCase()}`;
}
