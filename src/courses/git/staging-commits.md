# Staging and committing

Saving a snapshot takes two steps in Git, and the reason is control. You often change several things at once, but want to record them as separate, tidy commits.

1. **Stage** the changes you want in the next snapshot.
2. **Commit** what is staged.

```
git add index.html           stage one file
git add .                    stage everything that changed in this folder
git commit -m "Add menu page"
```

The **staging area** is the waiting room between your working tree and the history. `git add` moves changes into it, and `git commit` turns its contents into a commit.

So a file can be in one of three places:

| State | Meaning |
| --- | --- |
| Modified | Changed on disk, not yet staged |
| Staged | Marked to go into the next commit |
| Committed | Safely stored in the history |

The text after `-m` is the **commit message**. Write what the change does, in a short sentence: `Fix price of espresso`, not `stuff` or `asdf`. Six months from now, the messages are how you find things.

Commit small and often. A commit that does one thing is easy to understand and easy to undo.

## Hints

- `git add` does not save anything to the history. It only prepares.
- The dot in `git add .` means "the current folder and everything in it".
- A commit needs a message. The flag for giving it on the command line is `-m`, followed by the text in quotes.

## Quiz

? What does `git add` do?
- It creates a new file
- It saves a snapshot to the history
- It stages changes so they are included in the next commit *
- It downloads changes from GitHub

? You edited `style.css` but have not run any Git command yet. What state is the file in?
- Modified *
- Staged
- Committed

? Type the command that stages every changed file in the current folder.
= git add .
= git add -A
= git add --all

? Type the command that commits the staged changes with the message Add menu page
= git commit -m "Add menu page"
= /^git commit -m ['"]add menu page['"]$/
