# JavaScript reviewer

JavaScript is the behaviour layer: the language that runs in the browser and makes pages react.

## Talking to the computer

- `console.log(value)` prints to the console.
- `const` declares a name that is never reassigned. `let` declares one that is. Use `const` by default.
- A **template literal** uses backticks and inserts values with `${…}`.
- A **function** takes parameters and hands back a result with `return`.

```js
const price = 120;
let qty = 2;
console.log(`Total: ${price * qty}`);

function sizeLabel(ml) {
  if (ml < 300) {
    return "small";
  } else if (ml < 450) {
    return "medium";
  }
  return "large";
}
```

| Operator | Meaning |
| --- | --- |
| `+` `-` `*` `/` `%` | Arithmetic (`%` is the remainder) |
| `===` and `!==` | Equal and not equal (always use three characters) |
| `<` `>` `<=` `>=` | Comparisons |
| `&&` | And: both sides must be true |
| `!` | Not: flips true and false |

Loops repeat code. `for…of` visits every item of an array:

```js
let total = 0;
for (const cups of [2, 1, 3]) {
  total += cups;
}
```

Q: What happens if you reassign a `const`?
A: JavaScript throws a TypeError. Use `let` for values that change.

Q: In an `if` / `else if` chain, which branch runs?
A: The first one whose condition is true. The rest are skipped.

Q: Why must `return total;` come after the loop and not inside it?
A: `return` ends the function immediately, so inside the loop it would stop after the first item.

## Working with data

- An **array** is an ordered list: `[90, 120]`. Positions start at 0, and `.length` gives the count.
- An **object** holds named values: `{ name: "Latte", price: 120 }`.
- Read a property with a dot (`drink.name`), or with brackets when the name is in a variable (`counts[key]`).
- A missing property is `undefined`. `(counts[key] || 0) + 1` falls back to zero.

```js
const menu = [
  { name: "Espresso", price: 90 },
  { name: "Latte", price: 120 },
];

const names = menu
  .filter((item) => item.price >= 100)
  .map((item) => item.name);          // ["Latte"]
```

| Method | Returns |
| --- | --- |
| `filter(fn)` | A new array with the items for which `fn` returns true |
| `map(fn)` | A new array with every item transformed by `fn` |
| `find(fn)` | The first matching item, or `undefined` |
| `includes(value)` | `true` if the array contains the value |
| `push(value)` | Adds to the end of the array (changes it) |

An **arrow function** `(item) => item.price` is a short function whose result is the expression after `=>`.

Q: What is the difference between `map` and `filter`?
A: `filter` keeps some items unchanged and drops the others. `map` keeps every item but changes each one.

Q: When do you need `object[key]` instead of `object.key`?
A: When the property name is stored in a variable, or isn't a valid identifier.

Q: Do `map` and `filter` change the original array?
A: No. They return a new array, which is why they can be chained.

## Bringing pages to life

- The **DOM** is the browser's live tree of the page. Changing it changes what is on screen.
- Put `<script src="script.js"></script>` at the end of `<body>` so the elements exist before the script runs.
- An **event** is something that happens, such as a click. `addEventListener` runs your function each time it does.

```js
const button = document.querySelector("#add");
const count = document.querySelector("#count");
let cups = 0;

button.addEventListener("click", () => {
  cups += 1;
  count.textContent = cups;
});
```

| Code | Does |
| --- | --- |
| `document.querySelector(css)` | Finds the first element matching a CSS selector |
| `element.textContent = "…"` | Sets the text inside an element |
| `element.classList.add("x")` | Adds a CSS class (`remove`, `toggle` also exist) |
| `document.createElement("li")` | Creates a new element, not yet on the page |
| `parent.append(child)` | Puts an element on the page inside `parent` |

Q: Why keep the counter variable outside the event listener?
A: A variable declared inside would be created fresh, at zero, on every click.

Q: Why build a list from an array instead of typing the `<li>` elements?
A: The data lives in one place. When it changes, the page follows without anyone editing HTML.

Q: `document.querySelector("status")` returns `null`. What is wrong?
A: The selector has no `#`. Without it, it looks for a `<status>` element instead of the element with that id.
