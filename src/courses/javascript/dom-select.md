# Changing the page

When a browser loads HTML it builds a tree of objects called the **DOM** (Document Object Model). JavaScript can read and change that tree, and the page updates immediately.

First, find an element with a CSS selector:

```js
const title = document.querySelector("h1");
const price = document.querySelector("#price");   // by id
const note = document.querySelector(".note");     // by class
```

Then change it:

```js
title.textContent = "New heading";
note.classList.add("highlight");
```

- `textContent` is the text inside the element.
- `classList.add()` and `classList.remove()` switch CSS classes on and off, which is how JavaScript changes the look of things.

The page loads the script through `<script src="script.js"></script>`. Open the `index.html` tab: the tag sits at the *end* of the `<body>`, so the elements exist before the script runs.

## Task

The page has an empty paragraph with `id="status"`. In `script.js`:

1. Select the `#status` element.
2. Set its text to exactly **We are open!**
3. Add the class `open` to it, which the stylesheet turns green.

## Hints

- `const sign = document.querySelector("#status");` Don't forget the `#`.
- `sign.textContent = "We are open!";`
- `sign.classList.add("open");` Here the class name has no dot, because it's a name, not a selector.

## Given: index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Brewline</title>
    <style>
      body { font-family: Verdana, sans-serif; background: #fff8f0; }
      .open { color: #1f8a4c; font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>Brewline</h1>
    <p id="status"></p>

    <script src="script.js"></script>
  </body>
</html>
```

## Starter: script.js

```js
// Select the #status paragraph, then change its text and class

```

## Solution: script.js

```js
// Select the #status paragraph, then change its text and class
const sign = document.querySelector("#status");
sign.textContent = "We are open!";
sign.classList.add("open");
```
