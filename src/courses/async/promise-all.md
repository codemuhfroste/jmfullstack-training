# Challenge: many requests at once

Awaiting requests one after another is simple, but slow: three requests of one second each take three seconds. When the requests don't depend on each other, start them all together and wait for the whole group.

`Promise.all` takes an array of promises and returns one promise for an array of all their results, in the same order:

```js
const [a, b] = await Promise.all([fetchPrice("Latte"), fetchPrice("Mocha")]);
// a = 120, b = 135, and it took as long as the slowest one
```

Combined with `map`, it turns a list of names into a list of results:

```js
const prices = await Promise.all(names.map((name) => fetchPrice(name)));
```

`names.map(…)` starts every request immediately and gives back an array of promises. `Promise.all` waits for all of them. If any one is rejected, the whole group is rejected.

## Task

Complete the `async` function `menuReport(names)`. Fetch the prices of all the names **in parallel** with `Promise.all`, then return an object with:

- `total`: the sum of the prices
- `priciest`: the name of the most expensive item

```js
await menuReport(["Espresso", "Mocha", "Latte"])
// { total: 345, priciest: "Mocha" }
```

`names` always contains at least one item.

## Hints

- Get all prices first: `const prices = await Promise.all(names.map((name) => fetchPrice(name)));`
- `prices[i]` belongs to `names[i]`. Loop with an index so you can use both.
- Track the highest price seen so far and the name that goes with it.

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
async function menuReport(names) {
  // Fetch all prices in parallel, then build { total, priciest }

}
```

## Solution: script.js

```js
async function menuReport(names) {
  const prices = await Promise.all(names.map((name) => fetchPrice(name)));

  let total = 0;
  let priciest = names[0];
  let highest = prices[0];

  for (let i = 0; i < names.length; i++) {
    total += prices[i];
    if (prices[i] > highest) {
      highest = prices[i];
      priciest = names[i];
    }
  }

  return { total, priciest };
}
```
