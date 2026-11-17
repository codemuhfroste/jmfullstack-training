# Async JavaScript reviewer

Talking to a server takes time. This is how JavaScript exchanges data with the back end without freezing the page.

## Data in transit

- **JSON** is text that looks like JavaScript objects and arrays. It is the standard format between front end and back end.
- JSON is stricter than JavaScript: property names in double quotes, no functions, no comments.

```js
const text = JSON.stringify({ name: "Latte", price: 120 });   // value -> text
const drink = JSON.parse(text);                               // text -> value
```

| Function | Direction |
| --- | --- |
| `JSON.stringify(value)` | JavaScript value to JSON text, ready to send |
| `JSON.parse(text)` | JSON text to a JavaScript value you can use |

Q: A server response arrives as `'[{"qty": 2}]'`. Why can't you read `.length` of the items straight away?
A: It is still a string. Parse it with `JSON.parse` first to get a real array.

Q: What happens when `JSON.parse` receives invalid JSON?
A: It throws a SyntaxError, so wrap it in `try` / `catch` when the text comes from outside.

## Waiting for answers

- A **promise** stands for a value that arrives later. It is pending, then fulfilled (with a value) or rejected (with an error).
- `.then(fn)` runs `fn` with the value and returns a new promise for whatever `fn` returns.
- `await` pauses an `async` function until a promise is fulfilled and gives you its value.
- An `async` function always returns a promise.
- A rejected promise acts like a thrown error under `await`. Catch it with `try` / `catch`.

```js
function label(name) {
  return fetchPrice(name).then((price) => `${name}: ${price}`);
}

async function safePrice(name) {
  try {
    return await fetchPrice(name);
  } catch (error) {
    return -1;
  }
}
```

| With `.then()` | With `async` / `await` |
| --- | --- |
| `p.then((v) => use(v))` | `const v = await p; use(v);` |
| `p.catch((e) => handle(e))` | `try { await p } catch (e) { handle(e) }` |

Q: What does an `async` function return if you write `return 5;`?
A: A promise that resolves to 5. The caller needs `await` or `.then()` to get the number.

Q: You forgot `await` and logged the result. What do you see?
A: A pending Promise object instead of the value.

Q: Why should network code always handle rejection?
A: Requests fail for reasons outside your control. An unhandled rejection leaves the page stuck with no message for the user.

## Many at once

- Awaiting inside a loop runs requests one after another. The total time is the sum.
- `Promise.all(array)` waits for every promise in an array and resolves to an array of results in the same order. The total time is that of the slowest.
- If any one promise is rejected, `Promise.all` is rejected.

```js
const prices = await Promise.all(names.map((name) => fetchPrice(name)));
```

Q: When is it wrong to use `Promise.all`?
A: When one request needs the result of another. Those have to run in sequence.

Q: `names.map((name) => fetchPrice(name))` without `Promise.all` gives you what?
A: An array of promises, not an array of prices.
