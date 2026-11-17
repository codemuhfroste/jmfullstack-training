# The page skeleton

Browsers are forgiving, so a lone `<h1>` still shows up. A real page, though, has a fixed skeleton around its content:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Text for the browser tab</title>
  </head>
  <body>
    Everything visible goes here.
  </body>
</html>
```

- `<!DOCTYPE html>` tells the browser this is modern HTML. It is always the first line.
- `<html>` wraps the whole page. `lang="en"` is an **attribute**: extra information written inside the opening tag.
- `<head>` holds information *about* the page, such as its `<title>`. Nothing in it is drawn on the page.
- `<body>` holds everything the visitor sees.

Tags placed inside other tags are **nested**. Indent them so the structure is easy to read.

## Task

Turn the loose heading and paragraph into a complete document:

1. Start the file with `<!DOCTYPE html>`.
2. Wrap everything in `<html lang="en">`.
3. Add a `<head>` that contains a `<title>` with the text **Brewline**.
4. Put the existing heading and paragraph inside a `<body>`.

## Hints

- The order is always: doctype, then `<html>`, and inside it first `<head>`, then `<body>`.
- Don't forget the closing tags: `</title>`, `</head>`, `</body>` and `</html>`. A missing `</title>` swallows the rest of the page.
- The `<h1>` and `<p>` that are already there move between `<body>` and `</body>`.

## Starter

```html
<h1>Brewline</h1>
<p>Fresh coffee from a tiny cart on wheels.</p>
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
  </body>
</html>
```
