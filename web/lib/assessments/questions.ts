// Question bank for skill checks. Answers live only on the server: this module must
// only be imported from server code (server components and server actions).
// Each skill has 10 questions, two at each difficulty from 1 (easy) to 5 (hard).
import type { AdaptiveQuestion } from "./adaptive";
import { EXTRA_QUESTIONS } from "./questions-extra";

const BASE_QUESTIONS: Record<string, AdaptiveQuestion[]> = {
  python: [
    { id: "python-1", difficulty: 1, prompt: "Which keyword defines a function?", choices: ["def", "func", "function", "fn"], answer: 0 },
    { id: "python-2", difficulty: 2, prompt: "What does len([1, 2, 3]) return?", choices: ["2", "3", "4", "An error"], answer: 1 },
    { id: "python-3", difficulty: 2, prompt: "Which expression creates an empty dictionary?", choices: ["{}", "[]", "()", "set()"], answer: 0 },
    { id: "python-4", difficulty: 3, prompt: 'What does "abc"[::-1] return?', choices: ["abc", "cba", "a", "An error"], answer: 1 },
    { id: "python-5", difficulty: 1, prompt: "Which statement handles exceptions?", choices: ["try / except", "catch", "guard", "rescue"], answer: 0 },
    { id: "python-6", difficulty: 3, prompt: "What is the type of 5 / 2 in Python 3?", choices: ["int", "float", "decimal", "str"], answer: 1 },
    { id: "python-7", difficulty: 4, prompt: "What is printed by: a = [1]; b = a; b.append(2); print(a)", choices: ["[1]", "[1, 2]", "[2]", "An error"], answer: 1 },
    { id: "python-8", difficulty: 4, prompt: "What does 'a,b,,c'.split(',') return?", choices: ["['a', 'b', 'c']", "['a', 'b', '', 'c']", "['a', 'b', 'c', '']", "An error"], answer: 1 },
    { id: "python-9", difficulty: 5, prompt: "def f(a, b=[]): b.append(a); return b. What do f(1) and then f(2) return?", choices: ["[1] then [2]", "[1] then [1, 2]", "[1, 2] then [1, 2]", "[2] then [2]"], answer: 1 },
    { id: "python-10", difficulty: 5, prompt: "What does list(zip([1, 2, 3], 'ab')) return?", choices: ["[(1, 'a'), (2, 'b')]", "[(1, 'a'), (2, 'b'), (3, None)]", "[('a', 1), ('b', 2)]", "An error"], answer: 0 },
  ],
  javascript: [
    { id: "javascript-1", difficulty: 1, prompt: "Which keyword declares a block-scoped variable that can be reassigned?", choices: ["var", "let", "const", "static"], answer: 1 },
    { id: "javascript-2", difficulty: 3, prompt: "What does typeof null return?", choices: ["null", "object", "undefined", "number"], answer: 1 },
    { id: "javascript-3", difficulty: 4, prompt: "What does [] + [] evaluate to?", choices: ["0", "[]", "\"\"", "undefined"], answer: 2 },
    { id: "javascript-4", difficulty: 1, prompt: "Which array method returns a new array with each element transformed?", choices: ["forEach", "map", "filter", "reduce"], answer: 1 },
    { id: "javascript-5", difficulty: 2, prompt: "Which keyword pauses inside an async function until a promise settles?", choices: ["await", "yield", "pause", "defer"], answer: 0 },
    { id: "javascript-6", difficulty: 2, prompt: "What does 'JS'.length return?", choices: ["1", "2", "JS", "undefined"], answer: 1 },
    { id: "javascript-7", difficulty: 3, prompt: "What is 0.1 + 0.2 === 0.3?", choices: ["true", "false", "undefined", "NaN"], answer: 1 },
    { id: "javascript-8", difficulty: 4, prompt: "What does [1, 2, 3].indexOf('2') return?", choices: ["1", "-1", "2", "undefined"], answer: 1 },
    { id: "javascript-9", difficulty: 5, prompt: "What does console.log(0 == '') print?", choices: ["true", "false", "undefined", "An error"], answer: 0 },
    { id: "javascript-10", difficulty: 5, prompt: "What does console.log(typeof NaN) print?", choices: ["'NaN'", "'number'", "'undefined'", "'object'"], answer: 1 },
  ],
  sql: [
    { id: "sql-1", difficulty: 2, prompt: "Which clause filters groups after GROUP BY?", choices: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], answer: 1 },
    { id: "sql-2", difficulty: 2, prompt: "Which join keeps every row from the left table, even without a match?", choices: ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "SELF JOIN"], answer: 1 },
    { id: "sql-3", difficulty: 3, prompt: "What does COUNT(*) count?", choices: ["Non-null values in one column", "All rows, including NULLs", "Distinct values only", "Groups only"], answer: 1 },
    { id: "sql-4", difficulty: 3, prompt: "Which command removes all rows but keeps the table definition?", choices: ["DROP TABLE", "TRUNCATE TABLE", "REMOVE ALL", "CLEAR TABLE"], answer: 1 },
    { id: "sql-5", difficulty: 1, prompt: "Which keyword removes duplicate rows from the result?", choices: ["UNIQUE", "DISTINCT", "SINGLE", "FILTER"], answer: 1 },
    { id: "sql-6", difficulty: 1, prompt: "Which SQL keyword sorts the result rows?", choices: ["ORDER BY", "GROUP BY", "SORT", "ARRANGE"], answer: 0 },
    { id: "sql-7", difficulty: 4, prompt: "Which query returns each department once, even if it has many employees?", choices: ["SELECT department FROM employees", "SELECT DISTINCT department FROM employees", "SELECT COUNT(department) FROM employees", "SELECT department FROM employees WHERE department"], answer: 1 },
    { id: "sql-8", difficulty: 4, prompt: "In SQL, what does NULL = NULL evaluate to?", choices: ["TRUE", "FALSE", "NULL (unknown)", "An error"], answer: 2 },
    { id: "sql-9", difficulty: 5, prompt: "Does a WHERE clause run before or after GROUP BY?", choices: ["Before GROUP BY", "After GROUP BY", "Only with HAVING", "It does not matter"], answer: 0 },
    { id: "sql-10", difficulty: 5, prompt: "What does a self join need so the two copies of the table can be told apart?", choices: ["Two different tables", "Aliases for the same table used twice", "A UNION", "A subquery only"], answer: 1 },
  ],
  "data-analysis": [
    { id: "data-analysis-1", difficulty: 2, prompt: "Which measure of central tendency is most affected by outliers?", choices: ["Median", "Mode", "Mean", "Quartile"], answer: 2 },
    { id: "data-analysis-2", difficulty: 3, prompt: "A correlation of -0.9 between two variables means:", choices: ["Strong positive relationship", "Strong negative relationship", "No relationship", "Weak positive relationship"], answer: 1 },
    { id: "data-analysis-3", difficulty: 1, prompt: "The best first step when a dataset has missing values is:", choices: ["Delete the whole dataset", "Check how much is missing and why", "Replace everything with zero", "Ignore the column types"], answer: 1 },
    { id: "data-analysis-4", difficulty: 1, prompt: "Which chart is best for showing change over time?", choices: ["Pie chart", "Line chart", "Scatter plot", "Histogram"], answer: 1 },
    { id: "data-analysis-5", difficulty: 4, prompt: "A p-value below 0.05 usually means:", choices: ["The null hypothesis is proven true", "The result is unlikely if the null hypothesis is true", "The effect is large", "The sample is biased"], answer: 1 },
    { id: "data-analysis-6", difficulty: 2, prompt: "Which measure is the middle value of sorted data?", choices: ["Mean", "Median", "Mode", "Range"], answer: 1 },
    { id: "data-analysis-7", difficulty: 3, prompt: "A histogram is mainly used to show:", choices: ["The distribution of one numeric variable", "The share of categories as slices", "A trend over time", "A relationship between two categories"], answer: 0 },
    { id: "data-analysis-8", difficulty: 4, prompt: "Why split data into training and test sets?", choices: ["To make the dataset larger", "To check performance on unseen data", "To remove outliers", "To speed up training only"], answer: 1 },
    { id: "data-analysis-9", difficulty: 5, prompt: "A Type I error is:", choices: ["Accepting a false null hypothesis", "Rejecting a true null hypothesis", "Collecting too few samples", "Using the wrong chart"], answer: 1 },
    { id: "data-analysis-10", difficulty: 5, prompt: "Simpson's paradox means:", choices: ["A trend that reverses when groups are combined", "Two variables always move together", "A mean equal to the median", "Data that cannot be plotted"], answer: 0 },
  ],
  "problem-solving": [
    { id: "problem-solving-1", difficulty: 1, prompt: "What is the best first step with a complex problem?", choices: ["Start coding immediately", "Restate the problem and its constraints", "Ask someone else to solve it", "Guess a solution"], answer: 1 },
    { id: "problem-solving-2", difficulty: 2, prompt: "Which technique makes a large problem easier to manage?", choices: ["Decomposition", "Duplication", "Deletion", "Denial"], answer: 0 },
    { id: "problem-solving-3", difficulty: 3, prompt: "If a fix does not work, you should:", choices: ["Repeat the same fix", "Form a hypothesis and test it", "Ignore the error", "Restart the computer and hope"], answer: 1 },
    { id: "problem-solving-4", difficulty: 3, prompt: "Which testing approach gives the most useful evidence?", choices: ["Test one happy path only", "Test edge cases and invalid inputs", "Skip testing", "Test only in production"], answer: 1 },
    { id: "problem-solving-5", difficulty: 4, prompt: "Trade-off thinking means:", choices: ["Choosing the shortest answer", "Weighing the costs and benefits of each option", "Picking the newest technology", "Avoiding decisions"], answer: 1 },
    { id: "problem-solving-6", difficulty: 1, prompt: "When you get stuck, what is the simplest next step?", choices: ["Reproduce the problem reliably", "Rewrite everything", "Ask for the answer", "Change random things"], answer: 0 },
    { id: "problem-solving-7", difficulty: 2, prompt: "What is an assumption?", choices: ["A proven fact", "Something taken as true without checking", "A test result", "A deadline"], answer: 1 },
    { id: "problem-solving-8", difficulty: 4, prompt: "Which step comes right after forming a hypothesis?", choices: ["Test it", "Ignore it", "Announce the answer", "Rewrite the project"], answer: 0 },
    { id: "problem-solving-9", difficulty: 5, prompt: "Two fixes both work. Which should you prefer?", choices: ["The longest one", "The one with lower risk and clearer code", "The one you wrote first", "The one with more comments"], answer: 1 },
    { id: "problem-solving-10", difficulty: 5, prompt: "A root cause is:", choices: ["The first error message you see", "The underlying reason the problem happens", "The last change anyone made", "The person responsible"], answer: 1 },
  ],
  communication: [
    { id: "communication-1", difficulty: 1, prompt: "The best opening for a status update is:", choices: ["Background first", "The conclusion or request first", "A greeting only", "An apology"], answer: 1 },
    { id: "communication-2", difficulty: 1, prompt: "Which formatting makes a document easier to scan?", choices: ["Long unbroken paragraphs", "Headings and bullet points", "All capital letters", "Footnotes only"], answer: 1 },
    { id: "communication-3", difficulty: 2, prompt: "Which sentence uses the active voice?", choices: ["The report was written by her.", "She wrote the report.", "The report has been written.", "Written was the report."], answer: 1 },
    { id: "communication-4", difficulty: 3, prompt: "Before sending a message, you should:", choices: ["Proofread it and check what the reader needs", "Send it immediately", "Add more jargon", "Remove the subject line"], answer: 0 },
    { id: "communication-5", difficulty: 2, prompt: "A concise sentence is:", choices: ["Long and full of filler", "Clear, with no unnecessary words", "Written in code", "A single word"], answer: 1 },
    { id: "communication-6", difficulty: 3, prompt: "Which request is the most direct?", choices: ["I was wondering if maybe you could possibly send it?", "Could you send the report by Friday?", "Sorry to bother you, but report?", "It would be nice if the report came soon."], answer: 1 },
    { id: "communication-7", difficulty: 4, prompt: "What is the best check before you write a message?", choices: ["Who will read this, and what do they need?", "How many words I can use", "Which font looks best", "Whether it will be long"], answer: 0 },
    { id: "communication-8", difficulty: 4, prompt: "Which is a clear email subject line?", choices: ["Hi", "Update", "Need your sign-off on the Q3 budget by Friday", "Important!!!"], answer: 2 },
    { id: "communication-9", difficulty: 5, prompt: "A reader skims your email. What should come first?", choices: ["Your full history", "The action they need to take", "A joke", "Your signature"], answer: 1 },
    { id: "communication-10", difficulty: 5, prompt: "Passive voice is best used when:", choices: ["Always", "The actor is unknown or unimportant", "To sound formal", "Never"], answer: 1 },
  ],
};

// Every skill with a check: the original six plus the expanded catalogue.
export const QUESTIONS: Record<string, AdaptiveQuestion[]> = { ...BASE_QUESTIONS, ...EXTRA_QUESTIONS };
