# Reacting to clicks

So far your code has run once, top to bottom. Interactive pages run code *when something happens*: a click, a key press, a form being sent. Those happenings are called **events**.

You subscribe to an event with `addEventListener`. It takes the event's name and a function to call each time it happens:

```js
const button = document.querySelector("#hello");

button.addEventListener("click", () => {
  console.log("Clicked!");
});
```

The function is not called now. The browser calls it later, once per click.

To remember something between clicks, keep it in a variable *outside* the function:

```js
let clicks = 0;

button.addEventListener("click", () => {
  clicks += 1;
});
```

## Task

The page has a button with `id="add"` and a `<span id="count">` showing `0`. Make the button count cups:

1. Keep the number of cups in a variable that starts at `0`.
2. When `#add` is clicked, increase it by one and show the new number in `#count`.

Click the button in the preview to test it.

## Hints

- Select both elements first with `document.querySelector`.
- Declare `let cups = 0;` *above* the listener, so it isn't reset on every click.
- Inside the listener: `cups += 1;` then `count.textContent = cups;`

## Given: index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Order | Brewline</title>
    <style>
      body { font-family: Verdana, sans-serif; background: #fff8f0; }
      button { font-size: 16px; padding: 8px 14px; }
    </style>
  </head>
  <body>
    <h1>Your order</h1>
    <p>Cups: <span id="count">0</span></p>
    <button id="add">Add a cup</button>

    <script src="script.js"></script>
  </body>
</html>
```

## Starter: script.js

```js
const addButton = document.querySelector("#add");
const count = document.querySelector("#count");

// Count the clicks and show the number

```

## Solution: script.js

```js
const addButton = document.querySelector("#add");
const count = document.querySelector("#count");

// Count the clicks and show the number
let cups = 0;

addButton.addEventListener("click", () => {
  cups += 1;
  count.textContent = cups;
});
```
