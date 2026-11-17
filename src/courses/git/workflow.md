# Challenge: a day of Git

You know the pieces. This challenge walks through one complete piece of work, the way it happens on a real team.

The task: add opening hours to Brewline's website. The full cycle looks like this:

```
git pull                          start from the latest version
git switch -c opening-hours       do the work on its own branch
   ...edit the files...
git status                        check what changed
git add .
git commit -m "Add opening hours"
git switch main
git merge opening-hours           bring the finished work into main
git push                          share it
```

Some files should never be committed: passwords and API keys, and folders that tools generate, such as `node_modules`. List them in a file called `.gitignore` in the project folder, one pattern per line, and Git will act as if they don't exist:

```
node_modules/
.env
```

Two habits that prevent most Git trouble: run `git status` before every commit, and pull before you start working.

## Hints

- Follow the listing in the lesson from top to bottom. Each question is one step of it.
- Files that must stay out of the repository are listed in a file whose name starts with a dot.
- Merging happens from the branch that receives the changes.

## Quiz

? You sit down to start work on a shared project. What do you run first?
- git push
- git pull *
- git commit
- git merge

? Type the command that creates the branch opening-hours and switches to it.
= git switch -c opening-hours
= git checkout -b opening-hours

? You edited two files. Put these steps in the right order: commit, stage, check status.
- commit, stage, check status
- stage, commit, check status
- check status, stage, commit *
- check status, commit, stage

? Type the command that commits your staged work with the message Add opening hours
= git commit -m "Add opening hours"
= /^git commit -m ['"]add opening hours['"]$/

? Your project has a file `.env` containing a database password. How do you keep it out of the repository?
- Rename it to env.txt
- List it in .gitignore *
- Commit it, then delete it
- Put it on a separate branch

? The work is committed on `opening-hours`. You switch to `main`. Type the command that brings the work into main.
= git merge opening-hours
