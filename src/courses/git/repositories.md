# What Git is for

Every project reaches the moment where something that worked yesterday is broken today, and you can't remember what you changed. **Git** is the tool that makes that moment harmless.

Git is a **version control system**. It records snapshots of your project over time, so you can see what changed, when, and why, and go back to any earlier state.

Three words to know:

- A **repository** (or *repo*) is a project folder that Git is tracking. The history lives in a hidden `.git` folder inside it.
- A **commit** is one snapshot of the project, with a message describing the change.
- The **working tree** is the files as they are on your disk right now, including changes you haven't committed yet.

Git is a command-line program. You type commands in a terminal, inside the project folder:

```
git init        turn the current folder into a repository
git status      show what has changed since the last commit
```

`git status` never changes anything. Run it constantly: it tells you where you are and often suggests the next command.

> Git is not GitHub. Git runs on your computer. GitHub is a website that stores copies of Git repositories online, which you'll meet later in this course.

This course is a little different: instead of writing code, you answer questions. Some ask you to type the exact command.

## Hints

- A commit is like a save point in a game: a snapshot you can return to.
- The command to start tracking a folder is short: the word after `git` means "initialise".
- When you are unsure what state a repository is in, there is one command that tells you.

## Quiz

? What does Git do?
- It makes websites load faster
- It records the history of a project so you can review and undo changes *
- It uploads your files to a web server
- It checks your code for bugs

? What is a commit?
- A copy of the project on GitHub
- A file that Git ignores
- A snapshot of the project at one moment, with a message *
- A comment inside your code

? Type the command that turns the current folder into a Git repository.
= git init

? Type the command that shows which files have changed since the last commit.
= git status
