"use client";

import { useActionState } from "react";
import { answerQuestion } from "@/app/actions/skills";

type PublicQuestion = { id: string; prompt: string; choices: string[] };

export function QuizForm({
  skillId,
  question,
  number,
}: {
  skillId: string;
  question: PublicQuestion;
  number: number;
}) {
  const [state, action, pending] = useActionState(answerQuestion, undefined);

  return (
    <form action={action} className="quiz" key={question.id}>
      <input type="hidden" name="skillId" value={skillId} />
      <input type="hidden" name="questionId" value={question.id} />
      <fieldset>
        <legend>
          {number}. {question.prompt}
        </legend>
        {question.choices.map((choice, choiceIndex) => (
          <label key={choiceIndex} className="choice">
            <input type="radio" name="choice" value={choiceIndex} required />
            {choice}
          </label>
        ))}
      </fieldset>

      {state?.message && <p className="alert" role="alert">{state.message}</p>}

      <button className="btn btn-primary btn-large" disabled={pending} type="submit">
        {pending ? "Checking..." : "Submit answer"}
      </button>
    </form>
  );
}
