# Your first rule

HTML says what things *are*. **CSS** says how they *look*. A stylesheet is a list of **rules**:

```css
h1 {
  color: darkgreen;
}
```

- `h1` is the **selector**: which elements the rule applies to.
- Inside the braces are **declarations**: a **property**, a colon, a **value**, and a semicolon.

Colours can be written as names (`white`, `tomato`) or as hex codes such as `#6f4e37`, which mix red, green and blue.

The page loads its stylesheet through a `<link>` tag in the `<head>`. Open the `index.html` tab to see it. You'll write all your CSS in `style.css`.

## Task

Brewline's page is black on white. Give it some warmth in `style.css`:

1. Make the `h1` text coffee brown: `color: #6f4e37`.
2. Give the whole `body` a cream background: `background-color: #fff8f0`.

## Hints

- Each element gets its own rule: one that starts with `h1 {` and one that starts with `body {`.
- Text colour is `color`. The colour behind the content is `background-color`.
- Every declaration ends with a semicolon: `color: #6f4e37;`

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
    <p>Fresh coffee from a tiny cart on wheels.</p>
  </body>
</html>
```

## Starter: style.css

```css
/* Brewline's stylesheet */

```

## Solution: style.css

```css
/* Brewline's stylesheet */

h1 {
  color: #6f4e37;
}

body {
  background-color: #fff8f0;
}
```
