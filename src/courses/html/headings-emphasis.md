# Headings and emphasis

Headings give a page an outline, like the chapters and sections of a book:

```html
<h1>Brewline</h1>
<h2>Today's special</h2>
<h3>Why we love it</h3>
```

Use **one** `<h1>` for the page's main title, `<h2>` for its sections, and `<h3>` for parts of a section. Pick the level by meaning, not by how big it looks. Size is a job for CSS.

Inside a paragraph you can mark words that matter:

```html
<p>Our cold brew steeps for <strong>18 hours</strong>. It is <em>very</em> smooth.</p>
```

- `<strong>` means strong importance. Browsers show it in bold.
- `<em>` means stress emphasis. Browsers show it in italics.

## Task

Add a section about today's special to the page:

1. Keep the single `<h1>`.
2. Below it, add an `<h2>` that says **Today's special**.
3. Add a paragraph about the drink. Inside it, wrap one phrase in `<strong>` and another in `<em>`.

## Hints

- The `<h2>` goes after the first paragraph, still inside `<body>`.
- `<strong>` and `<em>` go *inside* the `<p>`, around just the words you want to stand out.
- For example: `<p>The <strong>caramel latte</strong> is <em>half price</em> today.</p>`

## Starter

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Brewline</title>
  </head>
  <body>
    <h1>Brewline</h1>
    <p>Fresh coffee from a tiny cart on wheels.</p>

    <!-- Add the "Today's special" section here -->

  </body>
</html>
```

## Solution

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Brewline</title>
  </head>
  <body>
    <h1>Brewline</h1>
    <p>Fresh coffee from a tiny cart on wheels.</p>

    <h2>Today's special</h2>
    <p>The <strong>caramel latte</strong> is <em>half price</em> until noon.</p>
  </body>
</html>
```
