# Variables

A **variable** is a name for a value, so you can use the value again later.

```js
const shop = "Brewline";
let cups = 2;
cups = cups + 1;      // cups is now 3
```

- `const` declares a name whose value never changes.
- `let` declares a name you intend to change later.

Use `const` by default, and `let` only when you need to reassign.

To build a string out of variables, use a **template literal**: a string written with backticks, where `${…}` inserts a value.

```js
const total = cups * 120;
console.log(`${cups} cups cost ${total}`);
```

Anything inside `${…}` is evaluated first, so `${cups * 120}` works too. The arithmetic operators are `+`, `-`, `*` and `/`.

## Task

The starter code stores an order in three variables.

1. Create a variable `total` that holds `price` multiplied by `qty`.
2. Use a template literal to print exactly:

```
Latte x2 = 240
```

Build the line from the variables. Don't type the numbers into the string.

## Hints

- `const total = price * qty;`
- Template literals use backticks, not quotes. The key is usually to the left of the `1` key.
- ``console.log(`${drink} x${qty} = ${total}`);`` The letter `x` is plain text, directly followed by `${qty}`.

## Starter

```js
const drink = "Latte";
const price = 120;
const qty = 2;

// Calculate the total, then print the order line

```

## Solution

```js
const drink = "Latte";
const price = 120;
const qty = 2;

// Calculate the total, then print the order line
const total = price * qty;
console.log(`${drink} x${qty} = ${total}`);
```
