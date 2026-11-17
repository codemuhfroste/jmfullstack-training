# Functions and decisions

A **function** is a named, reusable piece of code. It takes inputs (**parameters**) and hands a result back with `return`:

```js
function double(n) {
  return n * 2;
}

double(4); // 8
```

Code makes decisions with `if`. The condition in parentheses is either true or false:

```js
function describe(temperature) {
  if (temperature < 15) {
    return "cold";
  } else if (temperature < 25) {
    return "mild";
  } else {
    return "hot";
  }
}
```

The conditions are tried from top to bottom, and the first one that is true wins. `else` catches everything left over.

Comparison operators: `<`, `>`, `<=`, `>=`, `===` (equal) and `!==` (not equal). Always use three equals signs. `==` has surprising rules.

From this lesson on, your code is graded by calling your function with several inputs and comparing what it returns.

## Task

Brewline sells three cup sizes. Complete `sizeLabel(ml)` so it returns:

- `"small"` for less than 300 ml
- `"medium"` for 300 up to (but not including) 450 ml
- `"large"` for 450 ml or more

## Hints

- Start with the smallest case: `if (ml < 300) { return "small"; }`
- Because the conditions are tried in order, the second one only needs `ml < 450`. Anything below 300 was already handled.
- The last case needs no condition. A plain `else`, or just a final `return "large";`, covers it.

## Starter

```js
function sizeLabel(ml) {
  // Return "small", "medium" or "large"

}
```

## Solution

```js
function sizeLabel(ml) {
  if (ml < 300) {
    return "small";
  } else if (ml < 450) {
    return "medium";
  } else {
    return "large";
  }
}
```
