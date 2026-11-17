# Hello from the server

HTML, CSS and JavaScript all run in the visitor's browser: the **front end**. **PHP** runs somewhere else, on the **server**, before the page is ever sent. That is the **back end**, where a site checks passwords, calculates prices and talks to the database.

A PHP file starts with `<?php`. Everything after it is PHP code:

```php
<?php
echo "Good morning!";
```

- `echo` outputs text. On a real server that output becomes the page the browser receives.
- Text is a **string**, written in quotes.
- Every statement ends with a semicolon. Forgetting one is the most common PHP error there is.
- Lines starting with `//` are comments.

> The PHP in this course is real PHP 8.4, running inside your browser. The first run downloads it (about 20 MB), so give it a moment.

## Task

Print exactly this line:

```
Hello from the server!
```

## Hints

- The command is `echo`, followed by the text in quotes.
- `echo "Hello from the server!";` Don't forget the semicolon.

## Starter

```php
<?php
// Print the greeting below

```

## Solution

```php
<?php
// Print the greeting below
echo "Hello from the server!";
```
