// Pure grading logic, kept free of database and framework code so it can be tested directly.

export type Question = {
  id: string;
  prompt: string;
  choices: string[];
  // Index into choices. Never sent to the browser.
  answer: number;
};

export type GradeResult = {
  correct: number;
  total: number;
  percent: number;
  level: number;
};

// Each skill has five questions, so 1 to 5 correct answers map to levels 1 to 5.
export function levelFromPercent(percent: number): number {
  return Math.min(5, Math.max(1, Math.ceil(percent / 20)));
}

export function gradeAnswers(questions: Question[], answers: number[]): GradeResult {
  if (answers.length !== questions.length) {
    throw new Error(`expected ${questions.length} answers, got ${answers.length}`);
  }

  answers.forEach((choice, index) => {
    const question = questions[index];
    if (!Number.isInteger(choice) || choice < 0 || choice >= question.choices.length) {
      throw new Error(`answer for question ${index + 1} is out of range`);
    }
  });

  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const total = questions.length;
  const percent = Math.round((correct / total) * 100);

  return { correct, total, percent, level: levelFromPercent(percent) };
}
