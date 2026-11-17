# Styling text

Most of a page is text, so a few text properties go a long way:

```css
body {
  font-family: Georgia, serif;
  line-height: 1.5;
}

h1 {
  font-size: 32px;
  text-align: center;
}
```

- `font-family` takes a list. The browser uses the first font the visitor has, so always end with a generic fallback such as `serif` or `sans-serif`.
- `font-size` sets the size. `px` (pixels) is the simplest unit to start with.
- `line-height` is the space between lines. A plain number multiplies the font size, so `1.5` means one and a half times the text height.
- `text-align` can be `left`, `center` or `right`.

Many text properties are **inherited**: set `font-family` on `body` and every element inside uses it, unless a more specific rule says otherwise.

## Task

Make the page easier to read:

1. Set the `body` font to **Verdana**, with `sans-serif` as the fallback.
2. Make the `h1` exactly `40px` and centre it.
3. Give paragraphs (`p`) a `line-height` of `1.6`.

## Hints

- `font-family: Verdana, sans-serif;` goes in the `body` rule so the whole page inherits it.
- The `h1` rule needs two declarations: `font-size` and `text-align`.
- `line-height: 1.6;` has no unit.

## Given: index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Brewline</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Brewline</h1>
    <p>Fresh coffee from a tiny cart on wheels. We roast our own beans every Monday and brew each cup to order, so it is never left sitting in a pot.</p>
    <p>Find us by the park gate, every day from 7am.</p>
  </body>
</html>
```

## Starter: style.css

```css
body {
  background-color: #fff8f0;
}

h1 {
  color: #6f4e37;
}
```

## Solution: style.css

```css
body {
  background-color: #fff8f0;
  font-family: Verdana, sans-serif;
}

h1 {
  color: #6f4e37;
  font-size: 40px;
  text-align: center;
}

p {
  line-height: 1.6;
}
```
