# Arrays and loops

An **array** is an ordered list of values, written in square brackets:

```js
const orders = [2, 1, 3];

orders[0];       // 2   (positions start at 0)
orders.length;   // 3
```

A **loop** repeats code. The easiest way to visit every item of an array is `for…of`:

```js
for (const cups of orders) {
  console.log(cups);
}
```

On each pass, `cups` holds the next value: first `2`, then `1`, then `3`.

A very common pattern is to keep a running total in a `let` variable that starts at zero:

```js
let sum = 0;
for (const cups of orders) {
  sum += cups;       // short for: sum = sum + cups
}
```

## Task

Each number in `orders` is how many cups one customer bought. Complete `totalCups(orders)` so it returns the total number of cups.

For an empty array it should return `0`.

## Hints

- Create `let total = 0;` before the loop and `return total;` after it.
- Inside the loop, add the current value: `total += cups;`
- The `return` must come *after* the loop's closing brace. Inside the loop, it would stop at the first item.

## Starter

```js
function totalCups(orders) {
  // Add up every number in the array

}
```

## Solution

```js
function totalCups(orders) {
  let total = 0;
  for (const cups of orders) {
    total += cups;
  }
  return total;
}
```
