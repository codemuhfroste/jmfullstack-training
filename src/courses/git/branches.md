# Branches

Suppose the site works, and you want to try a new order form. If you commit half-finished work straight into the main history, the site is broken until you finish. A **branch** solves that: it is a separate line of commits where you can work without touching the main one.

Every repository starts with one branch, usually called `main`. You create others as you need them:

```
git branch                 list branches (the current one is marked with *)
git switch -c order-form   create a branch called order-form and move onto it
git switch main            move back to main
```

Commits you make go onto the branch you are currently on. `main` stays exactly as it was.

When the work is finished, you **merge** it: bring the commits from the other branch into the current one.

```
git switch main
git merge order-form
```

Note the direction. You first switch to the branch that should *receive* the changes, then name the branch to bring in.

If both branches changed the same lines of the same file, Git cannot decide which version is right. It stops and reports a **merge conflict**. You open the file, choose what the result should be, then stage and commit it.

Branches are cheap. Make one for every feature or fix, and delete it once it is merged.

## Hints

- `git switch` moves between branches. Adding `-c` means "create it first".
- Before merging, ask: which branch should end up with the changes? Be on that one.
- A conflict is not an error in Git. It is Git asking you a question it cannot answer itself.

## Quiz

? Why create a branch?
- To make the repository smaller
- To work on something without affecting the main line of work *
- To upload the project to GitHub
- To delete old commits

? Type the command that creates a new branch called order-form and switches to it.
= git switch -c order-form
= git checkout -b order-form

? You are on `main` and want to bring in the finished work from `order-form`. Which command do you run?
- git merge main
- git switch order-form
- git merge order-form *
- git branch order-form

? When does a merge conflict happen?
- When two branches have different names
- When both branches changed the same lines of the same file *
- Whenever you merge more than one commit
- When a commit message is missing
