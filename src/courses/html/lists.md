# Lists

HTML has two everyday kinds of list. Both wrap a series of `<li>` (list item) elements:

```html
<ul>
  <li>Milk</li>
  <li>Sugar</li>
</ul>

<ol>
  <li>Boil the water</li>
  <li>Pour slowly</li>
</ol>
```

- `<ul>` is an **unordered list**: the order doesn't matter, so the browser draws bullets.
- `<ol>` is an **ordered list**: the order matters, so the browser numbers the items for you.

Only `<li>` elements belong directly inside `<ul>` and `<ol>`. Everything else goes inside an `<li>`.

## Task

Give the page a menu and ordering instructions:

1. Under the **Menu** heading, add a `<ul>` with at least **three** drinks.
2. Under the **How to order** heading, add an `<ol>` with at least **three** steps.

## Hints

- Each drink is its own item: `<li>Espresso</li>`.
- A menu has no particular order, so it's a `<ul>`. Steps happen in sequence, so they're an `<ol>`.
- You don't type the numbers in an `<ol>`. The browser adds them.

## Starter

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Brewline</title>
  </head>
  <body>
    <h1>Brewline</h1>

    <h2>Menu</h2>
    <!-- An unordered list of drinks -->

    <h2>How to order</h2>
    <!-- An ordered list of steps -->

  </body>
</html>
```

## Solution

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Brewline</title>
  </head>
  <body>
    <h1>Brewline</h1>

    <h2>Menu</h2>
    <ul>
      <li>Espresso</li>
      <li>Latte</li>
      <li>Cold brew</li>
    </ul>

    <h2>How to order</h2>
    <ol>
      <li>Find the cart</li>
      <li>Pick a drink</li>
      <li>Pay and enjoy</li>
    </ol>
  </body>
</html>
```
