# Challenge: build the menu from data

Typing every menu item into the HTML by hand doesn't scale. Real sites keep their content as **data** and let JavaScript build the page from it. Change the data and the page follows.

You can create elements from scratch and attach them to the page:

```js
const list = document.querySelector("#colors");

const item = document.createElement("li");   // a new, detached <li>
item.textContent = "Blue";
list.append(item);                           // now it's on the page
```

Put that in a loop and an array becomes a list:

```js
for (const color of ["Red", "Green"]) {
  const item = document.createElement("li");
  item.textContent = color;
  list.append(item);
}
```

## Task

`script.js` contains Brewline's menu as an array of objects. The page has an empty `<ul id="menu">` and a `<span id="total">`.

1. For each item in `menu`, add an `<li>` to `#menu` with the text `Name: price`, for example `Espresso: 90`.
2. Add up all the prices and show the sum in `#total`.

Calculate the total with code. If the prices in the array change, the page must still be right.

## Hints

- Loop with `for (const item of menu) { … }`. Inside, the text is `${item.name}: ${item.price}` in a template literal.
- Keep a running `let total = 0;` and add `item.price` to it in the same loop.
- After the loop: `document.querySelector("#total").textContent = total;`

## Given: index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Menu | Brewline</title>
    <style>
      body { font-family: Verdana, sans-serif; background: #fff8f0; }
      li { padding: 4px 0; }
    </style>
  </head>
  <body>
    <h1>Menu</h1>
    <ul id="menu"></ul>
    <p>One of everything: <span id="total"></span></p>

    <script src="script.js"></script>
  </body>
</html>
```

## Starter: script.js

```js
const menu = [
  { name: "Espresso", price: 90 },
  { name: "Latte", price: 120 },
  { name: "Mocha", price: 135 },
  { name: "Cold Brew", price: 110 },
];

const list = document.querySelector("#menu");

// Add one <li> per item, and show the sum of the prices in #total

```

## Solution: script.js

```js
const menu = [
  { name: "Espresso", price: 90 },
  { name: "Latte", price: 120 },
  { name: "Mocha", price: 135 },
  { name: "Cold Brew", price: 110 },
];

const list = document.querySelector("#menu");

// Add one <li> per item, and show the sum of the prices in #total
let total = 0;

for (const item of menu) {
  const li = document.createElement("li");
  li.textContent = `${item.name}: ${item.price}`;
  list.append(li);
  total += item.price;
}

document.querySelector("#total").textContent = total;
```
