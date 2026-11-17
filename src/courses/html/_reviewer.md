# HTML reviewer

HTML describes what each part of a page *is*. Tags wrap content to give it meaning; how it looks is CSS's job.

## Your first page

- An **element** is an opening tag, content, and a closing tag: `<p>Hello</p>`.
- An **attribute** adds information inside the opening tag: `<html lang="en">`.
- Elements placed inside other elements are **nested**. Close them in the reverse order you opened them.
- Use one `<h1>` per page. Choose heading levels by meaning, never by size.

Every page has the same skeleton:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Shown in the browser tab</title>
  </head>
  <body>
    Everything visible goes here.
  </body>
</html>
```

| Tag | Meaning |
| --- | --- |
| `<h1>` to `<h6>` | Headings, from most to least important |
| `<p>` | Paragraph |
| `<strong>` | Strong importance (shown bold) |
| `<em>` | Stress emphasis (shown italic) |
| `<!-- text -->` | Comment, ignored by the browser |

Q: What is the difference between `<head>` and `<body>`?
A: `<head>` holds information about the page, such as its title, and nothing in it is drawn. `<body>` holds everything the visitor sees.

Q: Why is `<!DOCTYPE html>` the first line?
A: It tells the browser to treat the file as modern HTML. Without it, browsers fall back to an old compatibility mode.

Q: A forgotten `</title>` makes the page appear blank. Why?
A: The browser keeps reading everything after it as part of the title, so none of the content reaches the body.

## Real content

- `<ul>` is a list where order doesn't matter (bullets). `<ol>` is a list where it does (numbers). Both contain only `<li>` items.
- A link is `<a href="…">`. A file name links within your site; `https://…` links elsewhere; `target="_blank"` opens a new tab.
- `<img>` has no closing tag. Always write an `alt` text describing the image.
- **Semantic** elements name the regions of a page, which helps search engines, screen readers and your own CSS.

```html
<img src="img/cup.svg" alt="A steaming coffee cup">
<a href="menu.html">See the menu</a>
```

| Tag | Region |
| --- | --- |
| `<header>` | Introduction: site name, navigation |
| `<nav>` | The main links for getting around |
| `<main>` | The content unique to this page (once per page) |
| `<section>` | A themed group of content, usually with a heading |
| `<footer>` | Closing information: hours, contact, copyright |

Q: When do you choose `<ol>` over `<ul>`?
A: When the order carries meaning, such as steps in instructions or a ranking.

Q: What is the `alt` attribute for?
A: It describes the image in words. Screen readers read it aloud, and it is shown if the image cannot load.

Q: Why use `<nav>` when a `<div>` looks the same?
A: The name tells browsers, search engines and assistive tools what the region is for. A `<div>` says nothing.

## Asking for input

- A `<form>` wraps the fields a visitor fills in.
- `name` is the key the value is sent under. The server reads it with that name.
- A `<label for="x">` belongs to the field with `id="x"`. Clicking the label focuses the field.
- A `<button type="submit">` sends the form.

```html
<form>
  <label for="qty">How many?</label>
  <input type="number" id="qty" name="qty" min="1" value="1">

  <label for="drink">Drink</label>
  <select id="drink" name="drink">
    <option>Latte</option>
    <option>Mocha</option>
  </select>

  <button type="submit">Order</button>
</form>
```

| Input type | Accepts |
| --- | --- |
| `text` | Any single line of text |
| `number` | Numbers; limit with `min` and `max` |
| `email` | Text that looks like an email address |
| `password` | Text, hidden as it is typed |
| `checkbox` | On or off |

Q: What is the difference between `id` and `name` on an input?
A: `id` identifies the element on the page, for labels, CSS and JavaScript. `name` is the key under which its value is sent to the server.

Q: Why should every field have a label?
A: It tells everyone what to enter, it is read out by screen readers, and it makes the clickable area bigger.
