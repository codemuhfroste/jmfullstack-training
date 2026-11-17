# When things go wrong

Networks fail. Servers are down, items don't exist, phones lose signal. A promise reports failure by being **rejected**, and code that ignores that will crash at the worst moment.

With `await`, a rejected promise behaves like a thrown error, so you handle it with `try` and `catch`:

```js
async function loadPrice(name) {
  try {
    const price = await fetchPrice(name);
    return price;
  } catch (error) {
    console.log("Could not load:", error.message);
    return null;
  }
}
```

- The code in `try` runs normally. If anything in it fails, JavaScript jumps straight to `catch`.
- `error` is the reason for the failure. Its `message` property holds the text.
- After `catch`, the function carries on, so you can return a sensible fallback instead of crashing.

With `.then()` chains, the equivalent is `.catch((error) => …)` at the end.

## Task

`fetchPrice` rejects when asked for an item that isn't on the menu.

Complete the `async` function `safePrice(name)`. It returns the item's price, or `-1` if the lookup fails.

```js
await safePrice("Latte")   // 120
await safePrice("Tea")     // -1
```

## Hints

- Wrap the `await` in `try { … } catch (error) { … }`.
- In the `try` block, return the awaited price. In the `catch` block, return `-1`.

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
async function safePrice(name) {
  // Return the price, or -1 if fetchPrice fails

}
```

## Solution: script.js

```js
async function safePrice(name) {
  try {
    return await fetchPrice(name);
  } catch (error) {
    return -1;
  }
}
```
