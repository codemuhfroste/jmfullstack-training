# Remotes

So far everything has lived on your own computer. A **remote** is a copy of the repository somewhere else, usually on a hosting service such as GitHub. It gives you a backup, and it is how several people work on one project.

To get your own copy of a repository that already exists online:

```
git clone https://github.com/brewline/website.git
```

That downloads the whole project with its full history. The place it came from is remembered under the name `origin`.

After that, two commands keep the copies in step:

```
git push     send your new commits to the remote
git pull     fetch new commits from the remote and merge them into your branch
```

Nothing is shared automatically. A commit exists only on your machine until you push it, and you don't see your teammates' work until you pull.

The everyday rhythm in a team is:

1. `git pull` to start from the latest version.
2. Make your changes, `git add`, `git commit`.
3. `git push` to share them.

If someone else pushed while you were working, Git refuses your push and asks you to pull first. That is deliberate: it makes sure nobody's work is overwritten.

## Hints

- Think of the direction. Pushing sends away from you, pulling brings towards you.
- `origin` is only a nickname for the address the repository was cloned from.
- A rejected push is fixed by getting the newer commits first.

## Quiz

? What is a remote?
- A branch that has been deleted
- A copy of the repository hosted somewhere else, such as on GitHub *
- A commit that has not been pushed
- A backup of a single file

? Type the command that sends your new commits to the remote.
= git push
= git push origin main
= /^git push( origin( \S+)?)?$/

? Your teammate pushed new commits this morning. Which command brings them into your local branch?
- git push
- git clone
- git pull *
- git add

? Git rejects your push because the remote has commits you don't have. What should you do?
- Delete the repository and clone it again
- Run git pull first, then push again *
- Run git init
- Change the commit message
