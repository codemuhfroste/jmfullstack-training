# Objects

An array holds values by position. An **object** holds values by *name*. Each name is called a **property**:

```js
const drink = { name: "Latte", price: 120 };

drink.name;         // "Latte"
drink.price = 125;  // change a property
drink.hot = true;   // add a new one
```

When the property name is stored in a variable, use square brackets instead of a dot:

```js
const counts = {};
const key = "latte";

counts[key] = 1;       // { latte: 1 }
counts[key] += 1;      // { latte: 2 }
```

Reading a property that doesn't exist gives `undefined`. That makes counting easy to get wrong: `undefined + 1` is not a number. Check first, or fall back to zero:

```js
counts[key] = (counts[key] || 0) + 1;
```

## Task

Complete `countItems(names)`. It receives an array of drink names and returns an object that says how many times each name appears.

```js
countItems(["latte", "mocha", "latte"])
// { latte: 2, mocha: 1 }
```

An empty array returns an empty object.

## Hints

- Start with `const counts = {};`, loop over `names`, and `return counts;` at the end.
- Inside the loop, the property to update is `counts[name]`.
- `counts[name] = (counts[name] || 0) + 1;` handles both the first time and every time after.

## Starter

```js
function countItems(names) {
  const counts = {};

  // Count each name

  return counts;
}
```

## Solution

```js
function countItems(names) {
  const counts = {};

  for (const name of names) {
    counts[name] = (counts[name] || 0) + 1;
  }

  return counts;
}
```
