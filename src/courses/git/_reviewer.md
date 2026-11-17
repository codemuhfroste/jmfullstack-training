# Git reviewer

Git records the history of a project, so you can see what changed, undo mistakes, and work with other people without overwriting each other.

## Saving your work

- A **repository** is a folder Git tracks. A **commit** is a snapshot with a message. The **working tree** is the files on disk right now.
- Saving takes two steps: **stage** with `git add`, then **commit**.
- A file is modified, then staged, then committed.
- Write commit messages that say what the change does. Commit small and often.

| Command | Does |
| --- | --- |
| `git init` | Turn the current folder into a repository |
| `git status` | Show what has changed (never modifies anything) |
| `git add file` / `git add .` | Stage one file / everything that changed |
| `git commit -m "message"` | Save the staged changes as a commit |
| `git log --oneline` | List commits, one line each |
| `git diff` | Show unstaged line-by-line changes |
| `git diff --staged` | Show staged changes |
| `git restore file` | Discard uncommitted changes in a file |

Q: What is the staging area for?
A: Choosing exactly which changes go into the next commit, so unrelated edits can be committed separately.

Q: What does a line starting with `-` mean in `git diff`?
A: The line was removed.

Q: Is Git the same as GitHub?
A: No. Git is the tool on your computer. GitHub is a website that hosts copies of Git repositories.

## Branching

- A **branch** is a separate line of commits. Work on it without affecting `main`.
- To **merge**, switch to the branch that should receive the changes, then name the branch to bring in.
- A **merge conflict** happens when both branches changed the same lines. Edit the file to the result you want, then stage and commit.

| Command | Does |
| --- | --- |
| `git branch` | List branches; `*` marks the current one |
| `git switch -c name` | Create a branch and move onto it |
| `git switch name` | Move to an existing branch |
| `git merge name` | Bring the commits of `name` into the current branch |
| `git branch -d name` | Delete a branch that has been merged |

Q: You are on `order-form` and run `git merge main`. What happens?
A: The commits from `main` are brought into `order-form`. `main` itself does not change.

Q: What do you do when Git reports a merge conflict?
A: Open the conflicting file, decide what the final content should be, remove the conflict markers, then `git add` and `git commit`.

## Working with others

- A **remote** is a copy of the repository hosted elsewhere. `origin` is the usual name for the one you cloned from.
- Nothing is shared until you **push**. You see nobody else's work until you **pull**.
- A rejected push means the remote has commits you lack: pull, then push again.
- `.gitignore` lists files Git must not track: secrets such as `.env`, and generated folders such as `node_modules/`.

| Command | Does |
| --- | --- |
| `git clone url` | Download a repository with its full history |
| `git pull` | Fetch new commits from the remote and merge them |
| `git push` | Send your new commits to the remote |

The daily cycle:

```
git pull
git switch -c my-feature
   ...edit...
git status
git add .
git commit -m "Describe the change"
git switch main
git merge my-feature
git push
```

Q: Why pull before you start working?
A: You build on the latest version, which avoids conflicts and rejected pushes later.

Q: You committed a file containing a password by mistake. Is adding it to `.gitignore` enough?
A: No. `.gitignore` only affects untracked files, and the password is still in the history. Change the password, and remove the file from tracking.
