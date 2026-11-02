"use client";

import { useActionState } from "react";
import { submitAssessment } from "@/app/actions/skills";

type PublicQuestion = { id: string; prompt: string; choices: string[] };

export function QuizForm({ skillId, questions }: { skillId: string; questions: PublicQuestion[] }) {
  const [state, action, pending] = useActionState(submitAssessment, undefined);

  return (
    <form action={action} className="quiz">
      <input type="hidden" name="skillId" value={skillId} />
      {questions.map((question, index) => (
        <fieldset key={question.id}>
          <legend>
            {index + 1}. {question.prompt}
          </legend>
          {question.choices.map((choice, choiceIndex) => (
            <label key={choiceIndex} className="choice">
              <input type="radio" name={`answer-${question.id}`} value={choiceIndex} required />
              {choice}
            </label>
          ))}
        </fieldset>
      ))}

      {state?.message && <p className="alert" role="alert">{state.message}</p>}

      <button className="btn btn-primary btn-large" disabled={pending} type="submit">
        {pending ? "Checking..." : "Submit answers"}
      </button>
    </form>
  );
}
