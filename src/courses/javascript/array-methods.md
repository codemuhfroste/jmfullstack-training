# filter and map

Real data is usually an **array of objects**:

```js
const menu = [
  { name: "Espresso", price: 90 },
  { name: "Latte", price: 120 },
];
```

Loops work on these, but arrays come with methods that say what you mean more directly. Both take a function and call it once per item.

`filter` keeps the items for which the function returns true:

```js
const cheap = menu.filter((item) => item.price < 100);
// [{ name: "Espresso", price: 90 }]
```

`map` transforms every item into something else:

```js
const names = menu.map((item) => item.name);
// ["Espresso", "Latte"]
```

`(item) => item.price < 100` is an **arrow function**: a short way to write a function. The part after `=>` is what it returns.

Both methods return a *new* array, so they can be chained: `menu.filter(…).map(…)`.

## Task

Complete `namesFrom(menu, minPrice)`. It returns the **names** of all items whose price is `minPrice` or more, in their original order.

```js
namesFrom(menu, 100)   // ["Latte"]
```

## Hints

- Do it in two steps: first `filter` the items, then `map` them to their names.
- The filter condition is `item.price >= minPrice`.
- `return menu.filter((item) => item.price >= minPrice).map((item) => item.name);`

## Starter

```js
function namesFrom(menu, minPrice) {
  // Keep the items that cost minPrice or more, then return their names

}
```

## Solution

```js
function namesFrom(menu, minPrice) {
  return menu
    .filter((item) => item.price >= minPrice)
    .map((item) => item.name);
}
```
