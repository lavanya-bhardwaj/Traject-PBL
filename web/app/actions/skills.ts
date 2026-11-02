"use server";

import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { gradeAnswers } from "@/lib/assessments/grading";
import { QUESTIONS } from "@/lib/assessments/questions";

export type AssessmentState = { message?: string } | undefined;

export async function submitAssessment(
  _state: AssessmentState,
  formData: FormData,
): Promise<AssessmentState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const skillId = formData.get("skillId");
  if (typeof skillId !== "string" || !Object.hasOwn(QUESTIONS, skillId)) {
    return { message: "Unknown skill." };
  }

  const questions = QUESTIONS[skillId];
  const answers: number[] = [];
  for (const question of questions) {
    const raw = formData.get(`answer-${question.id}`);
    if (typeof raw !== "string" || raw === "") {
      return { message: "Answer every question before submitting." };
    }
    answers.push(Number(raw));
  }

  let result;
  try {
    result = gradeAnswers(questions, answers);
  } catch {
    return { message: "Your answers could not be read. Please try again." };
  }

  await query(
    "INSERT INTO assessments (user_id, skill_id, correct, total, level) VALUES ($1, $2, $3, $4, $5)",
    [user.id, skillId, result.correct, result.total, result.level],
  );

  redirect(`/skills/${skillId}/result`);
}
