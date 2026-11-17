# Promises

Asking a server for something takes time, and JavaScript doesn't wait around. A function that needs time returns immediately with a **promise**: an object that stands for a value that will arrive later.

A promise is in one of three states: **pending** (still working), **fulfilled** (it has a value) or **rejected** (it failed).

You say what should happen with the value by attaching a function with `.then()`:

```js
fetchPrice("Latte").then((price) => {
  console.log(price);   // 120, a moment later
});
```

`.then()` itself returns a new promise, for whatever your function returns. That lets you transform a result and pass it on:

```js
function doubled(name) {
  return fetchPrice(name).then((price) => price * 2);
}
```

Note the `return`: the caller needs the promise in order to wait for it.

Open the `helpers.js` tab. It contains `fetchPrice(name)`, which stands in for a real server request: it answers after a short delay, and rejects if the item doesn't exist.

## Task

Complete `priceLabel(name)`. It must return a **promise** that resolves to the text `Name: price`.

```js
priceLabel("Latte")   // a promise for "Latte: 120"
```

## Hints

- Call `fetchPrice(name)` and chain `.then(...)` onto it.
- Inside `.then`, build the text with a template literal: `${name}: ${price}`.
- Return the whole chain: ``return fetchPrice(name).then((price) => `${name}: ${price}`);``

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
function priceLabel(name) {
  // Return a promise for the text "Name: price"

}
```

## Solution: script.js

```js
function priceLabel(name) {
  return fetchPrice(name).then((price) => `${name}: ${price}`);
}
```
