# Reading the history

A history is only useful if you can read it. Two commands do most of the work.

`git log` lists the commits, newest first:

```
git log               full details of every commit
git log --oneline     one short line per commit
```

Each commit has a unique id called a **hash**, a long string like `3f2a9c1`. You use the first few characters to refer to a specific commit.

`git diff` shows exactly which lines changed:

```
git diff              changes in the working tree that are not staged yet
git diff --staged     changes that are staged for the next commit
```

Lines that were added are marked with `+`, lines that were removed with `-`. Reading the diff before you commit is the cheapest code review there is: you catch leftover debug lines and accidental edits before they enter the history.

To throw away the uncommitted changes in a file and return it to its last committed state:

```
git restore style.css
```

Be careful with that one. Changes that were never committed cannot be recovered.

## Hints

- One command lists commits, the other shows changed lines. Their names say which is which.
- The compact form of the log is a flag that literally says "one line".
- In a diff, a plus sign means the line is new.

## Quiz

? Which command shows the list of commits?
- git status
- git log *
- git diff
- git list

? In the output of `git diff`, what does a line starting with `+` mean?
- The line was removed
- The line is unchanged
- The line was added *
- The line has an error

? Type the command that shows the history with one line per commit.
= git log --oneline

? You made a mess of `style.css` and want it back the way it was in the last commit. Which command does that?
- git add style.css
- git restore style.css *
- git log style.css
- git commit style.css
