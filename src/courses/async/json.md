# JSON: data as text

The front end and the back end are separate programs, often on separate computers. To exchange data they need a format both understand. Almost everywhere, that format is **JSON** (JavaScript Object Notation).

JSON looks like JavaScript objects and arrays, written as plain text:

```
[{"name": "Latte", "price": 120, "qty": 2}]
```

JavaScript converts in both directions:

```js
const text = JSON.stringify({ name: "Latte", price: 120 });
// '{"name":"Latte","price":120}'   (a string)

const drink = JSON.parse(text);
drink.price;   // 120                (a real object again)
```

- `JSON.stringify(value)` turns a value into JSON text, ready to send.
- `JSON.parse(text)` turns JSON text back into a value you can work with.

JSON is stricter than JavaScript: property names need double quotes, and it cannot hold functions.

## Task

An order arrives from the server as JSON text: an array of items, each with a `price` and a `qty`.

Complete `orderTotal(json)`. Parse the text, then return the sum of `price * qty` over all items.

```js
orderTotal('[{"name":"Latte","price":120,"qty":2}]')   // 240
```

## Hints

- The parameter is a string. Turn it into an array first: `const items = JSON.parse(json);`
- Then it's the running-total loop you already know: start at `0` and add `item.price * item.qty` for each item.

## Starter

```js
function orderTotal(json) {
  // Parse the JSON text, then add up price * qty

}
```

## Solution

```js
function orderTotal(json) {
  const items = JSON.parse(json);
  let total = 0;
  for (const item of items) {
    total += item.price * item.qty;
  }
  return total;
}
```
