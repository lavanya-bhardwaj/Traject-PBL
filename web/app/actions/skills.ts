"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { gradeAnswers } from "@/lib/assessments/grading";
import { QUESTIONS } from "@/lib/assessments/questions";
import {
  CHECK_LENGTH,
  START_DIFFICULTY,
  levelFromDifficulty,
  nextDifficulty,
  pickQuestion,
} from "@/lib/assessments/adaptive";

export type AssessmentState = { message?: string } | undefined;

type SessionRow = { current_id: string; difficulty: number; asked: string[]; correct: number; missed: string[] };

// Starts (or restarts) the adaptive check for one skill.
export async function startCheck(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const skillId = formData.get("skillId");
  if (typeof skillId !== "string" || !Object.hasOwn(QUESTIONS, skillId)) return;

  const first = pickQuestion(QUESTIONS[skillId], [], START_DIFFICULTY);
  if (!first) return;

  await query(
    `INSERT INTO assessment_sessions (user_id, skill_id, current_id, difficulty, asked, correct, missed)
     VALUES ($1, $2, $3, $4, '{}', 0, '{}')
     ON CONFLICT (user_id, skill_id) DO UPDATE
       SET current_id = EXCLUDED.current_id, difficulty = EXCLUDED.difficulty,
           asked = '{}', correct = 0, missed = '{}'`,
    [user.id, skillId, first.id, START_DIFFICULTY],
  );
  revalidatePath(`/skills/${skillId}`);
}

// Grades the answer to the question the server is waiting on, then picks the next question or finishes the check.
export async function answerQuestion(_state: AssessmentState, formData: FormData): Promise<AssessmentState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const skillId = formData.get("skillId");
  if (typeof skillId !== "string" || !Object.hasOwn(QUESTIONS, skillId)) {
    return { message: "Unknown skill." };
  }
  const bank = QUESTIONS[skillId];

  const rows = await query<SessionRow>(
    "SELECT current_id, difficulty, asked, correct, missed FROM assessment_sessions WHERE user_id = $1 AND skill_id = $2",
    [user.id, skillId],
  );
  const session = rows[0];
  if (!session) return { message: "Start the check first." };

  // The form names the question it was shown. A stale form (e.g. a double submit) is rejected.
  if (formData.get("questionId") !== session.current_id) {
    revalidatePath(`/skills/${skillId}`);
    return { message: "That question was already answered. Here is the next one." };
  }

  const question = bank.find((q) => q.id === session.current_id);
  const raw = formData.get("choice");
  if (!question || typeof raw !== "string" || raw === "") {
    return { message: "Choose an answer." };
  }

  let wasCorrect: boolean;
  try {
    wasCorrect = gradeAnswers([question], [Number(raw)]).correct === 1;
  } catch {
    return { message: "Your answer could not be read. Please try again." };
  }

  const difficulty = nextDifficulty(session.difficulty, wasCorrect);
  const asked = [...session.asked, question.id];
  const correct = session.correct + (wasCorrect ? 1 : 0);
  const missed = wasCorrect ? session.missed : [...session.missed, question.id];

  if (asked.length >= CHECK_LENGTH) {
    await query(
      `INSERT INTO assessments (user_id, skill_id, correct, total, level, missed)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, skillId, correct, asked.length, levelFromDifficulty(difficulty), missed],
    );
    await query("DELETE FROM assessment_sessions WHERE user_id = $1 AND skill_id = $2", [user.id, skillId]);
    redirect(`/skills/${skillId}/result`);
  }

  const next = pickQuestion(bank, asked, difficulty);
  if (!next) return { message: "No questions left. Please start the check again." };

  await query(
    `UPDATE assessment_sessions
        SET current_id = $3, difficulty = $4, asked = $5, correct = $6, missed = $7
      WHERE user_id = $1 AND skill_id = $2`,
    [user.id, skillId, next.id, difficulty, asked, correct, missed],
  );
  revalidatePath(`/skills/${skillId}`);
  return undefined;
}
