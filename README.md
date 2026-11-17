# FSTraining

**Full Stack Training**: learn web development one layer at a time, with lessons that run real code in the browser. It works without signing up; optional accounts (Vercel functions + a Turso database) sync progress between devices and add a leaderboard.

| Layer | Course | Lessons | How the code runs |
| --- | --- | --- | --- |
| 1 · Structure | HTML | 7 | sandboxed iframe with a live preview |
| 2 · Style | CSS | 7 | sandboxed iframe, checks read computed styles |
| 3 · Behaviour | JavaScript | 9 | Web Worker (logic) and sandboxed iframe (DOM) |
| 4 · Network | Async JavaScript | 5 | Web Worker, with a simulated server request |
| 5 · Server | PHP | 14 | PHP 8.4 compiled to WebAssembly |
| 6 · Data | SQL | 7 | SQLite compiled to WebAssembly |
| 7 · Full stack | PHP + SQL | 5 | PHP 8.4 with PDO and an in-memory SQLite database |
| 8 · Workflow | Git | 6 | quiz lessons (multiple choice and typed commands) |

## Features

- **Course map**: each course is a path of lessons grouped into chapters. Lessons unlock one at a time (there is an "unlock all" switch on the profile page).
- **Lessons**: an explanation, a task, a code editor, and a live preview, console or result table. "Check answer" grades the code and shows exactly which checks passed.
- **Reviewer**: a study-notes page for every course, with one section per chapter: key points, cheat-sheet tables and self-check questions whose answers stay hidden until clicked. Sections can be ticked off as reviewed, and each reviewer prints cleanly.
- **XP, levels and badges**: every lesson is worth XP, XP adds up to levels, and 20 badges reward streaks, first-try passes, finished courses and more.
- **Hints and solutions**: hints are revealed one at a time. The solution unlocks after 3 unsuccessful checks; viewing it before solving halves the lesson's XP.
- **Playground**: an ungraded scratchpad for a web page (HTML + CSS + JS), JavaScript, PHP and SQL, plus an interactive PHP console where variables persist between lines.
- **Accounts (optional)**: sign up with a username and password to keep progress on every device. Progress made as a guest is added to the account.
- **Leaderboard**: everyone with an account, ranked by XP, with level and streak.
- **Saved locally first**: progress, drafts and playground code live in `localStorage`. Without an account, nothing leaves the device.
- Works on a phone.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run preview    # serves dist/ locally
```

Node 20+ is required. PHP (about 20 MB) and SQLite (about 0.7 MB) are downloaded the first time a lesson needs them, then cached by the browser.

## How it works

```
router ──► pages/home.js        dashboard: level, streak, the courses
       ──► pages/course.js      a course as a path of lessons
       ──► pages/lesson.js      learn + editor + checks ──► runners/
       ──► pages/playground.js  ungraded scratchpad      ──► runners/
       ──► pages/reviewer.js    study notes per course
       ──► pages/profile.js     stats, badges, settings

store.js   progress, XP, badges (persisted by storage.js)
courses/   lesson data
```

Each language has a **runner** in [`src/runners/`](src/runners/), and [`src/runners/index.js`](src/runners/index.js) puts one interface (`runLesson`, `checkLesson`) over all four:

- **HTML / CSS / DOM** ([`web.js`](src/runners/web.js)): the learner's files are merged into one document and loaded into an iframe with `sandbox="allow-scripts"`. The page can run scripts but cannot reach the app's storage or DOM. Because the iframe is a different origin, the check functions are serialised, executed *inside* it, and report back with `postMessage`.
- **JavaScript** ([`javascript.js`](src/runners/javascript.js)): the code runs in a throw-away Web Worker. `console.log` is captured, test inputs are passed to the learner's function, and a 3 second timeout terminates the worker if a loop never ends.
- **PHP** ([`php.js`](src/runners/php.js), [`php-runner.js`](src/php-runner.js), [`php-worker.js`](src/php-worker.js)): [`@php-wasm/web`](https://www.npmjs.com/package/@php-wasm/web) from WordPress Playground runs PHP 8.4 in a Web Worker. A hidden harness appended to the learner's code calls their function with each test's inputs and prints the results as JSON. A 5 second timeout kills and restarts the worker.
- **SQL** ([`sql.js`](src/runners/sql.js)): [sql.js](https://github.com/sql-js/sql.js) provides SQLite. Every run starts from a fresh in-memory database, and a lesson passes when its result matches the result of the reference solution.

Quiz lessons ([`quiz.js`](src/runners/quiz.js)) run no code: the chosen options and typed answers are compared with the answer key.

The PHP console keeps its session by replaying earlier snippets with their output suppressed; see the comment at the top of [`src/repl.js`](src/repl.js).

**Bundle size**: `@php-wasm/web` dynamically imports every PHP version it supports (about 40 MB each). A small plugin in [`vite.config.js`](vite.config.js) stubs the unused ones, so `dist/` only contains PHP 8.4.

## Accounts

Accounts are optional. Without a database the app behaves exactly as before and says that progress is saved in the browser only.

```
browser ── src/account.js ──► /api/*  (Vercel functions, ./api) ──► Turso (libSQL)
```

| Route | Purpose |
| --- | --- |
| `POST /api/auth/signup` | Create an account and log in |
| `POST /api/auth/login`, `POST /api/auth/logout` | Start and end a session |
| `GET /api/me` | Who is logged in; `PATCH` changes the password, `DELETE` deletes the account |
| `GET /api/progress`, `PUT /api/progress` | Load and save the logged-in user's progress |
| `GET /api/leaderboard` | Everyone's XP, lessons and streak (logged-in users only) |

How it is put together:

- **Passwords** are hashed with scrypt and a per-user salt. They are never stored or logged.
- **Sessions** are a random token in an `HttpOnly`, `SameSite=Lax` cookie (`Secure` over HTTPS) that lasts 30 days. The database stores only the token's SHA-256.
- **Cross-site requests** are refused: changes must be sent as JSON and carry a matching `Origin`.
- **Rate limiting**: 8 wrong passwords per account, or 40 per address, in 15 minutes locks further attempts; sign-ups are limited to 10 per address per hour.
- **Sync** is local-first. Changes are pushed about 2.5 seconds after they happen and pulled on start-up. Two copies of progress are *merged* (a lesson completed anywhere stays completed), so two devices never overwrite each other.
- **Logging out** saves progress first and then clears it from the browser, so the next person on that computer starts clean.
- The schema (`users`, `sessions`, `progress`, `attempts`) is created automatically on first use; see [`api/_lib/db.js`](api/_lib/db.js).

Limits worth knowing:

- There is **no password reset**, because no email address is collected. A forgotten password means a new account (or you delete the user's row in Turso and they sign up again).
- The **leaderboard numbers come from the browser**. The server caps XP at what the completed lessons could be worth, but a determined friend could still inflate their score. It is a friendly leaderboard, not an exam.
- "Reset progress" on one device is not carried to another device that still has the old progress: when that device syncs, the progress comes back.

### Local development

`npm run dev` serves the `/api` routes too (a small plugin in [`vite.config.js`](vite.config.js)) and, with no configuration, stores accounts in a SQLite file at `.data/local.db`. Delete that file to start over. To use your Turso database locally instead, copy [`.env.example`](.env.example) to `.env.local` and fill it in.

### Setting up Turso

1. Install the [Turso CLI](https://docs.turso.tech/cli/installation) and run `turso auth signup` (or `turso auth login`).
2. Create a database: `turso db create fstraining`
3. Get its URL: `turso db show fstraining --url`
4. Create a token: `turso db tokens create fstraining`

Steps 2 to 4 can also be done in the Turso dashboard. There are no tables to create by hand.

### Environment variables

| Variable | Value |
| --- | --- |
| `TURSO_DATABASE_URL` | The `libsql://…` URL from step 3 |
| `TURSO_AUTH_TOKEN` | The token from step 4. Treat it like a password: never commit it |
| `SIGNUP_CODE` | Optional. If set, signing up requires this code. Share it with the friends you want to let in; leave it out to let anyone sign up |

## Adding a lesson

A lesson has two parts:

1. **Text and code** in a Markdown file: `src/courses/<course>/<lesson-id>.md`
2. **Position and grading** in the course file: `src/courses/<course>.js`

### 1. The Markdown file

```markdown
# Lesson title

Explanation shown under "Learn". Use ### for sub-headings, `code`,
**bold**, *italic*, lists, fenced code blocks and > callouts.

## Task

What the learner has to do.

## Hints

- First hint
- Second hint

## Given: index.html

(optional: a read-only file, in a fenced code block)

## Starter: style.css

(the code the learner starts with, in a fenced code block)

## Solution: style.css

(a correct answer, in a fenced code block)
```

The file name after `Starter` and `Solution` can be left out when the lesson has a single file (`index.html`, `script.js`, `main.php` or `query.sql`, depending on the course). The full format is described in [`src/courses/lesson-file.js`](src/courses/lesson-file.js).

### 2. The entry in the course file

Add `{ id: '<lesson-id>', … }` to a chapter's `lessons` array. What else goes in the object depends on how the lesson is graded:

| Grading | Fields | Used by |
| --- | --- | --- |
| Inspect the page | `checks: [{ label, test: (doc, win, h, src) => true \| 'what is missing' }]` | HTML, CSS, DOM lessons |
| Compare printed output | `expectOutput: 'text'` | JavaScript, PHP |
| Call a function | `functionName: 'name', tests: [{ input: [args], expected: value }]` | JavaScript, PHP |
| Compare query results | `setup: 'CREATE TABLE …'`, optional `ordered: true` or `verify: 'SELECT …'` | SQL |
| Compare answers | nothing: the questions come from the `## Quiz` section of the Markdown file | Git (`kind: 'quiz'`) |

Optional on any lesson: `challenge: true` (25 XP instead of 10), `xp: 15`, and `sourceChecks: [{ label, test: (code) => boolean }]` for rules about the source itself.

Page checks run inside the preview iframe, so each `test` must be self-contained: it may only use its four arguments. `h` offers helpers such as `h.q(selector)`, `h.all(selector)`, `h.text(el)`, `h.css(el, property)`, `h.px(el, property)`, `h.sameColor(el, property, color)` and `h.rules()`; see `makeHelpers` in [`src/runners/web.js`](src/runners/web.js).

### Helper files

In JavaScript and PHP lessons, a `## Given: helpers.js` (or `helpers.php`) section defines functions the learner can call. The file is shown read-only in its own tab and runs before the learner's code. Write helpers without `//` comments at the end of a line: they are joined into a single line so that error messages keep the learner's line numbers.

Functions under test may be `async`; the result is awaited before it is compared.

### Quiz lessons

A course (or a single lesson) with `kind: 'quiz'` has no code. Replace the Starter and Solution sections with a `## Quiz` section:

```markdown
## Quiz

? Which command creates a repository?
- git start
- git init *
- git new

? Type the command that shows what has changed.
= git status
= /^git status( -s)?$/
```

Each question starts with `? `. Options start with `- `, and the correct one ends in ` *`. A question with `= ` lines instead is answered by typing; any listed answer is accepted, ignoring case and extra spaces. An answer written as `/pattern/` is a regular expression. List a plain answer first, because it is the one shown as the solution.

### Reviewers

Each course has a reviewer in `src/courses/<course>/_reviewer.md`: an optional introduction followed by one `## Section` per chapter, in chapter order. Besides the usual Markdown, reviewers use tables and self-check questions:

```markdown
## Rules and selectors

| Selector | Matches |
| --- | --- |
| `.price` | Every element with class="price" |

Q: When do you use a class, and when an id?
A: A class for anything that can repeat. An id for something that exists once.
```

Avoid the `|` character inside table cells.

### PHP function exercises

The twelve original PHP exercises are JSON files in [`src/courses/php/`](src/courses/php/). To add one, create the JSON file, optionally add a `.md` file with the same name for the "Learn" text, and list it in [`src/courses/php.js`](src/courses/php.js) with `exercise('<id>')`.

```jsonc
{
  "id": "13-my-exercise",
  "title": "Short title",
  "level": "basics",                 // basics | strings | arrays | functions | oop | practical (sets the XP)
  "prompt": "What to do, including the exact return format.",
  "starterCode": "<?php\nfunction myFunction(int $n): int\n{\n    // TODO\n    return 0;\n}\n",
  "functionName": "myFunction",      // the harness calls this function
  "hints": ["First hint", "Second hint"],
  "tests": [
    { "input": [3], "expected": 6 }, // input = argument list, spread into the call
    { "input": [0], "expected": 0 }
  ],
  "solution": "<?php\nfunction myFunction(int $n): int\n{\n    return $n * 2;\n}\n"
}
```

How return values are compared (JavaScript and PHP):

- Integers must match exactly; floats are compared with a 1e-9 tolerance.
- Object keys may be in any order; array elements must be in order.
- PHP encodes an empty array as `[]`, so write `[]` (not `{}`) when a PHP function should return an empty array.
- Exceptions are caught and reported as a failed test. Anything printed during a call is shown under that test.

### Check your lessons

Open the app, then run this in the browser console:

```js
await fst.verify()                    // every course
await fst.verify({ course: 'sql' })   // just one
```

It runs every lesson twice through the real grader: the solution must pass, and the untouched starter code must not. An empty `problems` array means everything is in order.

## Deploy to Vercel

Vercel detects Vite automatically, so no config file is needed.

1. Push the repo to GitHub.
2. In Vercel: **Add New → Project**, import the repository.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output directory `dist`. The files in `api/` become serverless functions automatically.
4. For accounts, add the [environment variables](#environment-variables) under **Settings → Environment Variables** (Production, and Preview if you want accounts there too), then redeploy.
5. Deploy. Every push to `main` redeploys.

Without the Turso variables the site still deploys and works; it simply has no accounts.

## Project structure

```
api/                          Vercel functions: auth, progress, leaderboard
api/_lib/                     shared server code: database, sessions, request helpers
.env.example                  the environment variables accounts need
index.html                    app shell: top bar and the page outlet
vite.config.js                Vite config + plugin that drops unused PHP builds
public/img/                   images used by lessons
src/main.js                   wires everything together
src/router.js                 minimal hash router
src/store.js                  progress, XP, streak, badges
src/account.js                logging in, and syncing progress with the server
src/storage.js                localStorage with try/catch everywhere
src/gamify.js                 level thresholds, rank titles, badge catalogue
src/ui.js                     DOM helpers, icons, toast, modal
src/markdown.js               renders lesson text
src/editor.js                 CodeMirror 6 editor (HTML, CSS, JS, PHP, SQL)
src/components/               file-tabbed editor, quiz form, output panel, account card
src/pages/                    home, course, lesson, reviewer, playground, leaderboard, profile
src/runners/                  one runner per language + the shared interface
src/courses/<course>.js       chapters, lesson order, grading rules
src/courses/<course>/*.md     lesson text, starter code, solutions, quiz questions
src/courses/<course>/_reviewer.md   the course's study notes
src/courses/php/*.json        PHP function exercises
src/php-runner.js             main-thread wrapper: worker lifecycle + timeout
src/php-worker.js             Web Worker that runs PHP (the only file touching @php-wasm)
src/repl.js, terminal.js, commands.js    the PHP console in the playground
src/verify.js                 self-test for lesson authors (fst.verify())
```

## Debugging hook

`window.fst` is exposed in the browser console:

```js
fst.router.go('/lesson/php/03-fizzbuzz')
fst.page().setFile('main.php', '<?php ...')   // replace a file in the editor
await fst.page().check()                      // same as pressing "Check answer"
fst.store.state                               // everything that is saved
```

## Coming from PHP Terminal Trainer

FSTraining grew out of PHP Terminal Trainer. Progress saved by the old app (in `localStorage` under `php-terminal-trainer`) is imported automatically on first load: completed exercises, drafts and activity carry over to the PHP course and count towards XP and badges.

## License

MIT. PHP itself is distributed under the PHP License; `@php-wasm/web` is GPL-2.0-or-later; sql.js and SQLite are MIT and public domain respectively.
