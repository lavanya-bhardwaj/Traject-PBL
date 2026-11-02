// Question bank for skill checks. Answers live only on the server: this module must
// only be imported from server code (server components and server actions).
import type { Question } from "./grading";

export const QUESTIONS: Record<string, Question[]> = {
  python: [
    { id: "python-1", prompt: "Which keyword defines a function?", choices: ["def", "func", "function", "fn"], answer: 0 },
    { id: "python-2", prompt: "What does len([1, 2, 3]) return?", choices: ["2", "3", "4", "An error"], answer: 1 },
    { id: "python-3", prompt: "Which expression creates an empty dictionary?", choices: ["{}", "[]", "()", "set()"], answer: 0 },
    { id: "python-4", prompt: 'What does "abc"[::-1] return?', choices: ["abc", "cba", "a", "An error"], answer: 1 },
    { id: "python-5", prompt: "Which statement handles exceptions?", choices: ["try / except", "catch", "guard", "rescue"], answer: 0 },
  ],
  javascript: [
    { id: "javascript-1", prompt: "Which keyword declares a block-scoped variable that can be reassigned?", choices: ["var", "let", "const", "static"], answer: 1 },
    { id: "javascript-2", prompt: "What does typeof null return?", choices: ["null", "object", "undefined", "number"], answer: 1 },
    { id: "javascript-3", prompt: "What does [] + [] evaluate to?", choices: ["0", "[]", "\"\"", "undefined"], answer: 2 },
    { id: "javascript-4", prompt: "Which array method returns a new array with each element transformed?", choices: ["forEach", "map", "filter", "reduce"], answer: 1 },
    { id: "javascript-5", prompt: "Which keyword pauses inside an async function until a promise settles?", choices: ["await", "yield", "pause", "defer"], answer: 0 },
  ],
  sql: [
    { id: "sql-1", prompt: "Which clause filters groups after GROUP BY?", choices: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], answer: 1 },
    { id: "sql-2", prompt: "Which join keeps every row from the left table, even without a match?", choices: ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SELF JOIN"], answer: 1 },
    { id: "sql-3", prompt: "What does COUNT(*) count?", choices: ["Non-null values in one column", "All rows, including NULLs", "Distinct values only", "Groups only"], answer: 1 },
    { id: "sql-4", prompt: "Which command removes all rows but keeps the table definition?", choices: ["DROP TABLE", "TRUNCATE TABLE", "REMOVE ALL", "CLEAR TABLE"], answer: 1 },
    { id: "sql-5", prompt: "Which keyword removes duplicate rows from the result?", choices: ["UNIQUE", "DISTINCT", "SINGLE", "FILTER"], answer: 1 },
  ],
  "data-analysis": [
    { id: "data-analysis-1", prompt: "Which measure of central tendency is most affected by outliers?", choices: ["Median", "Mode", "Mean", "Quartile"], answer: 2 },
    { id: "data-analysis-2", prompt: "A correlation of -0.9 between two variables means:", choices: ["Strong positive relationship", "Strong negative relationship", "No relationship", "Weak positive relationship"], answer: 1 },
    { id: "data-analysis-3", prompt: "The best first step when a dataset has missing values is:", choices: ["Delete the whole dataset", "Check how much is missing and why", "Replace everything with zero", "Ignore the column types"], answer: 1 },
    { id: "data-analysis-4", prompt: "Which chart is best for showing change over time?", choices: ["Pie chart", "Line chart", "Scatter plot", "Histogram"], answer: 1 },
    { id: "data-analysis-5", prompt: "A p-value below 0.05 usually means:", choices: ["The null hypothesis is proven true", "The result is unlikely if the null hypothesis is true", "The effect is large", "The sample is biased"], answer: 1 },
  ],
  "problem-solving": [
    { id: "problem-solving-1", prompt: "What is the best first step with a complex problem?", choices: ["Start coding immediately", "Restate the problem and its constraints", "Ask someone else to solve it", "Guess a solution"], answer: 1 },
    { id: "problem-solving-2", prompt: "Which technique makes a large problem easier to manage?", choices: ["Decomposition", "Duplication", "Deletion", "Denial"], answer: 0 },
    { id: "problem-solving-3", prompt: "If a fix does not work, you should:", choices: ["Repeat the same fix", "Form a hypothesis and test it", "Ignore the error", "Restart the computer and hope"], answer: 1 },
    { id: "problem-solving-4", prompt: "Which testing approach gives the most useful evidence?", choices: ["Test one happy path only", "Test edge cases and invalid inputs", "Skip testing", "Test only in production"], answer: 1 },
    { id: "problem-solving-5", prompt: "Trade-off thinking means:", choices: ["Choosing the shortest answer", "Weighing the costs and benefits of each option", "Picking the newest technology", "Avoiding decisions"], answer: 1 },
  ],
  communication: [
    { id: "communication-1", prompt: "The best opening for a status update is:", choices: ["Background first", "The conclusion or request first", "A greeting only", "An apology"], answer: 1 },
    { id: "communication-2", prompt: "Which formatting makes a document easier to scan?", choices: ["Long unbroken paragraphs", "Headings and bullet points", "All capital letters", "Footnotes only"], answer: 1 },
    { id: "communication-3", prompt: "Which sentence uses the active voice?", choices: ["The report was written by her.", "She wrote the report.", "The report has been written.", "Written was the report."], answer: 1 },
    { id: "communication-4", prompt: "Before sending a message, you should:", choices: ["Proofread it and check what the reader needs", "Send it immediately", "Add more jargon", "Remove the subject line"], answer: 0 },
    { id: "communication-5", prompt: "A concise sentence is:", choices: ["Long and full of filler", "Clear, with no unnecessary words", "Written in code", "A single word"], answer: 1 },
  ],
};
