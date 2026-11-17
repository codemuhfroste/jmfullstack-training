# async and await

Chains of `.then()` get hard to read. `async` and `await` let you write the same thing as if it were ordinary, top-to-bottom code.

```js
async function showPrice(name) {
  const price = await fetchPrice(name);
  console.log(price);
}
```

- `await` pauses the function until the promise is fulfilled, then hands you its value.
- `await` only works inside a function marked `async`.
- An `async` function always returns a promise. Whatever you `return` becomes the value that promise resolves to.

Because it reads like normal code, loops work as you'd expect:

```js
async function printAll(names) {
  for (const name of names) {
    const price = await fetchPrice(name);
    console.log(name, price);
  }
}
```

Each `await` waits for one request to finish before the next begins.

## Task

Complete the `async` function `orderTotal(names)`. It receives an array of item names, looks up each price with `fetchPrice`, and returns the sum.

```js
await orderTotal(["Latte", "Mocha"])   // 255
```

An empty array gives `0`.

## Hints

- Keep a running `let total = 0;` and loop over `names` with `for…of`.
- Inside the loop: `total += await fetchPrice(name);`
- `return total;` after the loop. The `async` keyword wraps it in a promise for you.

## Given: helpers.js

```js
const PRICES = { Espresso: 90, Latte: 120, Mocha: 135, "Cold Brew": 110 };

function fetchPrice(name) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (name in PRICES) resolve(PRICES[name]);
      else reject(new Error("No such item: " + name));
    }, 20);
  });
}
```

## Starter: script.js

```js
async function orderTotal(names) {
  // Look up every price and return the sum

}
```

## Solution: script.js

```js
async function orderTotal(names) {
  let total = 0;
  for (const name of names) {
    total += await fetchPrice(name);
  }
  return total;
}
```
