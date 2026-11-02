# Traject

Traject is a competency platform for students and jobseekers. Candidates prove their skills with short checks, see which roles fit them, find the gaps, and get a learning path. Recruiters can search by verified skill level.

## What it does

- **Accounts:** sign up, log in, log out. Passwords are hashed; sessions are stored as hashes.
- **Skill checks:** five questions per skill, graded on the server. A passed check sets a verified level from 1 to 5.
- **Describe your experience:** a local AI model suggests skills from plain text. Suggestions are saved as *claims* and do not count toward scores until a check is passed.
- **Profile score:** 100 × the weighted sum of verified levels over all skills. Unverified skills count as zero.
- **Roles:** each role lists required levels. Matches use verified levels only, and gaps show what is missing.
- **Learning paths:** the AI orders a role's gaps and writes an action for each. If the AI is unavailable, gaps are ordered by size instead.
- **Profiles and network:** edit your name and headline, view other profiles (verified skills and claims shown separately), and send, accept or remove connections.
- **Recruiter search:** find people with a verified level at or above a chosen minimum in a skill.

## Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer
- [Ollama](https://ollama.com) for the AI features (optional; the rest of the app works without it)

## Setup

1. Install dependencies:

   ```bash
   cd web
   npm install
   ```

2. Create a database and point the app at it. Create `web/.env.local`:

   ```bash
   DATABASE_URL=postgres://<user>@localhost:5432/traject
   ```

3. Create the tables and load the skills and draft roles:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. For AI features, start Ollama and pull the model:

   ```bash
   ollama pull qwen2.5:7b
   ollama serve
   ```

   Optional settings in `.env.local`:

   - `LLM_MODEL` to use a different Ollama model
   - `OLLAMA_URL` if Ollama does not run on `http://localhost:11434`
   - `LLM_PROVIDER=groq` with `GROQ_API_KEY` to use Groq instead of Ollama

5. Run the app:

   ```bash
   npm run dev        # development, http://localhost:3000
   # or
   npm run build && npm start
   ```

## Tests

```bash
cd web
npm test
```

The tests cover the scoring formulas, grading, validation rules, the AI reply parsing and the learning-path logic. They do not need the database or Ollama.

## Project layout

- `web/app/` pages and server actions (Next.js App Router)
- `web/lib/` scoring, grading, AI client, database and session code
- `web/db/migrations/` schema changes, applied in order
- `web/db/seed/` skill taxonomy, team courses and reviewed roles

## Known gaps

- Two course URLs point to the same Coursera page, and several NPTEL and Skill India links go to the provider's homepage. These need course-specific links.
- The question bank is starter content and needs review.
- Unknown skill URLs return HTTP 200 with a not-found page instead of 404.
- Candidate search is open to any signed-in user; there is no recruiter role yet.
